import {
    findFace,
    loadAgeModel,
    loadFaceDetector,
    onAgeModelProgress,
    predictProbabilities,
    readyFaceDetector,
    summarize,
    toModelInput,
    type AgeResult,
    type Estimate,
    type FaceBox,
    type ScoredResult,
} from './age-model';
import { createStoryCard } from './story-card';

interface AgeTestConfig {
    modelUrl: string;
    shareUrl: string;
    title: string;
    text: Record<string, string>;
    results: AgeResult[];
}

type Mode = 'upload' | 'camera';
type View = Mode | 'loading' | 'result' | 'error';

const LIVE_INTERVAL = 200; // 실시간 분석은 초당 5회로 제한해 발열·배터리 소모를 줄인다
const SMOOTHING = 0.35; // 실시간 확률의 지수이동평균 가중치 (숫자가 튀지 않게)
const MAX_IMAGE_SIZE = 1280;

// 진행 막대와 퍼센트를 모델 다운로드 진행률에 연결한다
const bindProgress = (container: Element) =>
    onAgeModelProgress((value) => {
        container.querySelectorAll<HTMLElement>('.load-progress').forEach((bar) => {
            bar.style.setProperty('--progress', String(value));
            bar.hidden = value >= 1;
        });
        const percent = container.querySelector('[data-load-percent]');
        if (percent) percent.textContent = `${Math.round(value * 100)}%`;
    });

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const track = (name: string, params: Record<string, unknown>) =>
    (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('event', name, params);

// 카메라와 결과 이미지는 페이지 전환 때 정리해야 하므로 모듈 단위로 둔다
let stream: MediaStream | undefined;
let loopId = 0;
let imageUrl: string | undefined;
let onPageHidden: (() => void) | undefined;

function stopCamera() {
    cancelAnimationFrame(loopId);
    loopId = 0;
    stream?.getTracks().forEach((track) => track.stop());
    stream = undefined;
}

function setImageUrl(url: string) {
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    imageUrl = url;
}

document.addEventListener('astro:before-swap', stopCamera);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) onPageHidden?.();
});

const counters = new WeakMap<HTMLElement, number>();

function countUp(el: HTMLElement, to: number, duration: number) {
    cancelAnimationFrame(counters.get(el) ?? 0);
    const from = Number(el.textContent) || 0;
    if (reducedMotion() || from === to) {
        el.textContent = String(to);
        return;
    }
    const start = performance.now();
    const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        el.textContent = String(Math.round(from + (to - from) * eased));
        if (progress < 1) counters.set(el, requestAnimationFrame(step));
    };
    counters.set(el, requestAnimationFrame(step));
}

function createLabel(result: ScoredResult, rank: number) {
    const wrap = document.createElement('div');
    wrap.className = 'label-wrap';
    wrap.dataset.class = result.className;
    wrap.style.setProperty('--rank', String(rank));
    wrap.innerHTML = '<div class="label-head"><span class="label-title"></span><span class="label-score"></span></div><div class="label-bar"><div class="progressbar"></div></div>';
    wrap.querySelector('.label-title')!.textContent = result.label;
    wrap.querySelector('.label-bar')!.classList.add(result.className);
    updateLabel(wrap, result);
    return wrap;
}

function updateLabel(wrap: HTMLElement, result: ScoredResult) {
    wrap.querySelector('.label-score')!.textContent = `${result.score}%`;
    wrap.querySelector<HTMLElement>('.progressbar')!.style.width = `${result.score}%`;
}

// 이미지 위 얼굴 위치를 원본 크기 기준 백분율로 표시한다
function placeFaceBox(el: HTMLElement, face: FaceBox | null, width: number, height: number) {
    el.hidden = !face;
    if (!face) return;
    el.style.left = `${(face.x / width) * 100}%`;
    el.style.top = `${(face.y / height) * 100}%`;
    el.style.width = `${(face.width / width) * 100}%`;
    el.style.height = `${(face.height / height) * 100}%`;
}

// EXIF 방향이 적용된 상태로 그리고, 큰 사진은 분석 속도를 위해 줄인다
function imageToCanvas(image: HTMLImageElement) {
    const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function drawBrackets(ctx: CanvasRenderingContext2D, box: FaceBox, lineWidth: number) {
    const { x, y, width, height } = box;
    const len = Math.min(width, height) * 0.28;
    const path = new Path2D();
    path.moveTo(x, y + len); path.lineTo(x, y); path.lineTo(x + len, y);
    path.moveTo(x + width - len, y); path.lineTo(x + width, y); path.lineTo(x + width, y + len);
    path.moveTo(x + width, y + height - len); path.lineTo(x + width, y + height); path.lineTo(x + width - len, y + height);
    path.moveTo(x + len, y + height); path.lineTo(x, y + height); path.lineTo(x, y + height - len);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'square';
    // 브루탈리즘 오프셋 그림자
    ctx.save();
    ctx.translate(lineWidth * 0.8, lineWidth * 0.8);
    ctx.strokeStyle = '#111111';
    ctx.stroke(path);
    ctx.restore();
    ctx.strokeStyle = '#FFE14D';
    ctx.stroke(path);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initAgeTest() {
    const root = document.querySelector<HTMLElement>('[data-age-test]');
    if (!root) return;

    const config: AgeTestConfig = JSON.parse(root.querySelector('[data-age-test-config]')!.textContent!);
    const { text } = config;
    const resultsByClass = new Map(config.results.map((result) => [result.className, result]));
    const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;

    const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-mode-tab]')];
    const views = root.querySelectorAll<HTMLElement>('[data-view]');
    const input = $<HTMLInputElement>('.file-upload-input');
    const dropzone = $('[data-dropzone]');
    const scanImage = $<HTMLImageElement>('[data-scan-image]');
    const scanFace = $('[data-scan-face]');
    const loadingText = $('[data-loading-text]');
    const resultImage = $<HTMLImageElement>('[data-result-image]');
    const resultFace = $('[data-result-face]');
    const resultAge = $('[data-result-age]');
    const resultLabels = $('[data-result-labels]');
    const cameraIntro = $('[data-camera-intro]');
    const cameraLive = $('[data-camera-live]');
    const cameraError = $('[data-camera-error]');
    const useUpload = $('[data-use-upload]');
    const video = $<HTMLVideoElement>('[data-camera-video]');
    const overlay = $<HTMLCanvasElement>('[data-camera-overlay]');
    const stage = $('[data-camera-stage]');
    const cameraStatus = $('[data-camera-status]');
    const liveAge = $('[data-live-age]');
    const liveLabels = $('[data-live-labels]');
    const captureButton = $<HTMLButtonElement>('[data-camera-capture]');
    const toast = $('[data-toast]');
    const loadingView = $('[data-view="loading"]');
    const loadHint = $('[data-load-hint]');
    const cameraLoading = $('[data-camera-loading]');

    let mode: Mode = 'upload';
    let lastAge = 0;
    let toastTimer = 0;

    const show = (view: View) => {
        views.forEach((el) => (el.hidden = el.dataset.view !== view));
        root.dataset.state = view;
    };

    const showToast = (message: string) => {
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => (toast.hidden = true), 2200);
    };

    // ---------- 모드 탭 ----------
    const resetCamera = () => {
        stopCamera();
        cameraLive.hidden = true;
        cameraIntro.hidden = false;
    };

    const selectMode = (next: Mode, focus = false) => {
        mode = next;
        resetCamera();
        tabs.forEach((tab) => {
            const selected = tab.dataset.modeTab === next;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            if (selected && focus) tab.focus();
        });
        root.dataset.mode = next;
        show(next);
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectMode(tab.dataset.modeTab as Mode));
        tab.addEventListener('keydown', (event) => {
            const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
            if (!(event.key in keys)) return;
            event.preventDefault();
            const next = tabs[(index + keys[event.key] + tabs.length) % tabs.length];
            selectMode(next.dataset.modeTab as Mode, true);
        });
    });

    // 테스트하려는 기미(탭·업로드 영역 터치, 포커스)가 보이면 나이 모델을 미리 받는다
    const warmUp = () => loadAgeModel(config.modelUrl).catch(() => {});
    for (const type of ['pointerover', 'pointerdown', 'touchstart', 'focusin']) {
        root.addEventListener(type, warmUp, { once: true, passive: true });
    }

    // ---------- 결과 ----------
    const renderResult = (estimate: Estimate, src: string, face: FaceBox | null, width: number, height: number) => {
        show('result');
        resultImage.src = src;
        placeFaceBox(resultFace, face, width, height);
        $('[data-result-message]').textContent = estimate.results[0].message;
        $('[data-result-explain]').textContent = estimate.results[0].explain;
        resultAge.textContent = '0';
        countUp(resultAge, estimate.age, 900);
        resultLabels.replaceChildren(...estimate.results.map(createLabel));
        lastAge = estimate.age;
        prepareStory(estimate, face, width, height);
        track('age_test_complete', { mode, age: estimate.age });
        root.querySelector('[data-view="result"]')!.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    };

    // 아이폰 Safari 는 버튼을 누른 직후에만 공유 시트를 열 수 있으므로 스토리 이미지를 미리 만들어 둔다
    let storyFile: File | undefined;
    let storyPromise: Promise<File | undefined> | undefined;

    const prepareStory = (estimate: Estimate, face: FaceBox | null, width: number, height: number) => {
        storyFile = undefined;
        const shareUrl = new URL(config.shareUrl);
        storyPromise = (async () => {
            if (!resultImage.complete) await resultImage.decode();
            const scale = resultImage.naturalWidth / width;
            const file = await createStoryCard({
                lang: document.documentElement.lang,
                photo: resultImage,
                face: face && { x: face.x * scale, y: face.y * scale, width: face.width * scale, height: face.height * scale },
                title: config.title,
                label: text.resultLabel,
                ageText: text.age.replace('{age}', String(estimate.age)),
                message: estimate.results[0].message,
                results: estimate.results,
                cta: text.storyCta,
                url: (shareUrl.host + shareUrl.pathname).replace(/\/$/, ''),
            });
            storyFile = file;
            return file;
        })().catch((error) => {
            console.error('스토리 이미지 생성 오류:', error);
            return undefined;
        });
    };

    $('[data-story-share]').addEventListener('click', async () => {
        const file = storyFile ?? (await storyPromise);
        if (!file) return;
        track('share', { method: 'story' });
        // 휴대폰: OS 공유 시트 → 인스타그램·페이스북 스토리 선택
        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: document.title });
                return;
            } catch (error) {
                if ((error as DOMException).name === 'AbortError') return;
            }
        }
        // 공유 시트가 없으면 이미지를 저장해 직접 올리게 한다
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(text.storySaved);
    });

    $('[data-share]').addEventListener('click', async () => {
        const message = text.shareText.replace('{age}', String(lastAge));
        const copyLink = () =>
            navigator.clipboard?.writeText(`${message} ${config.shareUrl}`).then(() => showToast(text.copied));
        track('share', { method: navigator.share ? 'web_share' : 'clipboard' });
        if (!navigator.share) return copyLink();
        try {
            await navigator.share({ title: document.title, text: message, url: config.shareUrl });
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') copyLink();
        }
    });

    root.querySelectorAll('[data-reset]').forEach((button) =>
        button.addEventListener('click', () => {
            input.value = '';
            selectMode(mode);
        }),
    );

    // ---------- 사진 업로드 ----------
    const cropCanvas = document.createElement('canvas');

    input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;

        show('loading');
        scanFace.hidden = true;
        loadingText.textContent = text.loadingModel;
        setImageUrl(URL.createObjectURL(file));
        scanImage.src = imageUrl!;
        track('age_test_start', { mode: 'upload' });

        const unbindProgress = bindProgress(loadingView);
        const hintTimer = setTimeout(() => (loadHint.hidden = false), 2500);
        try {
            await scanImage.decode();
            const model = await loadAgeModel(config.modelUrl);
            unbindProgress();
            clearTimeout(hintTimer);
            loadHint.hidden = true;
            const source = imageToCanvas(scanImage);

            // 얼굴 검출기는 결과를 늦추지 않도록 이미 준비돼 있을 때만 쓰고, 아니면 다음을 위해 뒤에서 받는다
            loadFaceDetector();
            const detector = readyFaceDetector();
            let face: FaceBox | null = null;
            if (detector) {
                loadingText.textContent = text.findingFace;
                face = findFace(detector, source);
                placeFaceBox(scanFace, face, source.width, source.height);
                // 얼굴을 찾는 과정을 잠깐 보여준다 (작업 과정이 보이면 결과를 더 신뢰한다: labor illusion)
                if (!reducedMotion()) await wait(700);
            }

            loadingText.textContent = text.analyzing;
            toModelInput(source, source.width, source.height, cropCanvas);
            const estimate = summarize(await predictProbabilities(model, cropCanvas), resultsByClass);
            renderResult(estimate, imageUrl!, face, source.width, source.height);
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            show('error');
        } finally {
            unbindProgress();
            clearTimeout(hintTimer);
            loadHint.hidden = true;
        }
    });

    dropzone.addEventListener('dragenter', () => dropzone.classList.add('is-dragging'));
    dropzone.addEventListener('dragover', () => dropzone.classList.add('is-dragging'));
    ['dragleave', 'drop'].forEach((type) => dropzone.addEventListener(type, () => dropzone.classList.remove('is-dragging')));

    // ---------- 실시간 카메라 ----------
    const frame = document.createElement('canvas');
    const overlayCtx = overlay.getContext('2d')!;
    let smoothed: Map<string, number> | undefined;
    let estimate: Estimate | undefined;
    let estimateFace: FaceBox | null = null;
    let targetBox: FaceBox | null = null;
    let drawnBox: FaceBox | null = null;

    const setStatus = (message: string, state: 'searching' | 'tracking') => {
        cameraStatus.textContent = message;
        stage.dataset.state = state;
    };

    const showCameraError = (message: string) => {
        resetCamera();
        cameraError.textContent = message;
        cameraError.hidden = false;
        useUpload.hidden = false;
    };

    const renderLiveBars = (current: Estimate) => {
        if (!liveLabels.childElementCount) {
            // 실시간 막대는 순서가 바뀌면 읽기 어려우므로 나이순으로 고정한다
            const byAge = [...current.results].sort((a, b) => a.age - b.age);
            liveLabels.replaceChildren(...byAge.map(createLabel));
        }
        for (const result of current.results) {
            const wrap = liveLabels.querySelector<HTMLElement>(`[data-class="${result.className}"]`);
            if (!wrap) continue;
            updateLabel(wrap, result);
            wrap.classList.toggle('is-top', result === current.results[0]);
        }
    };

    const drawOverlay = () => {
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
        if (!targetBox) {
            drawnBox = null;
            return;
        }
        // 5fps 로 들어오는 얼굴 위치를 매 프레임 보간해 부드럽게 따라간다
        const t = reducedMotion() ? 1 : 0.3;
        drawnBox = drawnBox
            ? {
                  x: lerp(drawnBox.x, targetBox.x, t),
                  y: lerp(drawnBox.y, targetBox.y, t),
                  width: lerp(drawnBox.width, targetBox.width, t),
                  height: lerp(drawnBox.height, targetBox.height, t),
              }
            : targetBox;
        drawBrackets(overlayCtx, drawnBox, Math.max(4, overlay.width * 0.01));
    };

    const analyzeFrame = async (
        model: Awaited<ReturnType<typeof loadAgeModel>>,
        detector: Awaited<ReturnType<typeof loadFaceDetector>>,
        detectorPending: boolean,
    ) => {
        const { videoWidth: width, videoHeight: height } = video;
        if (frame.width !== width || frame.height !== height) {
            frame.width = width;
            frame.height = height;
        }
        frame.getContext('2d')!.drawImage(video, 0, 0, width, height);

        const face = detector ? findFace(detector, frame) : null;
        targetBox = face;
        if (detector && !face) {
            setStatus(text.noFace, 'searching');
            return;
        }

        toModelInput(frame, width, height, cropCanvas);
        const probabilities = await predictProbabilities(model, cropCanvas);
        if (!stream) return;

        const previous = smoothed;
        smoothed = previous
            ? new Map([...probabilities].map(([c, p]) => [c, (previous.get(c) ?? p) * (1 - SMOOTHING) + p * SMOOTHING]))
            : probabilities;
        estimate = summarize(smoothed, resultsByClass);
        estimateFace = face;
        countUp(liveAge, estimate.age, 300);
        renderLiveBars(estimate);
        setStatus(detector ? text.faceFound : detectorPending ? text.faceLoading : text.analyzing, 'tracking');
        captureButton.disabled = false;
    };

    const startCamera = async () => {
        cameraError.hidden = true;
        useUpload.hidden = true;
        if (!navigator.mediaDevices?.getUserMedia) return showCameraError(text.cameraUnavailable);

        cameraIntro.hidden = true;
        cameraLive.hidden = false;
        captureButton.disabled = true;
        liveAge.textContent = '--';
        liveLabels.replaceChildren();
        smoothed = undefined;
        estimate = undefined;
        targetBox = drawnBox = null;
        setStatus(text.cameraStarting, 'searching');
        track('age_test_start', { mode: 'camera' });

        // 권한 요청과 동시에 모델을 받기 시작한다
        const modelPromise = loadAgeModel(config.modelUrl);
        modelPromise.catch(() => {});

        // 브라우저 권한 요청은 사용자가 '카메라 켜기'를 누른 이 시점에만 띄운다
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
        } catch (error) {
            const name = (error as DOMException).name;
            return showCameraError(name === 'NotAllowedError' || name === 'SecurityError' ? text.cameraDenied : text.cameraUnavailable);
        }
        if (mode !== 'camera') return stopCamera();

        video.srcObject = stream;
        await video.play().catch(() => {});
        stage.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;

        // 모델이 준비될 때까지 카메라 화면 위에 실제 진행률을 보여준다
        cameraLoading.hidden = false;
        cameraStatus.hidden = true;
        const unbindProgress = bindProgress(cameraLoading);
        let model: Awaited<ReturnType<typeof loadAgeModel>>;
        try {
            model = await modelPromise;
        } catch (error) {
            console.error('모델 로드 오류:', error);
            stopCamera();
            return show('error');
        } finally {
            unbindProgress();
            cameraLoading.hidden = true;
            cameraStatus.hidden = false;
        }
        if (!stream) return;

        // 얼굴 검출기(약 3.5MB)는 기다리지 않고 바로 측정을 시작하고, 준비되면 얼굴 추적을 붙인다
        let detector = readyFaceDetector();
        let detectorPending = !detector;
        if (!detector) {
            loadFaceDetector().then((loaded) => {
                detector = loaded;
                detectorPending = false;
            });
        }

        let lastRun = 0;
        let busy = false;
        const loop = (now: number) => {
            loopId = requestAnimationFrame(loop);
            drawOverlay();
            if (busy || now - lastRun < LIVE_INTERVAL || video.readyState < 2) return;
            lastRun = now;
            busy = true;
            analyzeFrame(model, detector, detectorPending)
                .catch((error) => console.error('실시간 분석 오류:', error))
                .finally(() => (busy = false));
        };
        loopId = requestAnimationFrame(loop);
    };

    const capture = async () => {
        if (!estimate) return;
        const { width, height } = frame;
        const face = estimateFace;
        // 화면에 보이던 거울 모드 그대로 저장한다
        const snapshot = document.createElement('canvas');
        snapshot.width = width;
        snapshot.height = height;
        const ctx = snapshot.getContext('2d')!;
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(frame, 0, 0);
        navigator.vibrate?.(30);

        const captured = estimate;
        const blob = await new Promise<Blob | null>((resolve) => snapshot.toBlob(resolve, 'image/jpeg', 0.9));
        stopCamera();
        setImageUrl(blob ? URL.createObjectURL(blob) : snapshot.toDataURL('image/jpeg'));
        const mirrored = face ? { ...face, x: width - face.x - face.width } : null;
        renderResult(captured, imageUrl!, mirrored, width, height);
    };

    $('[data-camera-start]').addEventListener('click', startCamera);
    $('[data-camera-stop]').addEventListener('click', resetCamera);
    captureButton.addEventListener('click', capture);
    useUpload.addEventListener('click', () => selectMode('upload', true));

    // 다른 탭으로 가면 카메라를 끈다 (배터리·사생활)
    onPageHidden = () => {
        if (stream) resetCamera();
    };
}

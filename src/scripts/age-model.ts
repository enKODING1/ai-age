import type { FaceDetector } from '@mediapipe/tasks-vision';

export interface AgeResult {
    className: string;
    age: number;
    label: string;
    message: string;
    explain: string;
}

export interface ScoredResult extends AgeResult {
    probability: number;
    score: number;
}

export interface Estimate {
    age: number;
    results: ScoredResult[];
}

export interface FaceBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Prediction {
    className: string;
    probability: number;
}

export interface AgeModel {
    predict(image: HTMLCanvasElement, flipped: boolean): Promise<Prediction[]>;
}

declare const tmImage: { loadFromFiles(model: File, weights: File, metadata: File): Promise<AgeModel> };

// TF.js 는 첫 화면에 필요 없으므로 사용자가 테스트하려는 기미가 보일 때부터 불러온다
const LIBRARIES = [
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js',
];
// package.json 의 @mediapipe/tasks-vision 버전과 맞춘다
const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm';
const FACE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

// Teachable Machine 이미지 모델의 입력 크기
export const MODEL_INPUT_SIZE = 224;

// 페이지 전환(SPA) 사이에도 모델을 재사용한다
let modelPromise: Promise<AgeModel> | undefined;
let detectorPromise: Promise<FaceDetector | null> | undefined;
let loadedDetector: FaceDetector | null = null;

// ---------- 진행률 (0~1) ----------
// 전송량의 대부분인 가중치 파일(약 2MB)은 직접 받으면서 실제 바이트 기준으로 진행률을 계산한다
let progress = 0;
const progressListeners = new Set<(value: number) => void>();

function setProgress(value: number) {
    progress = Math.max(progress, Math.min(value, 1));
    progressListeners.forEach((listener) => listener(progress));
}

export function onAgeModelProgress(listener: (value: number) => void) {
    progressListeners.add(listener);
    listener(progress);
    return () => progressListeners.delete(listener);
}

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.append(script);
    });
}

async function fetchBlob(url: string, from: number, to: number) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
    const total = Number(response.headers.get('content-length'));
    if (!response.body || !total) {
        const blob = await response.blob();
        setProgress(to);
        return { blob, url: response.url };
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        setProgress(from + (to - from) * Math.min(loaded / total, 1));
    }
    return { blob: new Blob(chunks), url: response.url };
}

export function loadAgeModel(modelUrl: string) {
    modelPromise ??= (async () => {
        setProgress(0.02);
        await loadScript(LIBRARIES[0]);
        setProgress(0.12);
        await loadScript(LIBRARIES[1]);
        setProgress(0.15);

        const [modelJson, metadata] = await Promise.all([
            fetchBlob(`${modelUrl}model.json`, 0.15, 0.18),
            fetchBlob(`${modelUrl}metadata.json`, 0.15, 0.18),
        ]);
        // 가중치 경로는 (리다이렉트된) model.json 위치를 기준으로 한다
        const manifest = JSON.parse(await modelJson.blob.text());
        const weightsUrl = new URL(manifest.weightsManifest[0].paths[0], modelJson.url).href;
        const weights = await fetchBlob(weightsUrl, 0.18, 0.88);

        const model = await tmImage.loadFromFiles(
            new File([modelJson.blob], 'model.json'),
            new File([weights.blob], 'model.weights.bin'),
            new File([metadata.blob], 'metadata.json'),
        );
        setProgress(0.94);

        // 첫 추론 때 WebGL 셰이더를 컴파일하느라 멈추지 않도록 빈 이미지로 미리 한 번 돌린다
        const blank = document.createElement('canvas');
        blank.width = MODEL_INPUT_SIZE;
        blank.height = MODEL_INPUT_SIZE;
        await model.predict(blank, false);
        setProgress(1);
        return model;
    })().catch((error) => {
        modelPromise = undefined;
        progress = 0;
        throw error;
    });
    return modelPromise;
}

// 얼굴 검출기를 못 불러와도 테스트는 계속할 수 있으므로 null 을 돌려준다.
// 작은 모델이라 CPU 로도 충분히 빠르고, iOS 에서 느리고 불안정한 GPU 초기화를 피한다
export function loadFaceDetector() {
    detectorPromise ??= (async () => {
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        loadedDetector = await FaceDetector.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'CPU' },
            runningMode: 'IMAGE',
            minDetectionConfidence: 0.5,
        });
        return loadedDetector;
    })().catch((error) => {
        console.warn('Face detector unavailable:', error);
        return null;
    });
    return detectorPromise;
}

// 이미 준비된 얼굴 검출기만 돌려준다 (결과를 기다리게 하지 않기 위해)
export const readyFaceDetector = () => loadedDetector;

// 여러 얼굴이 잡히면 가장 큰 얼굴을 쓴다
export function findFace(detector: FaceDetector, source: HTMLImageElement | HTMLCanvasElement): FaceBox | null {
    let best: FaceBox | null = null;
    for (const { boundingBox } of detector.detect(source).detections) {
        if (!boundingBox) continue;
        const box = { x: boundingBox.originX, y: boundingBox.originY, width: boundingBox.width, height: boundingBox.height };
        if (!best || box.width * box.height > best.width * best.height) best = box;
    }
    return best;
}

// 원본 서비스와 같은 입력(가운데 정사각형)을 모델에 넣는다.
// 이 모델은 사진 전체 기준으로 학습되어, 얼굴만 잘라 넣으면 결과가 크게 달라진다
// (예: 같은 사진이 전체 55세 → 얼굴 크롭 26세). 얼굴 검출은 위치 표시와 실시간 안내에만 쓴다.
export function toModelInput(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, target: HTMLCanvasElement) {
    const size = Math.min(sourceWidth, sourceHeight);
    target.width = MODEL_INPUT_SIZE;
    target.height = MODEL_INPUT_SIZE;
    target
        .getContext('2d')!
        .drawImage(source, (sourceWidth - size) / 2, (sourceHeight - size) / 2, size, size, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
}

// 각 연령대 대표 나이를 확률로 가중평균한 값이 예상 나이
export function summarize(probabilities: Map<string, number>, resultsByClass: Map<string, AgeResult>): Estimate {
    const results = [...probabilities]
        .filter(([className]) => resultsByClass.has(className))
        .map(([className, probability]) => ({
            ...resultsByClass.get(className)!,
            probability,
            score: Math.round(probability * 100),
        }))
        .sort((a, b) => b.probability - a.probability);

    const total = results.reduce((sum, r) => sum + r.probability, 0) || 1;
    const age = Math.round(results.reduce((sum, r) => sum + r.probability * r.age, 0) / total);
    return { age, results };
}

export async function predictProbabilities(model: AgeModel, input: HTMLCanvasElement) {
    const prediction = await model.predict(input, false);
    return new Map(prediction.map((p) => [p.className, p.probability]));
}

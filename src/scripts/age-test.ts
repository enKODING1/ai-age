interface AgeResult {
    className: string;
    age: number;
    label: string;
    message: string;
    explain: string;
}

interface AgeTestConfig {
    modelUrl: string;
    text: { analyzing: string; age: string; error: string; retry: string };
    results: AgeResult[];
}

interface Prediction {
    className: string;
    probability: number;
}

interface TeachableModel {
    predict(image: HTMLImageElement, flipped: boolean): Promise<Prediction[]>;
}

declare const tmImage: { load(modelUrl: string, metadataUrl: string): Promise<TeachableModel> };

// TF.js(약 1MB)는 첫 화면에 필요 없으므로 사용자가 업로드하려는 순간에만 불러온다
const LIBRARIES = [
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js',
];

// 페이지 전환(SPA) 사이에도 모델을 재사용한다
let modelPromise: Promise<TeachableModel> | undefined;
let imageUrl: string | undefined;

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.append(script);
    });
}

function getModel(modelUrl: string) {
    modelPromise ??= (async () => {
        for (const src of LIBRARIES) await loadScript(src);
        return tmImage.load(`${modelUrl}model.json`, `${modelUrl}metadata.json`);
    })().catch((error) => {
        modelPromise = undefined;
        throw error;
    });
    return modelPromise;
}

// 이미지 디코딩이 끝난 뒤에 예측해야 빈 이미지로 추론하지 않는다
async function loadImage(image: HTMLImageElement, file: File) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(file);
    image.src = imageUrl;
    await image.decode();
}

function createLabel(result: AgeResult & { score: number }, rank: number) {
    const wrap = document.createElement('div');
    wrap.className = 'label-wrap';
    wrap.style.setProperty('--rank', String(rank));

    const head = document.createElement('div');
    head.className = 'label-head';
    const title = document.createElement('span');
    title.className = 'label-title';
    title.textContent = result.label;
    const score = document.createElement('span');
    score.className = 'label-score';
    score.textContent = `${result.score}%`;
    head.append(title, score);

    const bar = document.createElement('div');
    bar.className = `label-bar ${result.className}`;
    const fill = document.createElement('div');
    fill.className = 'progressbar';
    fill.style.width = `${result.score}%`;
    bar.append(fill);

    wrap.append(head, bar);
    return wrap;
}

export function initAgeTest() {
    const root = document.querySelector<HTMLElement>('[data-age-test]');
    if (!root) return;

    const config: AgeTestConfig = JSON.parse(root.querySelector('[data-age-test-config]')!.textContent!);
    const input = root.querySelector<HTMLInputElement>('.file-upload-input')!;
    const image = root.querySelector<HTMLImageElement>('[data-result-image]')!;
    const views = root.querySelectorAll<HTMLElement>('[data-view]');
    const show = (view: string) => views.forEach((el) => (el.hidden = el.dataset.view !== view));

    // 모델 클래스명(baby, one, two...)으로 결과 문구를 찾는다
    const resultsByClass = new Map(config.results.map((result) => [result.className, result]));

    const warmUp = () => getModel(config.modelUrl).catch(() => {});
    root.querySelector('.image-upload-wrap')!.addEventListener('pointerenter', warmUp, { once: true });
    input.addEventListener('focus', warmUp, { once: true });

    input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;

        show('loading');
        try {
            const [model] = await Promise.all([getModel(config.modelUrl), loadImage(image, file)]);
            const prediction = await model.predict(image, false);

            const results = prediction
                .filter((p) => resultsByClass.has(p.className))
                .map((p) => ({
                    ...resultsByClass.get(p.className)!,
                    probability: p.probability,
                    score: Math.round(p.probability * 100),
                }))
                .sort((a, b) => b.probability - a.probability);

            // 각 연령대 대표 나이를 확률로 가중평균한 값이 예상 나이
            const totalProbability = results.reduce((sum, r) => sum + r.probability, 0);
            const age = Math.round(results.reduce((sum, r) => sum + r.probability * r.age, 0) / totalProbability);

            root.querySelector('[data-result-message]')!.textContent = results[0].message;
            root.querySelector('[data-result-explain]')!.textContent = results[0].explain;
            root.querySelector('[data-result-age]')!.textContent = config.text.age.replace('{age}', String(age));
            root.querySelector('[data-result-labels]')!.replaceChildren(...results.map(createLabel));
            show('result');
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
            show('error');
        }
    });

    root.querySelectorAll('[data-reset]').forEach((button) =>
        button.addEventListener('click', () => {
            input.value = '';
            show('idle');
            root.scrollIntoView({ block: 'center' });
        }),
    );
}

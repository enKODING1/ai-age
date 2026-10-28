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

declare const tmImage: { load(modelUrl: string, metadataUrl: string): Promise<AgeModel> };

// TF.js(약 1MB)는 첫 화면에 필요 없으므로 사용자가 테스트하려는 순간에만 불러온다
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

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.append(script);
    });
}

export function loadAgeModel(modelUrl: string) {
    modelPromise ??= (async () => {
        for (const src of LIBRARIES) await loadScript(src);
        return tmImage.load(`${modelUrl}model.json`, `${modelUrl}metadata.json`);
    })().catch((error) => {
        modelPromise = undefined;
        throw error;
    });
    return modelPromise;
}

// 얼굴 검출기를 못 불러와도 테스트는 사진 전체로 계속할 수 있으므로 null 을 돌려준다
export function loadFaceDetector() {
    detectorPromise ??= (async () => {
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        const create = (delegate: 'GPU' | 'CPU') =>
            FaceDetector.createFromOptions(fileset, {
                baseOptions: { modelAssetPath: FACE_MODEL, delegate },
                runningMode: 'IMAGE',
                minDetectionConfidence: 0.5,
            });
        try {
            return await create('GPU');
        } catch {
            return await create('CPU');
        }
    })().catch((error) => {
        console.warn('Face detector unavailable:', error);
        return null;
    });
    return detectorPromise;
}

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

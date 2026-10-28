import type { FaceBox, ScoredResult } from './age-model';

export interface StoryCardData {
    lang: string;
    photo: HTMLImageElement;
    face: FaceBox | null;
    title: string;
    label: string;
    ageText: string;
    message: string;
    results: ScoredResult[];
    cta: string;
    url: string;
}

// 인스타그램·페이스북 스토리 크기 (9:16)
const WIDTH = 1080;
const HEIGHT = 1920;
const INK = '#111111';
const BAR_COLORS: Record<string, string> = {
    baby: '#FF6B9D',
    one: '#FF8C42',
    two: '#FFE14D',
    three: '#3DDC97',
    four: '#4D9DE0',
    five: '#9B5DE5',
};

const fontsFor = (lang: string) => ({
    display: lang === 'ko' ? '"Black Han Sans", sans-serif' : '"Space Grotesk", sans-serif',
    displayWeight: lang === 'ko' ? '400' : '700',
    body: '"Space Grotesk", -apple-system, "Apple SD Gothic Neo", sans-serif',
    mono: '"Space Mono", ui-monospace, monospace',
});

// 띄어쓰기가 없는 언어(중국어·일본어·태국어)도 자연스럽게 줄바꿈되도록 단어 단위로 나눈다
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lang: string, maxLines: number) {
    const Segmenter = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment(t: string): Iterable<{ segment: string }> } }).Segmenter;
    const tokens = Segmenter ? [...new Segmenter(lang, { granularity: 'word' }).segment(text)].map((s) => s.segment) : [...text];
    const lines: string[] = [];
    let line = '';
    for (const token of tokens) {
        const next = line + token;
        if (ctx.measureText(next).width <= maxWidth || !line) {
            line = next;
            continue;
        }
        lines.push(line.trim());
        line = token.trimStart();
    }
    if (line.trim()) lines.push(line.trim());
    if (lines.length > maxLines) {
        lines.length = maxLines;
        let last = lines[maxLines - 1];
        while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
        lines[maxLines - 1] = `${last}…`;
    }
    return lines;
}

// 브루탈리즘 스티커: 오프셋 그림자 + 굵은 테두리 사각형
function sticker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, shadow = INK, offset = 14) {
    ctx.fillStyle = shadow;
    ctx.fillRect(x + offset, y + offset, w, h);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 8;
    ctx.strokeStyle = INK;
    ctx.strokeRect(x, y, w, h);
}

function rotated(ctx: CanvasRenderingContext2D, cx: number, cy: number, degrees: number, draw: () => void) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    draw();
    ctx.restore();
}

// 사진을 상자에 꽉 차게 자르되, 얼굴이 있으면 얼굴이 가운데 오도록 한다
function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, face: FaceBox | null, x: number, y: number, w: number, h: number) {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    const cx = face ? face.x + face.width / 2 : iw / 2;
    const cy = face ? face.y + face.height / 2 : ih / 2;
    const sx = Math.max(0, Math.min(cx - sw / 2, iw - sw));
    const sy = Math.max(0, Math.min(cy - sh / 2, ih - sh));
    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

async function loadFonts(lang: string, sample: string) {
    const fonts = fontsFor(lang);
    try {
        await Promise.all([
            document.fonts.load(`${fonts.displayWeight} 80px ${fonts.display}`, sample),
            document.fonts.load(`700 80px ${fonts.mono}`),
            document.fonts.load(`700 40px ${fonts.body}`, sample),
        ]);
    } catch {
        // 폰트를 못 불러와도 시스템 폰트로 그린다
    }
}

export async function createStoryCard(data: StoryCardData): Promise<File> {
    const fonts = fontsFor(data.lang);
    await loadFonts(data.lang, `${data.title}${data.message}${data.label}`);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'alphabetic';

    // 배경: 크림색 + 모눈
    ctx.fillStyle = '#FFF4D6';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.08)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= Math.max(WIDTH, HEIGHT); i += 54) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WIDTH, i); ctx.stroke();
    }

    // 로고 스티커 (스토리 상단 UI 영역 아래부터 배치)
    rotated(ctx, 240, 210, -3, () => {
        sticker(ctx, 96, 170, 290, 92, '#FFE14D', INK, 10);
        ctx.fillStyle = INK;
        ctx.font = `700 54px ${fonts.mono}`;
        ctx.fillText('AI AGE', 128, 234);
    });

    // 제목
    ctx.fillStyle = INK;
    ctx.font = `${fonts.displayWeight} 74px ${fonts.display}`;
    wrap(ctx, data.title, 888, data.lang, 2).forEach((line, i) => ctx.fillText(line, 96, 370 + i * 86));

    // 사진
    const photo = { x: 120, y: 500, w: 840, h: 700 };
    rotated(ctx, WIDTH / 2, photo.y + photo.h / 2, 1.5, () => {
        ctx.fillStyle = INK;
        ctx.fillRect(photo.x + 18, photo.y + 18, photo.w, photo.h);
        drawCover(ctx, data.photo, data.face, photo.x, photo.y, photo.w, photo.h);
        ctx.lineWidth = 10;
        ctx.strokeStyle = INK;
        ctx.strokeRect(photo.x, photo.y, photo.w, photo.h);
    });

    // 예상 나이 도장
    ctx.font = `700 104px ${fonts.mono}`;
    const ageWidth = Math.min(ctx.measureText(data.ageText).width + 96, 900);
    const ageX = (WIDTH - ageWidth) / 2;
    rotated(ctx, WIDTH / 2, 1250, -3, () => {
        ctx.fillStyle = INK;
        ctx.font = `700 34px ${fonts.body}`;
        const labelWidth = ctx.measureText(data.label).width + 36;
        ctx.fillRect(ageX, 1120, labelWidth, 52);
        ctx.fillStyle = '#FFE14D';
        ctx.fillText(data.label, ageX + 18, 1158);

        sticker(ctx, ageX, 1172, ageWidth, 150, INK, '#FF6B9D', 14);
        ctx.fillStyle = '#FFE14D';
        ctx.font = `700 104px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(data.ageText, WIDTH / 2, 1282, ageWidth - 48);
        ctx.textAlign = 'left';
    });

    // 결과 문구
    ctx.fillStyle = INK;
    ctx.font = `${fonts.displayWeight} 54px ${fonts.display}`;
    ctx.textAlign = 'center';
    wrap(ctx, data.message, 888, data.lang, 2).forEach((line, i) => ctx.fillText(line, WIDTH / 2, 1420 + i * 66));
    ctx.textAlign = 'left';

    // 상위 3개 연령대 막대
    data.results.slice(0, 3).forEach((result, i) => {
        const y = 1530 + i * 62;
        ctx.font = `700 30px ${fonts.body}`;
        ctx.fillStyle = INK;
        ctx.fillText(result.label, 120, y + 30);
        ctx.font = `700 30px ${fonts.mono}`;
        ctx.textAlign = 'right';
        ctx.fillText(`${result.score}%`, 960, y + 30);
        ctx.textAlign = 'left';
        const barX = 380;
        const barW = 470;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(barX, y + 4, barW, 30);
        ctx.fillStyle = BAR_COLORS[result.className] ?? '#FFE14D';
        ctx.fillRect(barX, y + 4, (barW * result.score) / 100, 30);
        ctx.lineWidth = 5;
        ctx.strokeStyle = INK;
        ctx.strokeRect(barX, y + 4, barW, 30);
    });

    // 사이트 안내 (하단 답장 입력창 위)
    ctx.font = `700 36px ${fonts.mono}`;
    const footer = `${data.cta} → ${data.url}`;
    const footerWidth = Math.min(ctx.measureText(footer).width + 64, 960);
    sticker(ctx, (WIDTH - footerWidth) / 2, 1720, footerWidth, 76, '#FFE14D', INK, 10);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.fillText(footer, WIDTH / 2, 1771, footerWidth - 40);
    ctx.textAlign = 'left';

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Failed to create story image');
    return new File([blob], 'ai-age-story.jpg', { type: 'image/jpeg' });
}

import type { APIRoute } from 'astro';
import { SITE_NAME, absoluteUrl } from '../consts';
import { LOCALE_INFO, LOCALES, localePath, t } from '../i18n';

// AI 답변 엔진이 사이트를 요약·인용할 수 있도록 핵심 사실과 페이지 목록을 제공한다 (llms.txt)
export const GET: APIRoute = () => {
    const en = t('en');

    const languages = LOCALES.map((locale) => {
        const d = t(locale);
        return `- [${LOCALE_INFO[locale].label}](${absoluteUrl(localePath(locale))}): ${d.meta.home.title}`;
    }).join('\n');

    const pages = LOCALES.flatMap((locale) => {
        const d = t(locale);
        return [
            `- [${d.meta.about.title}](${absoluteUrl(localePath(locale, 'about'))}) (${LOCALE_INFO[locale].label})`,
            `- [${d.meta.privacy.title}](${absoluteUrl(localePath(locale, 'privacy'))}) (${LOCALE_INFO[locale].label})`,
        ];
    }).join('\n');

    const faq = en.home.faq.map((item) => `### ${item.q}\n${item.a}`).join('\n\n');
    const steps = en.home.steps.map((step, i) => `${i + 1}. **${step.title}**: ${step.text}`).join('\n');

    const body = `# ${SITE_NAME}: ${en.hero.about.title}

> A free browser-based test that estimates how old a face looks from a single photo, available in ${LOCALES.length} languages with no sign-up. Photos are analyzed on-device with TensorFlow.js and are never uploaded. For entertainment only.

## Key facts

- Modes: upload a photo, or use the live camera mode that updates the estimated age in real time.
- Model: MediaPipe face detection finds the face, then an image classifier trained with Google Teachable Machine runs in the browser with TensorFlow.js.
- Output: probabilities for six age groups (baby, teens, twenties, thirties, forties, fifties).
- Estimated age: probability-weighted average of each group's representative age (5, 15, 25, 35, 45, 55).
- Privacy: photos and camera video never leave the device; nothing is stored.
- Not for medical, legal or identity verification use.

## How it works

${steps}

## Test (by language)

${languages}

## About and privacy pages

${pages}

## FAQ

${faq}
`;

    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

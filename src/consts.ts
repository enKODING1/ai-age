export const SITE_URL = 'https://aige.netlify.app';
export const SITE_NAME = 'AI Age';
export const CONTACT_EMAIL = 'ksjdevelop53@gmail.com';
export const UPDATED_AT = '2026-10-29';

export const GA_ID = 'G-53HXVB2652';
export const ADSENSE_CLIENT = 'ca-pub-5207006250876379';
export const KAKAO_AD = { unit: 'DAN-yzYtkRfLLQrZjIi1', width: 320, height: 200 };
export const GOOGLE_SITE_VERIFICATION = 'Yk2euFjnay1FF1dBlJSE71D2TtMojzDKIY7scno9tg8';
export const NAVER_SITE_VERIFICATION = '7aa6331705a17931b2bd844bd5285ea03a77210b';
export const BING_SITE_VERIFICATION = '4F1C7887D159E213D7B4251E74ECD43D';

// 언어별 SNS 공유 섬네일 (public/og/{언어}.jpg)
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const ogImagePath = (locale: string) => `/og/${locale}.jpg`;

// Google Teachable Machine 으로 학습한 6개 연령대(baby, one~five) 분류 모델
export const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/MbVPfeaJh/';

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

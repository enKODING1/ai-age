import ko from './locales/ko.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import hi from './locales/hi.json';

export const LOCALES = ['ko', 'en', 'zh', 'ja', 'th', 'vi', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ko';
// 언어가 맞지 않는 방문자에게 보여줄 버전 (hreflang x-default)
export const FALLBACK_LOCALE: Locale = 'en';

export const LOCALE_INFO: Record<Locale, { label: string; flag: string; htmlLang: string; ogLocale: string }> = {
    ko: { label: '한국어', flag: '🇰🇷', htmlLang: 'ko', ogLocale: 'ko_KR' },
    en: { label: 'English', flag: '🇺🇸', htmlLang: 'en', ogLocale: 'en_US' },
    zh: { label: '中文', flag: '🇨🇳', htmlLang: 'zh-Hans', ogLocale: 'zh_CN' },
    ja: { label: '日本語', flag: '🇯🇵', htmlLang: 'ja', ogLocale: 'ja_JP' },
    th: { label: 'ไทย', flag: '🇹🇭', htmlLang: 'th', ogLocale: 'th_TH' },
    vi: { label: 'Tiếng Việt', flag: '🇻🇳', htmlLang: 'vi', ogLocale: 'vi_VN' },
    hi: { label: 'हिन्दी', flag: '🇮🇳', htmlLang: 'hi', ogLocale: 'hi_IN' },
};

export type Dictionary = typeof ko;
const DICTIONARIES: Record<Locale, Dictionary> = { ko, en, zh, ja, th, vi, hi };

export const t = (locale: Locale): Dictionary => DICTIONARIES[locale];

// 모든 언어에 존재하는 페이지
export type LocalizedPage = 'home' | 'about' | 'privacy';
// 한국어로만 제공되는 페이지 포함 전체 페이지
export type Page = LocalizedPage | 'terms' | 'not-found';

export const isLocalizedPage = (page: Page): page is LocalizedPage =>
    page === 'home' || page === 'about' || page === 'privacy';

export function localePath(locale: Locale, page: LocalizedPage = 'home') {
    const prefix = locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
    return page === 'home' ? prefix : `${prefix}${page}/`;
}

// [...lang] 라우트용: 한국어는 루트(/), 나머지는 /{언어}/
export function localeStaticPaths() {
    return LOCALES.map((locale) => ({
        params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
        props: { locale },
    }));
}

import { OG_IMAGE, SITE_NAME, SITE_URL, UPDATED_AT, absoluteUrl } from '../consts';
import { LOCALE_INFO, LOCALES, localePath, t, type Locale, type LocalizedPage } from '../i18n';

type Thing = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const organization = (): Thing => ({
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
});

const webSite = (locale: Locale): Thing => ({
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: LOCALES.map((l) => LOCALE_INFO[l].htmlLang),
    publisher: { '@id': ORGANIZATION_ID },
    alternateName: t(locale).meta.home.siteName,
});

const breadcrumb = (locale: Locale, page: LocalizedPage, name: string): Thing => ({
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: t(locale).nav.home, item: absoluteUrl(localePath(locale)) },
        { '@type': 'ListItem', position: 2, name, item: absoluteUrl(localePath(locale, page)) },
    ],
});

export function homeJsonLd(locale: Locale) {
    const d = t(locale);
    const url = absoluteUrl(localePath(locale));
    const inLanguage = LOCALE_INFO[locale].htmlLang;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            organization(),
            webSite(locale),
            {
                '@type': 'WebApplication',
                '@id': `${url}#app`,
                name: d.hero.home.title,
                alternateName: d.meta.home.siteName,
                description: d.meta.home.description,
                url,
                image: absoluteUrl(OG_IMAGE.path),
                inLanguage,
                applicationCategory: 'EntertainmentApplication',
                operatingSystem: 'Any',
                browserRequirements: 'Requires JavaScript',
                isAccessibleForFree: true,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                featureList: d.home.steps.map((step) => step.title),
                creator: { '@id': ORGANIZATION_ID },
                dateModified: UPDATED_AT,
            },
            {
                '@type': 'HowTo',
                name: d.home.howTitle,
                inLanguage,
                step: d.home.steps.map((step, index) => ({
                    '@type': 'HowToStep',
                    position: index + 1,
                    name: step.title,
                    text: step.text,
                    url: `${url}#how-it-works`,
                })),
            },
            {
                '@type': 'FAQPage',
                inLanguage,
                mainEntity: d.home.faq.map((item) => ({
                    '@type': 'Question',
                    name: item.q,
                    acceptedAnswer: { '@type': 'Answer', text: item.a },
                })),
            },
        ],
    };
}

export function pageJsonLd(locale: Locale, page: Exclude<LocalizedPage, 'home'>) {
    const d = t(locale);
    const url = absoluteUrl(localePath(locale, page));

    return {
        '@context': 'https://schema.org',
        '@graph': [
            organization(),
            {
                '@type': page === 'about' ? 'AboutPage' : 'WebPage',
                '@id': url,
                url,
                name: d.meta[page].title,
                description: d.meta[page].description,
                inLanguage: LOCALE_INFO[locale].htmlLang,
                isPartOf: { '@id': `${SITE_URL}/#website` },
                dateModified: UPDATED_AT,
            },
            breadcrumb(locale, page, d.nav[page]),
        ],
    };
}

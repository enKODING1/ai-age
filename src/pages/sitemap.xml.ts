import type { APIRoute } from 'astro';
import { UPDATED_AT, absoluteUrl } from '../consts';
import { FALLBACK_LOCALE, LOCALE_INFO, LOCALES, localePath, type LocalizedPage } from '../i18n';

// 언어별 페이지마다 hreflang 대체 링크(xhtml:link)를 함께 기록한다
const LOCALIZED_PAGES: { page: LocalizedPage; priority: string }[] = [
    { page: 'home', priority: '1.0' },
    { page: 'about', priority: '0.7' },
    { page: 'info', priority: '0.5' },
];
const KOREAN_ONLY = ['/privacy/', '/terms/'];

export const GET: APIRoute = () => {
    const urls = LOCALIZED_PAGES.flatMap(({ page, priority }) => {
        const alternates = [
            ...LOCALES.map(
                (l) =>
                    `    <xhtml:link rel="alternate" hreflang="${LOCALE_INFO[l].htmlLang}" href="${absoluteUrl(localePath(l, page))}"/>`,
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localePath(FALLBACK_LOCALE, page))}"/>`,
        ].join('\n');

        return LOCALES.map(
            (locale) => `  <url>
    <loc>${absoluteUrl(localePath(locale, page))}</loc>
    <lastmod>${UPDATED_AT}</lastmod>
    <priority>${priority}</priority>
${alternates}
  </url>`,
        );
    });

    const legal = KOREAN_ONLY.map(
        (path) => `  <url>
    <loc>${absoluteUrl(path)}</loc>
    <lastmod>${UPDATED_AT}</lastmod>
    <priority>0.3</priority>
  </url>`,
    );

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...urls, ...legal].join('\n')}
</urlset>
`;

    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

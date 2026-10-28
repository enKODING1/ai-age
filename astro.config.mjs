import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://aige.netlify.app',
    trailingSlash: 'always',
    build: {
        format: 'directory',
    },
    // 화면에 보이는 링크의 페이지(각 수십 KB)를 미리 받아 두어, 모바일에서도 누르는 즉시 전환된다
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport',
    },
});

import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://aige.netlify.app',
    trailingSlash: 'always',
    build: {
        format: 'directory',
    },
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'hover',
    },
});

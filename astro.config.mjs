import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/medlem') && !page.includes('/admin'),
    }),
  ],
  output: 'static',
  site: 'https://www.ekia.net',
});

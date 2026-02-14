import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://socram.seyfert.dev',
  output: 'server',
  adapter: vercel(),
});

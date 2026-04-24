import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/name-place-faction-generator/',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@gi7b/shared': path.resolve(__dirname, 'shared/src/index.ts'),
      '@gi7b/namegen': path.resolve(__dirname, 'packages/namegen/src/index-browser.ts'),
      '@gi7b/placegen': path.resolve(__dirname, 'packages/placegen/src/index.ts'),
      '@gi7b/factiongen': path.resolve(__dirname, 'packages/factiongen/src/index.ts'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB — bundle includes all LC JSON
      },
      devOptions: { enabled: true },
    }),
  ],
});

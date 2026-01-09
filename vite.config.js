import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*', 'icons/*', 'manifest.webmanifest'],
      manifest: {
        name: 'Old Trail',
        short_name: 'Old Trail',
        start_url: '.',
        display: 'standalone',
        background_color: '#202737',
        theme_color: '#202737',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
      },
    }),
  ],
});

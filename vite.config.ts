import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import imageAtlasManifest from './src/features/question-types/kana-to-picture/data/image-atlas-manifest.json'

const atlasAssets = imageAtlasManifest.atlases.map((atlas) => atlas.src.replace(/^\//, ''))

export default defineConfig({
  build: {
    reportCompressedSize: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', ...atlasAssets],
      manifest: {
        name: 'ManabiNote',
        short_name: 'ManabiNote',
        description: 'ひらがなを楽しく学ぶ学習アプリ',
        start_url: '/',
        display: 'standalone',
        theme_color: '#fef3c7',
        background_color: '#fffaf0',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,webmanifest}',
          'images/**/*.{svg,png,jpg,jpeg,webp}',
          'images/kana-to-picture/atlases/**/*.{svg,png,jpg,jpeg,webp}',
        ],
      },
    }),
  ],
})

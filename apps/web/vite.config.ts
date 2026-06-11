/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vite'
import { defaultExclude } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2020',
    rollupOptions: {
      output: {
        // dict 形式 manualChunks はパッケージのバレルごとチャンク化して
        // tree-shaking を無効化し（lucide-react 全アイコン 601KB）、さらに
        // vendor チャンクが entry の静的依存に入って lazy 化を無効化するため、
        // eager 必須の react / supabase のみ残し、他は自然分割に任せる（#295）
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    // E2E（Playwright）の spec は vitest の収集対象から除外する。
    exclude: [...defaultExclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/test/**', 'src/mocks/**', 'src/content/**'],
      reporter: ['text', 'json-summary'],
    },
  },
})

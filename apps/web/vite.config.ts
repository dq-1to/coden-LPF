/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vite'
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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/view', '@codemirror/state'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'vendor-prism': ['prismjs'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/test/**', 'src/mocks/**', 'src/content/**'],
      reporter: ['text', 'json-summary'],
    },
  },
})

import { defineConfig, devices } from '@playwright/test'

/**
 * Coden E2E 設定（docs/usertest/Utest-e2e.md 準拠）
 * - 共有テストアカウント前提のため直列実行（workers: 1 / fullyParallel: false）
 * - 認証は setup プロジェクトで storageState を生成し、各 spec が再利用する
 */
const PORT = 5173
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './apps/web/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'ja-JP',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 認証セットアップ（storageState を生成）
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})

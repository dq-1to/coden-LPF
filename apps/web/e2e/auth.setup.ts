import { test as setup, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { accounts } from './fixtures/accounts'

/**
 * UI 経由でログインし、storageState を保存する共通処理。
 * 各 spec は test.use({ storageState }) でこの状態を再利用する。
 */
async function authenticate(page: Page, email: string, password: string, statePath: string) {
  await page.goto('/login')
  await page.getByLabel('メールアドレス', { exact: true }).fill(email)
  await page.getByLabel('パスワード', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  // ログイン成功 → ダッシュボードへ遷移
  await expect(page, `login failed for ${email}`).toHaveURL('/', { timeout: 30_000 })

  fs.mkdirSync(path.dirname(statePath), { recursive: true })
  await page.context().storageState({ path: statePath })
}

setup('authenticate general user', async ({ page }) => {
  await authenticate(page, accounts.general.email, accounts.general.password, accounts.general.storageState)
})

setup('authenticate admin user', async ({ page }) => {
  await authenticate(page, accounts.admin.email, accounts.admin.password, accounts.admin.storageState)
})

setup('authenticate complete user', async ({ page }) => {
  await authenticate(page, accounts.complete.email, accounts.complete.password, accounts.complete.storageState)
})

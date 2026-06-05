import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// コードリーディング（/practice/code-reading）。一覧・フィルター・設問の即時フィードバックを検証する。
// PW-READING-03（初回全問正解時のみ加算）は初回限定・永続副作用のため自動化対象外とする。
test.describe('S-READING コードリーディング（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-READING-01 問題一覧と難易度フィルターが表示される', async ({ page }) => {
    await page.goto('/practice/code-reading')
    await expect(page.getByRole('heading', { name: 'コードリーディング', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /カスタムフック（useCounter）/ })).toBeVisible()

    const basicTab = page.getByRole('tab', { name: '基礎' })
    await basicTab.click()
    await expect(basicTab).toHaveAttribute('aria-selected', 'true')
  })

  test('PW-READING-02 設問に回答すると即時フィードバックが表示される', async ({ page }) => {
    await page.goto('/practice/code-reading')
    await page.getByRole('button', { name: /カスタムフック（useCounter）/ }).click()

    // 設問ビュー（最初の設問は最終設問ではないため、回答しても採点送信は走らない）
    await page.getByRole('button', { name: /^A\./ }).click()
    await page.getByRole('button', { name: '回答する' }).click()

    // 即時フィードバック（正誤いずれか）と次設問への導線が表示される
    await expect(page.getByRole('button', { name: /次の設問へ/ })).toBeVisible()
  })
})

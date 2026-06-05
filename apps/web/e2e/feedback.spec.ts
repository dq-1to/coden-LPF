import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// フィードバック投稿（general アカウント）。FAB からダイアログを開いて送信完了までを検証する。
// 投稿データは一意接頭辞 pw-feedback- を使い、次回実行と衝突しないようにする。
// PW-FEEDBACK-03（管理側一覧反映）は管理者閲覧が必要なため admin 側ライフサイクルで担保する。
test.describe('S-FEEDBACK フィードバック投稿（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-FEEDBACK-01 FAB からフィードバックダイアログを開く', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'フィードバックを送る' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('不具合報告・要望・レビューなど、運営宛てに送信できます。')).toBeVisible()
  })

  test('PW-FEEDBACK-02 メッセージを入力して送信 → 完了表示', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'フィードバックを送る' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('気づいた点・ご要望など自由に記入してください').fill(`pw-feedback-${Date.now()}`)

    const writePromise = page.waitForResponse(
      (r) => r.url().includes('user_feedback') && r.request().method() === 'POST',
    )
    await dialog.getByRole('button', { name: '送信' }).click()
    await writePromise

    await expect(page.getByText('送信しました。ありがとうございます！')).toBeVisible()
  })
})

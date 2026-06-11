import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 例外系（失敗注入）。通常系と分離。route で API を abort して失敗時 UI を検証する。
// PW-ERR-01（API Practice 通信失敗→再試行）/ PW-ERR-04（楽観的更新ロールバック）は
// 対象画面の API 経路特定が必要なため別途、PW-ERR-03（Supabase 設定不備）は起動時 env 依存のため
// 自動化対象外（手動）とする。
test.describe('S-ERR 例外系（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-ERR-02 フィードバック送信失敗時にエラーを表示する', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'フィードバックを送る' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('気づいた点・ご要望など自由に記入してください').fill('pw-feedback-err')

    // user_feedback への書込みを失敗注入（実データは作成されない）
    await page.route('**/user_feedback*', (route) => route.abort())

    await dialog.getByRole('button', { name: '送信' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
  })
})

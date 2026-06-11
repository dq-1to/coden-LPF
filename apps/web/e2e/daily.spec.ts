import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// デイリーチャレンジ（/daily）。完了済みステップが必要なため complete アカウントを使う。
// 当日問題は「未回答=出題カード / 回答済み=完了ビュー」のいずれか（1日1回・状態依存）。
// PW-DAILY-02（回答→加算）/ PW-DAILY-03（再訪で完了済み）は当日1回限りで不可逆のため
// 自動化対象外とし、ここでは見出し・サブタイトル・週間ステータスの表示を検証する。
test.describe('S-DAILY デイリーチャレンジ（認証済み・complete）', () => {
  test.use({ storageState: accounts.complete.storageState })

  test('PW-DAILY-01 デイリーチャレンジ画面が表示される', async ({ page }) => {
    await page.goto('/daily')
    await expect(page.getByRole('heading', { name: 'デイリーチャレンジ', level: 1 })).toBeVisible()
    await expect(page.getByText('完了済みステップから毎日1問出題されます')).toBeVisible()
  })

  test('PW-DAILY-04 週間ステータス（今週の達成状況）が表示される', async ({ page }) => {
    await page.goto('/daily')
    await expect(page.getByRole('heading', { name: '今週の達成状況' })).toBeVisible()
  })
})

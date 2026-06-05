import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 通知（ユーザー側 /notifications）。
// PW-NOTIF-02（未読→既読化でバッジ減少）は配信済み通知データが前提のため、
// 管理者送信→ユーザー受信を1連で見る S-ADMIN（PW-ADMIN-03）側で担保する。
// PW-NOTIF-03（通知0件の空状態）は「受信ゼロが保証されたアカウント」が前提だが、
// 共有テストDBでは target_role=all/learner の配信済み通知が存在しうるため自動化対象外。
test.describe('S-NOTIF 通知ユーザー側（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-NOTIF-01 /notifications でポスト一覧ページが表示される', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: 'ポスト', level: 1 })).toBeVisible()
    await expect(page.getByText(/新着 \d+ 件/)).toBeVisible()
  })
})

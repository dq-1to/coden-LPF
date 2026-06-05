import { test, expect, type Page } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 管理者機能（admin アカウント）。表示・遷移の堅牢なケースを検証する。
//
// 注意: /admin への直接 goto は isAdmin 取得前（isLoadingAuth=false かつ isAdmin=初期false）に
// AdminGuard が一瞬 / へリダイレクトするレースに当たる。そのため必ずダッシュボードから
// isAdmin 解決後にアプリ内遷移（クリック）で /admin に入る。
// is_admin=true のアカウントが無い環境（既定シードの e2e-admin 等）は自動スキップする。
//
// PW-ADMIN-02（フィードバック更新）/ PW-ADMIN-03（通知送受信）は書込み・クロスアカウントのため
// 本specには含めない（書込みを伴うため別途・専用データ前提で扱う）。
async function enterAdmin(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'カリキュラム' }).click()
  const adminItem = page.getByRole('menuitem', { name: '管理画面' })
  const available = await adminItem
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  test.skip(!available, 'is_admin=true のアカウントが必要（提供アカウントが管理者でない/未シード）')
  await adminItem.click()
  await expect(page).toHaveURL('/admin')
}

test.describe('S-ADMIN 管理者機能（認証済み・admin）', () => {
  test.use({ storageState: accounts.admin.storageState })

  test('PW-ADMIN-01 /admin ダッシュボードが表示される', async ({ page }) => {
    await enterAdmin(page)
    await expect(page.getByRole('heading', { name: '管理画面', level: 1 })).toBeVisible()
  })

  test('PW-ADMIN-04 ユーザー一覧 → 詳細を表示できる', async ({ page }) => {
    await enterAdmin(page)
    // サイドバーのリンク名はラベル完全一致。ダッシュボードのカード（説明付きで名前が長い）と区別する。
    await page.getByRole('link', { name: 'ユーザー', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'ユーザー一覧', level: 1 })).toBeVisible()

    await page.locator('main a[href^="/admin/users/"]').first().click()
    await expect(page).toHaveURL(/\/admin\/users\/.+/)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('PW-ADMIN-05 統計・品質・Step Insights・運用ページが表示される', async ({ page }) => {
    await enterAdmin(page)
    const targets = [
      { link: '統計', heading: '統計' },
      { link: '品質ダッシュボード', heading: '品質ダッシュボード' },
      { link: 'Step Insights', heading: 'Step Insights' },
      { link: '運用', heading: '運用' },
    ] as const
    for (const { link, heading } of targets) {
      await page.getByRole('link', { name: link, exact: true }).click()
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    }
  })
})

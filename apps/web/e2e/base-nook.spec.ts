import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// ベースヌックはコンテンツ静的・進捗マップ読込のみ。general アカウントで一覧/詳細遷移を検証する。
test.describe('S-NOOK ベースナック（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-NOOK-01 トピック一覧が表示される', async ({ page }) => {
    await page.goto('/base-nook')
    await expect(page.getByRole('heading', { name: 'ベースヌック', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /JavaScriptって何？/ })).toBeVisible()
  })

  test('PW-NOOK-02 トピック詳細が 404 にならず表示される', async ({ page }) => {
    await page.goto('/base-nook')
    await page.getByRole('button', { name: /JavaScriptって何？/ }).click()

    await expect(page).toHaveURL('/base-nook/javascript')
    await expect(page.getByRole('heading', { name: 'JavaScriptって何？', level: 1 })).toBeVisible()
  })
})

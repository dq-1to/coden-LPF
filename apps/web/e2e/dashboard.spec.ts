import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

test.describe('S-DASH ダッシュボード（認証済み・complete）', () => {
  test.use({ storageState: accounts.complete.storageState })

  test('PW-DASH-01 ウェルカムメッセージにユーザー名', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /こんにちは、.*さん/ })).toBeVisible()
  })

  test('PW-DASH-02 ヘッダーの Pt・連続がリロード後も維持（DB反映）', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Pt/).first()).toBeVisible()
    await expect(page.getByText(/日連続/).first()).toBeVisible()

    await page.reload()
    await expect(page.getByText(/Pt/).first()).toBeVisible()
    await expect(page.getByText(/日連続/).first()).toBeVisible()
  })

  test('PW-DASH-03 学習コースカードが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '学習コース' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'React', exact: true })).toBeVisible()
  })

  test('PW-DASH-05 学習ステータス・ヒートマップが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '学習ステータス' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '学習ヒートマップ' })).toBeVisible()
  })
})

test.describe('S-DASH ダッシュボード（認証済み・general / ロック）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-DASH-04 未解放ステップ直アクセスは / へリダイレクト', async ({ page }) => {
    // ロックはコース前提条件ベース。general(進捗ゼロ)は react-fundamentals 未完了のため
    // react-hooks コースの useeffect はロックされ、ダッシュボードへリダイレクトされる。
    await page.goto('/step/useeffect')
    await expect(page).toHaveURL('/')
  })
})

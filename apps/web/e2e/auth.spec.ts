import { test, expect } from '@playwright/test'
import { accounts, PASSWORD } from './fixtures/accounts'

/** 未認証時にリダイレクトされるべき保護ルート */
const PROTECTED_PATHS = [
  '/',
  '/profile',
  '/step/usestate-basic',
  '/daily',
  '/curriculum',
  '/practice/code-doctor',
  '/notifications',
]

test.describe('S-AUTH 認証・ルートガード（未認証）', () => {
  test('PW-AUTH-01 未認証で / にアクセスすると /login へ', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('PW-AUTH-02 未認証で保護ルートは /login へ', async ({ page }) => {
    for (const p of PROTECTED_PATHS) {
      await page.goto(p)
      await expect(page, `path=${p}`).toHaveURL(/\/login/)
    }
  })

  test('PW-AUTH-03 正しい認証でログイン成功 → ダッシュボード', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス', { exact: true }).fill(accounts.general.email)
    await page.getByLabel('パスワード', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('PW-AUTH-04 誤った認証はエラー表示・/login に留まる', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス', { exact: true }).fill(accounts.general.email)
    await page.getByLabel('パスワード', { exact: true }).fill('WrongPass-000')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('PW-AUTH-06a サインアップ: 不正なメール形式でエラー（クライアント検証）', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('メールアドレス', { exact: true }).fill('not-an-email')
    await page.getByLabel('パスワード', { exact: true }).fill('ValidPass123')
    await page.getByRole('button', { name: 'アカウントを作成' }).click()

    await expect(page.getByText('正しいメールアドレスを入力してください。')).toBeVisible()
  })

  test('PW-AUTH-06b サインアップ: 短いパスワードでエラー（クライアント検証）', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('メールアドレス', { exact: true }).fill('newuser@coden.dev')
    await page.getByLabel('パスワード', { exact: true }).fill('short')
    await page.getByRole('button', { name: 'アカウントを作成' }).click()

    await expect(page.getByText('パスワードは8文字以上で入力してください。')).toBeVisible()
  })

  // PW-AUTH-06 サインアップ happy path は実 DB にユーザーを作成し、anon 権限では削除できないため自動化しない。
  // 手動 or 管理 API（service_role）でのクリーンアップ手順を整備してから対応する。
  test.skip('PW-AUTH-06 サインアップ happy path（実ユーザー作成のため要クリーンアップ設計）', () => {})

  test('PW-AUTH-10 存在しない URL は NotFound を表示', async ({ page }) => {
    await page.goto('/no-such-page-xyz')
    await expect(page.getByText('404 Not Found')).toBeVisible()
  })
})

test.describe('S-AUTH 認証・ルートガード（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-AUTH-05 認証済みで /login /signup は / へ', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/')
    await page.goto('/signup')
    await expect(page).toHaveURL('/')
  })

  test('PW-AUTH-07 ログアウトで /login、再訪も /login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'ログアウト' }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('PW-AUTH-08 リロードでセッション維持', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await page.reload()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()
  })

  test('PW-AUTH-09 一般ユーザーは /admin にアクセスできず / へ', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/')
  })
})

import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

test.describe('S-NAV ヘッダー/ナビゲーション（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-NAV-01 ロゴクリックで / へ', async ({ page }) => {
    await page.goto('/profile')
    await page.getByRole('link', { name: 'Coden ホームへ戻る' }).click()
    await expect(page).toHaveURL('/')
  })

  test('PW-NAV-02 主要リンクが正しい URL へ', async ({ page }) => {
    // ページ本文にも同名リンク（例: プロフィールページの「ベースヌック」カード）が
    // 存在するため、ヘッダーのメインナビゲーションにスコープする。
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'メインナビゲーション' })

    await nav.getByRole('link', { name: 'プロフィール' }).click()
    await expect(page).toHaveURL('/profile')

    await nav.getByRole('link', { name: 'ベースヌック' }).click()
    await expect(page).toHaveURL('/base-nook')

    await nav.getByRole('link', { name: 'ダッシュボード' }).click()
    await expect(page).toHaveURL('/')
  })

  test('PW-NAV-02b カリキュラムドロップダウンから練習モードへ', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'カリキュラム' }).click()
    await page.getByRole('menuitem', { name: 'デイリーチャレンジ' }).click()
    await expect(page).toHaveURL('/daily')
  })

  test('PW-NAV-03 一般ユーザーには管理画面リンクが表示されない', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'カリキュラム' }).click()
    await expect(page.getByRole('menuitem', { name: '管理画面' })).toHaveCount(0)
  })

  test('PW-NAV-04 通知ベルから /notifications へ', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /お知らせ/ }).click()
    await expect(page).toHaveURL('/notifications')
  })

  test('PW-NAV-05 ステップから戻るとダッシュボードへ', async ({ page }) => {
    await page.goto('/')
    await page.goto('/step/usestate-basic')
    await expect(page).toHaveURL('/step/usestate-basic')
    await page.goBack()
    await expect(page).toHaveURL('/')
  })
})

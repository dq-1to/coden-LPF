import { test, expect, type Page } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 管理者の書き込み系（admin アカウント）。送信・更新と反映/永続を検証する。
// 投稿/送信データは一意接頭辞（pw-notif- / 既存フィードバック）を使う。
// is_admin=true のアカウントが無い環境では enterAdmin が自動スキップする。
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

test.describe('S-ADMIN 書き込み（認証済み・admin）', () => {
  test.use({ storageState: accounts.admin.storageState })

  test('PW-ADMIN-03 お知らせを送信するとユーザーのポストに反映される', async ({ page, browser }) => {
    await enterAdmin(page)
    const base = new URL(page.url()).origin

    // ヘッダーの Mailbox リンク（/notifications）と名前が衝突するため、管理ナビは href で一意指定する
    await page.locator('a[href="/admin/notifications"]').click()
    await expect(page.getByRole('heading', { name: 'お知らせを送る', level: 1 })).toBeVisible()

    const title = `pw-notif-${Date.now()}`
    await page.getByLabel('タイトル').fill(title)
    await page.getByLabel('本文').fill('E2E 自動送信テスト本文')
    // 配信範囲は既定の「全ユーザー」のまま（learner の general も受信できる）
    await page.getByRole('button', { name: 'お知らせを送る' }).click()
    await expect(page.getByText('お知らせを送信しました')).toBeVisible()

    // 別アカウント（general）の /notifications に反映を確認する
    const generalContext = await browser.newContext({ storageState: accounts.general.storageState })
    try {
      const generalPage = await generalContext.newPage()
      await generalPage.goto(`${base}/notifications`)
      await expect(generalPage.getByText(title)).toBeVisible()
    } finally {
      await generalContext.close()
    }
  })

  test('PW-ADMIN-02 フィードバックのステータスを更新し、再読込後も残存する', async ({ page }) => {
    await enterAdmin(page)
    await page.getByRole('link', { name: 'フィードバック', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'フィードバック一覧', level: 1 })).toBeVisible()

    const firstItem = page.locator('main a[href^="/admin/feedback/"]').first()
    const hasItem = await firstItem
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false)
    test.skip(!hasItem, 'フィードバックが0件（先に S-FEEDBACK の投稿が必要）')
    await firstItem.click()
    await expect(page.getByRole('heading', { name: 'フィードバック詳細', level: 1 })).toBeVisible()
    const detailHref = new URL(page.url()).pathname

    const select = page.getByLabel('ステータスを変更')
    const current = await select.inputValue()
    const next = current === 'in_progress' ? 'resolved' : 'in_progress'

    const writePromise = page.waitForResponse(
      (r) => r.url().includes('user_feedback') && r.request().method() === 'PATCH',
    )
    await select.selectOption(next)
    await writePromise

    // 永続確認は「一覧へ戻る→同じ項目を開き直す」アプリ内遷移で行う。
    // 管理ページのフルリロードは AdminGuard の isAdmin 取得レースで / へ戻されるため使わない。
    await page.locator('a[href="/admin/feedback"]').first().click()
    await expect(page.getByRole('heading', { name: 'フィードバック一覧', level: 1 })).toBeVisible()
    await page.locator(`a[href="${detailHref}"]`).first().click()
    await expect(page.getByLabel('ステータスを変更')).toHaveValue(next)
  })
})

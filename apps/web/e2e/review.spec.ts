import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 復習キューは DB ベース（reviewService）。不正解で open 登録、正解で resolve される。
// general アカウントで「誤答→出現→正答→消滅」を1連で検証し、自己クリーンアップする。
test.describe('S-REVIEW 復習キュー（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-REVIEW-01 誤答で復習キュー出現 → 正答で消滅', async ({ page }) => {
    const reviewCard = page.getByText(/復習待ち \d+ 件/)

    // 初期状態: open なし → カード非表示
    await page.goto('/')
    await expect(reviewCard).toHaveCount(0)

    // Test を誤答 → 復習に登録される（DB書込み完了を待ってから遷移）
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('wrong')
    const writePromise = page.waitForResponse(
      (r) => r.url().includes('review_items') && ['POST', 'PATCH'].includes(r.request().method()),
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('必要キーワードを満たしていません。')).toBeVisible()
    await writePromise

    // ダッシュボードに復習キューカードが出現
    await page.goto('/')
    await expect(reviewCard).toBeVisible()

    // 正答 → 復習が解決される（resolve の PATCH 完了を待つ）
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('setCount(count - 1)')
    const resolvePromise = page.waitForResponse(
      (r) => r.url().includes('review_items') && r.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('テスト合格！ ライブプレビューが解禁されました。')).toBeVisible()
    await resolvePromise

    // ダッシュボードから復習キューカードが消滅
    await page.goto('/')
    await expect(reviewCard).toHaveCount(0)
  })
})

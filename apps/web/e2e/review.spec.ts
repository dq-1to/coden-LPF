import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 復習キューは DB ベース（reviewService）。不正解で即日 due 登録、正解で翌日送りになる。
// general アカウントで「誤答→出現→正答→消滅」を1連で検証し、カード非表示へ戻す。
test.describe('S-REVIEW 復習キュー（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-REVIEW-01 誤答で復習キュー出現 → 正答で消滅', async ({ page }) => {
    const reviewCard = page.getByText(/今日の復習 \d+ 件/)

    // 初期状態: due なし → カード非表示
    await page.goto('/')
    await expect(reviewCard).toHaveCount(0)

    // Test を誤答 → 復習に登録される（DB書込み完了を待ってから遷移）
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('wrong')
    const writePromise = page.waitForResponse(
      (r) => r.url().includes('review_items') && ['POST', 'PATCH'].includes(r.request().method()),
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('もう少しです。条件を確認してみましょう。')).toBeVisible()
    await expect(page.getByText('以下の条件を満たせているか確認しましょう:')).toBeVisible()
    await writePromise

    // ダッシュボードに復習キューカードが出現
    await page.goto('/')
    await expect(reviewCard).toBeVisible()

    // 正答 → 復習が翌日送りになる（PATCH 完了を待つ）
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('setCount(count - 1)')
    const schedulePromise = page.waitForResponse(
      (r) => r.url().includes('review_items') && r.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('テスト合格！ ライブプレビューが解禁されました。')).toBeVisible()
    await schedulePromise

    // ダッシュボードから復習キューカードが消滅
    await page.goto('/')
    await expect(reviewCard).toHaveCount(0)
  })
})

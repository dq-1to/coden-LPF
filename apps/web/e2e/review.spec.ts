import { test, expect, type Page } from '@playwright/test'
import { accounts } from './fixtures/accounts'
import { deleteReviewItems, getReviewItemState, type ReviewItemTarget } from './fixtures/reviewCleanup'

// 復習キューは DB ベース（reviewService）。誤答で即日 due 登録、正解で翌日送りになる。
// general アカウントで「誤答→出現→正答→翌日送り」を1連で検証する。
//
// 正解後の item は stage 1 / open / 翌日待ちで DB に残るため、
// 共有アカウントを汚さないよう前後で本人権限（anon key + general session）で削除する。
// これにより同じ spec を連続実行できる。

/** TestMode が保存する review item（questionId は TestMode 固定値 'test'） */
const TARGET: ReviewItemTarget = {
  stepId: 'usestate-basic',
  mode: 'test',
  questionId: 'test',
}

const DUE_COUNT_PATTERN = /今日の復習 (\d+) 件/

/**
 * ダッシュボードの due 件数を読む。
 * 「共有アカウントに due が 1 件もない」前提に依存しないよう、絶対値ではなく
 * baseline との差分で検証するために使う。
 */
async function readDueCount(page: Page): Promise<number> {
  await page.goto('/')
  // 復習カードの有無を判定する前に、ダッシュボード本体の描画を待つ
  await expect(page.getByRole('heading', { name: /こんにちは、.*さん/ })).toBeVisible()

  const card = page.getByText(DUE_COUNT_PATTERN)
  await expect(page.getByText('今日の復習を確認中')).toHaveCount(0)

  if ((await card.count()) === 0) return 0

  const match = (await card.first().innerText()).match(DUE_COUNT_PATTERN)
  return match ? Number(match[1]) : 0
}

test.describe('S-REVIEW 復習キュー（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  // 前回失敗時の残骸を消してから始める
  test.beforeEach(async () => {
    await deleteReviewItems([TARGET])
  })

  // 途中で失敗しても今回作成した行を残さない
  test.afterEach(async () => {
    await deleteReviewItems([TARGET])
  })

  test('PW-REVIEW-01 誤答で復習キュー出現 → 正答で翌日送り', async ({ page }) => {
    const baselineDueCount = await readDueCount(page)

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

    // DB上も stage 0 / 即日 due になっている
    const afterWrong = await getReviewItemState(TARGET)
    expect(afterWrong).not.toBeNull()
    expect(afterWrong?.status).toBe('open')
    expect(afterWrong?.review_stage).toBe(0)
    expect(new Date(afterWrong?.next_review_at ?? 0).getTime()).toBeLessThanOrEqual(Date.now())

    // ダッシュボードの due 件数が 1 件増える
    expect(await readDueCount(page)).toBe(baselineDueCount + 1)

    // 正答 → SRS RPC で翌日送りになる（RPC 完了を待つ）
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('setCount(count - 1)')
    const schedulePromise = page.waitForResponse(
      (r) => r.url().includes('advance_review_item_if_due') && r.request().method() === 'POST',
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('テスト合格！ ライブプレビューが解禁されました。')).toBeVisible()
    await schedulePromise

    // DB上は stage 1 / open / 未来日時（resolved ではない）
    const afterCorrect = await getReviewItemState(TARGET)
    expect(afterCorrect).not.toBeNull()
    expect(afterCorrect?.status).toBe('open')
    expect(afterCorrect?.review_stage).toBe(1)
    expect(new Date(afterCorrect?.next_review_at ?? 0).getTime()).toBeGreaterThan(Date.now())

    // due 件数が baseline に戻る
    expect(await readDueCount(page)).toBe(baselineDueCount)
  })

  test('PW-REVIEW-02 期日前の再正解では stage が進まない', async ({ page }) => {
    // 誤答で stage 0 / 即日 due にする
    await page.goto('/step/usestate-basic?mode=test')
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('wrong')
    const writePromise = page.waitForResponse(
      (r) => r.url().includes('review_items') && ['POST', 'PATCH'].includes(r.request().method()),
    )
    await page.getByRole('button', { name: '判定する' }).click()
    await writePromise

    // 1回目の正解で stage 1 / 翌日送り
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('setCount(count - 1)')
    const firstAdvance = page.waitForResponse((r) => r.url().includes('advance_review_item_if_due'))
    await page.getByRole('button', { name: '判定する' }).click()
    await firstAdvance
    expect((await getReviewItemState(TARGET))?.review_stage).toBe(1)

    // 期日前にもう一度正解しても stage は進まない（連打で resolved まで到達しない）
    await page.reload()
    await page.getByRole('textbox', { name: 'コードの空欄を入力' }).fill('setCount(count - 1)')
    const secondAdvance = page.waitForResponse((r) => r.url().includes('advance_review_item_if_due'))
    await page.getByRole('button', { name: '判定する' }).click()
    await secondAdvance

    const afterRepeat = await getReviewItemState(TARGET)
    expect(afterRepeat?.review_stage).toBe(1)
    expect(afterRepeat?.status).toBe('open')
  })
})

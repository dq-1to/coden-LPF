import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// コードドクター（/practice/code-doctor）。一覧・フィルター・不正解フィードバックを検証する。
// PW-DOCTOR-02（正解→ポイント）/ PW-DOCTOR-04（クリア状態の永続）は正解コードの内容依存・
// 永続副作用のため自動化対象外（手動 or 別途データ前提）とする。
test.describe('S-DOCTOR コードドクター（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-DOCTOR-01 問題一覧と難易度フィルターが表示される', async ({ page }) => {
    await page.goto('/practice/code-doctor')
    await expect(page.getByRole('heading', { name: 'コードドクター', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /リストに key がない/ })).toBeVisible()

    // 難易度フィルター（初級）に切り替えられる
    const beginnerTab = page.getByRole('tab', { name: '初級' })
    await beginnerTab.click()
    await expect(beginnerTab).toHaveAttribute('aria-selected', 'true')
  })

  test('PW-DOCTOR-03 未修正コードの判定で不正解フィードバックが表示される', async ({ page }) => {
    await page.goto('/practice/code-doctor')
    await page.getByRole('button', { name: /リストに key がない/ }).click()

    // 問題ビュー
    await expect(page.getByRole('heading', { name: 'リストに key がない', level: 2 })).toBeVisible()

    // バグ入りコードのまま判定 → 不正解フィードバック
    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('まだバグが残っています')).toBeVisible()
  })
})

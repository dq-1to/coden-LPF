import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// ミニプロジェクト（/practice/mini-projects）。一覧と詳細ページ遷移を検証する。
// PW-PROJ-03（マイルストーン判定→完了で加算）/ PW-PROJ-04（完了状態の永続）は
// 実装内容依存・永続副作用のため自動化対象外とする。
test.describe('S-PROJ ミニプロジェクト（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-PROJ-01 プロジェクト一覧と難易度フィルターが表示される', async ({ page }) => {
    await page.goto('/practice/mini-projects')
    await expect(page.getByRole('heading', { name: 'ミニプロジェクト', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /Todo App/ })).toBeVisible()

    const beginnerTab = page.getByRole('tab', { name: '初級' })
    await beginnerTab.click()
    await expect(beginnerTab).toHaveAttribute('aria-selected', 'true')
  })

  test('PW-PROJ-02 詳細ページ（/:projectId）でエディタ付きの実装画面が表示される', async ({ page }) => {
    await page.goto('/practice/mini-projects')
    await page.getByRole('button', { name: /Todo App/ }).click()

    await expect(page).toHaveURL('/practice/mini-projects/todo-app')
    await expect(page.getByRole('button', { name: '判定する' })).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// 全ステップ解放済みの complete アカウントで学習フローの UI 挙動を検証する。
// ポイント加算・完了の永続値は状態依存のため assert せず、判定 UI・遷移・入力を確認する。
test.describe('S-LEARN 学習フロー（認証済み・complete）', () => {
  test.use({ storageState: accounts.complete.storageState })

  test('PW-LEARN-01 ステップページにヘッダー・パンくず・モードタブ', async ({ page }) => {
    await page.goto('/step/usestate-basic')
    await expect(page.getByRole('heading', { name: 'useStateの基礎', level: 1 })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'パンくずリスト' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Read' })).toBeVisible()
  })

  test('PW-LEARN-02 学習モードタブを切り替えられる', async ({ page }) => {
    await page.goto('/step/usestate-basic')
    await expect(page.getByRole('heading', { name: 'Read', level: 2 })).toBeVisible()

    await page.getByRole('tab', { name: 'Practice' }).click()
    await expect(page.getByRole('heading', { name: 'Practice', level: 2 })).toBeVisible()

    await page.getByRole('tab', { name: 'Test' }).click()
    await expect(page.getByRole('heading', { name: 'Test', level: 2 })).toBeVisible()
  })

  test('PW-LEARN-03 Practice: 判定前は判定されず、誤答で解説が表示される', async ({ page }) => {
    await page.goto('/step/usestate-basic?mode=practice')

    // 判定ボタン押下前は正誤表示なし
    await expect(page.getByText('不正解です。もう一度試してください。')).toHaveCount(0)

    // Q1 で誤答を選択（answer は「いいえ」なので「はい」を選ぶ）
    await page.getByRole('radiogroup', { name: 'Q1 選択肢' }).getByRole('radio', { name: 'はい' }).click()
    // 入力中（判定前）はまだ判定されない
    await expect(page.getByText('不正解です。もう一度試してください。')).toHaveCount(0)

    await page.getByRole('button', { name: '判定する' }).click()
    await expect(page.getByText('まだ不正解の問題があります。')).toBeVisible()
    await expect(page.getByText('解説').first()).toBeVisible()
  })

  test('PW-LEARN-06 Test: コード空欄に入力でき、誤答で解説が表示される', async ({ page }) => {
    await page.goto('/step/usestate-basic?mode=test')

    const blank = page.getByRole('textbox', { name: 'コードの空欄を入力' })
    await blank.fill('wrong')
    await page.getByRole('button', { name: '判定する' }).click()

    await expect(page.getByText('必要キーワードを満たしていません。')).toBeVisible()
    await expect(page.getByText('解説').first()).toBeVisible()
  })

  test('PW-LEARN-07 Test: 正答で合格表示', async ({ page }) => {
    await page.goto('/step/usestate-basic?mode=test')

    const blank = page.getByRole('textbox', { name: 'コードの空欄を入力' })
    await blank.fill('setCount(count - 1)')
    await page.getByRole('button', { name: '判定する' }).click()

    await expect(page.getByText('テスト合格！ ライブプレビューが解禁されました。')).toBeVisible()
  })

  test('PW-LEARN-12 代表ステップが 404・リダイレクトなく表示される', async ({ page }) => {
    const stepIds = ['useeffect', 'custom-hooks', 'api-counter-get', 'error-boundary', 'ts-types']
    for (const id of stepIds) {
      await page.goto(`/step/${id}`)
      await expect(page, `step=${id}`).toHaveURL(`/step/${id}`)
      // Read の markdown にも h1 があるため、ページ見出し（先頭の h1）を確認する
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    }
  })
})

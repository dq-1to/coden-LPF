import { test, expect } from '@playwright/test'
import { accounts } from './fixtures/accounts'

// プロフィール（/profile）。general アカウントで表示名編集の永続と統計・実績表示を検証する。
test.describe('S-PROFILE プロフィール（認証済み・general）', () => {
  test.use({ storageState: accounts.general.storageState })

  test('PW-PROFILE-02 統計・実績が表示される', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'プロフィール', level: 1 })).toBeVisible()
    await expect(page.getByText('総ポイント')).toBeVisible()
    await expect(page.getByRole('heading', { name: '実績バッジ' })).toBeVisible()
  })

  test('PW-PROFILE-01 表示名を編集・保存し、再読込後も残存する', async ({ page }) => {
    await page.goto('/profile')
    const input = page.getByPlaceholder('表示名を入力')
    // 初期表示名のロード完了を待つ。getProfile が遅延解決して fill 内容を上書きするのを防ぐ。
    await expect(input).not.toHaveValue('')

    const original = await input.inputValue()
    const nextName = `pw-profile-${Date.now()}`

    try {
      await input.fill(nextName)
      await page.getByRole('button', { name: '表示名を保存' }).click()
      await expect(page.getByText('プロフィール名を更新しました。')).toBeVisible()

      // 再読込後も保存値が残存する
      await page.reload()
      await expect(page.getByPlaceholder('表示名を入力')).toHaveValue(nextName)
    } finally {
      // 後始末: 元の表示名へ戻す
      const restore = page.getByPlaceholder('表示名を入力')
      await expect(restore).not.toHaveValue('')
      await restore.fill(original)
      await page.getByRole('button', { name: '表示名を保存' }).click()
      await page.getByText('プロフィール名を更新しました。').waitFor({ timeout: 10_000 }).catch(() => undefined)
    }
  })
})

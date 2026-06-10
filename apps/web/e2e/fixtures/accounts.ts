/**
 * E2E テストアカウント定義（Git 管理外の seed SQL で投入）。
 * 実値は環境変数で上書き可能。パスワードは既定のテスト用値を使う。
 * admin のみ別アカウント検証用に E2E_ADMIN_PASSWORD で個別上書きできる。
 */
export const PASSWORD = process.env.E2E_PASSWORD ?? 'TestPass123!'

export const accounts = {
  /** 進捗ゼロの一般ユーザー */
  general: {
    email: process.env.E2E_GENERAL_EMAIL ?? 'e2e-general@coden.dev',
    password: PASSWORD,
    storageState: 'apps/web/e2e/.auth/general.json',
  },
  /** 管理者（profiles.is_admin = true） */
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@coden.dev',
    password: process.env.E2E_ADMIN_PASSWORD ?? PASSWORD,
    storageState: 'apps/web/e2e/.auth/admin.json',
  },
  /** 全40ステップ完了済み */
  complete: {
    email: process.env.E2E_COMPLETE_EMAIL ?? 'e2e-complete@coden.dev',
    password: PASSWORD,
    storageState: 'apps/web/e2e/.auth/complete.json',
  },
} as const

/**
 * E2E テストアカウント定義（apps/web/supabase/sql/025_seed_e2e_accounts.sql で投入）。
 * 実値は環境変数で上書き可能。パスワードは既定でシードと同じ TestPass123!。
 */
export const PASSWORD = process.env.E2E_PASSWORD ?? 'TestPass123!'

export const accounts = {
  /** 進捗ゼロの一般ユーザー */
  general: {
    email: process.env.E2E_GENERAL_EMAIL ?? 'e2e-general@coden.dev',
    storageState: 'apps/web/e2e/.auth/general.json',
  },
  /** 管理者（profiles.is_admin = true） */
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@coden.dev',
    storageState: 'apps/web/e2e/.auth/admin.json',
  },
  /** 全40ステップ完了済み */
  complete: {
    email: process.env.E2E_COMPLETE_EMAIL ?? 'e2e-complete@coden.dev',
    storageState: 'apps/web/e2e/.auth/complete.json',
  },
} as const

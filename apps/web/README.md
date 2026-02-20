# Coden Web（MVP）

React学習プラットフォーム Coden のMVPフロントエンドです。

## 前提環境

- Node.js 22 系推奨
- npm
- Supabase プロジェクト（Auth / DB）
- Windows PowerShell 5.1 利用時は `cmd /c npm ...` で実行

## ローカル起動手順

```bash
cd apps/web
npm install
copy .env.local.example .env.local
```

`.env.local` に以下を設定してください。

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

その後、以下で開発サーバーを起動します。

```bash
cmd /c npm run dev
```

## 品質チェック

```bash
cmd /c npm run typecheck
cmd /c npm run build
```

## Supabase SQL 適用順

1. `apps/web/supabase/sql/001_schema_and_rls.sql`
2. `apps/web/supabase/sql/002_seed_test_users.sql`

## テストユーザー

`002_seed_test_users.sql` 適用後、以下でログインできます。

- Email: `test01@coden.dev` / Password: `TestPass123!`
- Email: `test02@coden.dev` / Password: `TestPass123!`

## MVP機能（M1〜M2）

- 認証（ログイン/ログアウト）
- 保護ルート（`/`、`/step/:stepId`）
- ダッシュボード（完了ステップ数表示）
- 学習画面4モード（Read / Practice / Test / Challenge）
- `step_progress` への進捗保存（UPSERT）

## M3-1 手動テスト結果

詳細は `apps/web/docs/m3-1-manual-test-checklist.md` を参照してください。

- 20項目中: PASS 18 / BLOCKED 2
- BLOCKED理由:
  - Supabase接続情報未設定環境では実DBを使った認証導線確認ができない
  - 複数ユーザーでのRLS分離の実測には実DB接続が必要

## M3-2 ユーザーテスト開始条件

ユーザーテスト開始は以下を満たした時点とします。

1. `apps/web/.env.local` に本番または検証用 Supabase 接続情報が設定済み
2. SQL 2本の適用が完了している
3. 上記テストユーザーでログイン可能
4. `cmd /c npm run typecheck` と `cmd /c npm run build` が成功

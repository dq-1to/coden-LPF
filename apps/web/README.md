# Coden Web (M1-1)

## セットアップ

```bash
cd apps/web
npm install
npm run dev
```

## 必須環境変数

`apps/web/.env.local.example` を `apps/web/.env.local` にコピーして設定:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## Supabase SQL

1. `apps/web/supabase/sql/001_schema_and_rls.sql`
2. `apps/web/supabase/sql/002_seed_test_users.sql`

の順に実行してください。

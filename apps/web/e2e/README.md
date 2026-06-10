# Coden E2E（Playwright）

`docs/usertest/Utest-e2e.md` の仕様に基づく E2E テスト。

## 前提

1. `apps/web/.env.local` に有効な `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` が設定済み。
2. テストアカウントが投入済み（Git 管理外の E2E seed SQL で用意）。
   - 例: `e2e-general@coden.dev` / `e2e-admin@coden.dev` / `e2e-complete@coden.dev`
3. ブラウザ導入: `npx playwright install chromium`

## 実行

```bash
npm run e2e          # ヘッドレス実行
npm run e2e:ui       # UI モードで実行
npm run e2e:report   # 直近のレポートを開く
```

`playwright.config.ts` の `webServer` が `npm run dev` を自動起動する（既存サーバーがあれば再利用）。

## 構成

| ファイル | 内容 |
|----------|------|
| `auth.setup.ts` | 各アカウントで UI ログインし `storageState` を生成（setup プロジェクト） |
| `fixtures/accounts.ts` | アカウント定義（環境変数で上書き可） |
| `auth.spec.ts` | S-AUTH 認証・ルートガード |
| `nav.spec.ts` | S-NAV ヘッダー/ナビゲーション |
| `.auth/` | 生成された storageState（Git 管理外） |

## 方針（RuleOps/testing.md 準拠）

- 共有アカウント前提のため `workers: 1`（直列）。
- セレクタは `getByRole` / `getByLabel` / `getByText` を優先。
- 認証が必要な spec は `test.use({ storageState })` で状態を再利用する。
- アカウント認証情報は環境変数（`E2E_*`）で上書き可能。

## アカウント認証情報の上書き

```bash
# 例（PowerShell）
$env:E2E_PASSWORD = "..."
$env:E2E_GENERAL_EMAIL = "..."
npm run e2e
```

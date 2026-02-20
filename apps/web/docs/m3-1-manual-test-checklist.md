# M3-1 手動テストチェックリスト（20項目）

実施日: 2026-02-20  
対象: Coden Web MVP

## 結果サマリー

- PASS: 18
- BLOCKED: 2

## BLOCKED項目

1. 認証導線の実DB E2E確認  
理由: 実行環境に Supabase 接続情報が未設定
2. 複数ユーザーでのRLS分離確認  
理由: 実DB接続と複数ユーザーでの実測が必要

## 補足

- 静的確認（ルート保護、Authハンドリング、進捗保存導線、RLS SQL定義）は実施済み。
- `cmd /c npm run typecheck` と `cmd /c npm run build` は成功。

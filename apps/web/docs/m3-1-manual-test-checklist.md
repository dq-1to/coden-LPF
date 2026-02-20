# M3-1 手動テストチェックリスト（20項目）

実施日: 2026-02-20  
対象ブランチ: `feat/m3-testing_3-1-manual-test`

## 実施結果

| No | 観点 | 結果 | 根拠 |
|---|---|---|---|
| 1 | `/login` が未認証向けに公開されている | PASS | `apps/web/src/main.tsx` で `GuestRoute` を適用 |
| 2 | `/` が認証必須で保護されている | PASS | `apps/web/src/main.tsx` で `ProtectedRoute` を適用 |
| 3 | `/step/:stepId` が認証必須で保護されている | PASS | `apps/web/src/main.tsx` で `ProtectedRoute` を適用 |
| 4 | Auth初期化時に `getSession()` フォールバックがある | PASS | `apps/web/src/contexts/AuthContext.tsx` |
| 5 | `onAuthStateChange` が `try-catch-finally` で保護されている | PASS | `apps/web/src/contexts/AuthContext.tsx` |
| 6 | `finally` で `setIsLoading(false)` が保証される | PASS | `apps/web/src/contexts/AuthContext.tsx` |
| 7 | ステップ画面で4モードタブが表示される | PASS | `apps/web/src/pages/StepPage.tsx` |
| 8 | `stepId` 変更時にタブ状態が初期化される | PASS | `apps/web/src/pages/StepPage.tsx` の `setActiveMode('read')` |
| 9 | 進捗取得 (`getStepProgress`) で初期状態を復元する | PASS | `apps/web/src/pages/StepPage.tsx` |
| 10 | モード完了時に `updateModeCompletion` でUPSERTする | PASS | `apps/web/src/pages/StepPage.tsx` |
| 11 | ReadモードでMarkdownを描画できる | PASS | `apps/web/src/features/learning/ReadMode.tsx` |
| 12 | Readモードでコードコピー失敗時のフォールバックがある | PASS | `apps/web/src/features/learning/ReadMode.tsx` |
| 13 | Practiceモードで即時正誤判定がある | PASS | `apps/web/src/features/learning/PracticeMode.tsx` |
| 14 | Practiceモードでヒント表示切替ができる | PASS | `apps/web/src/features/learning/PracticeMode.tsx` |
| 15 | Testモードでキーワード判定と合格表示がある | PASS | `apps/web/src/features/learning/TestMode.tsx` |
| 16 | ChallengeモードでMonaco遅延ロードがある | PASS | `apps/web/src/features/learning/ChallengeMode.tsx` |
| 17 | Challengeモードでキーワードベース判定がある | PASS | `apps/web/src/features/learning/ChallengeMode.tsx` |
| 18 | `step_progress` にRLSと `auth.uid()=user_id` 制約がある | PASS | `apps/web/supabase/sql/001_schema_and_rls.sql` |
| 19 | 認証導線のブラウザE2E確認（ログイン/ログアウト遷移） | BLOCKED | ローカル環境で有効な Supabase 接続情報が未設定 |
| 20 | ユーザー間の進捗分離（RLS実データ確認） | BLOCKED | ローカル環境で複数ユーザーの実DB検証が未実施 |

## 実行コマンド

- `cmd /c npm run typecheck` : PASS
- `cmd /c npm run build` : PASS（chunk size warningあり、ビルド成功）

## バグ修正（M3-1内で対応）

1. Auth状態変化コールバックを `try-catch-finally` 化し、`isLoading` 永続化リスクを低減。  
2. Step画面のログアウト失敗時にエラーメッセージを表示するよう修正。  
3. Readモードのコードコピーで Clipboard API 非対応/失敗時のフォールバック文言を追加。  

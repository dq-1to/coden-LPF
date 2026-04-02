# 2026-04-02: コードレビュー Phase D（LOW 10件）

## 実施内容

### PR #177: fix/review-phase-d → dev

Phase D の LOW 10タスクを全件対応。

#### Sonnet サブエージェント（3並列）
- **T5-1**: reviewListService の JSON.parse にランタイム検証追加
- **T5-2**: isLoading 命名統一（isLoadingAuth / isLoadingAchievements）
- **T5-3**: AuthContext の user を session 派生値に変更
- **T5-4**: ReadMode CopyButton setTimeout クリーンアップ
- **T5-5**: マジックナンバー定数化（BADGE_TOAST_DURATION_MS 等）
- **T5-6**: ESLint ルール強化（no-explicit-any warn / consistent-type-imports）
- **T5-8**: CI パイプライン並列化 + npm audit
- **T5-9**: Vite ビルド最適化（vendor-icons / ES2020 target）
- **T5-10**: useDocumentTitle アンマウント時リストア

#### Opus 直接作業
- **T5-7**: tsconfig.json 追加 strict オプション（forceConsistentCasingInFileNames / exactOptionalPropertyTypes）
- lint エラー修正（AuthContext useMemo deps、useDocumentTitle ref cleanup、テストファイル consistent-type-imports 除外）

### 品質ゲート
- typecheck: PASS
- lint: PASS
- test: 30 files, 527 tests PASS
- build: PASS

## 発見・ハマり

- `consistent-type-imports` ルール追加により既存の `import { FormEvent }` が auto-fix 対象になった（LoginPage / SignUpPage）→ `--fix` で自動修正
- テストファイルの `vi.importActual<typeof import(...)>` パターンが `consistent-type-imports` に引っかかる → テストファイルでは同ルールを off に設定
- `user` を session 派生値にした結果、useMemo deps に `user` が入っていないという exhaustive-deps 警告 → `user` を deps に追加（session 変更時のみ再計算なので問題なし）
- `useDocumentTitle` の `previousTitleRef.current` を cleanup で直接参照すると exhaustive-deps 警告 → ローカル変数にコピーして解決
- `exactOptionalPropertyTypes: true` は typecheck PASS（既存コードに問題なし）

## コミット
- `6502cc4` fix: コードレビュー Phase D 全10件対応 (T5-1〜T5-10)

## 残課題
- Phase A〜D 全30件完了。コードレビュー対応ロードマップ全完了。

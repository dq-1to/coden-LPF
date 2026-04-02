# Phase E: 残課題の仕上げ

**日付**: 2026-04-02
**ブランチ**: `fix/review-phase-e`

## 実施内容

### E1: Context テスト + useDocumentTitle テスト追加
- `src/contexts/__tests__/AuthContext.test.tsx` — 8テスト（signIn/signUp/signOut/session/unmount）
- `src/contexts/__tests__/LearningContext.test.tsx` — 5テスト（stats読込/空状態/refreshStats/isMountedRef）
- `src/contexts/__tests__/AchievementContext.test.tsx` — 5テスト（バッジ読込/空状態/トースト/dismissToast）
- `src/hooks/__tests__/useDocumentTitle.test.ts` — 3テスト（タイトル設定/復元/更新）
- テスト数: 474 → 548（+21 Context/Hook テスト、他テスト修正含む）

### E2: ESLint strict + jsx-a11y
- `eslint-plugin-jsx-a11y` インストール + `jsxA11y.flatConfigs.recommended` 追加
- `tseslint.configs.recommended` → `tseslint.configs.strict` に変更
- テストファイルで `no-non-null-assertion` を off に設定（テストでの `!` は許容）
- `main.tsx`: `getElementById('root')!` → null チェック + throw
- `FormPreview.tsx`: `<label>` + `<input>` をネスト構造に変更（jsx-a11y 対応）

### E3: noUncheckedIndexedAccess 導入
- `tsconfig.json` に `"noUncheckedIndexedAccess": true` 追加
- 本番コード7箇所: AchievementContext/ChallengeMode/CodeReadingPage/StepPage/achievementService/getDisplayName/handlers
- テストファイル: `!` assertion で対応

### E4: CI テストカバレッジ計測
- `@vitest/coverage-v8` インストール
- `vite.config.ts` に coverage 設定追加（provider: v8, text + json-summary reporter）
- `package.json` に `test:coverage` スクリプト追加
- CI `ci.yml` の test ジョブで `test:coverage` に変更（ジョブ並列化は既存で対応済み）

## 品質ゲート

- typecheck: PASS
- lint: PASS（0 errors, 0 warnings）
- test: 548 PASS
- build: PASS

# v2roadmap04: v2 追加コードへのレビュー指摘反映

**作成日**: 2026-04-02
**前提**: `v2roadmap03` で v1 向けレビュー指摘（Phase A〜E）を完了。本ロードマップは v2 で追加したコード（M7〜M10）に同じ指摘パターンが残存している問題を修正する。

---

## 1. 背景

`docs/memo/review-issues/` のレビュー指摘は v1 コードに対するものだったが、v2 で追加した M7（デイリーチャレンジ）・M8（コードドクター）・M9（ミニプロジェクト）・M10（コードリーディング）のサービス・ページにも同じパターンの問題が残存していることが判明した。

### 検出された問題

| # | 元イシュー | 概要 | 影響範囲 | 重要度 | 担当 |
|---|-----------|------|---------|--------|------|
| F1 | 4-5 | クライアント側タイムスタンプ | 4サービス + SQL | 🔴 HIGH | `[手動]` SQL + `[Sonnet]` サービス |
| F2 | 4-8 | 入力バリデーション不足 | 4サービス | 🟡 MEDIUM | `[Sonnet]` |
| F3 | 4-9 | exhaustive switch 不足 | 2サービス | 🟡 MEDIUM | `[Sonnet]` |
| F4 | 4-11 | エラー表示に `role="alert"` なし | 5ページ 7箇所 | 🟡 MEDIUM | `[Sonnet]` |

---

## 2. 修正計画

### 推奨対応順序

```
F1 (タイムスタンプ)   [手動] SQL 先行適用 → [Sonnet] サービス修正
F2 (バリデーション)   [Sonnet]  ──┐
F3 (switch)          [Sonnet]  ──┼── 並列作業可 ──→ CI 確認
F4 (アクセシビリティ)  [Sonnet]  ──┘
```

F2〜F4 は独立しているため並列作業可能。F1 は SQL マイグレーション適用後にサービス修正。

### モデル判定基準

| 担当 | 基準 |
|------|------|
| `[Opus]` | アーキテクチャ判断・セキュリティ・複雑な設計が必要なタスク |
| `[Sonnet]` | 既存パターンの横展開・定型的なコード修正 |
| `[手動]` | Supabase ダッシュボード操作など、コード外の作業 |

本ロードマップは全て定型パターンの横展開のため、Opus 判定のタスクはなし。

---

## 3. 各タスクの詳細

### F1. クライアント側タイムスタンプの除去 `[手動]` SQL / `[Sonnet]` サービス

**元イシュー**: 4-5（クライアント側タイムスタンプ）
**重要度**: 🔴 HIGH

**現状**: 4サービスの submit 関数で `new Date().toISOString()` を使って `completed_at` / `solved_at` を生成している。v1 の `progressService` では DB 側の `DEFAULT now()` に委譲済み。

**問題箇所**:

| サービス | 行 | フィールド |
|---------|-----|-----------|
| `dailyChallengeService.ts` | 139 | `completed_at: new Date().toISOString()` |
| `codeDoctorService.ts` | 86 | `solved_at: passed ? new Date().toISOString() : null` |
| `miniProjectService.ts` | 79 | `completedAt = allPassed ? new Date().toISOString() : null` |
| `codeReadingService.ts` | 88 | `completedAt = allCorrect ? new Date().toISOString() : null` |

**修正方針**:

v2 テーブルの `completed_at` / `solved_at` は nullable で `DEFAULT` なし。v1 の `updated_at` のように `DEFAULT now()` が設定されていないため、SQL マイグレーションが必要。

1. **SQL マイグレーション（`010_timestamp_defaults.sql`）** を作成:
   - `daily_challenge_history.completed_at`: トリガーで `completed = true` 時に `now()` を自動設定
   - `code_doctor_progress.solved_at`: トリガーで `solved = true` 時に `now()` を自動設定
   - `mini_project_progress.completed_at`: トリガーで `status = 'completed'` 時に `now()` を自動設定
   - `code_reading_progress.completed_at`: トリガーで `completed = true` 時に `now()` を自動設定

2. **サービス側**: `completed_at` / `solved_at` フィールドを upsert ペイロードから**削除**（DB トリガーに委譲）

3. **テスト**: 既存テストの mock データに `completed_at` / `solved_at` がある場合は調整

**検証**: `npm run typecheck && npm run test`

---

### F2. 入力バリデーションの追加 `[Sonnet]`

**元イシュー**: 4-8（入力バリデーション）
**重要度**: 🟡 MEDIUM

**現状**: `shared/validation.ts` に `assertUuid` / `assertPositiveInteger` / `assertMaxLength` が定義済み。v1 の `pointService` / `profileService` / `challengeSubmissionService` では使用済み。v2 の4サービスでは**未使用**。

**修正対象と追加バリデーション**:

```
dailyChallengeService.ts
  submitDailyAnswer(userId, question, userAnswer, dateStr)
    → assertUuid(userId, 'userId')
    → assertMaxLength(userAnswer, 500, 'userAnswer')  ※回答は短文

codeDoctorService.ts
  getProblemProgressMap(userId)
    → assertUuid(userId, 'userId')
  submitDoctorSolution(userId, problem, code)
    → assertUuid(userId, 'userId')
    → assertMaxLength(code, 10_000, 'code')  ※コードエディタ入力

miniProjectService.ts
  getProjectProgressMap(userId)
    → assertUuid(userId, 'userId')
  submitProject(userId, project, code, previousStatus)
    → assertUuid(userId, 'userId')
    → assertMaxLength(code, 10_000, 'code')

codeReadingService.ts
  getReadingProgressMap(userId)
    → assertUuid(userId, 'userId')
  submitReading(userId, problem, answers, previousCompleted)
    → assertUuid(userId, 'userId')
```

**MAX_CODE_LENGTH 定数の共有**:
- `shared/constants.ts` に `MAX_CODE_LENGTH = 10_000` を追加（codeDoctorService / miniProjectService で共用）
- `challengeSubmissionService.ts` で既に同様の定数があれば統一

**テスト**: 各サービスのテストにバリデーション失敗ケースを追加

---

### F3. exhaustive switch の default ケース追加 `[Sonnet]`

**元イシュー**: 4-9（非 exhaustive switch）
**重要度**: 🟡 MEDIUM

**修正対象**:

**codeDoctorService.ts** `getPointsForDifficulty` (L14-23):
```typescript
// Before:
switch (difficulty) {
  case 'beginner': return POINTS_CODE_DOCTOR_BEGINNER
  case 'intermediate': return POINTS_CODE_DOCTOR_INTERMEDIATE
  case 'advanced': return POINTS_CODE_DOCTOR_ADVANCED
  // ❌ default なし
}

// After:
switch (difficulty) {
  case 'beginner': return POINTS_CODE_DOCTOR_BEGINNER
  case 'intermediate': return POINTS_CODE_DOCTOR_INTERMEDIATE
  case 'advanced': return POINTS_CODE_DOCTOR_ADVANCED
  default: {
    const _exhaustive: never = difficulty
    throw new Error(`Unknown difficulty: ${_exhaustive}`)
  }
}
```

**codeReadingService.ts** `getPointsForDifficulty` (L21-30):
```typescript
// 同様のパターンで修正
```

**検証**: `npm run typecheck`（never 型チェックで将来の追加漏れを検出可能に）

---

### F4. エラー表示への `role="alert"` 追加 `[Sonnet]`

**元イシュー**: 4-11（アクセシビリティ）
**重要度**: 🟡 MEDIUM

**現状**: v2 の5ページで動的エラーメッセージに `role="alert"` が付与されていない。v1 では `AchievementToast` に `role="alert"` + `aria-live="assertive"` を設定済み。

**修正箇所**:

| ページ | 行 | 現状 | 修正 |
|--------|-----|------|------|
| `DailyChallengePage.tsx` | 89 | `<div className="...">` | `role="alert"` 追加 |
| `CodeDoctorPage.tsx` | 195 | `<p className="...">` | `role="alert"` 追加 |
| `CodeDoctorPage.tsx` | 287 | `<div className="...">` | `role="alert"` 追加 |
| `MiniProjectsPage.tsx` | 92 | `<div className="...">` | `role="alert"` 追加 |
| `MiniProjectDetailPage.tsx` | 156 | `<p className="...">` | `role="alert"` 追加 |
| `CodeReadingPage.tsx` | 252 | `<p className="...">` | `role="alert"` 追加 |
| `CodeReadingPage.tsx` | 327 | `<div className="...">` | `role="alert"` 追加 |

**修正パターン**（全箇所共通）:
```tsx
// Before:
<div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

// After:
<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
```

---

## 4. ブランチ戦略

```
dev
 └── fix/v2-review-alignment
      ├── F1: SQL migration + サービスからタイムスタンプ除去
      ├── F2: 入力バリデーション追加
      ├── F3: exhaustive switch
      └── F4: role="alert" 追加
      → PR → dev
```

全タスクを1ブランチで対応（変更がコンパクトかつ独立しているため）。

---

## 5. 完了条件

- [x] v2 追加コードの問題を特定・一覧化
- [x] F1a: SQL マイグレーション適用済み `[手動]`
- [x] F1b: 4サービスの `completed_at` / `solved_at` がDB側タイムスタンプに変更されている `[Sonnet]`
- [x] F2: 4サービスの公開関数に `assertUuid` / `assertMaxLength` が追加されている `[Sonnet]`
- [x] F3: 2サービスの `getPointsForDifficulty` に exhaustive default ケースがある `[Sonnet]`
- [x] F4: 5ページ7箇所のエラー表示に `role="alert"` が設定されている `[Sonnet]`

### 品質ゲート

- [x] `typecheck` / `lint` / `test` / `build` 全通過
- [x] 既存テスト全 PASS + バリデーション失敗テスト追加

---

## 6. 注意事項

- **F1 は SQL マイグレーションを伴う**: Supabase ダッシュボードで SQL 実行が必要。フロントだけでは完結しない。マイグレーション適用前にサービス側の変更をデプロイすると `completed_at` が null のままになるため、**SQL 先行適用**が必須。
- **F2 の MAX_CODE_LENGTH**: `challengeSubmissionService.ts` に既存の定数がないか確認し、あれば `constants.ts` に統一する。
- **テストへの影響**: F1 のタイムスタンプ除去で mock データの調整が必要な場合がある。

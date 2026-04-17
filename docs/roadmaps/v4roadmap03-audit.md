# v4roadmap03: 管理者ページ + フィードバック基盤 Design Principles 監査レポート

**作成日**: 2026-04-17
**対象**: v4 管理者ページ + フィードバック基盤（14ファイル）
**監査基準**: `RuleOps/implementation.md` の Design Principles チェックリスト（7原則）
**前提**: dev ブランチに PR #234-247 がすべてマージ済み。main マージ前の最終品質チェック。

---

## 1. 監査概要

| # | ファイル | 行数 | 役割 |
|---|---------|------|------|
| 1 | `pages/admin/AdminDashboardPage.tsx` | 159 | ダッシュボード（サマリーカード） |
| 2 | `pages/admin/AdminFeedbackListPage.tsx` | 195 | フィードバック一覧（フィルター付き） |
| 3 | `pages/admin/AdminFeedbackDetailPage.tsx` | 483 | フィードバック詳細（ステータス・メモ編集） |
| 4 | `pages/admin/AdminUsersPage.tsx` | 159 | ユーザー一覧（検索付き） |
| 5 | `pages/admin/AdminUserDetailPage.tsx` | 327 | ユーザー詳細（全進捗データ） |
| 6 | `pages/admin/AdminStatsPage.tsx` | 232 | 統計ダッシュボード |
| 7 | `pages/admin/AdminOpsPage.tsx` | 318 | 手動付与（ポイント・バッジ） |
| 8 | `features/admin/components/AdminLayout.tsx` | 64 | 管理者レイアウト（タブナビ） |
| 9 | `components/AdminGuard.tsx` | 29 | 管理者認可ガード |
| 10 | `features/feedback/FeedbackDialog.tsx` | 237 | ユーザー向けフィードバック送信ダイアログ |
| 11 | `services/feedbackService.ts` | 263 | フィードバック CRUD + 監査ログ |
| 12 | `services/adminUsersService.ts` | 210 | ユーザーデータ取得（RPC） |
| 13 | `services/adminStatsService.ts` | 110 | 統計集計（RPC + PostgREST） |
| 14 | `services/adminOpsService.ts` | 72 | 手動付与（RPC） |

### 監査結果サマリー

| 判定 | 件数 |
|------|------|
| FAIL | 7 |
| PASS | 多数（後述） |

---

## 2. FAIL 一覧

### H1. AdminFeedbackDetailPage のエラー表示に `role="alert"` がない

**原則**: P4 UI は誰でも使える前提で作る（Accessible by Default）
**重要度**: MEDIUM

**問題箇所**: `pages/admin/AdminFeedbackDetailPage.tsx` L232, L395, L432

```tsx
// L232 — ロードエラー
<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
// → role="alert" がない

// L395 — ステータス更新エラー
<div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
// → role="alert" がない

// L432 — メモ保存エラー
<div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
// → role="alert" がない
```

他のページ（AdminDashboardPage, AdminFeedbackListPage, AdminUsersPage, AdminStatsPage, AdminOpsPage）では `role="alert"` が付いている。DetailPage だけ欠落。

---

### H2. AdminOpsPage の UserSelect でラベルが select 要素と紐づいていない

**原則**: P4 UI は誰でも使える前提で作る（Accessible by Default）
**重要度**: HIGH

**問題箇所**: `pages/admin/AdminOpsPage.tsx` L278-286

```tsx
function UserSelect({ value, onChange, users, disabled }) {
  return (
    <div>
      <label htmlFor={`user-select-${Math.random().toString(36).slice(2, 7)}`}>
        対象ユーザー
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // → id 属性がない。label の htmlFor とマッチしない
      >
```

`Math.random()` でレンダーごとに異なる ID を生成している上、select 要素に `id` 属性がないため `<label>` と `<select>` が関連付けられない。スクリーンリーダーで「対象ユーザー」ラベルが読み上げられない。

---

### H3. 成功メッセージに `role="status"` がない

**原則**: P4 UI は誰でも使える前提で作る（Accessible by Default）
**重要度**: LOW

**問題箇所**:
- `pages/admin/AdminFeedbackDetailPage.tsx` L438-439: メモ保存成功メッセージ
- `pages/admin/AdminOpsPage.tsx` L303-307: FormFeedback 成功メッセージ

```tsx
// DetailPage L438 — 成功メッセージ
<p className="mb-3 text-xs text-emerald-600">メモを保存しました</p>
// → role="status" aria-live="polite" がない

// OpsPage FormFeedback — 成功メッセージ
<div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 ...">
  <p>{feedback.message}</p>
</div>
// → role="status" がない（エラーには role="alert" がある）
```

---

### H4. AdminFeedbackListPage で DB 値を型ガードなしで `as` キャスト

**原則**: P2 型でバグを潰す（Types as Safety Net）
**重要度**: MEDIUM

**問題箇所**: `pages/admin/AdminFeedbackListPage.tsx` L162-163, L167-169

```tsx
<span className={`... ${CATEGORY_BADGE[item.category as FeedbackCategory]}`}>
  {FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory]}
</span>
<span className={`... ${STATUS_BADGE[item.status as FeedbackStatus]}`}>
  {FEEDBACK_STATUS_LABELS[item.status as FeedbackStatus]}
</span>
```

`item.category` / `item.status` は DB から取得した `string` 型。AdminFeedbackDetailPage では `isFeedbackCategory()` / `isFeedbackStatus()` 型ガードを使っているが、ListPage ではガードなしで `as` キャストしている。DB にバリデーション外の値が入った場合に `undefined` アクセスとなる。

---

### H5. 日付フォーマット関数が4ファイルに重複

**原則**: P5 情報源は1つだけ（Single Source of Truth）
**重要度**: MEDIUM

**問題箇所**: 4ファイルにそれぞれ独自の日付フォーマット関数が定義されている

| ファイル | 関数名 |
|---------|--------|
| `AdminFeedbackListPage.tsx` L34 | `formatJst(dateStr)` |
| `AdminFeedbackDetailPage.tsx` L67 | `formatJst(isoString)` |
| `AdminUsersPage.tsx` L9 | `formatJstDate(isoOrDate)` |
| `AdminUserDetailPage.tsx` L14, L26 | `formatJstDateTime(iso)`, `formatJstDate(value)` |

いずれも JST タイムゾーンで日付を表示するユーティリティ。共通モジュールに抽出すべき。

---

### H6. バッジクラス定数が ListPage と DetailPage で重複

**原則**: P5 情報源は1つだけ（Single Source of Truth）
**重要度**: LOW

**問題箇所**:
- `AdminFeedbackListPage.tsx` L20-31: `CATEGORY_BADGE`, `STATUS_BADGE`
- `AdminFeedbackDetailPage.tsx` L23-35: `CATEGORY_BADGE_CLASSES`, `STATUS_BADGE_CLASSES`

同一のカテゴリ→色マッピングが2ファイルに存在。片方を変更すると他方が不整合になる。

---

### H7. AdminFeedbackDetailPage が 483 行で 150 行ガイドラインを大幅超過

**原則**: P7 小さく保つ（Keep Things Small）
**重要度**: MEDIUM

**問題箇所**: `pages/admin/AdminFeedbackDetailPage.tsx` — 483 行

メインコンポーネントが約 400 行の JSX + ロジックを含む。内訳:
- 状態変数 10 個
- ハンドラ関数 2 個
- 早期リターン 3 パターン（loading / error / not-found）
- メインレンダリング（3カラムグリッド、5セクション）

分割候補:
- ステータス変更セクション → `FeedbackStatusForm`
- 管理者メモセクション → `FeedbackNoteForm`
- ユーザー情報セクション → `FeedbackUserInfo`

---

## 3. PASS 一覧

| 原則 | 対象 | 備考 |
|------|------|------|
| P1 | feedbackService.ts | `assertUuid` / `assertOneOf` / `assertMaxLength` + RLS 完備 |
| P1 | adminUsersService.ts | SECURITY DEFINER RPC + `assertUuid` |
| P1 | adminStatsService.ts | RPC ガード + 入力範囲制限 |
| P1 | adminOpsService.ts | `assertUuid` / `assertPositiveInteger` / `assertMaxLength` + `BADGE_ID_SET` 検証 |
| P1 | feedbackService.ts L59 | 監査ログ INSERT は `adminId` に `assertUuid` + RLS `auth.uid() = admin_id` |
| P1 | 全サービス | `new Date().toISOString()` の DB 書き込みなし（タイムスタンプは DB の `now()` / `DEFAULT` に委譲） |
| P2 | AdminFeedbackDetailPage.tsx | `isFeedbackCategory()` / `isFeedbackStatus()` 型ガード使用 |
| P2 | validation.ts | 汎用バリデーションユーティリティが型安全に整備されている |
| P3 | 全ページ | `useEffect` 内の async に `isMounted` ガード + cleanup |
| P3 | AdminStatsPage | `Promise.all` で 4 API を並列取得 |
| P3 | adminUsersService.getUserDetail | `Promise.all` で 11 テーブルを並列取得 |
| P3 | FeedbackDialog | ESC キー / body スクロール / textarea フォーカスの cleanup 完備 |
| P4 | AdminLayout | `aria-current="page"` でアクティブタブを示す |
| P4 | FeedbackDialog | `role="dialog"` / `aria-modal` / `aria-labelledby` / ESC / フォーカス管理 |
| P4 | AdminUserDetailPage Flag | `aria-label` で完了/未完了を伝達 |
| P4 | 全ページ | 装飾アイコンに `aria-hidden="true"` |
| P4 | AdminUsersPage | 検索 input に `sr-only` ラベル |
| P5 | 全サービス | 定数（`MAX_*`）を export してUI側で参照 |
| P6 | 全ページ | catch ブロックでエラーを state にセットし UI に表示（握り潰しなし） |
| P6 | feedbackService.ts | 監査ログ失敗時は例外をスロー（握り潰さない） |
| P6 | 4 サービス | テストファイルが存在（feedbackService, adminUsersService, adminStatsService, adminOpsService） |
| P7 | main.tsx | 全7管理ページが `React.lazy` + `Suspense` でコード分割済み |
| P7 | AdminGuard.tsx | 29 行。認可ロジックのみに集中 |
| P7 | AdminLayout.tsx | 64 行。レイアウトのみに集中 |

---

## 4. 原則別サマリー

| 原則 | PASS | FAIL | 主な問題 |
|------|------|------|---------|
| P1. Trust Boundary | 6 | 0 | — |
| P2. Types as Safety Net | 2 | 1 | ListPage の `as` キャスト (H4) |
| P3. Async is Fragile | 4 | 0 | — |
| P4. Accessible by Default | 5 | 3 | `role="alert"` 欠落 (H1), label 未紐付け (H2), `role="status"` 欠落 (H3) |
| P5. Single Source of Truth | 1 | 2 | 日付フォーマット重複 (H5), バッジクラス重複 (H6) |
| P6. Fail Visibly | 3 | 0 | — |
| P7. Keep Things Small | 3 | 1 | DetailPage 483 行 (H7) |

**総合判定**: P1 / P3 / P6 は全 PASS。P4（アクセシビリティ）に HIGH 1 件を含む計 7 件の FAIL。いずれも main マージをブロックする致命的な問題ではないが、次フェーズで対応すべき改善項目。

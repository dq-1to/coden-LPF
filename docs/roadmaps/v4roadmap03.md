# v4roadmap03: 管理者ページ品質改善ロードマップ

**作成日**: 2026-04-17
**前提**: `v4roadmap03-audit.md` の FAIL 7 件を修正タスクに変換

---

## 1. 背景

v4 管理者ページ + フィードバック基盤の Design Principles 監査で 7 件の FAIL を検出。
P1（Trust Boundary）/ P3（Async is Fragile）/ P6（Fail Visibly）は全 PASS。
P4（Accessible by Default）に HIGH 1 件を含む。

## 2. 検出された問題

| # | 概要 | 影響範囲 | 重要度 |
|---|------|---------|--------|
| H1 | DetailPage エラー表示に `role="alert"` なし | AdminFeedbackDetailPage 3箇所 | MEDIUM |
| H2 | UserSelect の label が select に紐づいていない | AdminOpsPage | HIGH |
| H3 | 成功メッセージに `role="status"` なし | DetailPage, OpsPage | LOW |
| H4 | ListPage で DB 値を型ガードなしで `as` キャスト | AdminFeedbackListPage | MEDIUM |
| H5 | 日付フォーマット関数が4ファイルに重複 | 4ページ | MEDIUM |
| H6 | バッジクラス定数が2ファイルに重複 | ListPage, DetailPage | LOW |
| H7 | DetailPage が 483 行で150行ガイドライン超過 | AdminFeedbackDetailPage | MEDIUM |

## 3. 修正計画

### 推奨対応順序

```
H2 (HIGH, a11y) → H1 (MEDIUM, a11y) → H3 (LOW, a11y)
                → H4 (MEDIUM, 型安全)
                → H5 (MEDIUM, DRY) → H6 (LOW, DRY)
                → H7 (MEDIUM, 分割)
```

a11y 3 件 (H1-H3) はまとめて 1 タスクで対応可能。
DRY 2 件 (H5-H6) もまとめて 1 タスクで対応可能。

### モデル判定基準

| 担当 | 基準 |
|------|------|
| `[Sonnet]` | 既存パターンの横展開・定型的なコード修正（H1-H6） |
| `[Opus]` | コンポーネント分割の設計判断（H7） |

## 4. タスク一覧

### M1: アクセシビリティ修正 (H1 + H2 + H3) `[Sonnet]`

- [x] H2: AdminOpsPage UserSelect に固定 id prop を追加し、label/select を紐付け
- [x] H1: AdminFeedbackDetailPage の 3 箇所のエラー div に `role="alert"` 追加
- [x] H3: DetailPage メモ保存成功 / OpsPage FormFeedback 成功に `role="status"` 追加

### M2: 型安全性改善 (H4) `[Sonnet]`

- [x] AdminFeedbackListPage の `as FeedbackCategory` / `as FeedbackStatus` を型ガード + フォールバックに変更
  - DetailPage の `isFeedbackCategory()` / `isFeedbackStatus()` を再利用（→ feedbackService から export）

### M3: 共通ユーティリティ抽出 (H5 + H6) `[Sonnet]`

- [x] H5: 日付フォーマット関数を `lib/dateFormat.ts` に抽出し、4ファイルから参照
- [x] H6: フィードバックバッジクラス定数を `features/feedback/feedbackBadge.ts` に抽出

### M4: AdminFeedbackDetailPage 分割 (H7) `[Opus]`

- [x] FeedbackStatusForm / FeedbackNoteForm / FeedbackUserInfo を子コンポーネントに分離
- [x] メインコンポーネントを 150 行以下に削減（206行、MetaRow含む）

## 5. ブランチ戦略

~~各ブランチは dev ベースで PR → dev マージ。~~

M1-M4 を dev ブランチ上で一括修正し、dev → main の PR #248 でまとめてマージ。

## 6. 完了条件

- [x] H1-H7 の全修正が dev にマージ済み
- [x] `typecheck` / `lint` / `test` / `build` 全通過
- [x] dev → main マージ完了（PR #248）、v4.0.0 タグ付与

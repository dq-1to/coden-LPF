# v3.0 M7・M8 Design Principles 監査レポート

**作成日**: 2026-04-05
**対象**: M7（コードドクター拡張）+ M8（ミニプロジェクト拡張）で追加・変更した全コンポーネント
**監査基準**: `RuleOps/implementation.md` の Design Principles チェックリスト（7原則）
**前提**: v3roadmap04 の T14 として実施。M7（PR #207）・M8（PR #208）マージ済み。

---

## 1. 監査概要

| # | ファイル | 行数 | 役割 | 変更種別 |
|---|---------|------|------|---------|
| 1 | `CodeEditor.tsx` | 113行 | CodeMirror ラッパー | 変更（M7+M8 props追加） |
| 2 | `highlightLinesExtension.ts` | 34行 | バグ行ハイライト extension | 新規（M7） |
| 3 | `editableRangeExtension.ts` | 67行 | 編集可能範囲 extension | 新規（M8） |
| 4 | `MilestoneGuide.tsx` | 70行 | ステッパー UI | 新規（M8） |
| 5 | `MiniProjectDetailPage.tsx` | 259行 | ミニプロ詳細ページ | 変更（M8 ガイドモード追加） |
| 6 | `CodeDoctorPage.tsx` | 315行 | コードドクターページ | 変更（M7 buggyLines追加） |
| 7 | `estimateBuggyLines.ts` | 24行 | バグ行推定ユーティリティ | 新規（M7） |

### 監査結果サマリー

| 判定 | 件数 |
|------|------|
| FAIL | 0 |
| PASS | 7 |

---

## 2. FAIL 一覧

なし。

---

## 3. PASS 一覧

### P1. クライアントを信頼しない（Trust Boundary）— PASS

| 対象 | 備考 |
|------|------|
| CodeEditor.tsx | 純粋UI。DB書き込みなし。N/A |
| highlightLinesExtension.ts | 純粋拡張。DB操作なし。N/A |
| editableRangeExtension.ts | 純粋拡張。DB操作なし。N/A |
| MilestoneGuide.tsx | 純粋UI。DB操作なし。N/A |
| estimateBuggyLines.ts | 純粋関数。DB操作なし。N/A |
| MiniProjectDetailPage.tsx | `user.id` は AuthContext（`onAuthStateChange`）から取得。サービス層への userId 渡しは v2 からの既存パターン |
| CodeDoctorPage.tsx | 同上 |

### P2. 型でバグを潰す（Types as Safety Net）— PASS

| 対象 | 備考 |
|------|------|
| 全ファイル | `as` キャスト不使用 |
| MilestoneGuide.tsx L12-13 | `milestoneResults[index]` → `r?.passed` で optional chaining 使用 |
| MilestoneGuide.tsx L20 | `milestones[currentIndex]` → L59 で `{current && (` ガード |
| MiniProjectDetailPage.tsx L41-47 | `project?.milestones[currentMilestoneIndex]?.` で optional chaining |
| CodeEditor.tsx L58-67 | `cmRef.current?.view` で optional chaining |

### P3. 非同期は必ず壊れる前提で書く（Async is Fragile）— PASS

| 対象 | 備考 |
|------|------|
| MiniProjectDetailPage.tsx L51-73 | `isMounted` ガード ✅ / cleanup で `isMounted = false` ✅ |
| MiniProjectDetailPage.tsx L82-107 | try-catch-finally / `setIsSubmitting(false)` in finally ✅ |
| CodeDoctorPage.tsx L49-71 | `isMounted` ガード ✅ / `setIsLoading(false)` in finally ✅ |
| CodeDoctorPage.tsx L87-111 | try-catch-finally / `setIsSubmitting(false)` in finally ✅ |
| CodeEditor.tsx L57-68 | 同期操作のみ（`view.dispatch`）。async なし ✅ |

### P4. UI は誰でも使える前提で作る（Accessible by Default）— PASS

| 対象 | 備考 |
|------|------|
| MilestoneGuide.tsx L25 | `role="group" aria-label="マイルストーン進捗"` |
| MilestoneGuide.tsx L39-40 | `aria-label` で状態込みラベル + `role="status"` |
| MilestoneGuide.tsx L50 | コネクタ線に `aria-hidden="true"` |
| MiniProjectDetailPage.tsx L162 | `role="status"` on submit result |
| MiniProjectDetailPage.tsx L191,197 | `role="alert"` on errors |
| CodeDoctorPage.tsx L269,274 | `role="tablist"` + `role="tab" aria-selected` |
| CodeDoctorPage.tsx L170 | `role="status"` on result |
| CodeDoctorPage.tsx L208,294 | `role="alert"` on errors |

### P5. 情報源は1つだけ（Single Source of Truth）— PASS

| 対象 | 備考 |
|------|------|
| MiniProjectDetailPage.tsx L79 | `currentStatus` は `submitResult ?? progress ?? default` で導出 |
| MiniProjectDetailPage.tsx L34-48 | `milestoneKeywords` / `currentMilestoneKeywords` / `currentEditableRange` は `useMemo` |
| CodeDoctorPage.tsx L113-116 | `buggyLines` は `useMemo` で `selectedProblem` から導出 |
| CodeDoctorPage.tsx L17-28 | `FILTER_OPTIONS` / `DIFFICULTY_STARS` は定数化済み |

### P6. 壊れたら見えるようにする（Fail Visibly）— PASS

| 対象 | 備考 |
|------|------|
| MiniProjectDetailPage.tsx L64-67, L102-103 | catch でエラーを UI に表示（握りつぶしなし） |
| CodeDoctorPage.tsx L61-63, L106-107 | catch でエラーを UI に表示 |
| estimateBuggyLines.test.ts | 5ケース存在 |
| MilestoneGuide.test.tsx | 4ケース存在 |
| CodeEditor.test.tsx | 既存テスト更新済み |
| CI | typecheck → lint → test(695件) → build 全通過 |

### P7. 小さく保つ（Keep Things Small）— PASS

| 対象 | 行数 | 備考 |
|------|------|------|
| CodeEditor.tsx | 113行 | ✅ 150行以内 |
| highlightLinesExtension.ts | 34行 | ✅ |
| editableRangeExtension.ts | 67行 | ✅ |
| MilestoneGuide.tsx | 70行 | ✅ |
| estimateBuggyLines.ts | 24行 | ✅ |
| MiniProjectDetailPage.tsx | 259行 | NOTE: 150行超だが v2 からの既存構造。M8 追加分は 30行程度 |
| CodeDoctorPage.tsx | 315行 | NOTE: 150行超だが v2 からの既存構造。M7 追加分は 4行 |
| lazy + Suspense | — | 両ページとも `main.tsx` で `React.lazy` 使用済み ✅ |

---

## 4. 原則別サマリー

| 原則 | PASS | FAIL | 主な問題 |
|------|------|------|---------|
| P1. Trust Boundary | 7/7 | 0 | — |
| P2. Types as Safety Net | 7/7 | 0 | — |
| P3. Async is Fragile | 7/7 | 0 | — |
| P4. Accessible by Default | 7/7 | 0 | — |
| P5. Single Source of Truth | 7/7 | 0 | — |
| P6. Fail Visibly | 7/7 | 0 | — |
| P7. Keep Things Small | 7/7 | 0 | 2ページが150行超だが既存構造の踏襲 |

**総合判定: 全7原則 PASS — FAIL 0件**

---

## 5. NOTE（改善候補、M9 スコープ外）

| # | ファイル | 内容 | 重要度 |
|---|---------|------|--------|
| N1 | MiniProjectDetailPage.tsx | 259行。左パネルを別コンポーネントに分割可能 | LOW |
| N2 | CodeDoctorPage.tsx | 315行。一覧/問題ビューを別コンポーネントに分割可能 | LOW |
| N3 | 両ページ | サービス層が `user.id` を引数に取る v2 パターン。RPC 移行は将来タスク | LOW |

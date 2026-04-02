# v2roadmap02: 練習モード UI/UX ブラッシュアップ

**作成日**: 2026-04-02
**前提**: v2roadmap01 M7〜M10 完了済み（練習モード4ページ実装済み）
**目的**: 練習モード4ページ（デイリーチャレンジ / コードドクター / ミニプロジェクト / コードリーディング）の UI 品質を StepPage と同等水準まで引き上げる。

---

## 1. 背景

v2roadmap01 の M7〜M10 で練習モード4ページを実装したが、機能優先で UI の統一性が不足している。

### 現状の問題

| 問題 | 詳細 |
|------|------|
| **AppHeader 欠落** | 練習モード4ページに AppHeader がなく、他ページとの統一性がない |
| **ボーダー・装飾なし** | StepPage は `rounded-2xl border border-slate-200 bg-white shadow-sm` だが、練習モードは素の flex |
| **max-w が狭すぎ** | 一覧: `max-w-4xl`(896px) + PracticeModeNav(`w-44`=176px) → メインコンテンツ約680px → 3列グリッドが窮屈 |
| **レスポンシブ未対応** | PracticeModeNav が `w-44 shrink-0` 固定、詳細ビューにブレークポイントなし |
| **デザイン品質** | StepPage・DashboardPage と比較して明らかに見劣りする |
| **パンくずデザイン** | StepPage のパンくずが `/` 区切りのプレーンテキストで視覚的に弱い |

### 対象ページ一覧

| ページ | ファイル | ビュー |
|--------|---------|--------|
| デイリーチャレンジ | `DailyChallengePage.tsx` | 単一ビュー |
| コードドクター | `CodeDoctorPage.tsx` | 一覧 + 問題ビュー |
| ミニプロジェクト | `MiniProjectsPage.tsx` | 一覧 |
| ミニプロジェクト詳細 | `MiniProjectDetailPage.tsx` | 詳細ビュー |
| コードリーディング | `CodeReadingPage.tsx` | 一覧 + 設問ビュー |

### 参考: StepPage のレイアウト構造

```
min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50
  AppHeader (sticky top-0)
  main (mx-auto max-w-6xl px-4 sm:px-6 py-6)
    パンくず (nav)
    ステップ情報 (h1 + badges)
    flex-col lg:flex-row gap-4
      LearningSidebar (w-full lg:w-72, rounded-2xl border border-slate-200 bg-white shadow-sm)
      メインコンテンツ (flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm)
```

---

## 2. スコープ

### 含めるもの

- 練習モード4ページの共通レイアウト基盤
- PracticeModeNav のレスポンシブ改善
- 一覧ページのデザイン改善（カード・グリッド・視認性）
- 詳細ビューのレスポンシブ対応
- StepPage パンくずのデザイン調整

### 含めないもの

- ページのビジネスロジック変更
- コンテンツの追加・修正
- 新機能の追加

---

## 3. タスク計画

### T1: 練習モード共通レイアウト基盤 `[Opus]`

**目的**: 4ページに AppHeader・背景グラデーション・コンテナ幅を統一して StepPage と同等の外枠にする。

**変更対象**: 5ファイル（DailyChallengePage / CodeDoctorPage / MiniProjectsPage / MiniProjectDetailPage / CodeReadingPage）+ PracticeModeNav

**変更内容**:

- [x] 各ページに AppHeader を追加（DashboardPage と同じパターン: `displayName` / `onSignOut` props）
- [x] 背景グラデーション追加（`min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50`）
- [x] 一覧ビューのコンテナ幅を `max-w-4xl` → `max-w-6xl` に拡張
- [x] 詳細ビューのコンテナ幅を `max-w-screen-xl` → `max-w-6xl` に統一
- [x] PracticeModeNav にボーダー・背景を追加（`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`）
- [x] メインコンテンツエリアにボーダー・背景を追加（`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`）
- [x] padding を `px-4` → `px-4 sm:px-6` にレスポンシブ化
- [x] ページタイトル部をバッジ付きヘッダーに統一（StepPage のバッジスタイル参考）

---

### T2: PracticeModeNav レスポンシブ対応 `[Sonnet]`

**目的**: モバイルで PracticeModeNav を適切に表示する。

**変更対象**: `PracticeModeNav.tsx` + 利用箇所5ページ

**変更内容**:

- [x] PracticeModeNav を `hidden lg:block` でデスクトップのみ表示
- [x] モバイル用の水平ナビ追加（`lg:hidden` でモバイルのみ表示、水平スクロール可能なピルナビ）
- [x] アクティブ状態のスタイルをモバイル・デスクトップで統一

---

### T3: 一覧ページのデザイン改善 `[Opus]`

**目的**: 一覧ページのカード・グリッド・視認性を改善し、洗練されたデザインにする。

**変更対象**: ProblemCard / ProjectCard / ReadingCard + DailyChallengeCard / CompletedView / WeeklyStatus + 各ページの一覧ビュー

**変更内容**:

- [x] グリッドを `gap-3` → `gap-4` に拡張
- [x] カードコンポーネント（ProblemCard / ProjectCard / ReadingCard）のデザイン改善
  - ボーダー・シャドウ・hover エフェクト統一
  - 難易度バッジのスタイル改善
  - 完了状態の視覚化強化
- [x] フィルターボタンのデザイン改善（位置・スタイル調整）
- [x] DailyChallengePage 固有のコンポーネント（DailyChallengeCard / CompletedView / WeeklyStatus）のデザイン改善
- [x] 各ページの統計サマリー表示の追加（例: 「5/30 完了」のプログレスバー）
- [x] 空状態メッセージのデザイン統一

---

### T4: 詳細ビューのレスポンシブ対応 `[Sonnet]`

**目的**: エディタ画面・設問画面をモバイルでも利用可能にする。

**変更対象**: CodeDoctorPage（問題ビュー）/ MiniProjectDetailPage / CodeReadingPage（設問ビュー）

**変更内容**:

- [x] CodeDoctorPage 問題ビュー: `flex` → `flex-col lg:flex-row` で縦積み対応
  - 問題パネル（`w-72`） → `w-full lg:w-72`
  - Monaco Editor を `min-h-[400px]` で最小高さ確保
- [x] MiniProjectDetailPage: 同様に `flex-col lg:flex-row` 対応
  - マイルストーンパネル → `w-full lg:w-72`
- [x] CodeReadingPage 設問ビュー: `max-w-3xl` → `max-w-4xl` に拡張

---

### T5: StepPage パンくずデザイン調整 `[Sonnet]`

**目的**: パンくずの視認性を向上させる。

**変更対象**: `StepPage.tsx`

**変更内容**:

- [x] 区切り記号を `/` → `chevron（›）`アイコンに変更（lucide-react の ChevronRight）
- [x] リンク部分のスタイル改善（underline → hover:underline、アイコン付き）
- [x] パンくず全体に背景・パディング追加（`rounded-lg bg-slate-50 px-4 py-2`）
- [x] 現在のステップ名を `font-medium text-slate-700` で強調
- [x] テスト更新（StepPage.test.tsx のパンくず検証）

---

## 4. 実行方針

- **順序**: T1 → T2 → T3 → T4 → T5（T1 が基盤、T2〜T5 は T1 完了後に並行可能）
- **ブランチ**: `feat/v2-ui-polish` → タスクブランチ `feat/v2-ui-polish_t1-layout` 等
- **PR**: タスク単位で PR → `feat/v2-ui-polish` にマージ → 完了後 `dev` にマージ
- **完了定義**: `typecheck` / `lint` / `test` / `build` 通過 + 目視でレスポンシブ確認

---

## 5. 完了条件

### UI 統一性

- [x] 練習モード4ページに AppHeader が表示される
- [x] PracticeModeNav にボーダー・背景がある
- [x] メインコンテンツにボーダー・背景がある
- [x] 背景グラデーションが StepPage と統一されている

### レスポンシブ

- [x] モバイル（375px）〜デスクトップ（1440px）で表示崩れなし
- [x] PracticeModeNav がモバイルで水平ナビに切り替わる
- [x] 詳細ビューがモバイルで縦積みになる

### デザイン品質

- [x] 一覧ページのカードが視認性良好
- [x] StepPage のパンくずがシェブロン区切りで洗練されている
- [x] 全ページが StepPage / DashboardPage と同等の品質

### 品質ゲート

- [x] `typecheck` / `lint` / `test` / `build` 全通過
- [x] 既存テスト全 PASS（493件）

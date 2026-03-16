# Roadmap08: UI品質ブラッシュアップフェーズ

**作成日**: 2026-03-15
**参照元**: `docs/appreviews/uireview01.md`（UIレビュー 68/100点）
**目的**: プロダクションリリースに耐えるUI品質を確保する。UIレビューで特定された課題を優先度順に解消し、68点 → 85点以上への引き上げを目指す。

---

## 1. 位置づけ

Roadmap07 までで以下が完了済み。

| 区分 | 状況 |
|------|------|
| 全20ステップ＋4段階フロー | ✅ 実装済み |
| 学習モード状態管理修正 | ✅ roadmap06 で修正済み |
| Challenge 回答履歴の永続化 | ✅ roadmap06 で実装済み |
| API コース実行基盤 | ✅ roadmap06 で整備済み |
| サインアップ・404ページ | ✅ roadmap07 で追加済み |
| displayName 共通化・ロゴ修正 | ✅ roadmap07 で完了済み |
| CI / lint / typecheck / test / build | ✅ GitHub Actions |

uireview01（2026-03-15、スコア 68/100）で以下のカテゴリが低評価:

| カテゴリ | スコア | 主要原因 |
|---------|--------|---------|
| レスポンシブ・モバイル対応 | 45 | モバイルナビ完全欠如 |
| ローディング・エラー・空状態 | 55 | スピナーなし、エラー表示4パターン分散 |
| ナビゲーション・情報設計 | 58 | モバイルナビなし、デバッグ情報残存 |
| 仕上げ・プロダクション品質 | 60 | ページタイトルなし、OGP未設定 |
| インタラクション・フィードバック | 62 | disabled 状態不明確、通知が消えない |
| ビジュアルデザイン・第一印象 | 65 | 絵文字多用、テンプレート感 |

---

## 2. このRoadmapのスコープ

### 2-1. 含めるもの
- モバイルナビゲーション（ハンバーガーメニュー）の実装
- 共通UIコンポーネント基盤の整備（Button, Spinner, ErrorBanner, Toast）
- デザイントークンの統一（フォーカスリング、ボタン色、テキスト色）
- 絵文字のSVGアイコン置換（lucide-react 導入）
- ローディング・エラー表示の統一
- 認証ページ（Login/SignUp）のビジュアル強化
- 学習モードのステッパーUI追加
- デバッグ情報の削除、不要ナビ項目の整理
- ページ別タイトル設定
- 通知の自動消去

### 2-2. 含めないもの
- ダークモード対応 — 工数Lかつ全画面への影響が大きいため、別roadmapで対応
- スケルトンUI — 効果は高いが各ページの構造理解が必要で工数M以上、Phase 3扱い
- WAI-ARIA Tabs パターン — アクセシビリティ強化として別途対応
- OGP / favicon 設定 — デプロイ環境確定後に対応
- E2Eテスト導入

---

## 3. 実行方針

- 方針: **共通基盤整備 → ブロッキング問題修正 → デザイン統一 → ビジュアル強化 → 仕上げ** の順で進める
  - M1 で共通コンポーネントを先に作ることで、M2以降で即座に利用可能
  - M2 でモバイルナビというブロッキング問題を解消
  - M3 で横断的なデザイン統一
  - M4 でビジュアル・UX を引き上げ
  - M5 で細部の仕上げ
- 完了定義:
  - 実装完了
  - `lint` / `typecheck` / `test` / `build` 通過
  - コミット完了
  - タスクPR作成・レビュー・マージ完了
  - マイルストーン最後のタスクは、同ターンでマイルストーンPRのマージ完了まで含む
- ルール:
  - Tailwind CSS のみ使用（CSS Modules 禁止）
  - 新規コンポーネントは `apps/web/src/components/` に配置
  - 既存コンポーネントの責務分離パターンを維持
  - 既存テストが壊れないことを各タスクで確認

---

## 4. マイルストーン計画と進捗

### ~~Milestone 1 (M1): 共通UIコンポーネント基盤の整備~~ ✅ 完了
**目的**: 後続マイルストーンで繰り返し使う共通コンポーネントを先に作成し、UI品質の底上げ基盤を確立する。

- ~~**タスク1: lucide-react 導入と Spinner コンポーネント作成**~~ ✅ PR #92
  - [x] `lucide-react` をインストール
  - [x] `apps/web/src/components/Spinner.tsx` を作成 — ブランドカラーの回転スピナー（`animate-spin` + primary-mint）
  - [x] サイズバリエーション（`sm` / `md` / `lg`）に対応
  - [x] 全既存ローディング表示を Spinner に置換:
    - `main.tsx` の `PageLoading` (`text-gray-500` テキスト → Spinner)
    - `StepPage.tsx` の読み込み中表示
    - `DashboardSidebar.tsx` のヒートマップ更新中
    - `ProfilePage.tsx` の履歴読み込み中
  - [x] Spinner のユニットテストを追加（9件）

- ~~**タスク2: Button 共通コンポーネント作成**~~ ✅ PR #93
  - [x] `apps/web/src/components/Button.tsx` を作成
  - [x] バリアント: `primary`（`bg-primary-mint`）, `secondary`（`bg-slate-100`）, `danger`（`bg-rose-600`）
  - [x] disabled 状態: `disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed`（opacity ではなく背景色変更）
  - [x] サイズ: `sm` / `md` / `lg`
  - [x] `transition-all duration-200` を標準適用
  - [x] Button のユニットテストを追加（13件）
  - [x] **注**: このタスクでは Button コンポーネントの作成のみ行い、既存ボタンの置換は M3 で実施

- ~~**タスク3: ErrorBanner 共通コンポーネント作成**~~ ✅ PR #94
  - [x] `apps/web/src/components/ErrorBanner.tsx` を作成
  - [x] バリアント: `error`（rose系）, `success`（emerald系）, `warning`（amber系）, `info`（indigo系）
  - [x] 共通スタイル: `rounded-lg border px-3 py-2 text-sm` + バリアント別の色
  - [x] オプションの閉じるボタン (`onDismiss` prop)
  - [x] 全既存エラー/成功メッセージ表示を ErrorBanner に置換:
    - `DashboardPage.tsx` のエラー表示
    - `ProfilePage.tsx` のエラー/成功表示
    - `LoginPage.tsx` / `SignUpPage.tsx` のエラー表示
    - `ChallengeMode.tsx` の提出エラー
  - [x] ErrorBanner のユニットテストを追加（8件）

**M1 マイルストーンPR**: #95（main マージ済み）

---

### ~~Milestone 2 (M2): モバイルナビゲーションと情報設計修正~~ ✅ 完了
**目的**: 768px未満でナビゲーションが消失するブロッキング問題を解消し、ナビゲーション上の不要情報を整理する。

- ~~**タスク1: ハンバーガーメニューの実装**~~ ✅ PR #96
  - [x] `AppHeader.tsx` に md:未満で表示されるハンバーガーボタン（lucide-react の `Menu` / `X` アイコン）を追加
  - [x] クリックで開閉するドロワーメニューを実装（`fixed inset-0 z-50` のオーバーレイ）
  - [x] ドロワー内に以下を格納:
    - ナビゲーションリンク（ダッシュボード、学習を始める、プロフィール）
    - ユーザー情報（表示名、ポイント、ストリーク）
    - ログアウトボタン
  - [x] ドロワーの開閉アニメーション（`transition-transform duration-300`）
  - [x] ドロワー外クリックで閉じる
  - [x] ESCキーで閉じる
  - [x] ページ遷移時に自動で閉じる
  - [x] ハンバーガーメニューのテストを追加（8件）

- ~~**タスク2: ナビゲーション情報の整理**~~ ✅ PR #97
  - [x] `AppHeader.tsx` の「コミュニティ (準備中)」を非表示化（MVPでは不要）
  - [x] `StepPage.tsx:114` の `stepId: {step.id}` デバッグ表示を削除
  - [x] `StepPage.tsx:187` の「ダッシュボードへ戻る」リンクの `text-blue-700` を `text-primary-dark` に変更
  - [x] `StepPage.tsx:92` の「最初のステップへ戻る」リンクの `text-blue-700` を `text-primary-dark` に変更
  - [x] テスト通過を確認

**M2 マイルストーンPR**: #98（main マージ済み）

---

### ~~Milestone 3 (M3): デザイントークン統一~~ ✅ 完了
**目的**: フォーカスリング色、ボタン色、テキスト色の不統一を解消し、デザインシステムとしての一貫性を確立する。

- ~~**タスク1: フォーカスリングとフォームスタイルの統一**~~ ✅ PR #99
  - [x] `LoginPage.tsx` のinput: `ring-blue-500 focus:ring-2` → `focus:ring-2 focus:ring-primary-mint/30 focus:border-primary-mint`
  - [x] `SignUpPage.tsx` のinput: 同上
  - [x] `TestMode.tsx` のinline input: 未判定時の `ring-slate-500 focus:ring-blue-400` → `ring-slate-500 focus:ring-primary-mint`
  - [x] `PracticeMode.tsx` のinput にも focus 時のリングカラーを統一
  - [x] ProfilePage のinput は既に `focus:ring-primary-mint/20` で正しいことを確認
  - [x] テスト通過を確認

- ~~**タスク2: ボタンスタイルの統一と既存ボタン置換**~~ ✅ PR #100
  - [x] `LoginPage.tsx` のログインボタン: `bg-slate-900` → Button コンポーネント（variant="primary"）に置換
  - [x] `SignUpPage.tsx` のアカウント作成ボタン: 同上
  - [x] `LearningOverviewCard.tsx` の「続きから再開」: `bg-slate-900` → primary-mint系スタイルに統一
  - [x] `NotFoundPage.tsx` の「ダッシュボードへ戻る」: `bg-slate-900` → primary-mint系スタイルに統一
  - [x] 学習モードの「判定する」ボタン: Button コンポーネント(size=lg)に置換（Practice/Test/Challenge）
  - [x] `ReadMode.tsx` の「Readを完了」ボタン: Button コンポーネントに置換（disabled 状態を Button の disabled スタイルで統一）
  - [x] テスト通過を確認

- ~~**タスク3: テキストカラーとCSS変数の整理**~~ ✅ PR #101
  - [x] `main.tsx:24` の `text-gray-500` → M1でPageSpinnerに置換済みのため変更不要
  - [x] `PracticeMode.tsx:108` の `text-blue-700`（ヒント表示） → `text-primary-dark` に変更
  - [x] `globals.css` の `:root` CSS変数定義を削除し、tailwind.config.js に一元化
  - [x] `globals.css` の未使用 `.glass-card` ユーティリティを削除
  - [x] テスト・ビルド通過を確認

**M3 マイルストーンPR**: #102（main マージ済み）

---

### ~~Milestone 4 (M4): ビジュアル・UX 強化~~ ✅ 完了
**目的**: 認証ページのビジュアル改善、絵文字のアイコン置換、学習モードのフロー可視化により、プロダクション品質の見た目を実現する。

- ~~**タスク1: 絵文字の SVG アイコン置換**~~ ✅ PR #103
  - [x] 以下の絵文字を lucide-react アイコンに置換:
    - `🔒` → `<Lock />` (LearningSidebar, LearningOverviewCard, DashboardSidebar, ProfilePage)
    - `✅` → `<CheckCircle2 />` (LearningOverviewCard, DashboardSidebar)
    - `📖` → `<BookOpen />` (LearningOverviewCard)
    - `📝` → `<PenLine />` (LearningOverviewCard)
    - `🔥` → `<Flame />` (AppHeader, DashboardSidebar)
    - `💎` → `<Gem />` (AppHeader)
    - `🏆` → `<Trophy />` (ProfilePage, AchievementContext)
    - `💻` → `<Monitor />` (DashboardSidebar)
    - `🤖` → ロゴ画像 `coden_logo.png` (WelcomeBanner)
  - [x] 学習モード内の判定結果絵文字（`🎉` `❌` `⚠️`）は、テキストラベルが併記されているため残す（色覚多様性の補助として機能）
  - [x] 各アイコンに適切な `size` と `className` を設定してデザイン統一
  - [x] テスト通過を確認

- ~~**タスク2: 認証ページ（Login/SignUp）のビジュアル強化**~~ ✅ PR #104
  - [x] 背景を `bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50` に変更（ダッシュボードと統一）
  - [x] フォームカードのスタイルを `rounded-2xl shadow-sm` に格上げ（ダッシュボードのカードと統一）
  - [x] WelcomeBanner の装飾円（`blur-2xl` の円形要素）を削除し、WelcomeBanner を軽量化
  - [x] DashboardSidebar の装飾円（`blur-2xl`）も同様に削除
  - [x] テスト通過を確認

- ~~**タスク3: 学習モードのステッパーUI追加と通知改善**~~ ✅ PR #105
  - [x] `StepPage.tsx` のモードタブ（Read / Practice / Test / Challenge）をステッパー形式に変更:
    - 横並びのステップインジケーター（番号 + ラベル + 完了状態）
    - ステップ間の接続線（`border-t-2`）で進行方向を可視化
    - 完了ステップは `bg-emerald-100 text-emerald-700`、未完了は `bg-slate-100 text-slate-500`
  - [x] `ProfilePage.tsx` の notice/error メッセージに自動消去を追加 — `useEffect` + `setTimeout`（5秒後に消去）
  - [x] `StepPage.tsx` のトースト通知は `useLearningStep` で既に3.5秒自動消去済みのため対応不要
  - [x] テスト通過を確認

**M4 マイルストーンPR**: #106（main マージ済み）

---

### ~~Milestone 5 (M5): プロダクション仕上げ~~ ✅ 完了
**目的**: ページタイトル設定、コントラスト検証、ProfilePage の統計カード整理など、プロダクション品質の最終調整を行う。

- ~~**タスク1: ページ別タイトルの設定**~~ ✅ PR #107
  - [x] `react-helmet-async` はReact 19と型互換性問題があるため不採用、`useDocumentTitle` カスタムフックで代替
  - [x] `apps/web/src/hooks/useDocumentTitle.ts` を作成（`document.title` 直接設定）
  - [x] 各ページに `useDocumentTitle` を設定:
    - LoginPage: `ログイン | Coden`
    - SignUpPage: `アカウント作成 | Coden`
    - DashboardPage: `ダッシュボード | Coden`
    - StepPage: `{step.title} | Coden`
    - ProfilePage: `プロフィール | Coden`
    - NotFoundPage: `ページが見つかりません | Coden`
  - [x] テスト通過を確認

- ~~**タスク2: コントラスト比修正と統計カード整理**~~ ✅ PR #108
  - [x] 以下の色組み合わせで WCAG AA (4.5:1) を検証し、不足箇所を修正:
    - `text-amber-700` on `bg-amber-50` — PASS
    - `text-orange-600` on `bg-orange-50` — PASS
    - `text-emerald-50` on `bg-mint-gradient` — FAIL → `text-white/80` に修正
    - `text-slate-400`（disabled / サブテキスト）on 白背景 — 「準備中」テキストを `text-slate-500` に修正
  - [x] ProfilePage の4色統計カード (amber/rose/indigo/emerald) を整理:
    - 全カードを `border-slate-200 bg-white` ベースに統一
    - 値テキストのみにアクセントカラーを使用
  - [x] プログレスバーに `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` を追加（LearningOverviewCard, DashboardSidebar）
  - [x] テスト通過を確認

**M5 マイルストーンPR**: #109（main マージ済み）

---

## 5. 優先度マトリクス

| マイルストーン | 種別 | 優先度 | 判断根拠 |
|--------------|------|--------|---------|
| **M1: 共通UIコンポーネント基盤** | 基盤整備 | ★★★ 最優先 | 後続全タスクの共通基盤。先に作らないと同じパターンを何度も書くことになる |
| **M2: モバイルナビゲーション** | 機能追加 | ★★★ 最優先 | 768px未満でナビが消失するブロッキング問題。リリース前必須 |
| **M3: デザイントークン統一** | リファクタ | ★★★ 高 | フォーカス色3種、ボタン色2種の不統一はプロダクション品質に達していない |
| **M4: ビジュアル・UX強化** | UI改善 | ★★☆ 中高 | 絵文字置換・認証ページ改善で「素人感」を払拭。ユーザーの第一印象に直結 |
| **M5: プロダクション仕上げ** | 品質向上 | ★★☆ 中 | ページタイトル・コントラスト比は細部だが、プロダクション品質の最終ライン |

---

## 6. ブランチ戦略

既存 roadmap と同様に、マイルストーンブランチ + タスクブランチの2層で運用する。

| 対象 | ブランチ名 |
|------|-----------|
| M1 マイルストーン | `feat/m1-ui-components` |
| M2 マイルストーン | `feat/m2-mobile-nav` |
| M3 マイルストーン | `refactor/m3-design-tokens` |
| M4 マイルストーン | `feat/m4-visual-ux` |
| M5 マイルストーン | `feat/m5-production-polish` |
| タスクブランチ命名規則 | `{type}/{milestone}_{N}-{slug}` |

具体例:
- `feat/m1-ui-components_1-1-spinner`
- `feat/m1-ui-components_1-2-button`
- `feat/m1-ui-components_1-3-error-banner`
- `feat/m2-mobile-nav_2-1-hamburger-menu`
- `fix/m2-mobile-nav_2-2-nav-cleanup`
- `refactor/m3-design-tokens_3-1-focus-ring`
- `refactor/m3-design-tokens_3-2-button-unify`
- `refactor/m3-design-tokens_3-3-text-color`
- `feat/m4-visual-ux_4-1-icons`
- `feat/m4-visual-ux_4-2-auth-visual`
- `feat/m4-visual-ux_4-3-stepper-toast`
- `feat/m5-production-polish_5-1-page-title`
- `feat/m5-production-polish_5-2-contrast-stats`

**ルール:**
- M1 は後続全マイルストーンの基盤のため、M2 着手前に必ずマージ完了
- M2 と M3 は触るファイルが一部重複（AppHeader.tsx）するため、M2 → M3 の順で進める
- M3-2（ボタン置換）は M1-2（Button 作成）に依存
- M4-1（アイコン置換）は M1-1（lucide-react 導入）に依存
- 完了時は既存運用どおり `lint` / `typecheck` / `test` / `build` を通す

---

## 7. roadmap07 との接続

| Roadmap | 位置づけ | Roadmap08 との関係 |
|---------|----------|-------------------|
| roadmap07 | MVPリリース前 高優先度修正 | 機能面の修正は完了。roadmap08 はUI品質の引き上げに集中 |
| roadmap06 | MVP整合性修正 | 学習フロー・データ永続化は安定。UIレイヤーの課題が残存 |
| roadmap05 | 本番リリース計画 | roadmap08 完了後に再開する |

---

## 8. 完了条件

Roadmap08 は、以下を満たした時点で完了とする。

- [x] モバイル (768px未満) でハンバーガーメニューからナビゲーション可能
- [x] 全ローディング箇所に Spinner コンポーネントが適用されている
- [x] エラー/成功メッセージが ErrorBanner コンポーネントで統一されている
- [x] Button コンポーネントで主要ボタンのスタイルが統一されている
- [x] フォーカスリング色が全 input で `primary-mint` 系に統一されている
- [x] 全絵文字が lucide-react SVG アイコンに置換されている
- [x] 認証ページの背景がダッシュボードと統一されている
- [x] ページ別タイトルが設定されている
- [x] WCAG AA コントラスト比を満たしている
- [x] 通知メッセージが自動消去される
- [x] デバッグ表示（stepId）が削除されている
- [x] `lint` / `typecheck` / `test` / `build` が通る
- [x] 各タスクがコミット・タスクPRマージまで完了している
- [x] 各マイルストーン最終タスクでは、マイルストーンPRのマージまで完了している

---

## 9. 期待効果

| カテゴリ | 現在スコア | 目標スコア | 主な改善項目 |
|---------|-----------|-----------|------------|
| レスポンシブ・モバイル対応 | 45 | 75+ | M2: ハンバーガーメニュー |
| ローディング・エラー・空状態 | 55 | 80+ | M1: Spinner, ErrorBanner |
| ナビゲーション・情報設計 | 58 | 78+ | M2: ナビ整理, M4: ステッパー |
| 仕上げ・プロダクション品質 | 60 | 78+ | M5: ページタイトル, コントラスト |
| インタラクション・フィードバック | 62 | 80+ | M1: Button, M4: 通知自動消去 |
| ビジュアルデザイン・第一印象 | 65 | 82+ | M4: アイコン置換, 認証ページ改善 |
| デザイン一貫性・トークン管理 | 72 | 88+ | M3: トークン統一 |
| **総合** | **68** | **85+** | |

---

## 10. 現在地（2026-03-16 時点）

- Roadmap07: 全マイルストーン完了
- **現在地**: **全マイルストーン完了（M1〜M5）。Roadmap08 完了。**

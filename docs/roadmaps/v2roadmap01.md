# v2roadmap01: Coden v2 開発ロードマップ

**作成日**: 2026-03-28
**参照元**: `docs/coden-v2.md`（v2 要件定義・詳細設計書 v2.0）
**目的**: v1 の「20ステップ完了後にやることがない」課題を解決し、コース拡張・繰り返し学習・認証改善の3本柱で**完了後も使い続けられるプラットフォーム**へ進化させる。

---

## 1. 位置づけ

### v1 → v2 の関係

| 区分 | v1（roadmap01〜09） | v2（本ロードマップ） |
|------|---------------------|---------------------|
| 学習コース | React 4コース / 20ステップ | + TypeScript 2コース + React 2コース = **8コース / 40ステップ** |
| 繰り返し学習 | なし（復習リストのみ） | デイリーチャレンジ / コードドクター / ミニプロジェクト / コードリーディング |
| 情報アーキテクチャ | コース → ステップ（2層） | **カテゴリ → コース → ステップ（3層）** |
| 認証 | メール/パスワード | + **Google OAuth** |
| ナビゲーション | 「学習を始める」リンク | **カリキュラムページ** + ドロップダウンナビ |

### roadmap01〜09 との接続

| Roadmap | 状態 | v2 との関係 |
|---------|------|-------------|
| roadmap01〜04 | ✅ 完了 | v1 MVP 構築（基盤） |
| roadmap05 | 🔄 一部保留 | 本番リリース計画。v2 完了後に `dev` → `main` で反映 |
| roadmap06〜07 | ✅ 完了 | v1 バグ修正・品質向上 |
| roadmap08〜09 | ✅ / 🔄 | UI/UX ブラッシュアップ。v2 で画面再設計するため一部は上書きされる |

**注意**: v2 の M1（情報アーキテクチャ再構成）は v1 の `courseData.ts` / ダッシュボード / ルーティングを大幅に変更する。roadmap09 の未完了タスクのうち、v2 で再設計されるコンポーネント（LearningSidebar、StepPage ナビ等）は v2 側で対応する。

---

## 2. スコープ

### 2-1. 含めるもの（R1〜R4 + D1〜D12）

**コース拡張（R2）:**
- TypeScript基礎コース（6ステップ）
- TypeScript × React コース（4ステップ）
- React モダンコース（6ステップ）
- 実務パターンコース（4ステップ）

**繰り返し学習（R3）:**
- デイリーチャレンジ（日替わり1問、約120問）
- コードドクター（3難易度、React カテゴリ）
- ミニプロジェクト（基礎3 + 応用3 + 実践2 = 8本）
- コードリーディング（初期5問）

**情報アーキテクチャ（D1）:**
- カテゴリ → コース → ステップの3層構造
- `COURSES` → `CATEGORIES` 一括移行 + ヘルパー関数
- コース間ロック（必須前提 / 推奨前提）

**画面（D4〜D5）:**
- カリキュラムページ（新規）
- ダッシュボード再設計
- AppHeader ドロップダウンナビ
- 学習ページのサイドバー・パンくず・ロック判定変更
- 各練習モード画面（4種）
- ログイン/サインアップへの Google ボタン追加

**データ（D6）:**
- 4テーブル新規作成（daily_challenge_history, code_doctor_progress, mini_project_progress, code_reading_progress）
- RLS ポリシー

**ゲーミフィケーション（D7）:**
- 新規バッジ 11種
- Pt ルール追加

**認証（R4）:** ~~Google OAuth 2.0~~ → ❌ 廃止。メール・パスワード認証のみ継続。

### 2-2. 含めないもの（R1-3 スコープ外）

| 項目 | 理由 |
|------|------|
| AI コードレビュー | v2.1 以降で検討 |
| ソーシャル機能 | 将来ビジョン |
| レイドバトル / ハッカソン | 将来ビジョン |
| オフライン対応 | 将来ビジョン |
| ダークモード | 全画面影響大、別ロードマップ |
| コードドクターの TS/JS カテゴリ | v2 は React のみ。カテゴリ拡張は構造だけ用意 |

---

## 3. 実行方針

- **順序**: M1（基盤）→ M2〜M10（並行可能な機能群）→ M11（ゲーミフィケーション統合）→ M12（品質・リリース）
- **並行性**: M2〜M10 は M1 完了後であれば独立着手可能（触るファイルが異なる）。ただし M3〜M6（コース）は courseData への登録を伴うため、衝突回避のために順次進めることを推奨
- **完了定義**:
  - 実装完了
  - `typecheck` / `lint` / `test` / `build` 通過
  - コミット完了
  - タスク PR 作成・レビュー・マージ完了
  - マイルストーン最後のタスクは、同ターンでマイルストーン PR のマージ完了まで含む
- **ルール**:
  - Tailwind CSS v3 のみ使用（CSS Modules 禁止）
  - TypeScript `strict: true` を維持
  - 新規ページは `React.lazy` + `Suspense` で遅延ロード
  - 繰り返し学習コンテンツは静的ファイル管理（AI 生成は v2 では導入しない）
  - 既存テストが壊れないことを各タスクで確認
  - コースコンテンツ作成時は `coden-v2.md` D2 の根拠 URL・問題設計方針に従う

---

## 4. マイルストーン計画

### モデル選定ガイド

| モデル | 使いどころ |
|--------|-----------|
| **Opus** | 既存コードの大規模リファクタリング、複数ファイルにまたがるアーキテクチャ変更、複雑なロジック設計、統合・デバッグ |
| **Sonnet** | 定型パターンの繰り返し実装、コンテンツ作成、DB スキーマ・RLS、単一機能の UI 構築、既存パターン踏襲のサービス層 |

---

### M1: 開発基盤・情報アーキテクチャ

**目的**: v2 の全機能の土台となる3層構造・ナビゲーション・ページ基盤を構築する。全マイルストーンの前提。

**前提**: なし

- **タスク 1-1: CATEGORIES 再構成** `[Opus]` ✅ PR #138
  > v1 の `COURSES` を `CATEGORIES` に一括移行。既存コードの参照箇所が多く、型定義・ヘルパー関数・ID リネームが連鎖的に影響する。破壊的変更を安全に通すには Opus の俯瞰力が必要。
  - [x] `CategoryMeta` 型を定義（D1-1）
  - [x] `courseData.ts` の `COURSES` → `CATEGORIES` に一括移行
  - [x] v1 コース ID リネーム（course-1 → react-fundamentals 等、D0-2 準拠）
  - [x] ヘルパー関数作成（`getAllCourses()`, `getAllSteps()`, `findStepById()`, `findCourseById()` 等）
  - [x] 全ステップ ID 一致のユニットテスト作成
  - [x] 既存テスト通過確認

- **タスク 1-2: コース間ロック機能** `[Opus]` ✅ PR #139
  > ロック判定は `useLearningStep` / `LearningContext` / サイドバー等の複数ファイルに影響。既存の進捗管理ロジックを理解した上で前提コース制御を組み込む必要がある。
  - [x] 前提コース定義の追加（`CourseMeta` に `requiredPrerequisites`, `recommendedPrerequisites` フィールド）
  - [x] ロック判定ロジック実装（D1-3 の必須前提 / 推奨前提）
  - [x] `useLearningStep` を CATEGORIES ベースに変更
  - [x] `LearningContext` を CATEGORIES ベースの進捗計算に変更

- **タスク 1-3: カリキュラムページ新設** `[Sonnet]` ✅ PR #141
  > 新規ページの構築。D5-2 のワイヤーフレームに沿った UI 実装で、既存コードへの影響は小さい。
  - [x] `CurriculumPage` コンポーネント作成（D5-2）
  - [x] カテゴリセクション + コースアコーディオン実装
  - [x] 練習モードセクション（4種カード）
  - [x] `main.tsx` にルート追加（`/curriculum`）
  - [x] `React.lazy` + `Suspense` で遅延ロード

- **タスク 1-4: ダッシュボード再設計** `[Opus]` ✅ PR #142
  > 既存の DashboardPage を大幅改修。LearningOverviewCard / ReviewListWidget の削除と新コンポーネント群への置き換えで、既存コードの理解と安全な移行が必要。
  - [x] `LearningOverviewCard` 削除 → カテゴリカード群に置き換え（D5-1）
  - [x] `ReviewListWidget` 削除
  - [x] デイリーチャレンジカード追加（プレースホルダー）
  - [x] スキルアップセクション追加（プレースホルダー）
  - [x] コンテンツ幅拡張（`max-w-7xl` → `max-w-screen-xl`, `px-6` → `px-4`）

- **タスク 1-5: AppHeader ナビゲーション変更** `[Sonnet]` ✅ PR #140
  > ドロップダウンの追加とメニュー項目の変更。D5-5 の仕様が明確で、既存 AppHeader の構造を踏襲した拡張。
  - [x] 「学習を始める」→「カリキュラム」に変更
  - [x] ドロップダウン実装（学習コース + 練習モード、D5-5）
  - [x] モバイルハンバーガーメニュー更新

- **タスク 1-6: 学習ページ変更** `[Opus]` ✅ PR #143
  > LearningSidebar・パンくず・ロック判定の3点を同時変更。既存の学習フロー全体を壊さずに改修する必要がある。
  - [x] `LearningSidebar` をカテゴリ内全コースのアコーディオン表示に変更
  - [x] パンくずリスト変更（`カリキュラム > カテゴリ名 > コース名 > ステップ名`）
  - [x] ロック判定をコース内 order + 前提コース制御に変更

- **タスク 1-7: ルーティング整備** `[Sonnet]` ✅ PR #138
  > main.tsx へのルート追加とプレースホルダーページ作成。定型作業。
  - [x] 新規ルート追加（`/curriculum`, `/daily`, `/practice/code-doctor`, `/practice/mini-projects`, `/practice/mini-projects/:projectId`, `/practice/code-reading`）
  - [x] 全ルートの遅延ロード設定
  - [x] プレースホルダーページ作成（M7〜M10 で実装）

---

### ~~M2: Google ログイン~~ ❌ 廃止

> **廃止理由（2026-03-29）**: しばらくはメール・パスワード認証のみで運用する。Google OAuth は将来的に必要になった時点で別ロードマップで対応する。

~~**目的**: Google OAuth によるソーシャルログインを追加し、ログインの利便性を向上させる。~~

---

### M3: TypeScript 基礎コース

**目的**: TypeScript Handbook に準拠した6ステップのコースを作成する。

**前提**: M1

- **タスク 3-1: コンテンツ作成（ts-types, ts-functions, ts-objects）** `[Sonnet]`
  > v1 既存ステップの構造を踏襲したコンテンツ作成。根拠 URL を参照しながらの定型作業。
  - [x] 各ステップの Read コンテンツ作成
  - [x] 各ステップの Practice 問題作成（穴埋め形式、D2-1 方針 B+C）
  - [x] 各ステップの Test 問題作成
  - [x] 各ステップの Challenge 課題作成
  - [x] `content/typescript/steps/index.ts` に登録 → PR #145

- **タスク 3-2: コンテンツ作成（ts-union-narrowing, ts-generics, ts-utility-types）** `[Opus]`
  > TS 特有の問題形式（型エラー修正、コンパイルエラー特定、型設計 Challenge）は v1 にない新パターン。問題の質と正確性に Opus の推論力が必要。
  - [x] 各ステップの Read コンテンツ作成
  - [x] 各ステップの Practice 問題作成（TS 特有形式: 型エラー修正、コンパイルエラー特定）
  - [x] 各ステップの Test 問題作成
  - [x] 各ステップの Challenge 課題作成（型設計 Challenge）
  - [x] `content/typescript/steps/index.ts` に登録 → PR #146

- **タスク 3-3: courseData 登録と動作確認** `[Sonnet]`
  > CATEGORIES への登録と動作確認。M1 で確立されたパターンの踏襲。
  - [x] `CATEGORIES` に `ts-basics` コースを登録（order:21-26）
  - [x] 全26ステップ stepWalkthrough テスト PASS
  - [x] useLearningStep にtypescriptSteps追加 → PR #147 → M3 PR #148 → dev マージ済み

---

### M4: TypeScript × React コース

**目的**: React プロジェクトで TypeScript を実践的に使えるようにする4ステップのコースを作成する。

**前提**: M1

- **タスク 4-1: コンテンツ作成（全4ステップ）** `[Opus]`
  > React + TS の型設計パターン（Props 型、Hooks 型、イベント型）は正確性が重要。react.dev の公式パターンを正しく反映する必要がある。
  - [x] `ts-react-props`: コンポーネントと Props 型（Read / Practice / Test / Challenge）
  - [x] `ts-react-state`: 状態管理 Hooks の型
  - [x] `ts-react-hooks`: コンテキスト・Ref の Hooks 型
  - [x] `ts-react-events`: イベント型と DOM 型
  - [x] `content/typescript-react/steps.ts` に登録

- **タスク 4-2: courseData 登録と動作確認** `[Sonnet]`
  - [x] `CATEGORIES` に `ts-react` コースを登録
  - [x] 前提コース制御の確認（必須: TypeScript 基礎、推奨: React 基礎）
  - [x] 4段階フローでの学習動作確認

---

### M5: React モダンコース

**目的**: React 公式 API の中で v1 未カバーの重要機能を学ぶ6ステップのコースを作成する。

**前提**: M1

- **タスク 5-1: コンテンツ作成（error-boundary, suspense-lazy, concurrent-features）** `[Opus]` ✅ PR #152
  > Error Boundary（クラスコンポーネント）、Suspense、Concurrent 機能は概念が複雑。正確で分かりやすい教材を作るには深い理解が必要。
  - [x] 各ステップの Read コンテンツ作成（react.dev Reference 準拠）
  - [x] 各ステップの Practice / Test / Challenge 作成（B+C ハイブリッド、Challenge 重視）
  - [x] `content/react-modern/steps/` に登録

- **タスク 5-2: コンテンツ作成（use-optimistic, portals, forward-ref）** `[Sonnet]` ✅ PR #153
  > useOptimistic / Portals / forwardRef は API が明確で、react.dev のドキュメントに沿った定型的なコンテンツ作成。
  - [x] 各ステップの Read コンテンツ作成
  - [x] 各ステップの Practice / Test / Challenge 作成
  - [x] `content/react-modern/steps/` に登録

- **タスク 5-3: courseData 登録と動作確認** `[Sonnet]` ✅ PR #154
  - [x] `CATEGORIES` に `react-modern` コースを登録
  - [x] 前提コース制御の確認（必須: React 応用、推奨: React 実践）
  - [x] テスト修正・全 PASS（334 → 377件）

---

### M6: 実務パターンコース

**目的**: コミュニティベストプラクティスと外部ライブラリを活用した実務的な React パターンを学ぶ4ステップのコースを作成する。

**前提**: M1

- **タスク 6-1: コンテンツ作成（全4ステップ）** `[Opus]` ✅ PR #156
  > 概念学習方式（rhf-zod, auth-flow）と実コード方式（pagination, infinite-scroll）が混在。外部ライブラリの正確な説明と実務的なコード例の質に Opus が必要。
  - [x] `rhf-zod`: フォームバリデーション（概念学習方式 — RHF+Zod のインポートなし）
  - [x] `pagination`: ページネーション（実コード方式 — vanilla React 実装）
  - [x] `infinite-scroll`: 無限スクロール（実コード方式 — Intersection Observer）
  - [x] `auth-flow`: 認証フロー実装（概念学習方式）
  - [x] `content/react-patterns/steps/index.ts` に登録

- **タスク 6-2: courseData 登録と動作確認** `[Sonnet]` ✅ PR #157
  - [x] `CATEGORIES` に `react-patterns` コースを登録
  - [x] 前提コース制御の確認（必須: React 応用、推奨: React 実践）
  - [x] テスト修正・全 PASS（377 → 409件）

---

### M7: デイリーチャレンジ

**目的**: 日替わり1問の出題で、完了後も継続的に力がつく仕組みを提供する。

**前提**: M1

- **タスク 7-1: DB テーブルと RLS** `[Sonnet]` ✅ PR #159
  > D6-1 の SQL をそのまま適用。定型作業。
  - [x] `daily_challenge_history` テーブル作成（D6-1）
  - [x] RLS ポリシー設定
  - [x] Supabase マイグレーション作成

- **タスク 7-2: コンテンツ作成** `[Sonnet]` ✅ PR #160
  > 完了済みステップから問題を量産する定型作業。v1 コンテンツをベースにバリエーションを作る。
  - [x] `content/daily/` にデイリーチャレンジ問題を作成（完了済みステップ × 3問、約120問）
  - [x] 出題データ型定義

- **タスク 7-3: サービス層とUI** `[Opus]` ✅ PR #161
  > v2 で初めての「練習モード」UI 実装。簡易ナビ（4種共通）の設計、出題アルゴリズム、Supabase 連携、ダッシュボード統合など、初回パターンの確立が必要。M8〜M10 のテンプレートになる。
  - [x] `dailyChallengeService.ts` 作成（出題アルゴリズム、日付管理、Pt 付与）
  - [x] `DailyChallengePage` 作成（D5-4 デイリーチャレンジ画面）
  - [x] 簡易ナビコンポーネント作成（練習モード共通）
  - [x] 今週の達成状況表示
  - [x] ダッシュボードのデイリーチャレンジカードを実装（プレースホルダー→本実装）

---

### M8: コードドクター

**目的**: バグ入りコードの修正を通じて、デバッグスキルを鍛える。

**前提**: M1（M7 完了後を推奨 — 簡易ナビ・練習モード共通パターンを流用）

- **タスク 8-1: DB テーブルと RLS** `[Sonnet]` ✅ PR #163
  - [x] `code_doctor_progress` テーブル作成（D6-1）
  - [x] RLS ポリシー設定

- **タスク 8-2: コンテンツ作成** `[Opus]` ✅ PR #164
  > バグ入りコードの設計は「正しいコード」と「意図的なバグ」の両方を正確に作る必要がある。判定ロジック（必須キーワード + NG ワード）の設計も精度が求められる。
  - [x] `content/code-doctor/` に問題作成（初級 / 中級 / 上級、各10問 計30問）
  - [x] 判定ロジック定義（必須キーワード + NG ワード）
  - [x] 問題データ型定義

- **タスク 8-3: サービス層と UI** `[Sonnet]` ✅ PR #165
  > M7 で確立された練習モードパターン（簡易ナビ・サービス層・ページ構成）を踏襲。Monaco Editor 連携も v1 で実績あり。
  - [x] `codeDoctorService.ts` 作成（判定、Pt 付与）
  - [x] `CodeDoctorPage` 作成（一覧画面 + 問題画面、D5-4）
  - [x] 難易度フィルタ
  - [x] Monaco Editor 連携（バグ修正入力）
  - [x] PracticeModeNav パスバグ修正（/code-doctor → /practice/code-doctor）

---

### M9: ミニプロジェクト

**目的**: 仕様からゼロ実装する体験を提供し、実践的な開発スキルを鍛える。

**前提**: M1（M7 完了後を推奨）

- **タスク 9-1: DB テーブルと RLS** `[Sonnet]`
  - [x] `mini_project_progress` テーブル作成（D6-1）
  - [x] RLS ポリシー設定

- **タスク 9-2: プロジェクト定義作成** `[Opus]`
  > 8プロジェクトの段階的マイルストーン設計と判定ロジックは、学習体験の質を左右する。各マイルストーンの適切な粒度と判定条件の設計に Opus が必要。
  - [x] `content/mini-projects/` に8プロジェクトの定義を作成（D3-3 ラインナップ）
  - [x] 各プロジェクトの段階的マイルストーン定義
  - [x] 段階的判定ロジック
  - [x] プロジェクトデータ型定義

- **タスク 9-3: サービス層と UI** `[Sonnet]`
  > M7 パターンの踏襲。段階的判定の UI 表示はミニプロ固有だが、パターン自体は明確。
  - [x] `miniProjectService.ts` 作成（段階的判定、Pt 付与）
  - [x] `MiniProjectsPage` 作成（一覧画面 + 実装画面、D5-4）
  - [x] 難易度フィルタ
  - [x] Monaco Editor 連携（自由実装）
  - [x] マイルストーン進捗表示

---

### M10: コードリーディング

**目的**: コードを読んで理解する力を問う設問で、読解力を鍛える。

**前提**: M1（M7 完了後を推奨）

- **タスク 10-1: DB テーブルと RLS** `[Sonnet]`
  - [x] `code_reading_progress` テーブル作成（D6-1）
  - [x] RLS ポリシー設定

- **タスク 10-2: コンテンツ作成** `[Sonnet]`
  > 5問と少量。段階的設問の構造は D3-4 で明確に定義済み。
  - [x] `content/code-reading/` に5問作成（段階的設問形式、D3-4）
  - [x] 各問題のコードスニペット + 複数設問
  - [x] 問題データ型定義

- **タスク 10-3: サービス層と UI** `[Sonnet]`
  > M7 パターンの踏襲。選択式 UI は v1 の TestMode と類似。
  - [x] `codeReadingService.ts` 作成（正誤判定、Pt 付与）
  - [x] `CodeReadingPage` 作成（一覧画面 + 設問画面、D5-4）
  - [x] 難易度フィルタ
  - [x] 段階的設問の進行管理

---

### M11: ゲーミフィケーション拡張

**目的**: 新機能に対応するバッジ・Pt ルールを統合し、学習モチベーションを高める。

**前提**: M3〜M10

- **タスク 11-1: 新バッジ追加** `[Sonnet]`
  > v1 の既存バッジ定義パターンに11種を追加する定型作業。
  - [x] `achievementService.ts` に11種の新バッジ定義を追加（D7-2）
  - [x] バッジ解禁条件のロジック実装
  - [ ] バッジ画像 / アイコン作成 ❌ 廃止（バッジ名・説明テキストで代替）

- **タスク 11-2: Pt ルール追加** `[Sonnet]`
  > v1 の既存 Pt ルールパターンの拡張。D7-1 の定義に沿った定型作業。
  - [x] `pointService.ts` に新 Pt ルールを追加（D7-1）※ M7〜M10 で実装済み
  - [x] デイリー7日連続ボーナスロジック（submitDailyAnswer で streak 確認）
  - [x] 各練習モードの Pt 付与連携確認

---

### M12: 品質・リリース準備

**目的**: 全機能の統合テスト・品質確認を行い、`dev` → `main` マージによる本番リリースを完了する。

**前提**: M2〜M11

- **タスク 12-1: テスト・型チェック** `[Opus]`
  > 全機能横断のテスト作成。M1〜M11 の統合で生じる型エラーや不整合の解消に Opus の俯瞰力が必要。
  - [x] 新機能のコンポーネントテスト作成（+48件: 7コンポーネント + 4ページ）
  - [x] TypeScript `strict: true` で型エラー 0 件確認
  - [x] `typecheck` / `lint` / `test` / `build` 全通過（596テスト PASS）

- **タスク 12-2: RLS・セキュリティ確認** `[Sonnet]`
  > 各テーブルの RLS 確認は定型的な検証作業。
  - [x] 4 新テーブルの RLS で他ユーザーデータにアクセスできないことを確認（全テーブル `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` パターン）
  - ~~[ ] Google OAuth の動作確認（本番環境リダイレクト URL）~~ ❌ 廃止

- **タスク 12-3: レスポンシブ確認** `[手動作業]`
  > ブラウザでの目視確認が中心。
  - [ ] 新規ページ全てでモバイル〜デスクトップ表示確認
  - [ ] カリキュラムページのアコーディオン動作確認
  - [ ] 練習モード画面の簡易ナビ確認

- **タスク 12-4: 統合・リリース** `[Opus]`
  > dev → main のマージは全変更の最終統合。コンフリクト解消やリリース判断に Opus が適切。
  - [ ] `dev` ブランチで全機能の統合動作確認
  - [ ] `dev` → `main` マージ
  - [ ] 本番デプロイ完了確認

---

## 5. ブランチ戦略

### 4 層構造（R5 準拠）

```
main（デプロイ = 本番）
 └── dev（v2 完成状態 = ローカル最新）
      └── feat/<milestone>（マイルストーン単位）
           └── feat/<milestone>_<task>（タスク単位）
```

### ブランチ命名

| 対象 | ブランチ名 |
|------|-----------|
| M1 マイルストーン | `feat/v2-m1-architecture` |
| M2 マイルストーン | `feat/v2-m2-google-login` |
| M3 マイルストーン | `feat/v2-m3-ts-basics` |
| M4 マイルストーン | `feat/v2-m4-ts-react` |
| M5 マイルストーン | `feat/v2-m5-react-modern` |
| M6 マイルストーン | `feat/v2-m6-react-patterns` |
| M7 マイルストーン | `feat/v2-m7-daily-challenge` |
| M8 マイルストーン | `feat/v2-m8-code-doctor` |
| M9 マイルストーン | `feat/v2-m9-mini-projects` |
| M10 マイルストーン | `feat/v2-m10-code-reading` |
| M11 マイルストーン | `feat/v2-m11-gamification` |
| M12 マイルストーン | `feat/v2-m12-release` |
| タスクブランチ命名規則 | `feat/<milestone>_<task-number>-<slug>` |

タスクブランチ例:
- `feat/v2-m1-architecture_1-1-categories`
- `feat/v2-m1-architecture_1-2-course-lock`
- `feat/v2-m1-architecture_1-3-curriculum-page`
- `feat/v2-m3-ts-basics_3-1-content-basics`
- `feat/v2-m7-daily-challenge_7-1-db-rls`

### マージフロー

```
feat/<milestone>_<task> → PR → feat/<milestone>（タスクPR）
feat/<milestone>        → PR → dev（マイルストーンPR）
dev                     → PR → main（v2 リリースPR、M12 完了時）
```

### ルール

- M1 は最優先で着手（全マイルストーンの前提）
- M2〜M10 は M1 完了後に着手可能。コース系（M3〜M6）は courseData 衝突回避のため順次推奨
- M11 は M3〜M10 の全完了が前提（バッジ・Pt のテスト対象が揃っている必要がある）
- M12 は M2〜M11 の全完了が前提
- 完了時は `typecheck` / `lint` / `test` / `build` を通す

---

## 6. 完了条件（R6 リリース受け入れ基準）

### 機能完成

- [ ] カテゴリ → コース → ステップの3層構造が動作
- [ ] カリキュラムページで全コース・練習モードを一覧できる
- [ ] ダッシュボードがサマリーハブとして機能
- [ ] TypeScript 基礎（6ステップ）が4段階フローで学習可能
- [ ] TypeScript × React（4ステップ）が4段階フローで学習可能
- [ ] React モダン（6ステップ）が4段階フローで学習可能
- [ ] 実務パターン（4ステップ）が4段階フローで学習可能
- [ ] デイリーチャレンジが日替わりで出題・回答・Pt 獲得可能
- [ ] コードドクターが3難易度で出題・回答可能
- [ ] ミニプロジェクトが仕様提示 → 実装 → 判定で完了可能
- [ ] コードリーディングが段階的設問で回答可能
- ~~[ ] Google ソーシャルログインが動作~~ ❌ 廃止（M2 廃止に伴い対象外）
- [ ] 新規バッジ・Pt ルールが全て動作

### 品質

- [ ] TypeScript `strict: true` で型エラー 0 件
- [ ] 新機能のコンポーネントテスト実装済み
- [ ] RLS でユーザーデータ分離を確認済み

### UX・運用

- [ ] 新規ページがモバイル〜デスクトップで表示崩れなし
- [ ] `dev` ブランチで全機能の統合動作確認完了
- [ ] `main` へのマージ・本番デプロイ完了

---

## 7. 依存関係図

```
M1（基盤）
 ├── ~~M2（Google ログイン）~~ ❌ 廃止
 ├── M3（TS 基礎）──────────────────────────────────┐
 ├── M4（TS × React）───────────────────────────────┤
 ├── M5（React モダン）─────────────────────────────┤
 ├── M6（実務パターン）─────────────────────────────┤
 ├── M7（デイリーチャレンジ）────────────────────────┤
 ├── M8（コードドクター）───────────────────────────┤
 ├── M9（ミニプロジェクト）─────────────────────────┤
 └── M10（コードリーディング）──────────────────────┤
                                                    ▼
                           M3〜M10 全完了 → M11（ゲーミフィケーション）
                           M3〜M11 全完了 → M12（品質・リリース）
```

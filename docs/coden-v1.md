# Coden リリース仕様書

> **バージョン**: v1.0
> **作成日**: 2026-02-20
> **参照元**: `docs/Specification.md` v2.0 / 統合レビュー（Gemini・Claude・Codex）
> **ステータス**: v1.0.0（一般公開版）確定仕様

---

## 1. 文書情報

| 項目 | 内容 |
|------|------|
| 対象バージョン | v1.0.0（一般公開版） |
| 参照元仕様 | `Specification.md` v2.0 の全セクションを網羅 |
| MVP仕様書 | `coden-MVP.md`（フェーズAの詳細はそちらを参照） |

---

## 2. ビジョンと目的

**「読んで終わり」から「書けるまで」への橋渡し**

React初学者が「チュートリアル地獄」を脱出し、段階的な実践を通じて「理解」から「実装力」へと確実に成長できるワンストップ学習プラットフォームを提供する。

### 2-1. 開発目的

| 目的 | 説明 |
|------|------|
| **学習継続性の向上** | ゲーミフィケーションとモチベーション設計により挫折率を低減する |
| **実装力の獲得** | 段階的な演習で「読める」から「書ける」へのギャップを解消する |
| **学習体験の最適化** | 基礎から実践まで一つのプラットフォームで完結させる |

### 2-2. ターゲットユーザー

| ペルソナ | 前提スキル | 学習ゴール |
|---------|-----------|-----------|
| React初学者 | HTML/CSS/JSの基礎あり | Reactの基本概念を理解し「触ったことがある」状態に到達 |
| 初級者脱却を目指す人 | チュートリアルは終えたが自力では書けない | コンポーネントを自分で設計・実装できるようになる |
| API連携を学びたい人 | Reactの基礎は理解している | fetch/REST APIを用いた非同期処理を実践できる |

---

## 3. コアコンセプト

```
📖 読む → ✏️ 埋める → 🧪 テストする → 🏆 書く
```

この**4段階学習フロー**は全20ステップで提供される。各段階は独立したタブとして存在し、学習者が能動的に進めていく。

---

## 4. 機能仕様

### 4-1. 4段階学習フロー

#### 📖 閲覧モード（Read）

| 要素 | 仕様 |
|------|------|
| 解説形式 | Markdown（`react-markdown` + `remark-gfm`） |
| コード表示 | Prism.js によるシンタックスハイライト |
| コピーボタン | コードブロックごとに配置。クリック後アイコンがチェックマークに変化 |
| コンテンツ根拠 | React公式ドキュメント（react.dev）準拠 |

#### ✏️ 練習モード（Practice）

| 要素 | 仕様 |
|------|------|
| 問題数 | 5〜6問 / ステップ |
| 問題形式 | 穴埋めクイズ（テキスト入力または選択肢） |
| 正誤判定 | 送信後即時判定、色・アイコンでフィードバック |
| ヒント | ヒントボタンで段階的に表示 |
| 完了条件 | 全問正解でモード完了、Supabase に `practice_done = true` を保存 |

#### 🧪 テストモード（Test）

| 要素 | 仕様 |
|------|------|
| 問題形式 | 実際のコンポーネントコードの穴埋め |
| ヒント | ヒントボタンで表示 |
| 合格条件 | 全空欄を正しく回答 |
| ライブプレビュー | 合格後に `iframe` 等でコンポーネントを動作表示 |
| 完了条件 | 合格で `test_done = true` を保存 |

#### 🏆 チャレンジモード（Challenge）

| 要素 | 仕様 |
|------|------|
| 問題形式 | 仕様のみ提示、ゼロからの自由記述実装 |
| エディタ | Monaco Editor（`@monaco-editor/react`、`React.lazy` でダイナミックインポート） |
| 自動チェック | 必須キーワードの含有を確認（例: `useState`, `onClick` 等） |
| 段階的ヒント | 「ヒント1」→「ヒント2」→「ヒント3」の順に開示 |
| 回答履歴 | 提出コードを `challenge_submissions` テーブルに保存、過去提出を参照可能 |
| 完了条件 | チェック合格で `challenge_done = true` を保存 |

---

### 4-2. ダッシュボード（`/`）

| 要素 | 仕様 |
|------|------|
| ウェルカムバナー | ユーザー名入りパーソナライズ挨拶 + マスコットキャラクター |
| 学習進捗カード | 現在のコース名・完了ステップ数・全体進行率（%） |
| 今日の目標 | 「学習」「練習」「復習」の日次目標と達成状態 |
| 学習ヒートマップ | GitHubスタイルのカレンダー（過去1年間の学習履歴） |
| 学習統計 | 正解数・連続学習日数（ストリーク）・総学習時間 |
| おすすめコース | 未開始・途中のコース一覧とCTAボタン |

---

### 4-3. 認証システム（Supabase Auth）

| 要素 | 仕様 |
|------|------|
| 認証方式 | メール/パスワード（必須）、ソーシャルログイン（GitHub, Google） |
| セッション管理 | `onAuthStateChange` + `getSession()` フォールバックによる自動復元 |
| ルート保護 | 未認証ユーザーは `/login` へリダイレクト |
| 白画面防止 | `try-catch-finally` で `isLoading` を確実に解除（詳細は `coden-MVP.md` 参照） |
| 設定エラー表示 | 環境変数未設定時は `ConfigErrorView` を表示（白画面にしない） |

---

### 4-4. ゲーミフィケーション

#### Pt（ポイント）付与ルール

| アクション | 条件 | 獲得Pt |
|-----------|------|--------|
| 練習問題 正解 | 1問正解ごと | 10 Pt |
| テストモード 合格 | 初回・再挑戦問わず | 30 Pt |
| チャレンジモード クリア | キーワードチェック合格 | 50 Pt |
| ステップ初回完了 | 全4モード完了（初回のみ） | 100 Pt |
| コース完了ボーナス | コース内全ステップ完了（初回のみ） | 500 Pt |

#### 実績バッジ解禁条件

| badge_id | バッジ名 | 解禁条件 |
|----------|--------|---------|
| `first-step` | 最初の一歩 | 初めてステップを完了（全4モード）した |
| `first-challenge` | 初チャレンジャー | 初めてチャレンジモードをクリアした |
| `streak-3` | 3日連続 | 3日連続で学習した |
| `streak-7` | 週間学習者 | 7日連続で学習した |
| `streak-30` | 継続の達人 | 30日連続で学習した |
| `course-1-complete` | 基礎マスター | React基礎コース（4ステップ）を完了した |
| `course-2-complete` | 応用習得者 | React応用コース（4ステップ）を完了した |
| `course-3-complete` | 実践者 | React実践コース（4ステップ）を完了した |
| `course-4-complete` | API連携マスター | API連携実践コース（8ステップ）を完了した |
| `all-complete` | Coden完走者 | 全20ステップを完了した |
| `pt-500` | 500Pt達成 | 累計500Pt以上を獲得した |
| `pt-1000` | 1000Pt達成 | 累計1000Pt以上を獲得した |

#### その他ゲーミフィケーション要素

| 要素 | 仕様 |
|------|------|
| 学習ストリーク | 連続学習日数をカウント・可視化 |
| トースト通知 | 実績解除時にアニメーション付きトーストを表示 |
| ヘッダーPt表示 | 累計ポイントをヘッダーに常時表示 |

---

### 4-5. 模擬API環境（API連携コース用）

| 項目 | 仕様 |
|------|------|
| 用途 | API連携コース（コース4）専用の学習用モックAPI |
| 実装 | json-server または同等ツール |
| エンドポイント | カウンター操作・タスク管理CRUD |
| 対応メソッド | GET / POST / PATCH / DELETE |

#### API動作仕様（学習コンテンツとして体験する状態）

| 操作 | 成功時UI | 失敗時UI |
|------|---------|---------|
| GET | データを一覧または単体で表示 | エラーメッセージ表示 + 再試行ボタン |
| POST | 作成データを即時リストに追加 | エラーメッセージ表示 |
| PATCH | 更新データをその場で反映 | エラーメッセージ表示 |
| DELETE | 削除アイテムをリストから除去 | エラーメッセージ表示 |
| ローディング中 | スピナーまたはスケルトンUI | — |

---

### 4-6. プロフィール画面（`/profile`）

| 要素 | 仕様 |
|------|------|
| 学習統計 | 総学習時間・正解率・連続学習日数の詳細表示 |
| Pt履歴 | 獲得日時・理由・Pt数の一覧 |
| 実績バッジ | 獲得済み（カラー表示）と未獲得（グレーアウト）の一覧 |
| マスコット設定 | 使用するマスコットキャラクターの選択・変更 |

---

## 5. 学習カリキュラム（全4コース・20ステップ）

### コース1: React基礎（4ステップ / beginner）

| # | ステップID | タイトル | 学習テーマ |
|---|-----------|----------|-----------|
| 1 | `usestate-basic` | useState基礎 | 状態管理の基本 |
| 2 | `events` | イベント処理 | ユーザー操作への反応 |
| 3 | `conditional` | 条件付きレンダリング | 条件に応じた表示切替 |
| 4 | `lists` | リスト表示 | 配列データの表示 |

### コース2: React応用（4ステップ / intermediate）

| # | ステップID | タイトル | 学習テーマ |
|---|-----------|----------|-----------|
| 5 | `useeffect` | useEffect | 副作用とライフサイクル |
| 6 | `forms` | フォーム処理 | 入力とバリデーション |
| 7 | `usecontext` | useContext | グローバル状態管理 |
| 8 | `usereducer` | useReducer | 複雑な状態ロジック |

### コース3: React実践（4ステップ / advanced）

| # | ステップID | タイトル | 学習テーマ |
|---|-----------|----------|-----------|
| 9 | `custom-hooks` | カスタムHooks | 再利用可能なロジック |
| 10 | `api-fetch` | API連携 | データ取得とローディング |
| 11 | `performance` | パフォーマンス最適化 | useMemo/useCallback |
| 12 | `testing` | テスト入門 | React Testing Library |

### コース4: API連携実践（8ステップ / intermediate）

| # | ステップID | タイトル | 学習テーマ |
|---|-----------|----------|-----------|
| 13 | `api-counter-get` | カウンターAPI (GET) | APIからデータを取得 |
| 14 | `api-counter-post` | カウンターAPI (POST) | APIにデータを送信 |
| 15 | `api-tasks-list` | タスク一覧 (GET) | リストデータの取得と表示 |
| 16 | `api-tasks-create` | タスク追加 (POST) | フォームからのデータ送信 |
| 17 | `api-tasks-update` | タスク更新 (PATCH) | 完了状態の切り替え |
| 18 | `api-tasks-delete` | タスク削除 (DELETE) | APIからの削除処理 |
| 19 | `api-custom-hook` | useTasksフック | API操作のカスタムフック化 |
| 20 | `api-error-loading` | エラー/ローディングUI | APIの状態に応じたUI表示 |

---

## 6. 画面・ルーティング仕様

| パス | 画面 | 認証 |
|-----|------|------|
| `/login` | ログイン画面 | 不要（ログイン済みなら `/` へリダイレクト） |
| `/` | ダッシュボード | 必須 |
| `/step/:stepId` | 学習画面 | 必須 |
| `/profile` | プロフィール画面 | 必須 |

---

## 7. アーキテクチャ

### 7-1. レイヤー構造

```
src/
├── pages/                  ← ページコンポーネント（ルートと1:1）
│   ├── LoginPage/
│   ├── DashboardPage/
│   ├── LearningPage/       ← /step/:stepId
│   └── ProfilePage/
│
├── features/               ← 機能ごとの凝集ユニット
│   ├── learning/           ← 学習モード（ReadMode / PracticeMode / TestMode / ChallengeMode）
│   └── gamification/       ← バッジ通知 / Pt表示 / ストリーク
│
├── components/             ← 共通UIコンポーネント（Header / Sidebar / Toast等）
│
├── contexts/               ← グローバル状態管理（Context API）
│   ├── AuthContext         ← user / isLoading / signIn / signOut
│   ├── LearningContext     ← totalPoints / streakDays / completedSteps
│   └── AchievementContext  ← badges / checkAndUnlock
│
├── services/               ← データアクセス層（Supabase操作を隠蔽）
│   ├── progressService.ts
│   ├── statsService.ts
│   ├── achievementService.ts
│   └── pointService.ts
│
├── lib/
│   └── supabaseClient.ts   ← Supabaseクライアント + 設定エラー export
│
└── content/                ← 静的コンテンツ（Markdown / クイズ / チャレンジ定義）
    ├── fundamentals/
    ├── intermediate/
    ├── advanced/
    └── api-practice/
```

### 7-2. 状態管理責務

| Context | 管理する状態 | 主な操作 |
|---------|-----------|---------|
| `AuthContext` | `user`, `isLoading` | `signIn`, `signOut`, セッション復元 |
| `LearningContext` | `totalPoints`, `streakDays`, `completedStepIds` | 進捗取得・更新、ポイント加算 |
| `AchievementContext` | `unlockedBadges` | バッジ解禁チェック・通知トリガー |

**UI状態**（タブ選択・モーダル・フォーム入力値）は各コンポーネントのローカル `useState` で管理し、Contextには持ち込まない。

### 7-3. コンポーネント分割方針（並行開発コンフリクト対策）

- 各機能（4モード・ゲーミフィケーション等）は **`features/` 配下のディレクトリ単位**でコンポーネントを分割する
- 並行開発では「1タスク = 1ディレクトリ所有」を原則とし、同一ファイルへの並行編集を避ける
- `LearningPage/index.tsx` のような共有ファイルは、並行タスク開始前に骨格（スケルトン）を確定させ、各モードを `import` で組み込む形にする

---

## 8. 技術スタック

### 8-1. フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|---------|
| フレームワーク | React | 19.x |
| ビルドツール | Vite | 最新安定版 |
| 言語 | TypeScript | 5.x（`strict: true`） |
| ルーティング | React Router | v7.x |
| コードエディタ | Monaco Editor（`@monaco-editor/react`） | 最新安定版 |
| Markdownレンダリング | react-markdown + remark-gfm | 最新安定版 |
| シンタックスハイライト | Prism.js | 最新安定版 |
| スタイリング | Tailwind CSS | v3（`*.module.css` 不使用） |
| テスト | Vitest + React Testing Library | 最新安定版 |

### 8-2. バックエンド / 外部サービス

| カテゴリ | 技術 |
|---------|------|
| BaaS（認証・DB） | Supabase（PostgreSQL + Supabase Auth） |
| 模擬API | json-server または同等ツール |

### 8-3. インフラ・ツール

| カテゴリ | 選定 |
|---------|------|
| ホスティング | Vercel または Netlify |
| バージョン管理 | Git + GitHub |
| CI | GitHub Actions（lint / typecheck / test） |

---

## 9. データ設計

### 9-1. テーブル定義

```sql
-- プロフィール（auth.users と 1:1）
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  selected_mascot TEXT DEFAULT 'default',
  total_points    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ステップ進捗（4モード個別に管理）
CREATE TABLE step_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id        TEXT NOT NULL,
  read_done      BOOLEAN DEFAULT false,
  practice_done  BOOLEAN DEFAULT false,
  test_done      BOOLEAN DEFAULT false,
  challenge_done BOOLEAN DEFAULT false,
  completed_at   TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step_id)
);

-- 学習統計（ユーザーごとの集計）
CREATE TABLE learning_stats (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_correct     INTEGER DEFAULT 0,
  total_incorrect   INTEGER DEFAULT 0,
  streak_days       INTEGER DEFAULT 0,
  last_learned_date DATE,
  total_minutes     INTEGER DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 実績バッジ
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ポイント獲得履歴
CREATE TABLE point_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- チャレンジ提出履歴
CREATE TABLE challenge_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id      TEXT NOT NULL,
  code         TEXT NOT NULL,
  passed       BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
```

### 9-2. RLS（Row Level Security）ポリシー

```sql
-- 全テーブルで RLS を有効化
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_progress        ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- 各ユーザーは自分のデータのみアクセス可
CREATE POLICY "own_profile"      ON profiles              FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_progress"     ON step_progress         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_stats"        ON learning_stats        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_achievements" ON achievements          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_points"       ON point_history         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_submissions"  ON challenge_submissions FOR ALL USING (auth.uid() = user_id);
```

### 9-3. 静的コンテンツ

学習コンテンツ（Markdown解説・クイズデータ・チャレンジ定義）は**フロントエンドの静的ファイルとして管理**し、DBには保存しない。

---

## 10. CSS設計方針

| 項目 | 方針 |
|------|------|
| スタイリング手法 | Tailwind CSS v3（ユーティリティクラス統一） |
| CSS Modules | `*.module.css` は使用しない |
| デザイントークン | `tailwind.config.ts` の `theme.extend` でブランドカラー・フォント・サイズを一元定義 |
| グローバルスタイル | `src/styles/globals.css` に `@tailwind` ディレクティブ + リセット |
| レスポンシブ | Tailwind ブレークポイント（`sm:` `md:` `lg:`）を使用 |
| アニメーション | `transition-*` / `animate-*` を優先、必要時に `@layer utilities` でカスタム追加 |

---

## 11. 非機能要件

### 11-1. セキュリティ

| 要件 | 仕様 |
|------|------|
| 認証基盤 | Supabase Auth（JWT管理はSupabaseに委譲） |
| データアクセス制御 | RLS でユーザー単位に行レベルアクセスを制御 |
| 環境変数管理 | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` は `.env.local` で管理し `.gitignore` に含める |
| コンテンツ配信 | 学習コンテンツは静的ファイルとして配信（DB不要） |
| コード実行境界 | チャレンジモードはクライアントサイド（ブラウザ内）のみで実行。サーバーサイドでの任意コード実行は行わない |
| 白画面防止 | `onAuthStateChange` は `try-catch-finally` で包み、`finally` で必ず `isLoading` を解除する |

### 11-2. 品質

| 要件 | 仕様 |
|------|------|
| TypeScript | `strict: true` で型エラー 0 件 |
| テスト | Vitest + RTL でコンポーネントテスト・統合テストを実施 |
| エラー境界 | APIエラー・ネットワーク断時にUIがクラッシュしないこと（エラー境界またはフォールバックUI） |
| RLS検証 | 複数ユーザーでログインし、データが混在しないことを確認 |

### 11-3. UX・アクセシビリティ

| 要件 | 仕様 |
|------|------|
| レスポンシブ | モバイル〜デスクトップで表示崩れなし（実機 or デバイスエミュレーションで確認） |
| 即時フィードバック | 正誤判定・Pt獲得・実績解除は即座に視覚的フィードバックを返す |
| ローディング | 非同期処理中はスピナーまたはスケルトンUIを表示 |
| キーボード操作 | 主要インタラクション（タブ切替・フォーム送信等）がキーボードで操作可能 |

### 11-4. パフォーマンス

| 要件 | 仕様 |
|------|------|
| コード分割 | Vite のダイナミックインポートでバンドルサイズを最適化 |
| Monaco遅延ロード | `React.lazy` + `Suspense` でチャレンジ画面の初期ロードを軽減 |
| 再レンダリング抑制 | `useMemo` / `useCallback` で不要な再レンダリングを防止 |

---

## 12. 成功指標（KPI）

### ユーザー指標（v1リリース後 初月目標）

| 指標 | 目標値 | 集計単位 |
|------|-------|---------|
| ユーザー登録数 | 100人 | 月次 |
| 週次アクティブユーザー率 | 30%以上 | 週次（ログイン数 / 登録数） |
| 1コース完了率 | 50%以上 | 月次（完了者 / 登録者） |
| 平均学習時間 | 週3時間以上 | 週次 |

### 学習効果指標

| 指標 | 目標値 | 集計単位 |
|------|-------|---------|
| 練習問題正解率 | 平均70%以上 | 月次（正解数 / 総試行数） |
| チャレンジクリア率 | 平均60%以上 | 月次（クリア数 / 挑戦数） |
| 7日連続学習率 | 20%以上 | 月次（達成者 / 登録者） |

### エンゲージメント指標

| 指標 | 目標値 | 集計単位 |
|------|-------|---------|
| 平均セッション時間 | 20分以上 | 週次 |
| 30日リテンション率 | 40%以上 | 月次（30日後アクティブ率） |

---

## 13. リリース受け入れ基準（Definition of Done）

以下を全て満たした状態をリリース完了とする。

#### 機能完成

- [ ] 全4コース・20ステップが4モード（閲覧・練習・テスト・チャレンジ）で学習可能
- [ ] 認証（メール/パスワード・ソーシャル）・ルート保護・セッション復元が動作
- [ ] 学習進捗・統計・Pt・実績・回答履歴が Supabase に永続化される
- [ ] 模擬API演習（CRUD操作）の成功時UI・失敗時UI・ローディングUIが動作
- [ ] ダッシュボードの全ウィジェット（進捗・統計・ヒートマップ・今日の目標）が動作
- [ ] プロフィール画面の統計・Pt履歴・実績一覧・マスコット設定が機能
- [ ] ゲーミフィケーション（Pt付与・バッジ解禁・ストリーク・トースト通知）が動作

#### 品質

- [ ] TypeScript `strict: true` で型エラー 0 件
- [ ] 主要導線のテスト（単体・統合）が完了
- [ ] 複数ユーザーでRLSデータ分離を確認済み
- [ ] APIエラー・ネットワーク断時にUIがクラッシュしないことを確認済み

#### UX・運用

- [ ] モバイル〜デスクトップで表示崩れなし（実機 or エミュレーション確認済み）
- [ ] 本番環境（Vercel または Netlify）へデプロイ済み
- [ ] KPI計測のためのアナリティクスが設定済み

---

## 14. ロードマップ概要（MVP → リリース）

### フェーズA: MVP

詳細は `coden-MVP.md` を参照。

**フェーズAの定義（MVP仕様書と整合）**: 環境構築・認証・基本ルーティング・**全4モード**の実装・React基礎コース（4ステップ）。

完了条件:
- [ ] テストユーザーでログインしてダッシュボードが表示される
- [ ] React基礎4ステップを4段階フローで一通り学習できる
- [ ] 進捗が Supabase に永続化される
- [ ] 手動テストチェックリスト（20項目）完了

---

### フェーズB: 学習機能拡充

**目標**: 全20ステップの学習が可能になる

| タスク | 内容 |
|--------|------|
| コース2〜4コンテンツ作成 | 残16ステップの Markdown・問題データ |
| 全コース解禁 | サイドバーに全コース・ステップを表示 |
| 進捗トラッキング強化 | 4モード個別の完了状態管理 |
| ステップ間ナビゲーション | 「次のステップへ」ボタンと完了状態の連動 |

完了条件:
- [ ] 全20ステップの学習コンテンツが存在する
- [ ] サイドバーで全コース・ステップを選択できる
- [ ] ステップ間のナビゲーションが動作する

---

### フェーズC: ゲーミフィケーション実装

**目標**: 学習継続モチベーションの仕組みを完成させる

| タスク | 内容 |
|--------|------|
| Ptシステム | `point_history` テーブルへの保存 + 各アクションでのPt付与 |
| 実績バッジ | バッジ解禁条件チェック + `AchievementContext` |
| 学習ストリーク | 連続学習日数の計算・保存・表示 |
| 学習ヒートマップ | カレンダー形式の学習履歴UI |
| トースト通知 | 実績解除時のアニメーション付き通知 |
| プロフィール画面 | Pt履歴・実績一覧・マスコット設定を実装 |
| ダッシュボード完成 | 全ウィジェット（ヒートマップ・統計・今日の目標）の完成 |

完了条件:
- [ ] 全Pt付与ルール（セクション4-4参照）が動作する
- [ ] 全バッジ解禁条件が実装・テスト済み
- [ ] ストリーク計算が日付をまたいで正確に動作する
- [ ] プロフィール画面が完成している

---

### フェーズD: API連携実践コース完成

**目標**: コース4（API連携実践・8ステップ）の学習体験を完成させる

| タスク | 内容 |
|--------|------|
| 模擬API環境 | json-serverのセットアップ + エンドポイント定義 |
| コース4コンテンツ | 8ステップのMarkdown・問題データ作成 |
| API動作仕様の実装 | セクション4-5の成功時UI・失敗時UI・ローディングUI |

完了条件:
- [ ] GET/POST/PATCH/DELETE 全メソッドで成功・失敗時のUIが動作する
- [ ] コース4の8ステップが一通り学習完了できる
- [ ] ローディング中のスピナー/スケルトンUIが動作する

---

### フェーズE: リリース準備・品質向上

**目標**: 本番環境への公開と品質担保

| タスク | 内容 |
|--------|------|
| テスト追加 | Vitest + RTL によるコンポーネント・統合テスト |
| TypeScript strict | 型エラー 0 件の達成 |
| パフォーマンス最適化 | バンドルサイズ削減・遅延ロード適用 |
| レスポンシブ確認 | 実機 or エミュレーターでの崩れ修正 |
| アクセシビリティ | キーボード操作・ARIAラベル対応 |
| SEO | メタタグ・OGP設定 |
| 本番デプロイ | Vercel または Netlify へのデプロイ・動作確認 |
| アナリティクス設定 | KPI計測基盤の設定 |

完了条件:
- [ ] TypeScript strict で型エラー 0 件
- [ ] 主要コンポーネントのテストが実装済み
- [ ] モバイル〜デスクトップでの表示崩れなし
- [ ] 本番環境へのデプロイ完了・動作確認済み
- [ ] KPI計測のためのアナリティクス設定済み

---

## 15. リリース後拡張候補

> ユーザーフィードバックに基づき優先順位を決定する。

| 優先度 | 機能 | 概要 |
|--------|------|------|
| 高 | ソーシャル機能 | チャレンジ作品の投稿・共有・コメント・ランキング |
| 高 | AIコードレビュー | チャレンジ提出への自動フィードバック・改善提案 |
| 高 | API拡充 | 認証API・アップロードAPI・ローカル開発用パッケージ配布 |
| 中 | コース拡張 | Next.js / TypeScript / バックエンドコース |
| 中 | Ptストア | Ptでアバター・テーマ・エフェクトと交換 |
| 中 | デイリーチャレンジ | 期間限定の特別課題で追加Pt獲得 |
| 低 | オフライン対応 | Service Workerによるオフライン学習 |
| 低 | モバイルアプリ | React Nativeによるネイティブアプリ化 |

---

## 16. 補足事項

### 学習コンテンツについて
- 解説テキストは **React公式ドキュメント（react.dev）** を参照して作成する
- Reactのバージョンアップ・ドキュメント改訂に応じてコンテンツの更新が必要になる場合がある

### 模擬API環境について
- API連携コースで使用する模擬APIは**学習用途専用**であり、本番環境での使用は想定しない

---

**仕様書バージョン**: v1.0 | **参照元**: Specification.md v2.0 + 統合レビュー（Gemini・Claude・Codex）

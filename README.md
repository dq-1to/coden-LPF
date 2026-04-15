# Coden

React 初学者向けの段階的学習プラットフォーム。
「読める」から「書ける」への成長を、4段階の学習フローと全40ステップ + 多彩な練習モードで支援します。

## 特徴

### 4段階学習フロー

| モード | 内容 |
|--------|------|
| **Read** | Markdown ベースの解説を読んで概念を理解する |
| **Practice** | 穴埋め・コード記述で手を動かして定着させる |
| **Test** | 確認テストで理解度をチェック（不正解時は解説表示） |
| **Challenge** | 応用課題に挑戦し、実践力を養う |

### 学習コンテンツ（10コース / 40ステップ）

| コース | ステップ数 | 主なトピック |
|--------|-----------|-------------|
| React 基礎 | 4 | useState、イベント処理、条件分岐、リスト描画 |
| React 応用 | 4 | useEffect、フォーム、useContext、useReducer |
| React 実践 | 4 | カスタムフック、API取得、パフォーマンス、テスト |
| API 連携実践 | 8 | GET/POST/PATCH/DELETE、カスタムフック、エラー/ローディング |
| TypeScript 基礎 | 6 | 型、関数、オブジェクト、Union/Narrowing、Generics、ユーティリティ型 |
| TypeScript×React | 4 | Props 型定義、State 型、Hooks 型、イベント型 |
| React モダン | 6 | ErrorBoundary、Suspense/lazy、Concurrent、useOptimistic、Portals、forwardRef |
| 実務パターン | 4 | RHF+Zod、ページネーション、無限スクロール、認証フロー |

### 練習モード

| モード | 内容 |
|--------|------|
| **デイリーチャレンジ** | 毎日3問出題。7日連続でボーナスポイント |
| **コードドクター** | バグのあるコードを診断・修正（初級/中級/上級 各10問） |
| **ミニプロジェクト** | 段階的に完成させる実践プロジェクト（8プロジェクト） |
| **コードリーディング** | 他人のコードを読み解く力を養う（5問） |

### ベースヌック（Base Nook）

「基礎がわかると、コードが読める」をコンセプトに、JavaScript / React / Web の基礎概念を解説記事 + 理解度クイズで学べるコンテンツ。全12トピック。

### ゲーミフィケーション

- **ポイントシステム** — 学習の進捗に応じて Pt を獲得
- **実績バッジ** — マイルストーン達成で解禁される14種のバッジ
- **学習ストリーク** — 連続学習日数のトラッキング
- **ヒートマップ** — 30日間の学習活動を可視化

### その他の機能

- ダッシュボード（学習ステータス・進捗・バッジ・ヒートマップを一覧）
- プロフィールページ（学習統計の詳細表示）
- 復習リスト（苦手ステップのブックマーク）
- コードエディタ（Monaco Editor によるブラウザ上でのコード記述）
- 認証（メール/パスワード、Supabase Auth）
- レスポンシブ対応（モバイル〜デスクトップ）

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | React 19, TypeScript (strict), Vite 7 |
| スタイリング | Tailwind CSS v3, @tailwindcss/typography |
| ルーティング | react-router-dom v7 |
| エディタ | Monaco Editor |
| Markdown 描画 | react-markdown, remark-gfm |
| コードハイライト | Prism.js |
| アイコン | lucide-react |
| バックエンド | Supabase (Auth / PostgreSQL / RLS) |
| モック API | json-server |
| テスト | Vitest, Testing Library, jsdom |
| Lint | ESLint 9, typescript-eslint |
| パッケージ管理 | npm workspaces (monorepo) |

## アーキテクチャ

```
coden-monorepo/
├── apps/
│   └── web/                    # フロントエンドアプリケーション
│       ├── src/
│       │   ├── components/     # 共通 UI コンポーネント
│       │   ├── content/        # 学習コンテンツ（10コース + 練習モード + ベースヌック）
│       │   ├── contexts/       # AuthContext / LearningContext / AchievementContext
│       │   ├── features/       # 機能別 UI（learning / dashboard / base-nook）
│       │   ├── pages/          # ページコンポーネント
│       │   ├── services/       # ビジネスロジック
│       │   ├── shared/         # 共有型定義・バリデーション・ユーティリティ
│       │   └── main.tsx        # エントリポイント + ルーティング
│       ├── mock-api/           # json-server 用データ
│       └── supabase/sql/       # DB スキーマ・シード・マイグレーション
└── package.json                # ワークスペース設定
```

### 状態管理

- **AuthContext** — 認証状態（ログイン/ログアウト）
- **LearningContext** — 学習進捗（Supabase と同期）
- **AchievementContext** — 実績・ポイント管理

### データ永続化

- 学習進捗・ポイント・実績 → Supabase (PostgreSQL + RLS)
- 復習リスト → localStorage

## セットアップ

### 前提条件

- Node.js 22 系
- npm
- Supabase プロジェクト（Auth / DB）

### 手順

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp apps/web/.env.local.example apps/web/.env.local
```

`apps/web/.env.local` に以下を設定:

```env
VITE_SUPABASE_URL=<Supabase プロジェクト URL>
VITE_SUPABASE_ANON_KEY=<Supabase 公開キー>
VITE_API_BASE_URL=http://localhost:3001
```

### Supabase SQL の適用

`apps/web/supabase/sql/` 内の SQL を番号順に実行:

| # | ファイル | 内容 |
|---|---------|------|
| 001 | `001_schema_and_rls.sql` | スキーマと RLS |
| 002 | `002_seed_test_users.sql` | テストユーザー |
| 003 | `003_gamification.sql` | ゲーミフィケーション |
| 004 | `004_award_points_rpc.sql` | ポイント付与 RPC |
| 005 | `005_seed_test_progress.sql` | テスト用進捗データ |
| 006 | `006_daily_challenge.sql` | デイリーチャレンジ |
| 007 | `007_code_doctor.sql` | コードドクター |
| 008 | `008_mini_projects.sql` | ミニプロジェクト |
| 009 | `009_code_reading.sql` | コードリーディング |
| 010 | `010_record_study_activity_rpc.sql` | 学習活動記録 RPC |
| 011 | `011_base_nook.sql` | ベースヌック |
| 012 | `012_base_nook_timestamp_trigger.sql` | ベースヌック タイムスタンプトリガー |

### 起動

```bash
# フロントエンド開発サーバー
npm run dev

# モック API サーバー（API 連携実践コース用、別ターミナル）
npm run api:dev
```

### テストユーザー

| Email | Password |
|-------|----------|
| `test01@coden.dev` | `TestPass123!` |
| `test02@coden.dev` | `TestPass123!` |

## 開発コマンド

```bash
npm run dev         # 開発サーバー起動
npm run api:dev     # モック API サーバー起動
npm run typecheck   # TypeScript 型チェック
npm run lint        # ESLint
npm run test        # Vitest テスト実行
npm run build       # プロダクションビルド
```

## ライセンス

Private

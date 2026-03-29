# Coden

React 初学者向けの段階的学習プラットフォーム。
「読める」から「書ける」への成長を、4段階の学習フローと全20ステップで支援します。

## 特徴

### 4段階学習フロー

| モード | 内容 |
|--------|------|
| **Read** | Markdown ベースの解説を読んで概念を理解する |
| **Practice** | 穴埋め・コード記述で手を動かして定着させる |
| **Test** | 確認テストで理解度をチェック（不正解時は解説表示） |
| **Challenge** | 応用課題に挑戦し、実践力を養う |

### 学習コンテンツ（4コース / 20ステップ）

| コース | ステップ数 | 主なトピック |
|--------|-----------|-------------|
| React 基礎 | 4 | useState、イベント処理、条件分岐、リスト描画 |
| React 応用 | 4 | useEffect、フォーム、useContext、useReducer |
| React 実践 | 4 | カスタムフック、API取得、パフォーマンス、テスト |
| API 連携実践 | 8 | GET/POST/PATCH/DELETE、カスタムフック、エラー/ローディング |

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
│       │   ├── content/        # 学習コンテンツ（4コース分）
│       │   ├── contexts/       # AuthContext / LearningContext / AchievementContext
│       │   ├── features/       # 機能別 UI（learning / dashboard）
│       │   ├── pages/          # ページコンポーネント
│       │   ├── services/       # ビジネスロジック
│       │   └── main.tsx        # エントリポイント + ルーティング
│       ├── mock-api/           # json-server 用データ
│       └── supabase/sql/       # DB スキーマ・シード
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

以下の順で SQL を実行:

1. `apps/web/supabase/sql/001_schema_and_rls.sql` — スキーマと RLS
2. `apps/web/supabase/sql/002_seed_test_users.sql` — テストユーザー
3. `apps/web/supabase/sql/003_gamification.sql` — ゲーミフィケーション
4. `apps/web/supabase/sql/004_award_points_rpc.sql` — ポイント付与 RPC

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

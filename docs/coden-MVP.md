# Coden MVP仕様書

> **バージョン**: v0.1
> **作成日**: 2026-02-20
> **参照元**: `docs/Specification.md` v2.0 / 統合レビュー（Gemini・Claude・Codex）
> **ステータス**: MVP開発用 確定仕様

---

## 1. MVPの目的

Codenのコアコンセプト「**4段階学習フロー（読む→埋める→テストする→書く）**」を最小構成で実現し、ユーザー本人が実機で触って確認できる状態を最短で作る。

| 目的 | 説明 |
|------|------|
| **コア体験の検証** | 4段階フローが学習体験として成立するかを確認する |
| **実装基盤の確立** | 認証・学習・進捗の骨格を整え、後続フェーズの土台とする |
| **ユーザーテストの実現** | テストユーザーでログインし、一通り学習・確認できる状態を提供する |

---

## 2. MVPスコープ

### 2-1. 実装対象（必須）

| カテゴリ | 内容 |
|---------|------|
| **認証** | メール/パスワードログイン・ログアウト・セッション復元 |
| **ルート保護** | 未認証ユーザーの `/login` へのリダイレクト |
| **ダッシュボード（簡易版）** | 学習中コース名・完了ステップ数の表示 |
| **学習画面** | 4タブUI（閲覧・練習・テスト・チャレンジ）のサイドバー付き画面 |
| **閲覧モード** | Markdownレンダリング・シンタックスハイライト・コードコピーボタン |
| **練習モード** | 穴埋めクイズ・即時正誤判定・ヒント表示 |
| **テストモード** | コード穴埋め・合格後ライブプレビュー解禁 |
| **チャレンジモード** | Monaco Editor（遅延ロード）・キーワードベース自動チェック・段階的ヒント |
| **コース1コンテンツ** | React基礎4ステップ分のMarkdown解説・クイズ・チャレンジ定義 |
| **進捗保存** | 4モードの完了状態を Supabase に永続化 |
| **テストユーザーシード** | `auth.users` に直接 INSERT するシードSQLの作成と適用 |

> **チャレンジモードについて**: Gemini・Codex はモナコを v0.2 へ先送りすることを提案したが、「書く」モードは4段階フローの根幹であり、これがないとCodenとして成立しない。ただし `@monaco-editor/react` を `React.lazy` + `Suspense` でダイナミックインポートし、初期バンドルへの影響を最小化すること。

### 2-2. スコープ外（後続フェーズ）

| 機能 | 対応フェーズ |
|------|------------|
| ソーシャルログイン（GitHub, Google） | フェーズB以降（任意） |
| ゲーミフィケーション全般（Pt・バッジ・ストリーク） | フェーズC |
| 学習ヒートマップ・詳細統計 | フェーズC |
| コース2〜4（残16ステップ） | フェーズB |
| 模擬REST API環境 | フェーズD |
| プロフィール画面（`/profile`） | フェーズC以降 |
| テスト自動化・パフォーマンス最適化 | フェーズE |

> **Ptシステムの扱い**: 「ポイント加算はMVP対象」という記述が一部草案に存在したが、Specification.md の開発計画（セクション12）でPtはフェーズ3（ゲーミフィケーション）に分類されている。ここで確定: **PtはMVP対象外、フェーズCで実装する**。

---

## 3. 実装フェーズ

### Phase 1: 環境構築（初期セットアップ）

**目的**: 実装と検証が可能な開発基盤を整える。

#### 1-A. フロントエンド基盤

- `npm create vite@latest` で React + TypeScript テンプレートを作成
- Tailwind CSS v3 をセットアップ（`tailwind.config.ts` + `src/styles/globals.css`）
  - `*.module.css` は**一切作成しない**。ユーティリティクラスに統一
- React Router v7 を導入し、3ルート（`/login` / `/` / `/step/:stepId`）を定義
- 共通ヘッダー・ページコンテナの最小コンポーネントを作成

#### 1-B. Supabase接続設定

- `src/lib/supabaseClient.ts` を作成し、環境変数で初期化
- 環境変数未設定時は白画面でなく `<ConfigErrorView>` を表示する実装を追加

```ts
// supabaseClient.ts の責務（白画面防止パターン）
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabaseConfigError = (!url || !key)
  ? '環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が設定されていません'
  : null
export const supabase = createClient(url ?? 'http://localhost', key ?? '')
```

- `.env.local.example` を作成（`.gitignore` で `.env.local` を管理対象外にする）

#### 1-C. DBテーブル作成 + RLSポリシー適用

Supabase SQL Editor または MCP で以下を実行する。

```sql
-- プロフィール（auth.users と 1:1）
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ステップ進捗
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

-- RLS 有効化
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_progress ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（自分のデータのみアクセス可）
CREATE POLICY "own_profile"   ON profiles      FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_progress"  ON step_progress FOR ALL USING (auth.uid() = user_id);
```

#### 1-D. テストユーザーシードデータ

```sql
-- 注意: email_change / email_change_token_new / email_change_token_current は
-- 必ず '' (空文字列) を明示する。NULL にすると GoTrue がログイン時に 500 エラーを発生させる。
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, role
) VALUES
(
  gen_random_uuid(), 'test01@coden.dev',
  crypt('TestPass123!', gen_salt('bf')), now(),
  '', '', '', '', '',
  now(), now(),
  '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'
),
(
  gen_random_uuid(), 'test02@coden.dev',
  crypt('TestPass123!', gen_salt('bf')), now(),
  '', '', '', '', '',
  now(), now(),
  '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'
);
```

**テストユーザー認証情報**（ユーザーテスト引き渡し用）:

| ユーザー | メールアドレス | パスワード | 初期状態 |
|---------|--------------|---------|---------|
| test01 | `test01@coden.dev` | `TestPass123!` | 進捗なし |
| test02 | `test02@coden.dev` | `TestPass123!` | 進捗なし |

#### Phase 1 完了条件

- [ ] `npm run dev` でローカル起動できる（コンソールにエラーなし）
- [ ] `/login` `/` `/step/usestate-basic` の3ルートに遷移できる
- [ ] 環境変数未設定時に白画面でなく `ConfigErrorView` が表示される
- [ ] `profiles` と `step_progress` テーブルが存在し、RLSポリシーが適用済み
- [ ] テストユーザー2件が `auth.users` に存在する

---

### Phase 2: 初期実装（Codenとして必要な最小要素）

**目的**: 4段階学習フローが実際に動作し、Codenとしての最小体験を提供する。

#### 2-A. 認証実装

**必須実装パターン**（既知の白画面バグ対策。RuleOps記録済み）:

```tsx
// AuthContext.tsx — onAuthStateChange の安全な実装
useEffect(() => {
  let isMounted = true

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!isMounted) return
      try {
        // セッションありなら user をセット
        if (session?.user && event !== 'SIGNED_OUT') {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch {
        // AbortError 等が発生してもクラッシュしない
        setUser(null)
      } finally {
        // 必ず isLoading を解除する（これがないと白画面になる）
        if (isMounted) setIsLoading(false)
      }
    }
  )

  // 未ログイン初回アクセス時は onAuthStateChange が呼ばれないため
  // getSession でフォールバックして isLoading を解除する
  supabase.auth.getSession().finally(() => {
    if (isMounted) setIsLoading(false)
  })

  return () => {
    isMounted = false
    subscription.unsubscribe()
  }
}, [])
```

- ログイン画面UI: メール/パスワードフォーム + バリデーション + エラー表示
- ヘッダーのログアウトボタン: セッション終了 → `/login` へリダイレクト

#### 2-B. ダッシュボード（簡易版）

| 要素 | 仕様 |
|------|------|
| ウェルカム表示 | 「こんにちは、{ユーザー名}さん」 |
| 学習中コース名 | 「React基礎」等のコース名 |
| 進捗表示 | 完了ステップ数 / 全ステップ数（例: 2 / 4） |

#### 2-C. 学習画面（`/step/:stepId`）

**サイドバー**:
- コース名・ステップ一覧を表示
- 各ステップに完了状態アイコン（未完了 / 完了）
- ステップクリックで URLパラメータ更新

**4タブUI**:

| タブ | コンポーネント |
|------|--------------|
| 📖 解説 | `ReadMode` |
| ✏️ 練習 | `PracticeMode` |
| 🧪 テスト | `TestMode` |
| 🏆 チャレンジ | `ChallengeMode` |

**必須: stepId変更時のローカル状態リセット**（既知バグ対策。RuleOps記録済み）:

```tsx
// 各モードコンポーネントで必ず実装する
useEffect(() => {
  setAnswers({})
  setShowResult(false)
  setShowHints(false)
}, [stepId])
```

#### 2-D. 閲覧モード（ReadMode）

| 要素 | 仕様 |
|------|------|
| Markdown描画 | `react-markdown` + `remark-gfm` |
| シンタックスハイライト | `Prism.js`（または `react-syntax-highlighter`） |
| コードコピーボタン | クリックでクリップボードにコピー、アイコンをチェックマークに一時変化 |

#### 2-E. 練習モード（PracticeMode）

| 要素 | 仕様 |
|------|------|
| 問題形式 | 穴埋めクイズ（各ステップ5〜6問） |
| 即時正誤判定 | 送信後に色・アイコンで正誤をフィードバック |
| ヒント | ヒントボタンで関連ヒントを表示 |
| 全問正解で保存 | `practice_done = true` を Supabase にUPSERT |

#### 2-F. テストモード（TestMode）

| 要素 | 仕様 |
|------|------|
| 問題形式 | 実際のコンポーネントコードの穴埋め |
| ヒント | ヒントボタンで表示 |
| 合格判定 | 全空欄正解で合格 |
| ライブプレビュー | 合格後に `iframe` 等でコンポーネントを表示 |
| 合格で保存 | `test_done = true` を Supabase にUPSERT |

#### 2-G. チャレンジモード（ChallengeMode）

| 要素 | 仕様 |
|------|------|
| 課題提示 | 仕様のみ表示（実装はゼロから） |
| エディタ | Monaco Editor（`@monaco-editor/react`）を **`React.lazy` でダイナミックインポート** |
| 自動チェック | 必須キーワードの含有確認 |
| 段階的ヒント | 「ヒント1」→「ヒント2」→「ヒント3」の順に表示 |
| クリアで保存 | `challenge_done = true` を Supabase にUPSERT |

```tsx
// ChallengeMode.tsx — Monaco の遅延ロード
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

// JSX 内
<React.Suspense fallback={<div>エディタを読み込み中...</div>}>
  <MonacoEditor language="typescript" value={code} onChange={setCode} />
</React.Suspense>
```

#### 2-H. コース1コンテンツ（React基礎4ステップ）

```
src/content/
  fundamentals/
    usestate-basic/
      read.md         ← 解説Markdown（React公式ドキュメント準拠）
      practice.ts     ← 穴埋めクイズデータ（問題・正解・ヒント）
      test.ts         ← コード穴埋めテストデータ（テンプレート・正解）
      challenge.ts    ← チャレンジ定義（仕様文・必須キーワード・ヒント群）
    events/
    conditional/
    lists/
```

| ステップ | 解説テーマ | チャレンジ課題 |
|---------|-----------|--------------|
| `usestate-basic` | useState の基本 | カウンターを実装せよ |
| `events` | onClick / onChange | ボタンで文字を切り替えるUIを実装せよ |
| `conditional` | 三項演算子 / && | ログイン状態で表示を切り替えるUIを実装せよ |
| `lists` | map / key | フルーツ一覧をリスト表示せよ |

#### 2-I. 進捗保存サービス

`src/services/progressService.ts` として実装する。

- `getStepProgress(userId, stepId)` — 特定ステップの4モード完了状態を取得
- `updateModeCompletion(userId, stepId, mode)` — モード完了をUPSERT
- `getCompletedStepCount(userId)` — ユーザーの完了済みステップ数を集計

#### Phase 2 完了条件

- [ ] テストユーザーでログインし、ダッシュボードが表示される
- [ ] 未認証で `/` にアクセスすると `/login` へリダイレクトされる
- [ ] サイドバーから4ステップを選択できる
- [ ] 閲覧・練習・テスト・チャレンジの全タブが動作する
- [ ] 各モードの完了状態が Supabase に保存される
- [ ] リロード・再ログイン後も完了状態が保持される
- [ ] ダッシュボードの完了ステップ数が更新に追随する
- [ ] 別ステップへ移動したとき前ステップの入力・判定フラグがリセットされる

---

### Phase 3: テスト・ユーザーテスト準備

**目的**: MVPの最低品質を担保し、ユーザーテストに引き渡せる状態にする。

#### 3-A. 手動テストチェックリスト

##### 認証導線

| # | テスト内容 | 期待する結果 |
|---|-----------|------------|
| 1 | 正しい認証情報でログイン | ダッシュボードへ遷移する |
| 2 | 誤ったパスワードでログイン | エラーメッセージが表示される |
| 3 | 未ログインで `/` へアクセス | `/login` へリダイレクトされる |
| 4 | 未ログインで `/step/usestate-basic` へアクセス | `/login` へリダイレクトされる |
| 5 | ログイン後にブラウザをリロード | セッションが復元されダッシュボードが表示される |
| 6 | ログアウトボタンをクリック | セッション終了・`/login` へ遷移する |
| 7 | ログアウト後にブラウザバック | 学習画面に戻れず `/login` へリダイレクトされる |

##### 学習導線

| # | テスト内容 | 期待する結果 |
|---|-----------|------------|
| 8 | サイドバーからステップを選択 | 学習画面が表示される |
| 9 | 解説タブを閲覧 | Markdownが正しくレンダリングされる |
| 10 | コードのコピーボタンをクリック | クリップボードにコピーされアイコンが変化する |
| 11 | 練習タブで全問正解 | 「完了」フィードバックが表示され保存される |
| 12 | 練習タブで不正解 | エラー表示が出て再挑戦できる |
| 13 | ヒントボタンをクリック | ヒントが表示される |
| 14 | テストタブで全空欄正解 | ライブプレビューが解禁される |
| 15 | チャレンジタブでコードを入力し提出 | キーワードチェックが実行される |
| 16 | チャレンジで必須キーワードを含む実装 | 「合格」フィードバックが表示される |
| 17 | 別ステップへ移動 | 前ステップの入力・判定フラグがリセットされる |

##### 進捗・データ分離

| # | テスト内容 | 期待する結果 |
|---|-----------|------------|
| 18 | ステップを完了 | ダッシュボードの完了数が更新される |
| 19 | ログアウト → 再ログイン | 完了状態が保持されている |
| 20 | test02 でログイン | test01 の進捗データが見えない（RLS分離確認） |

#### 3-B. 受け入れ基準

| 基準 | 詳細 |
|------|------|
| **重大不具合 0 件** | ログイン不能・データ消失・学習不能の状態がないこと |
| **チェックリスト完了** | 上記20項目を全て確認・合格済み |
| **RLS確認** | test01 と test02 でデータが混在しないことを確認済み |
| **ログインから学習開始 3分以内** | ダッシュボード → 学習画面への導線が迷わず通ること |

---

## 4. MVP成果物

### 4-1. テストユーザー認証情報

| ユーザー | メールアドレス | パスワード |
|---------|--------------|---------|
| test01 | `test01@coden.dev` | `TestPass123!` |
| test02 | `test02@coden.dev` | `TestPass123!` |

### 4-2. 起動手順

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
cp .env.local.example .env.local
# .env.local を開いて以下を記入:
#   VITE_SUPABASE_URL=<Supabase プロジェクト URL>
#   VITE_SUPABASE_ANON_KEY=<Supabase anon key>

# 3. 開発サーバーの起動
npm run dev

# 4. ブラウザで http://localhost:5173 を開く
# 5. test01@coden.dev / TestPass123! でログイン
```

### 4-3. 確認観点

- React基礎コース（4ステップ）の全4モードを一通り体験できること
- 学習の進捗状態がダッシュボードに反映されること
- ブラウザをリロードしても完了状態が保持されること

---

## 5. 既知制約・注意事項

| 項目 | 内容 |
|------|------|
| ソーシャルログイン | MVP未実装（メール/パスワードのみ） |
| ゲーミフィケーション | Pt・バッジ・ストリーク全て未実装 |
| 対象コース | React基礎（4ステップ）のみ。コース2〜4は非表示 |
| API連携コース | 模擬API環境は未構築 |
| プロフィール画面 | `/profile` 未実装 |
| デプロイ環境 | ローカル動作確認が必須。本番デプロイは任意（フェーズE） |

---

## 6. MVP後の次のステップ（v0.2 候補）

| 優先度 | 機能 | 対応フェーズ |
|--------|------|------------|
| 高 | コース2〜4コンテンツ追加と解禁 | フェーズB |
| 高 | Ptシステム基礎実装 | フェーズC |
| 中 | バッジ・ストリーク・学習ヒートマップ | フェーズC |
| 中 | プロフィール画面 | フェーズC |
| 中 | 模擬API環境とAPI連携コース | フェーズD |
| 低 | ソーシャルログイン（任意） | フェーズB以降 |

---

**仕様書バージョン**: v0.1 | **参照元**: Specification.md v2.0 + 統合レビュー（Gemini・Claude・Codex）

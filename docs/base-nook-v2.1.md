# Base Nook（ベースヌック）v2.1 仕様書

> **バージョン**: v2.1（ドラフト）
> **作成日**: 2026-04-02
> **ステータス**: 要件定義フェーズ
> **参照元**: `docs/coden-v2.md` / `docs/Specification.md`

---

# Part 1: 要件定義

---

## R1. 概要と目的

### R1-1. 解決する課題

**「なんとなく使えているが、聞かれると説明できない基礎概念がある」**

React や TypeScript の学習を進める中で、JSX・API・fetch・DOM といった基礎概念を「なんとなく」理解したまま先に進んでしまう初学者が多い。既存のコースは「使えるようになる」ことに特化しており、「そもそもこれは何なのか」を掘り下げるコンテンツがない。

### R1-2. Base Nook とは

| 項目 | 内容 |
|------|------|
| 名称 | Base Nook（ベースヌック） |
| コンセプト | 基礎概念の「居場所」。気になった時にサッと立ち寄って理解を深める |
| 世界観 | Coden（コード + ガーデン）の中の、落ち着いて基礎を学べるスペース |
| 形式 | 解説記事 + 理解度クイズ |
| 位置づけ | 既存コース・練習モードとは独立した新コンテンツ |

### R1-3. v2.1 スコープ

| 項目 | 含む / 含まない |
|------|----------------|
| 12トピックの解説 + クイズ | 含む |
| ナビゲーション項目として独立配置 | 含む |
| ポイント付与 | 含む |
| DB テーブル設計・実装 | 含む |
| バッジ・実績連携 | 含まない（将来検討） |
| 他コンテンツからのリンク導線 | 含まない（将来検討） |

---

## R2. トピック一覧

### R2-1. 初回リリース（12トピック）

| # | トピック ID | タイトル | 概要 |
|---|-----------|---------|------|
| 1 | `javascript` | JavaScriptって何？ | ブラウザで動く言語、何ができるか |
| 2 | `jsx` | JSXって何？ | HTMLとの違い、なぜReactで使うか |
| 3 | `dom` | DOMって何？ | ブラウザがHTMLを理解する仕組み |
| 4 | `component` | コンポーネントって何？ | UIの部品化、なぜ分けるのか |
| 5 | `props-vs-state` | propsとstateの違い | データの流れ、それぞれの役割 |
| 6 | `json` | JSONって何？ | データ交換フォーマット、なぜ必要か |
| 7 | `api` | APIって何？ | サービス間の窓口、身近な例え |
| 8 | `http-methods` | HTTPメソッドって何？ | GET/POST/PUT/DELETE の役割 |
| 9 | `fetch` | fetchって何？ | ブラウザからサーバーへの通信手段 |
| 10 | `async` | 非同期処理って何？ | Promise, async/await、なぜ必要か |
| 11 | `npm` | npm / パッケージ管理って何？ | ライブラリの共有・管理の仕組み |
| 12 | `typescript` | TypeScriptって何？ | JSとの違い、型がある利点 |

### R2-2. トピックの順序

上記の番号順を推奨順序とする。ただしユーザーは任意の順序でアクセス可能（コースのようなロック機構は設けない）。

---

## R3. 解説パート要件

### R3-1. 方針

| 観点 | 方針 |
|------|------|
| 正確性 | 一次ソース（下表）の内容と矛盾しないこと。制作時に Context7 で最新ドキュメントを取得し照合する |
| 読みやすさ | 身近な例え話を交えてイメージしやすくする |
| 飽きにくさ | セクション分け + 適度なコード例で単調にしない |
| 量 | 読み切れる分量。スクロール2〜3回程度（800〜1500字目安） |
| ソース明記 | しない（解説末尾に参照リンクは載せない） |

### R3-1a. 一次ソース一覧

| # | トピック | 一次ソース |
|---|---------|-----------|
| 1 | JavaScript | MDN — JavaScript ガイド (`developer.mozilla.org/ja/docs/Web/JavaScript/Guide`) |
| 2 | JSX | React 公式 — JSX でマークアップを記述する (`react.dev/learn/writing-markup-with-jsx`) |
| 3 | DOM | MDN — DOM の紹介 (`developer.mozilla.org/ja/docs/Web/API/Document_Object_Model`) |
| 4 | コンポーネント | React 公式 — はじめてのコンポーネント (`react.dev/learn/your-first-component`) |
| 5 | props vs state | React 公式 — props を渡す / state の管理 (`react.dev/learn/passing-props-to-a-component`) |
| 6 | JSON | MDN — JSON の操作 (`developer.mozilla.org/ja/docs/Learn/JavaScript/Objects/JSON`) |
| 7 | API | MDN — Web API の紹介 (`developer.mozilla.org/ja/docs/Learn/JavaScript/Client-side_web_APIs`) |
| 8 | HTTPメソッド | MDN — HTTP リクエストメソッド (`developer.mozilla.org/ja/docs/Web/HTTP/Methods`) |
| 9 | fetch | MDN — Fetch API (`developer.mozilla.org/ja/docs/Web/API/Fetch_API`) |
| 10 | 非同期処理 | MDN — Promise / async と await (`developer.mozilla.org/ja/docs/Learn/JavaScript/Asynchronous`) |
| 11 | npm | npm 公式ドキュメント (`docs.npmjs.com/about-npm`) |
| 12 | TypeScript | TypeScript 公式 — TS for JS Programmers (`typescriptlang.org/docs/handbook/typescript-in-5-minutes.html`) |

**品質基準**: 解説の事実関係が一次ソースと矛盾しないこと。制作時は Context7 で最新版を取得して照合する。

### R3-2. 解説の構成（各トピック共通）

```
1. ひとことで言うと（1〜2文の端的な説明）
2. もう少し詳しく（身近な例え + やや詳しい説明）
3. コードで見てみよう（短いコード例）
4. まとめ（要点を3つ程度に絞る）
```

### R3-3. コード例の方針

- 短く、1つのことだけを示す（15行以内目安）
- シンタックスハイライト付き（Prism.js、既存インフラを流用）
- コピー可能にはしない（読んで理解するのが目的）

---

## R4. クイズパート要件

### R4-1. 基本仕様

| 項目 | 仕様 |
|------|------|
| 問題プール | 1トピックあたり 10〜20問 |
| 1回の表示 | ランダム3問 |
| 出題ロジック | 未正解の問題を優先的に出題 |
| 形式 | 4択選択式 |
| 正解済み表示 | 「済」マーク付きで表示 |
| 解説 | 各問題に正解理由の解説を付与（回答後に表示） |

### R4-2. 出題アルゴリズム

```
1. トピック内の全問題を取得
2. ユーザーの正解済み問題IDを取得
3. 未正解の問題を優先的に選択
4. 未正解が3問未満の場合、正解済みから補充してランダム3問にする
5. 全問正解済みの場合、全問題からランダム3問（「済」マーク付き）
```

### R4-3. ポイント体系

| 項目 | ポイント |
|------|---------|
| 1問正答 | 5pt |
| 1トピックの上限 | 問題数 × 5pt（10問なら50pt、20問なら100pt） |
| 全問正解ボーナス | なし |

- ポイントは初回正答時のみ付与（同じ問題の再正答ではポイントなし）
- 既存の `awardPoints` / `award_points_tx` RPC を流用

---

## R5. UI / UX 要件

### R5-1. ナビゲーション配置

- **AppHeader** のナビゲーション項目として独立配置（「Base Nook」ボタン）
- 練習モード（PracticeModeNav）とは別枠
- モバイルハンバーガーメニューにも表示

### R5-2. ページ構成

#### トピック一覧ページ（`/base-nook`）

```
┌─────────────────────────────────┐
│ AppHeader                       │
├─────────────────────────────────┤
│ Base Nook                       │
│ 「基礎がわかると、コードが読める」 │
│                                 │
│ ┌─────────┐ ┌─────────┐        │
│ │ JS      │ │ JSX     │ ...    │
│ │ ●/●● 問 │ │ ○/●● 問 │        │
│ │ 50pt    │ │ --pt    │        │
│ └─────────┘ └─────────┘        │
│                                 │
│ ...（12トピック グリッド表示）    │
└─────────────────────────────────┘
```

- 各トピックカードに進捗表示（正解数 / 総問題数）
- 獲得済みポイント表示
- 全問正解トピックには完了マーク

#### トピック詳細ページ（`/base-nook/:topicId`）

```
┌─────────────────────────────────┐
│ AppHeader                       │
├─────────────────────────────────┤
│ ← Base Nook に戻る              │
│                                 │
│ ┌─ 解説パート ─────────────────┐ │
│ │ # JSXって何？               │ │
│ │                             │ │
│ │ ひとことで言うと...          │ │
│ │ もう少し詳しく...           │ │
│ │ コードで見てみよう...       │ │
│ │ まとめ...                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ クイズパート ───────────────┐ │
│ │ 理解度チェック（3問）        │ │
│ │                             │ │
│ │ Q1. [済] JSXは何の略？      │ │
│ │   ○ A  ○ B  ● C  ○ D     │ │
│ │   → 正解！ [解説...]       │ │
│ │                             │ │
│ │ Q2. コンパイル後は...       │ │
│ │   ○ A  ○ B  ○ C  ○ D     │ │
│ │                             │ │
│ │ Q3. ...                     │ │
│ │                             │ │
│ │ [別の3問に挑戦]             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

- 解説パートは常に表示（スクロールで読む）
- クイズパートは解説の下に配置
- 「別の3問に挑戦」ボタンで再出題（未正解優先）
- 全問正解時は「全問クリア！」表示

### R5-3. レスポンシブ対応

- トピック一覧: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- トピック詳細: 1カラム（解説 → クイズの縦並び）
- 既存の `PracticePageLayout` は使用しない（練習モードではないため）

---

## R6. 技術要件

### R6-1. ファイル構成（予定）

```
apps/web/src/
├── pages/
│   └── BaseNookPage.tsx              # 一覧ページ
│   └── BaseNookTopicPage.tsx         # トピック詳細ページ
├── features/
│   └── base-nook/
│       └── components/
│           ├── TopicCard.tsx          # トピックカード
│           ├── ArticleView.tsx        # 解説表示
│           └── QuizView.tsx           # クイズ表示
├── services/
│   └── baseNookService.ts            # ビジネスロジック
├── content/
│   └── base-nook/
│       ├── types.ts                  # 型定義
│       ├── topics.ts                 # トピックデータ（解説 + クイズ）
│       └── articles/                 # 各トピックの解説 Markdown（必要に応じて）
└── supabase/sql/
    └── 0XX_base_nook.sql             # DB マイグレーション
```

### R6-2. ルーティング

| パス | ページ | 認証 |
|------|--------|------|
| `/base-nook` | トピック一覧 | 必須（ProtectedRoute） |
| `/base-nook/:topicId` | トピック詳細 | 必須（ProtectedRoute） |

### R6-3. ポイント定数

```typescript
POINTS_BASE_NOOK_CORRECT = 5  // 1問正答
```

上限は問題数に依存するため定数化しない（サービス層で計算）。

### R6-4. DB 設計

#### 新規テーブル: `base_nook_progress`

ユーザー × 問題 の正解記録を保持する。1問1レコード。

```sql
CREATE TABLE IF NOT EXISTS public.base_nook_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id    TEXT NOT NULL,        -- 'jsx', 'api', 'fetch' 等
  question_id TEXT NOT NULL,        -- 'jsx-q01', 'jsx-q02' 等
  correct     BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.base_nook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.base_nook_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | UUID | 主キー（自動生成） |
| `user_id` | UUID | ユーザー ID（auth.users FK、CASCADE 削除） |
| `topic_id` | TEXT | トピック ID（集計・フィルタ用） |
| `question_id` | TEXT | 問題 ID（UNIQUE 制約で重複防止） |
| `correct` | BOOLEAN | 正解したか（再回答時は upsert で更新） |
| `answered_at` | TIMESTAMPTZ | 回答日時 |

**設計判断**:
- `UNIQUE(user_id, question_id)` — 同じ問題は1レコード。再回答時は upsert で `correct` を更新
- `topic_id` を持たせることで、トピック単位の進捗集計が `WHERE topic_id = ? AND correct = true` の単純クエリで済む
- ポイント付与は既存の `award_points_tx` RPC を流用（このテーブルにはポイント情報を持たない）

**代替案の検討結果**:

| 案 | 方法 | 不採用理由 |
|----|------|-----------|
| A | 既存テーブル流用 | 粒度が合わない。無関係な機能のテーブル共用は保守性低下 |
| B | 汎用 `quiz_progress` テーブル | Base Nook しか使わないため over-engineering |
| C | トピック単位1行 + 配列カラム | 回答日時が記録できない。配列操作が複雑 |

#### 既存テーブルの流用

| テーブル | 用途 | 変更 |
|---------|------|------|
| `point_history` | ポイント付与記録 | 変更なし（`reason: 'base_nook'` で記録） |
| `learning_stats` | ポイント合計・ストリーク | 変更なし（`award_points_tx` 経由で更新） |

#### 主要クエリパターン

```sql
-- トピックの正解数を取得
SELECT COUNT(*) FROM base_nook_progress
WHERE user_id = $1 AND topic_id = $2 AND correct = true;

-- トピックの正解済み問題IDを取得（出題ロジック用）
SELECT question_id FROM base_nook_progress
WHERE user_id = $1 AND topic_id = $2 AND correct = true;

-- 全トピックの進捗サマリー（一覧ページ用）
SELECT topic_id, COUNT(*) FILTER (WHERE correct = true) AS correct_count
FROM base_nook_progress
WHERE user_id = $1
GROUP BY topic_id;

-- 回答を記録（upsert）
INSERT INTO base_nook_progress (user_id, topic_id, question_id, correct)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, question_id)
DO UPDATE SET correct = EXCLUDED.correct, answered_at = now();
```

---

## R7. コンテンツ制作方針

### R7-1. 解説記事の品質基準

| 基準 | 詳細 |
|------|------|
| 正確性 | 公式ドキュメントの内容と矛盾しないこと |
| 平易さ | プログラミング未経験者でも読めること |
| 具体性 | 抽象論だけでなく、身近な例え・コード例を必ず含む |
| 簡潔さ | 1トピック 800〜1500字。冗長な説明は避ける |
| 独立性 | 他トピックを読んでいなくても理解できること |

### R7-2. クイズの品質基準

| 基準 | 詳細 |
|------|------|
| 理解度確認 | 暗記ではなく概念理解を問う |
| 選択肢 | 紛らわしい誤答を含め、消去法でも学びがある |
| 解説 | なぜその答えが正解かを簡潔に説明 |
| 難易度 | 解説を読めば全問正解できるレベル |

---

## R8. 受け入れ基準

### 機能

- [ ] 12トピックの解説記事が閲覧可能
- [ ] 各トピックで4択クイズが出題・回答可能
- [ ] 未正解問題が優先的に出題される
- [ ] 正解済み問題に「済」マークが表示される
- [ ] 初回正答時にポイントが付与される
- [ ] AppHeader に Base Nook ナビ項目がある
- [ ] トピック一覧で進捗が確認できる

### 品質

- [ ] TypeScript `strict: true` で型エラー0件
- [ ] コンポーネントテスト実装済み
- [ ] RLS でユーザーデータ分離を確認済み
- [ ] モバイル〜デスクトップで表示崩れなし

---

# Part 2: 詳細設計

---

## D1. DB マイグレーション

ファイル: `apps/web/supabase/sql/011_base_nook.sql`

```sql
-- Base Nook: 基礎概念クイズの進捗記録
CREATE TABLE IF NOT EXISTS public.base_nook_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id    TEXT NOT NULL,
  question_id TEXT NOT NULL,
  correct     BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.base_nook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON public.base_nook_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## D2. サービス層設計

`services/baseNookService.ts` の主要関数:

| 関数 | 種別 | 説明 |
|------|------|------|
| `selectQuestions(topicId, solvedIds, pool, count)` | 純粋 | 未正解優先でランダム3問を選択 |
| `getTopicProgress(userId, topicId)` | DB | トピックの正解済み問題ID一覧を取得 |
| `getAllProgress(userId)` | DB | 全トピックの進捗サマリーを取得 |
| `submitAnswer(topicId, questionId, isCorrect)` | DB | 回答を記録（upsert）+ 初回正答時にポイント付与 |

## D3. マイルストーン分割

### 全体像

```
M1: 基盤構築 + サンプル2トピック（End-to-End 動作確認）
 ↓
M2: コンテンツ前半（トピック3〜7）
 ↓
M3: コンテンツ後半（トピック8〜12）+ テスト + 仕上げ
```

---

### M1: 基盤構築 + サンプル2トピック

**目的**: DB からUIまで一気通貫で動く状態を作る。2トピックで End-to-End 動作確認。

| # | タスク | 内容 |
|---|--------|------|
| 1-1 | DB + 型定義 | `011_base_nook.sql` 作成、`database.types.ts` に型追加、`constants.ts` に `POINTS_BASE_NOOK_CORRECT` 追加 |
| 1-2 | コンテンツ型 + サンプルデータ | `content/base-nook/types.ts`、`topics.ts` に2トピック分（JavaScript, JSX）の解説 + クイズ |
| 1-3 | サービス層 | `baseNookService.ts`（selectQuestions / getTopicProgress / getAllProgress / submitAnswer） |
| 1-4 | UI: 一覧ページ | `BaseNookPage.tsx` + `TopicCard.tsx`（グリッド表示、進捗表示） |
| 1-5 | UI: 詳細ページ | `BaseNookTopicPage.tsx` + `ArticleView.tsx` + `QuizView.tsx`（解説 + クイズ） |
| 1-6 | ナビ + ルーティング | AppHeader に Base Nook 追加、`main.tsx` にルート追加（lazy load） |
| 1-7 | テスト | サービス層テスト + コンポーネントテスト |

**完了基準**:
- [x] JavaScript / JSX の2トピックで解説閲覧 → クイズ回答 → ポイント獲得が動作
- [x] 未正解優先出題 + 済マークが機能
- [x] AppHeader から Base Nook にアクセス可能
- [x] CI 全通過（typecheck / lint / test / build）

---

### M2: コンテンツ前半（トピック3〜7）

**目的**: 5トピックを追加し、コンテンツを7/12まで拡充。

| # | タスク | 内容 |
|---|--------|------|
| 2-1 | DOM | 解説記事 + クイズ10〜20問 |
| 2-2 | コンポーネント | 解説記事 + クイズ10〜20問 |
| 2-3 | props vs state | 解説記事 + クイズ10〜20問 |
| 2-4 | JSON | 解説記事 + クイズ10〜20問 |
| 2-5 | API | 解説記事 + クイズ10〜20問 |

**完了基準**:
- [x] 7トピックが閲覧・回答可能
- [x] CI 全通過

---

### M3: コンテンツ後半（トピック8〜12）+ 仕上げ

**目的**: 残り5トピックを追加し、全12トピック完成。最終品質確認。

| # | タスク | 内容 |
|---|--------|------|
| 3-1 | HTTPメソッド | 解説記事 + クイズ10〜20問 |
| 3-2 | fetch | 解説記事 + クイズ10〜20問 |
| 3-3 | 非同期処理 | 解説記事 + クイズ10〜20問 |
| 3-4 | npm / パッケージ管理 | 解説記事 + クイズ10〜20問 |
| 3-5 | TypeScript | 解説記事 + クイズ10〜20問 |
| 3-6 | 最終確認 | レスポンシブ確認、テスト追加、CI 全通過 |

**完了基準**:
- [x] 全12トピックが閲覧・回答可能
- [x] R8 受け入れ基準を全て満たす
- [x] CI 全通過
- [x] PR → dev マージ

---

### ブランチ戦略

```
main
 └── dev
      └── feat/v2.1-base-nook        （マイルストーンブランチ）
           ├── feat/v2.1-base-nook_1-1-db
           ├── feat/v2.1-base-nook_1-2-content-sample
           ├── ...
           ├── feat/v2.1-base-nook_2-1-dom
           └── feat/v2.1-base-nook_3-6-final
```

v2 と同じ4層構造。task ブランチはローカルで milestone にマージし、milestone 単位で dev へ PR。

---

*このドキュメントは Base Nook の要件と設計を定義する。変更時はバージョン履歴を更新すること。*

# v2roadmap03: コードレビュー指摘対応

**作成日**: 2026-04-02
**参照元**: `docs/memo/review-issues/`（先輩エンジニアによるフロントエンドコードレビュー）
**目的**: 先輩エンジニアのコードレビューで指摘された問題を分類・整理し、計画的に対応する。

---

## 1. 背景

先輩エンジニアによるフロントエンドコードレビューにて、30件の指摘事項が報告された。指摘は CRITICAL / HIGH / MEDIUM / LOW の4段階で分類されている。おそらく v1 時点のコードに対するレビューがベースとなっている（v2 の内容が含まれている可能性もある）。

### 元レビュー報告書

`docs/memo/review-issues/README.md` に全体の一覧と推奨対応順序が記載されている。

---

## 2. 指摘事項一覧

### Phase A: CRITICAL — 即座に対応が必要

#### 2-1. Supabase クライアントに `Database` 型が渡されていない `[Sonnet]`

- **重要度**: CRITICAL
- **対象ファイル**: `apps/web/src/lib/supabaseClient.ts`
- **影響範囲**: 全サービスファイル
- **カテゴリ**: TypeScript ジェネリクス, 型安全性

**問題**: `createClient` に `Database` 型パラメータが渡されていないため、全クエリ結果が `any` 型になる。テーブル名・カラム名のタイポが検出できず、RPC も完全に untyped。サービスファイルでは `as StepProgressRow[]` のような unsafe な型キャストが必要になっている。

**修正方針**:
1. `createClient<Database>(url, key)` に型パラメータを追加（1行の変更）
2. 各サービスの unsafe cast（`as` キャスト）を削除
3. 自動補完・コンパイル時エラー検出が全サービスで有効になる

---

#### 2-2. `award_points_tx` RPC の権限昇格脆弱性 `[Opus]`

- **重要度**: CRITICAL
- **対象ファイル**: `supabase/sql/004_award_points_rpc.sql`, `apps/web/src/services/pointService.ts`
- **カテゴリ**: セキュリティ

**問題**: `award_points_tx` RPC が `SECURITY DEFINER`（管理者権限）で実行されるにもかかわらず、`p_user_id` をクライアントから受け取っている。ブラウザの開発者ツールから他人の UUID を指定してポイントを操作できる。また `p_amount` に負の値を送ってポイントを減算することも可能。

**修正方針**:
1. SQL 側: `p_user_id` パラメータを削除し、`auth.uid()` でログインユーザーを特定
2. SQL 側: `p_amount > 0` チェックを追加して負の値を拒否
3. SQL 側: `set search_path = public` を追加して検索パス攻撃を防止
4. TypeScript 側: `awardPoints` から `userId` 引数を削除
5. 呼び出し元（`useLearningStep.ts` の `handleModeComplete` 等）を修正

---

#### 2-3. RPC が生成型に含まれていない `[Sonnet]`

- **重要度**: CRITICAL
- **対象ファイル**: `apps/web/src/shared/types/database.types.ts`
- **カテゴリ**: 型安全性

**問題**: `database.types.ts` の `Functions` セクションが `[_ in never]: never`（関数ゼロ）のまま。実際には `award_points_tx` RPC が存在するが、型生成コマンド実行後に再生成されていない。RPC 呼び出しの引数名・型・存在チェックがすべて無効。

**修正方針**:
1. `npx supabase gen types typescript --local > apps/web/src/shared/types/database.types.ts` で型を再生成
2. 生成後の `Functions` セクションに `award_points_tx` が含まれていることを確認
3. 今後はスキーマ変更のたびに型再生成を行う運用を徹底

---

#### 2-4. Error Boundary の欠如 `[Opus]`

- **重要度**: CRITICAL
- **対象ファイル**: プロジェクト全体
- **カテゴリ**: エラーハンドリング・安定性

**問題**: プロジェクトに `ErrorBoundary` コンポーネントが一切存在しない。Monaco Editor のロード失敗、プレビューコンポーネントのランタイムエラー、Context Provider 内のエラーなどが発生するとアプリ全体が白画面になる。

**修正方針**:
1. `ErrorBoundary` クラスコンポーネントを `apps/web/src/components/ErrorBoundary.tsx` に作成（`getDerivedStateFromError` + `componentDidCatch`）
2. 配置箇所:
   - `main.tsx` のルート（アプリ全体のフォールバック）
   - `StepPage` のメインコンテンツ（学習モード全体を隔離）
   - `ChallengeMode` の Monaco Editor（外部ライブラリを隔離）
   - `TestMode` のプレビュー（動的コンポーネントを隔離）
3. フォールバック UI にリトライボタンを含める

---

### Phase B: HIGH — 早期に対応すべき

#### 3-1. `useLearningStep` の Stale Closure 問題 `[Opus]`

- **重要度**: HIGH
- **対象ファイル**: `apps/web/src/features/learning/hooks/useLearningStep.ts`（行 151-155）
- **カテゴリ**: 状態管理・バグ

**問題**: `handleModeComplete` 内で `modeStatus` をクロージャ経由で参照している。ユーザーが素早く2つのモードを連続完了した場合、`setModeStatus` が非同期であるため2回目の呼び出しが古い `modeStatus` を参照する。`modeStatus[mode]` ガードが正しく機能せず、同じモードの完了処理が重複実行される可能性がある。

**修正方針**:
- 方法 1: `useRef` で `modeStatus` の最新値を保持し、`modeStatusRef.current` を参照
- 方法 2: `setModeStatus((prev) => ...)` の関数型アップデータで最新 state を取得

---

#### 3-2. `AchievementContext` に `isMounted` ガードがない `[Sonnet]`

- **重要度**: HIGH
- **対象ファイル**: `apps/web/src/contexts/AchievementContext.tsx`（行 31-52）
- **同様の問題**: `apps/web/src/contexts/LearningContext.tsx`
- **カテゴリ**: メモリリーク・安定性

**問題**: `refreshAchievements` は `useCallback` で定義され、外部から呼ばれる（`useLearningStep` の `handleModeComplete` 等）。Provider がアンマウントされた後でも非同期処理が完了して `setUnlockedBadgeIds` 等が呼ばれる。`LearningContext` の `refreshStats` も同様。

**修正方針**:
- 方法 1: `isMountedRef = useRef(true)` パターンで、アンマウント後の setState をスキップ
- 方法 2: `AbortController` でアンマウント時にリクエスト自体をキャンセル（推奨）

---

#### 3-3. `onAuthStateChange` と `getSession` の実行順序 `[Opus]`

- **重要度**: HIGH
- **対象ファイル**: `apps/web/src/contexts/AuthContext.tsx`（行 30-81）
- **カテゴリ**: 認証・レースコンディション

**問題**: `useEffect` 内で `onAuthStateChange` の登録と `getSession()` の呼び出しが並行実行されている。Supabase 内部でトークンリフレッシュが発生した場合、リスナーが先に最新セッションをセットした後に `getSession()` のレスポンスが古い情報で上書きする可能性がある。

**修正方針**:
- `getSession()` を `await` で完了させてから `onAuthStateChange` を登録（逐次実行に変更）
- `isMounted` ガードも適用

---

#### 3-4. サインアップフローのメール検証問題 `[Opus]`

- **重要度**: HIGH
- **対象ファイル**: `apps/web/src/contexts/AuthContext.tsx`（行 102-126）
- **カテゴリ**: 認証・UX

**問題**: メール確認が有効な Supabase プロジェクトで `signUp` 後に `session` が `null` の場合、即座に `signInWithPassword` を試行して失敗し、ユーザーにエラーメッセージが表示される。また、既に登録済みメールアドレスの場合の `data.user?.identities?.length === 0` チェックがない。

**修正方針**:
1. メール確認待ちの場合: `signIn` を試行せず、`'CONFIRM_EMAIL'` を返してメール確認を促す UI を表示
2. 重複メールアドレス: `identities?.length === 0` チェックを追加し、「このメールアドレスは既に登録されています」と表示
3. 呼び出し元（LoginPage）で `'CONFIRM_EMAIL'` を判定して案内を表示

---

#### 3-5. 不正な HTML 構造: `<a>` が `<li>` をラップ `[Sonnet]`

- **重要度**: HIGH
- **対象ファイル**: `apps/web/src/features/dashboard/components/LearningOverviewCard.tsx`（行 67-68）
- **カテゴリ**: アクセシビリティ・HTML 仕様

**問題**: `StepRow` コンポーネントで `<Link>` が `<li>` をラップしている（`<a><li>...</li></a>`）。HTML 仕様では `<ul>` の直接の子は `<li>` でなければならない。スクリーンリーダーがリストを正しく読み上げられない。

**修正方針**:
- `<li>` を常に `<ul>` の直接の子にし、`<Link>` を `<li>` の内側に配置
- `<Link>` に `className="block p-4"` を付けてクリック可能エリアを維持

---

### Phase C: MEDIUM — 計画的に対応

#### 4-1. `useLearningStep` が巨大すぎる（God Hook） `[Opus]`

- **重要度**: MEDIUM
- **対象ファイル**: `apps/web/src/features/learning/hooks/useLearningStep.ts`（208行, 戻り値10個）
- **カテゴリ**: 設計・保守性

**問題**: 1つのフックに4つの責任（ステップ検索・ナビゲーション / モード進捗管理 / エラーメッセージ管理 / トースト通知）が詰め込まれている。戻り値10個、`useCallback` の依存配列が大きく、テストも書きにくい。

**修正方針**:
- 3つのフックに分割: `useStepNavigation` / `useStepProgress` / `useStepNotification`
- `useLearningStep` はこれら3つを組み合わせるファサードとして残す

---

#### 4-2. AchievementContext 内にトースト UI が埋め込まれている `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `apps/web/src/contexts/AchievementContext.tsx`（行 84-103）
- **カテゴリ**: 設計・関心の分離

**問題**: `AchievementProvider` が状態管理と UI 表示（トーストの JSX + CSS）の2つの責任を持っている。テストの困難さ、カスタマイズ性の低さ、トーストのアクセシビリティ属性（`role="alert"`, `aria-live`）の欠如につながっている。

**修正方針**:
1. Context から UI を分離: `AchievementProvider` は状態管理のみ。`newlyUnlockedBadge` と `dismissBadgeToast` を公開
2. `AchievementToast` コンポーネントを `components/` に作成（`role="alert"`, `aria-live="assertive"` 付き）
3. アプリのルートに `<AchievementToast />` を配置

---

#### 4-3. 学習モード間のコード重複 `[Opus]`

- **重要度**: MEDIUM
- **対象ファイル**: `ChallengeMode.tsx`, `PracticeMode.tsx`, `TestMode.tsx`, `AppHeader.tsx`
- **カテゴリ**: コード品質・保守性

**問題**: 4つの重複パターンが存在する。
- パターン A: 判定結果 UI（PracticeMode / TestMode / ChallengeMode でほぼ同一の JSX）
- パターン B: stepId 変更時の状態リセット（`useEffect` で `setIsJudged(false)` 等）
- パターン C: レビューリスト判定（正解時 `removeFromReviewList` / 不正解時 `addToReviewList`）
- パターン D: AppHeader のナビゲーションリンク（デスクトップ用・モバイル用で2回繰り返し）

**修正方針**:
- パターン A: `JudgmentResult` 共通コンポーネントに抽出
- パターン B: `useStepReset` フックに抽出
- パターン C: `useJudgmentAction` フックに抽出
- パターン D: `NAV_LINKS` 定数を定義し、`map` で描画

---

#### 4-4. `isStepCompleted` 関数の重複 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `progressService.ts`（行 83-90）, `achievementService.ts`（行 51-58）
- **カテゴリ**: コード品質・保守性

**問題**: 完全に同一のロジック（`read_done && practice_done && test_done && challenge_done`）が2つのサービスファイルに存在。新モード追加時に片方だけ更新を忘れるリスクがある。

**修正方針**:
- `progressService.ts` の `isStepCompleted` に統一し、`achievementService.ts` から `import` する
- 循環参照がないことを確認

---

#### 4-5. クライアントサイドタイムスタンプの使用 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `progressService.ts`（行 49）, `statsService.ts`（行 108）
- **カテゴリ**: データ整合性

**問題**: `updated_at: new Date().toISOString()` でクライアントの時計を使用している。PC の時計のずれや意図的な改ざんにより、DB のタイムスタンプと不整合が生じる。ストリーク維持の不正も可能。

**修正方針**:
- 方法 1: ペイロードから `updated_at` を削除し、DB の `DEFAULT now()` に任せる
- 方法 2: DB トリガー `update_updated_at()` で自動更新

---

#### 4-6. `statsService.recordStudyActivity` のレースコンディション `[Opus]`

- **重要度**: MEDIUM
- **対象ファイル**: `apps/web/src/services/statsService.ts`（行 97-118）
- **カテゴリ**: データ整合性・並行処理

**問題**: Read-Modify-Write パターンでストリークを更新している。2つのタブで同時に学習完了すると、同じ値を読んで同じ計算結果を書き込み、ストリークが1回分失われる。

**修正方針**:
- `record_study_activity` RPC を作成し、SQL 側で `FOR UPDATE` 行ロック付きのアトミック操作として実行
- TypeScript 側は `supabase.rpc('record_study_activity')` を呼ぶだけに簡素化

---

#### 4-7. `achievementService` のバッジ解除が逐次実行 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `apps/web/src/services/achievementService.ts`（行 108-145）
- **カテゴリ**: パフォーマンス

**問題**: 最大12個のバッジ判定がそれぞれ独立した `await tryUnlock(...)` で逐次実行されている。各クエリは独立しているため並列実行可能。1クエリ50ms の場合、逐次: 600ms → 並列: 50ms。

**修正方針**:
1. 解禁対象のバッジを先に判定（同期処理で `badgesToUnlock` 配列を構築）
2. `Promise.all(badgesToUnlock.map(...))` で並列 INSERT
3. 一部失敗しても他を解禁したい場合は `Promise.allSettled` を使用

---

#### 4-8. 入力バリデーション不足 `[Opus]`

- **重要度**: MEDIUM
- **対象ファイル**: 複数のサービスファイル
- **カテゴリ**: セキュリティ・データ整合性

**問題**: 以下のバリデーションが欠如している。
1. `pointService.ts`: `amount` の検証なし（0, 負数, NaN, Infinity が通る）
2. `profileService.ts`: `displayName` の文字数制限なし
3. `challengeSubmissionService.ts`: `code` のサイズ制限なし
4. `challengeSubmissionService.ts`: `limit` の上限チェックなし
5. 全サービス: `userId` の UUID フォーマット検証なし

**修正方針**:
1. `shared/validation.ts` に共通バリデーション関数を作成（`assertPositiveInteger`, `assertUuid`, `assertMaxLength`, `assertMaxSize`）
2. 各サービスの入口でバリデーション呼び出しを追加

---

#### 4-9. `progressService.updateModeCompletion` の非網羅的分岐 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `apps/web/src/services/progressService.ts`（行 63-80）
- **カテゴリ**: 型安全性・保守性

**問題**: 独立した `if` 文が4つ並んでおり、新しいモードが追加されてもコンパイルエラーにならない。`patch` が空のまま `upsertProgress` が呼ばれ、`updated_at` だけが無駄に更新される。

**修正方針**:
- `switch` 文 + `default` での `never` 型 exhaustive check に変更
- 未対応モードが追加された場合にコンパイルエラーを発生させる

---

#### 4-10. テストカバレッジの主要ギャップ `[Opus]`

- **重要度**: MEDIUM
- **対象ファイル**: プロジェクト全体
- **カテゴリ**: テスト・品質保証

**問題**: 以下のカテゴリでテストが存在しない。
- **Context (0/3)**: `AuthContext`, `LearningContext`, `AchievementContext`（認証・状態管理の中核）
- **Pages (2/6)**: `LoginPage`, `ProfilePage`（ユーザーの入口）
- **Services (2/7)**: `profileService`, `pointService`（DB 操作）
- **Hooks (4/5)**: `useDocumentTitle`, `useChallengeSubmission`, `useRecentChallengeSubmissions`, `useReviewList`
- **Utilities (1/2)**: `dateTime`（日付計算）

**修正方針**:
- 優先度 1: Context のテスト（影響範囲が最も大きい）
- 優先度 2: pointService, profileService のテスト（DB 操作の整合性）
- 優先度 3: Hooks のテスト（UI ロジック）

---

#### 4-11. アクセシビリティの不備 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `PracticeMode.tsx`, `AchievementContext.tsx`, `DashboardSidebar.tsx`
- **カテゴリ**: アクセシビリティ（a11y）

**問題**: 4つの不備が存在する。
1. `PracticeMode.tsx`: `role="radiogroup"` 内のボタンに `aria-pressed` を使用（正しくは `role="radio"` + `aria-checked`）
2. `AchievementContext.tsx`: トーストに `role="alert"` / `aria-live` がない
3. `DashboardSidebar.tsx`: ヒートマップのセルに `aria-label` がない（色だけで情報伝達）
4. `DashboardSidebar.tsx`: バッジアイコンがハードコードで実際の解除状態を反映していない

**修正方針**:
1. `role="radio"` + `aria-checked` に修正
2. トーストに `role="alert"` + `aria-live="assertive"` を追加
3. ヒートマップセルに `aria-label="{日付}: {回数}回学習"` + `title` + `role="img"` を追加
4. `useAchievementContext` から実際の解除状態を読み取り動的表示

---

#### 4-12. Node.js バージョンの不一致 `[Sonnet]`

- **重要度**: MEDIUM
- **対象ファイル**: `README.md`, `.github/workflows/ci.yml`
- **カテゴリ**: 開発環境・CI/CD

**問題**: README は Node.js 22 系を指定しているが、CI は `node-version: '20'` を指定。`.nvmrc` / `.node-version` ファイルが存在せず、`package.json` の `engines` フィールドも未設定。

**修正方針**:
1. Node.js 22 に統一
2. `.nvmrc` ファイルを作成（`22`）
3. `package.json` に `"engines": { "node": ">=22.0.0" }` を追加
4. CI の `node-version` を `'22'` に変更
5. README の記載と一致を確認

---

### Phase D: LOW — 余裕がある時に対応

#### 5-1. `reviewListService` の `JSON.parse` にランタイム検証がない `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/src/services/reviewListService.ts`（行 23）
- **カテゴリ**: 堅牢性

**問題**: `JSON.parse(json) as string[]` で localStorage の値を string[] と信じている。DevTools からの直接編集やブラウザ拡張機能による改ざんで、型と実際の値が不一致になる可能性がある。

**修正方針**:
- `JSON.parse` の結果を `unknown` 型で受け取り、`Array.isArray()` + `.every(item => typeof item === 'string')` で検証
- 検証失敗時はデフォルト値 `[]` を返す

---

#### 5-2. `isLoading` 状態の命名不統一 `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: 各 Context ファイル, Hooks
- **カテゴリ**: コード品質・命名規則

**問題**: `isLoading`（AuthContext）/ `isLoadingStats`（LearningContext）/ `isChecking`（AchievementContext）と3つの異なる命名パターンが使われている。`isChecking` は初期値が `false` で「未取得」と「取得完了」の区別がつかず、フラッシュが発生する。

**修正方針**:
- `isLoading + 対象名` パターンに統一（`isLoadingAuth`, `isLoadingStats`, `isLoadingAchievements`）
- 初期値を `true` に変更

---

#### 5-3. `AuthContext` の `user` 状態の冗長性 `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/src/contexts/AuthContext.tsx`
- **カテゴリ**: 設計・状態管理

**問題**: `user` と `session` の両方を `useState` で管理しているが、`user` は `session?.user` から導出可能。`setSession` と `setUser` を常にペアで呼ぶ必要があり、同期漏れのリスクがある。

**修正方針**:
- `user` の `useState` を削除し、`const user = session?.user ?? null` で派生値として計算
- `setSession` だけで `user` も自動的に最新になる

---

#### 5-4. `ReadMode` の `CopyButton` に `setTimeout` クリーンアップがない `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/src/features/learning/ReadMode.tsx`（行 27）
- **カテゴリ**: メモリリーク・安定性

**問題**: コピー完了後の `setTimeout(() => setCopied(false), 2000)` のタイマー ID を保持しておらず、コンポーネントのアンマウント時にクリーンアップできない。

**修正方針**:
- `useEffect` + クリーンアップ: `copied` が `true` になったときにタイマーを設定し、`return () => clearTimeout(timerId)` でクリーンアップ
- または `useRef` でタイマー ID を保持しアンマウント時にクリア

---

#### 5-5. ハードコードされたマジックナンバー `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: 複数のファイル
- **カテゴリ**: コード品質・保守性

**問題**: 以下のマジックナンバーが定数化されていない。
- `AchievementContext.tsx`: `4000` ms（バッジトースト表示時間）
- `useLearningStep.ts`: `3500` ms（ステップ完了トースト表示時間）
- `ReadMode.tsx`: `2000` ms（コピー完了フィードバック表示時間）
- `ChallengeMode.tsx`: `320px`（Monaco Editor の高さ）
- `statsService.ts`: `[500, 1000, 1500, 2000]`（ポイントマイルストーン）

**修正方針**:
- `shared/constants.ts` にトースト表示時間・エディタ設定・ポイントマイルストーン等の定数を追加
- 各ファイルで `import` して使用

---

#### 5-6. ESLint ルールの強化余地 `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/eslint.config.js`
- **カテゴリ**: 開発ツール・コード品質

**問題**: 現在 `tseslint.configs.recommended` のみで、追加の厳密ルールが設定されていない。

**修正方針**:
1. `@typescript-eslint/no-explicit-any: 'error'` — `any` 型の使用を禁止
2. `@typescript-eslint/consistent-type-imports: 'error'` — `import type` を強制
3. `eslint-plugin-jsx-a11y` — アクセシビリティ問題を Lint で検出
4. `tseslint.configs.strict` への変更を検討

---

#### 5-7. `tsconfig.json` の追加 strict オプション `[Opus]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/tsconfig.json`
- **カテゴリ**: 型安全性

**問題**: `strict: true` は設定済みだが、`strict` に含まれない追加オプションが未設定。

**修正方針**（段階的導入）:
1. Phase 1: `forceConsistentCasingInFileNames: true`（影響小）
2. Phase 2: `exactOptionalPropertyTypes: true`（影響中）
3. Phase 3: `noUncheckedIndexedAccess: true`（影響大: 配列アクセスの全箇所で `undefined` チェックが必要）

---

#### 5-8. CI パイプラインの改善余地 `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `.github/workflows/ci.yml`
- **カテゴリ**: CI/CD・開発プロセス

**問題**: テストカバレッジの計測なし、`npm audit` なし、ジョブが逐次実行、Node.js バージョンが不一致。

**修正方針**:
1. テストカバレッジ計測: `vitest run --coverage` + `upload-artifact` + `thresholds` 設定
2. セキュリティ監査: `npm audit --audit-level=high` をステップに追加
3. ジョブ並列化: typecheck / lint / test を並列実行し、build は `needs:` で後続に
4. Node.js バージョンを `'22'` に統一

---

#### 5-9. Vite ビルドの最適化余地 `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/vite.config.ts`
- **カテゴリ**: ビルド最適化・パフォーマンス

**問題**: `manualChunks` に `lucide-react` が含まれていない。`build.target` が明示設定されていない（`tsconfig.json` の `target: "ES2020"` と不一致の可能性）。

**修正方針**:
1. `manualChunks` に `'vendor-icons': ['lucide-react']` を追加
2. `build.target: 'ES2020'` を明示設定

---

#### 5-10. `useDocumentTitle` にアンマウント時のリストアがない `[Sonnet]`

- **重要度**: LOW
- **対象ファイル**: `apps/web/src/hooks/useDocumentTitle.ts`
- **カテゴリ**: UX・SPA ナビゲーション

**問題**: `useDocumentTitle` がアンマウント時に前のタイトルを復元しない。通常は新しいページの `useDocumentTitle` が実行されるため軽微だが、同じコンポーネントが再利用される場合やネストルーティングで親が残る場合に問題になる可能性がある。

**修正方針**:
- `useRef` で `previousTitle` を保持し、`useEffect` のクリーンアップで `document.title = previousTitle` を実行

---

## 3. 推奨対応順序

レビュー元の推奨に従い、以下の順序で対応する。

1. **Phase A** (即座): 2-1 → 2-2 → 2-3 → 2-4（セキュリティ・型安全性・安定性）
2. **Phase B** (早期): 3-1 → 3-2 → 3-3 → 3-4 → 3-5（バグ・安定性向上）
3. **Phase C** (計画的): 4-1 〜 4-12（設計改善・品質向上）
4. **Phase D** (継続的): 5-1 〜 5-10（品質基盤強化）

---

## 4. 実行方針

- **ブランチ**: Phase ごとにブランチを作成（例: `fix/review-phase-a`）
- **PR**: Phase 単位で PR → `dev` にマージ
- **完了定義**: `typecheck` / `lint` / `test` / `build` 通過
- **v1/v2 判断**: レビュー内容は v1 ベースの可能性が高いため、v2 で既に対応済みの項目がないか確認してから着手する

---

## 5. 完了条件

### Phase A

- [x] Supabase クライアントに `Database` 型が渡されている
- [x] `award_points_tx` RPC が `auth.uid()` を使用し、金額検証がある
- [x] `database.types.ts` の `Functions` セクションに RPC が含まれている
- [x] `ErrorBoundary` がルート・StepPage・ChallengeMode・TestMode に配置されている

### Phase B

- [x] `useLearningStep` の Stale Closure 問題が解消されている
- [x] `AchievementContext` / `LearningContext` に isMounted ガードがある
- [x] `AuthContext` の `getSession` → `onAuthStateChange` の順序が逐次実行になっている
- [x] サインアップフローでメール確認待ちの案内が表示される
- [x] `<li>` が `<ul>` の直接の子になっている（v2 で対象コンポーネント削除済み）

### Phase C

- [x] `useLearningStep` が3つのフックに分割されている
- [x] `AchievementContext` から UI が分離されている
- [x] 重複コードが共通コンポーネント・フックに抽出されている
- [x] `isStepCompleted` が `progressService.ts` に統一されている
- [x] タイムスタンプが DB の `now()` を使用している
- [x] `recordStudyActivity` が RPC でアトミック実行されている
- [x] バッジ解除が `Promise.all` で並列実行されている
- [x] 入力バリデーションが各サービスに追加されている
- [x] `updateModeCompletion` が exhaustive switch になっている
- [x] Context / Service / Hooks のテストが追加されている
- [x] アクセシビリティの不備が修正されている
- [x] Node.js バージョンが統一されている

### Phase D

- [ ] `JSON.parse` にランタイム検証がある
- [ ] `isLoading` 命名が統一されている
- [ ] `user` 状態が `session` からの派生値になっている
- [ ] `setTimeout` のクリーンアップが適切
- [ ] マジックナンバーが定数化されている
- [ ] ESLint ルールが強化されている
- [ ] `tsconfig.json` に追加 strict オプションがある
- [ ] CI パイプラインが改善されている
- [ ] Vite ビルドが最適化されている
- [ ] `useDocumentTitle` にリストアがある

### 品質ゲート

- [ ] `typecheck` / `lint` / `test` / `build` 全通過
- [ ] 既存テスト全 PASS

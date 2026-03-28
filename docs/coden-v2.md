# Coden v2 要件定義・詳細設計書

> **バージョン**: v2.0（ドラフト）
> **作成日**: 2026-03-25
> **更新日**: 2026-03-27
> **参照元**: `docs/coden-v1.md` / `docs/Specification.md` v2.0
> **ステータス**: 詳細設計フェーズ
> **決定記録**: `docs/memo/v2-ux-decisions.md`, `v2-content-decisions.md`, `v2-tech-decisions.md`

---

# Part 1: 要件定義

---

## R1. v2 の目的

### R1-1. 解決する課題

**「20ステップ完了後にやることがなくなる」**

v1 は React 基礎〜API連携の 20 ステップで完結しており、全ステップ完了後の学習継続導線がない。v2 ではコンテンツの拡張と繰り返し学習の仕組みにより、**完了後も使い続けられるプラットフォーム**へ進化させる。

### R1-2. v2 の 3 本柱

| 柱 | 概要 |
|----|------|
| **コース拡張** | 横展開（TypeScript 2コース）+ 縦展開（Reactモダン + 実務パターン）で学習範囲を広げる |
| **繰り返し学習** | デイリーチャレンジ・コードドクター・ミニプロジェクト・コードリーディングで完了後も継続的に力がつく仕組み |
| **認証改善** | Google ソーシャルログイン対応 |

### R1-3. v2 スコープ外

| 項目 | 理由 |
|------|------|
| AIコードレビュー | v2.1 以降で検討。v2 はコンテンツ充実に集中 |
| ソーシャル機能 | 将来ビジョン（`docs/coden-memo.md` 参照） |
| レイドバトル/ハッカソン | 同上 |
| オフライン対応 | 同上 |

---

## R2. コース要件

### R2-1. v2 新規コース一覧

| # | コース名 | カテゴリ | ステップ数 | 種別 |
|---|---------|----------|----------|------|
| 1 | TypeScript基礎 | TypeScript | 6 | 横展開 |
| 2 | TypeScript × React | TypeScript | 4 | 横展開 |
| 3 | Reactモダン | React | 6 | 縦展開 |
| 4 | 実務パターン | React | 4 | 縦展開 |

**v2 新規合計**: 4コース / 20ステップ

### R2-2. コース構成（v2 時点の全体像）

```
React（カテゴリ）
 ├── React基礎           … 4ステップ（v1既存）
 ├── React応用           … 4ステップ（v1既存）
 ├── React実践           … 4ステップ（v1既存）
 ├── API連携実践         … 8ステップ（v1既存）
 ├── Reactモダン         … 6ステップ（v2 NEW）
 └── 実務パターン         … 4ステップ（v2 NEW）

TypeScript（カテゴリ）
 ├── TypeScript基礎      … 6ステップ（v2 NEW）
 └── TypeScript × React  … 4ステップ（v2 NEW）
```

---

## R3. 繰り返し学習機能要件

| 機能 | 概要 | 問題形式 | コンテンツ方式 |
|------|------|---------|--------------|
| **デイリーチャレンジ** | 日替わり1問。完了済みステップから出題 | 穴埋め / コード修正 / 短い実装 | 静的（最小構成約96問） |
| **コードドクター** | バグ入りコードを修正。3難易度 | バグ修正（Monaco Editor） | 静的（各難易度10-15問、v2はReactのみ） |
| **ミニプロジェクト** | 仕様からゼロ実装。段階的セット | 自由実装（Monaco Editor） | 静的（基礎3+応用3+実践2 = 8本） |
| **コードリーディング** | コードを読んで設問に回答 | 段階的設問（1スニペット複数問） | 静的（5問、設問数を絞って開始） |

---

## R4. 認証要件

| 項目 | 仕様 |
|------|------|
| 追加プロバイダー | Google OAuth 2.0（Supabase Auth 経由） |
| 実装方式 | Supabase デフォルト（リダイレクト方式） |
| アカウント連携 | 同一メール既存アカウントは自動リンク |
| 既存認証 | メール/パスワードはそのまま維持 |

---

## R5. ブランチ戦略

### 4 層構造

```
main（デプロイ = 本番）
 └── dev（v2 完成状態 = ローカル最新）
      └── feat/<milestone>（マイルストーン単位）
           └── feat/<milestone>_<task>（タスク単位）
```

| ブランチ | 役割 | マージ先 |
|---------|------|---------|
| `main` | 本番デプロイ。安定版のみ | — |
| `dev` | v2 開発統合ブランチ。ローカル確認可能な最新状態 | → `main`（v2 リリース時） |
| `feat/<milestone>` | マイルストーン単位 | → `dev` |
| `feat/<milestone>_<task>` | タスク単位 | → `feat/<milestone>`（PR） |

---

## R6. v2 リリース受け入れ基準

### 機能完成

- [ ] カテゴリ→コース→ステップの3層構造が動作
- [ ] カリキュラムページで全コース・練習モードを一覧できる
- [ ] ダッシュボードがサマリーハブとして機能
- [ ] TypeScript基礎（6ステップ）が4段階フローで学習可能
- [ ] TypeScript × React（4ステップ）が4段階フローで学習可能
- [ ] Reactモダン（6ステップ）が4段階フローで学習可能
- [ ] 実務パターン（4ステップ）が4段階フローで学習可能
- [ ] デイリーチャレンジが日替わりで出題・回答・Pt獲得可能
- [ ] コードドクターが3難易度で出題・回答可能
- [ ] ミニプロジェクトが仕様提示→実装→判定で完了可能
- [ ] コードリーディングが段階的設問で回答可能
- [ ] Googleソーシャルログインが動作
- [ ] 新規バッジ・Ptルールが全て動作

### 品質

- [ ] TypeScript `strict: true` で型エラー0件
- [ ] 新機能のコンポーネントテスト実装済み
- [ ] RLSでユーザーデータ分離を確認済み

### UX・運用

- [ ] 新規ページがモバイル〜デスクトップで表示崩れなし
- [ ] `dev` ブランチで全機能の統合動作確認完了
- [ ] `main` へのマージ・本番デプロイ完了

---

# Part 2: 詳細設計

---

## D0. ネーミング一覧（確定）

### D0-1. カテゴリ

| カテゴリID | 表示名 |
|-----------|--------|
| `react` | React |
| `typescript` | TypeScript |

### D0-2. コース

| コースID | 表示名 | カテゴリ | v1からの変更 |
|---------|--------|---------|-------------|
| `react-fundamentals` | React基礎 | react | course-1 → リネーム |
| `react-hooks` | React応用 | react | course-2 → リネーム |
| `react-advanced` | React実践 | react | course-3 → リネーム |
| `react-api` | API連携実践 | react | course-4 → リネーム |
| `react-modern` | Reactモダン | react | v2 新規 |
| `react-patterns` | 実務パターン | react | v2 新規 |
| `ts-basics` | TypeScript基礎 | typescript | v2 新規 |
| `ts-react` | TypeScript × React | typescript | v2 新規 |

### D0-3. ステップID（v2 新規のみ。v1 既存ステップは変更なし）

| コース | ステップID | 表示名 |
|--------|-----------|--------|
| ts-basics | `ts-types` | 型の基礎 |
| ts-basics | `ts-functions` | 関数の型 |
| ts-basics | `ts-objects` | オブジェクト型 |
| ts-basics | `ts-union-narrowing` | ユニオン型と型ガード |
| ts-basics | `ts-generics` | ジェネリクス |
| ts-basics | `ts-utility-types` | ユーティリティ型 |
| ts-react | `ts-react-props` | コンポーネントとProps型 |
| ts-react | `ts-react-state` | 状態管理Hooksの型 |
| ts-react | `ts-react-hooks` | コンテキスト・RefのHooks型 |
| ts-react | `ts-react-events` | イベント型とDOM型 |
| react-modern | `error-boundary` | エラーハンドリング設計 |
| react-modern | `suspense-lazy` | Suspenseとコード分割 |
| react-modern | `concurrent-features` | Concurrent機能 |
| react-modern | `use-optimistic` | 楽観的更新 |
| react-modern | `portals` | Portals |
| react-modern | `forward-ref` | Ref転送と命令的API |
| react-patterns | `rhf-zod` | フォームバリデーション |
| react-patterns | `pagination` | ページネーション |
| react-patterns | `infinite-scroll` | 無限スクロール |
| react-patterns | `auth-flow` | 認証フロー実装 |

### D0-4. 練習モード

| 種別 | 表示名 | ルートパス |
|------|--------|----------|
| デイリー | デイリーチャレンジ | `/daily` |
| ドクター | コードドクター | `/practice/code-doctor` |
| ミニプロ | ミニプロジェクト | `/practice/mini-projects` |
| リーディング | コードリーディング | `/practice/code-reading` |

---

## D1. 情報アーキテクチャ

### D1-1. コンテンツ階層（3層構造）

v1 の「コース → ステップ」2層を、**カテゴリ → コース → ステップ**の3層に拡張。

```typescript
// v2: カテゴリの追加
export interface CategoryMeta {
  id: string              // 'react', 'typescript'
  title: string           // 'React', 'TypeScript'
  description: string
  icon: string            // lucide-react アイコン名
  courses: CourseMeta[]
}

// v1 既存（変更なし）
export interface CourseMeta {
  id: string
  title: string
  level: 'beginner' | 'intermediate' | 'advanced'
  steps: StepMeta[]
}

// v1 既存（変更なし）
export interface StepMeta {
  id: string
  order: number
  title: string
  description: string
  isImplemented: boolean
}
```

### D1-2. courseData.ts 移行方式

**決定**: 一括移行 + ヘルパー関数（`COURSES` → `CATEGORIES`）

- `CATEGORIES: CategoryMeta[]` に一括移行
- `getAllCourses()` / `getAllSteps()` / `findStepById()` 等のヘルパー関数で既存コードの呼び出しを吸収
- 既存の `COURSES` は削除
- **注意**: データ破損防止のため、移行時にユニットテストで全ステップIDの一致を検証する

### D1-3. ステップロック方針

**決定**: 折衷案（コース内は順番ロック + コース間は前提コースで制御）

- **コース内**: ステップは `order` 順にロック解除（v1と同様）
- **コース間**: 「必須前提」と「推奨前提」を定義
  - 必須前提が未完了 → コース全体がロック
  - 推奨前提が未完了 → 警告表示のみ（アクセス可能）
- **カテゴリ間**: 独立（TypeScript は React 完了を待たずに開始可能）

前提コースの定義:

| コース | 必須前提 | 推奨前提 |
|--------|---------|---------|
| React基礎 | なし | なし |
| React応用 | React基礎 | なし |
| React実践 | React応用 | なし |
| API連携実践 | React基礎 | React応用 |
| Reactモダン | React応用 | React実践 |
| 実務パターン | React応用 | React実践 |
| TypeScript基礎 | なし | なし |
| TypeScript × React | TypeScript基礎 | React基礎 |

---

## D2. カリキュラム詳細設計

### D2-1. TypeScript基礎コース（6ステップ）

**コース位置づけ**: TypeScriptの言語機能を体系的に理解する。React非依存。バックエンド等にもそのまま活きる。

**根拠**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) の章構成に1:1対応

| # | ステップID | タイトル | 対応Handbook章 | 根拠URL | 主なトピック |
|---|-----------------|----------|---------------|---------|-------------|
| 1 | `ts-basics` | 型の基礎 | The Basics + Everyday Types | [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html), [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) | 型注釈、プリミティブ型、型推論、配列型、any、リテラル型、null/undefined |
| 2 | `ts-functions` | 関数の型 | More on Functions | [Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) | 引数・戻り値の型、オプショナル引数、関数型式、void、rest引数、オーバーロード |
| 3 | `ts-objects` | オブジェクト型 | Object Types + Everyday Types | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) | interface、type alias、interface vs type、readonly、extends、intersection、タプル |
| 4 | `ts-union-narrowing` | ユニオン型と型ガード | Narrowing | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) | union型、typeofガード、truthiness、equality、in演算子、instanceof、判別共用体、never |
| 5 | `ts-generics` | ジェネリクス | Generics | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) | 型パラメータ`<T>`、ジェネリック関数・インターフェース、制約(extends) |
| 6 | `ts-utility-types` | ユーティリティ型 | Utility Types (Reference) | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) | Partial、Required、Pick、Omit、Record、Readonly、ReturnType、Parameters |

**Handbook順序との差異**: Handbook は Narrowing(3章) → Functions(4章) だが、本コースでは Functions → Objects → Narrowing の順。関数やオブジェクトの型を先に学んでからナローイングを学ぶ方が具体例をイメージしやすいため。

**意図的な省略**:

| 省略章 | 理由 | 将来コース |
|--------|------|-----------|
| Classes | Reactは関数コンポーネント中心 | TS × バックエンド |
| Modules | JSのimport/exportと同等 | TS × バックエンド |
| Enums | const objectで代替可能 | 高度な型操作 |
| Conditional/Mapped Types | ライブラリ作者向け | 高度な型操作 |
| Decorators | 実験的機能 | TS × バックエンド |

**問題設計方針**: B+C ハイブリッド
- Step 1-3（基礎〜オブジェクト型）: v1準拠の穴埋め形式
- Step 4-6（ユニオン型〜ユーティリティ型）: TS特有の問題形式（型エラー修正、コンパイルエラー特定、型設計Challenge）

---

### D2-2. TypeScript × Reactコース（4ステップ）

**コース位置づけ**: ReactプロジェクトでTypeScriptを実践的に使えるようになる。

**根拠**: [react.dev/learn/typescript](https://react.dev/learn/typescript) のセクション構成に準拠

| # | ステップID | タイトル | 対応 react.dev セクション | 主なトピック |
|---|-----------------|----------|-------------------------|-------------|
| 1 | `ts-react-props` | コンポーネントとProps型 | "TypeScript with React Components" | インラインProps型、interface/typeによるProps定義、オプショナルProps、children型(ReactNode vs ReactElement) |
| 2 | `ts-react-state` | 状態管理Hooksの型 | "Example Hooks" — useState, useReducer | useStateの型推論と明示的ジェネリクス、union型State、useReducerのState/Action型、判別共用体によるAction設計 |
| 3 | `ts-react-hooks` | コンテキスト・RefのHooks型 | "Example Hooks" — useContext, useRef, useMemo, useCallback | useContextのnull安全パターン、useRefのDOM参照型とmutable ref、useMemo/useCallbackの型推論 |
| 4 | `ts-react-events` | イベント型とDOM型 | "Useful Types" — DOM Events, Children, Style Props | React.ChangeEvent、React.MouseEvent、React.FormEvent、React.SyntheticEvent、React.CSSProperties |

**react.dev カバー率**: Installation 以外の全セクションを100%カバー

**問題設計方針**: B+C ハイブリッド（TS基礎コースと同様）

---

### D2-3. Reactモダンコース（6ステップ）

**コース位置づけ**: React公式APIの中で v1 未カバーの重要機能を学ぶ。

**根拠**: react.dev Reference セクション

| # | ステップID | タイトル | 根拠URL | 主なトピック |
|---|-----------------|----------|---------|-------------|
| 1 | `error-boundary` | エラーハンドリング設計 | [react.dev: Component](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | Error Boundary、getDerivedStateFromError、componentDidCatch、フォールバックUI、react-error-boundary |
| 2 | `suspense-lazy` | Suspenseとコード分割 | [react.dev: Suspense](https://react.dev/reference/react/Suspense) | Suspense、React.lazy、データフェッチとの連携、ネストされたSuspense |
| 3 | `concurrent-features` | Concurrent機能 | [react.dev: useTransition](https://react.dev/reference/react/useTransition) | useTransition、useDeferredValue、isPending状態、重い処理のUI最適化 |
| 4 | `use-optimistic` | 楽観的更新 | [react.dev: useOptimistic](https://react.dev/reference/react/useOptimistic) | useOptimistic、即時UIフィードバック、ロールバック、reducer パターン |
| 5 | `portals` | Portals | [react.dev: createPortal](https://react.dev/reference/react-dom/createPortal) | createPortal、モーダル・オーバーレイ実装、イベントバブリング |
| 6 | `forward-ref` | Ref転送と命令的API | [react.dev: forwardRef](https://react.dev/reference/react/forwardRef) | forwardRef、useImperativeHandle、カスタム公開API |

**問題設計方針**: B+C ハイブリッド（Read充実 + Challenge重視）

---

### D2-4. 実務パターンコース（4ステップ）

**コース位置づけ**: コミュニティベストプラクティスと外部ライブラリを活用した実務的なReactパターンを学ぶ。

**根拠**: ライブラリ公式ドキュメント + Web標準（MDN）+ 実務頻出パターン

| # | ステップID | タイトル | 根拠 | 主なトピック |
|---|-----------------|----------|------|-------------|
| 1 | `rhf-zod` | フォームバリデーション | [RHF公式](https://react-hook-form.com/get-started), [Zod公式](https://zod.dev/) | React Hook Form + Zod、register、Controller、スキーマバリデーション |
| 2 | `pagination` | ページネーション | 実務頻出パターン | ページ分割表示、URL連動（searchParams）、ページ計算ロジック |
| 3 | `infinite-scroll` | 無限スクロール | [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) | Intersection Observer、スクロール検知、データ追加ロード |
| 4 | `auth-flow` | 認証フロー実装 | 実務頻出パターン | ログイン/ログアウト/保護ルート設計、トークン管理、リダイレクト |

**問題設計方針**: B+C ハイブリッド（Read に図解・比較表・実務場面を充実 + Challenge メイン）

**外部ライブラリ依存の方針**:

| ステップ | 方針 | 理由 |
|---------|------|------|
| rhf-zod | 概念学習（A案） | RHF+Zodのインポート環境構築コストが高い |
| pagination | 実コード（B案） | vanilla Reactで実装可能 |
| infinite-scroll | 実コード（B案） | Intersection ObserverはブラウザAPI |
| auth-flow | 概念学習（A案） | 認証は環境依存が大きい |

---

## D3. 繰り返し学習機能 詳細設計

### D3-1. デイリーチャレンジ

| 項目 | 仕様 |
|------|------|
| 概要 | 日替わり1問。完了済みステップから出題 |
| 出題アルゴリズム | 完全ランダム（完了済みステップから1ステップ選択→バリエーションから1問出題） |
| 問題数 | 最小構成（全ステップ × 3問 ≒ 約120問。約4ヶ月で一巡） |
| 日付管理 | Supabase の `now()` 基準（サーバー時刻）。RPC or Edge Function で出題決定 |
| 報酬 | 正解: 20 Pt。7日連続ボーナス: 50 Pt |
| 制限 | 1日1問。JST基準でリセット |
| 復習リスト統合 | v1 の ReviewListWidget は削除。デイリー出題に復習要素を将来組み込める余地を残す |

### D3-2. コードドクター

| 項目 | 仕様 |
|------|------|
| 概要 | バグ入りコードを修正。3難易度 |
| カテゴリ構造 | v2はReactカテゴリのみ。将来TS/JS等のカテゴリ追加可能な構造にする |
| 難易度別内容 | 初級: JSX構文ミス・Props型ミス / 中級: useEffect依存配列・状態更新 / 上級: メモ化漏れ・レースコンディション |
| 判定方法 | 複合判定（必須キーワード + NGワード）。修正後に含むべきコード + バグ原因が残っていないことを確認 |
| 報酬 | 初級: 15 Pt / 中級: 30 Pt / 上級: 50 Pt |

### D3-3. ミニプロジェクト

| 項目 | 仕様 |
|------|------|
| 概要 | 仕様からゼロ実装。段階的セット |
| ラインナップ | 基礎3 + 応用3 + 実践2 = 8プロジェクト（下表参照） |
| 判定方法 | 段階的判定（ステップバイステップ）。プロジェクトを小マイルストーンに分割し、1つずつクリア |
| 報酬 | 完了: 100 Pt |

#### ミニプロジェクト ラインナップ

| # | 難易度 | プロジェクト名 | 概要 | 主な学習要素 |
|---|--------|--------------|------|-------------|
| 1 | 基礎 | Todoアプリ | タスクの追加・完了・削除 | useState、リスト操作、条件付きレンダリング |
| 2 | 基礎 | カウンター拡張 | 複数カウンター + 合計値表示 | 複数state管理、コンポーネント分割、props |
| 3 | 基礎 | じゃんけんゲーム | CPU対戦 + 戦績表示 | イベント処理、ランダム処理、状態遷移 |
| 4 | 応用 | タイマーアプリ | カウントダウン + アラーム通知 | useEffect、setInterval管理、クリーンアップ |
| 5 | 応用 | Markdownプレビューア | 左右分割エディタ+プレビュー | 制御/非制御コンポーネント、リアルタイム変換 |
| 6 | 応用 | クイズアプリ | JSON問題データ + スコア表示 | データ駆動UI、画面遷移、結果集計 |
| 7 | 実践 | 天気API表示 | 外部API取得 + ローディング + エラー表示 | fetch/async-await、ローディング状態、エラーハンドリング |
| 8 | 実践 | ショッピングカート | 商品一覧 + カート + 合計計算 | useReducer/useContext、複合状態管理、計算ロジック |

### D3-4. コードリーディング

| 項目 | 仕様 |
|------|------|
| 概要 | コードを読んで理解度を問う |
| 問題形式 | 段階的設問（1つのコードスニペットに対して複数設問: 「何をする関数か？」→「バグはどこか？」→「修正後の出力は？」） |
| 問題数 | 初期5問（設問数を絞って開始。体験が良ければ増やす） |
| 報酬 | 基礎: 10 Pt / 応用: 20 Pt / 実践: 30 Pt |

---

## D4. 画面遷移設計

### D4-1. 全体遷移図

```
ログイン画面 (/login)
  │  ← Google ログイン追加
  ▼
ダッシュボード (/)
  │
  ├──→ カリキュラムページ (/curriculum)      ← 新規
  │     ├── カテゴリセクション（React / TypeScript / ...）
  │     │    └── コース一覧（アコーディオン）
  │     │         └──→ 学習ページ (/step/:stepId)
  │     └── 練習モードセクション
  │          └──→ 各練習ページ
  │
  ├──→ デイリーチャレンジ (/daily)           ← 新規
  ├──→ コードドクター (/practice/code-doctor) ← 新規
  ├──→ ミニプロジェクト (/practice/mini-projects) ← 新規
  │     └──→ 実装画面 (/practice/mini-projects/:projectId)
  ├──→ コードリーディング (/practice/code-reading) ← 新規
  └──→ プロフィール (/profile)
```

### D4-2. ルーティング一覧

| パス | 画面 | 認証 | 状態 |
|-----|------|------|------|
| `/login` | ログイン画面 | 不要 | 変更（Googleボタン追加） |
| `/signup` | サインアップ画面 | 不要 | 変更（Googleボタン追加） |
| `/` | ダッシュボード | 必須 | 変更（レイアウト再設計） |
| `/curriculum` | カリキュラムページ | 必須 | **新規** |
| `/step/:stepId` | 学習画面 | 必須 | 変更（サイドバー・パンくず・ロック判定） |
| `/daily` | デイリーチャレンジ | 必須 | **新規** |
| `/practice/code-doctor` | コードドクター | 必須 | **新規** |
| `/practice/mini-projects` | ミニプロジェクト一覧 | 必須 | **新規** |
| `/practice/mini-projects/:projectId` | ミニプロジェクト実装 | 必須 | **新規** |
| `/practice/code-reading` | コードリーディング | 必須 | **新規** |
| `/profile` | プロフィール画面 | 必須 | 既存（変更なし） |
| `/*` | 404 | 不要 | 既存（変更なし） |

---

## D5. 画面詳細設計

### D5-1. ダッシュボード (`/`) — 再設計

**方針**: 「今日やること＆全体の状態が一目でわかるハブ」に徹する。

#### レイアウト（2カラム維持・コンテンツ幅拡張）

```
┌────────────────────────────────────────────────────────┐
│ AppHeader（ドロップダウンナビ → D5-5）                    │
├────────────────────────────────────────────────────────┤
│  max-w-screen-xl (v1: max-w-7xl → 拡張)               │
│  px-4 (v1: px-6 → 縮小してコンテンツ幅確保)             │
│                                                        │
│  ┌─────── col-span-8 ──────┐ ┌──── col-span-4 ────┐   │
│  │                         │ │                     │   │
│  │  WelcomeBanner          │ │  学習ステータス       │   │
│  │  (v1既存・維持)          │ │  (ストリーク・Pt)    │   │
│  │                         │ │                     │   │
│  │  デイリーチャレンジ       │ │  ポイント目標        │   │
│  │  カード (NEW)            │ │  進捗バー           │   │
│  │                         │ │                     │   │
│  │  カテゴリカード群         │ │  獲得バッジ         │   │
│  │  (NEW)                  │ │  (最近数個)         │   │
│  │                         │ │                     │   │
│  │  スキルアップ             │ │  ヒートマップ        │   │
│  │  セクション (NEW)        │ │  (30日)            │   │
│  │                         │ │                     │   │
│  └─────────────────────────┘ └─────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### カテゴリカード群

```
┌─ React ──────────────┐  ┌─ TypeScript ──────────┐
│  ⚛️  React            │  │  🔷 TypeScript         │
│  6コース / 30ステップ  │  │  2コース / 10ステップ   │
│  進捗: 12/30 (40%)   │  │  進捗: 0/10 (0%)      │
│  [████░░░░░░]        │  │  [░░░░░░░░░░]         │
│  ▸ カリキュラムを見る  │  │  ▸ カリキュラムを見る   │
└──────────────────────┘  └───────────────────────┘
```

- クリック → `/curriculum#react` or `/curriculum#typescript`
- v2時点は2カード横並び。将来カテゴリ増加時はスライダーに切り替え

#### スキルアップセクション

練習モード3種（コードドクター・ミニプロ・コードリーディング）を「スキルアップ」セクション見出し付きで表示。デイリーチャレンジは独立カードのため含まない。

#### v1からの変更まとめ

| 要素 | v1 | v2 |
|------|-----|-----|
| WelcomeBanner | あり | **維持** |
| 初心者CTA | completedSteps === 0 で表示 | **維持** |
| LearningOverviewCard | 全コース・全ステップ一覧 | **削除** → カテゴリカード群に置き換え |
| ReviewListWidget | あり | **削除**（デイリーに統合） |
| デイリーチャレンジカード | なし | **新規追加** |
| カテゴリカード群 | なし | **新規追加** |
| スキルアップセクション | なし | **新規追加** |
| サイドバー | 学習ステータス・バッジ・ヒートマップ | **維持** |
| コンテンツ幅 | max-w-7xl, px-6 | **拡張**（max-w-screen-xl, px-4） |

---

### D5-2. カリキュラムページ (`/curriculum`) — 新規

**役割**: 全カテゴリ・全コース・全ステップを一覧でき、学習開始の起点。

```
┌────────────────────────────────────────────────────────┐
│  h1: カリキュラム                                       │
│                                                        │
│  ┌─ #react ────────────────────────────────────────┐   │
│  │  ⚛️  React                                       │   │
│  │                                                  │   │
│  │  ┌─ React基礎 [初級] ─── ▼ アコーディオン ──┐     │   │
│  │  │  進捗: 4/4 (100%)                        │     │   │
│  │  │  ✅ Step 1〜4                             │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  │  ┌─ React応用 [中級] ──────────────────────┐     │   │
│  │  │  ...                                     │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  │  ... (React実践 / API連携 / 最新機能 / 実務パターン) │   │
│  └──────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ #typescript ───────────────────────────────────┐   │
│  │  🔷 TypeScript                                   │   │
│  │  ┌─ TypeScript基礎 ───────────────────────┐      │   │
│  │  │  ...                                    │      │   │
│  │  └─────────────────────────────────────────┘      │   │
│  │  ┌─ TypeScript × React ───────────────────┐      │   │
│  │  │  ...                                    │      │   │
│  │  └─────────────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ #practice ─────────────────────────────────────┐   │
│  │  🔧 練習モード                                    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │Daily   │ │Doctor  │ │Mini    │ │Reading │    │   │
│  │  │Challenge│ │        │ │Project │ │        │    │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

- コースカードはアコーディオン。進行中コースのみ初期展開
- ダッシュボードのカテゴリカードから `#react` 等のアンカーで直接遷移

---

### D5-3. 学習ページ (`/step/:stepId`) — 既存変更

| 項目 | v1 | v2 |
|------|-----|-----|
| LearningSidebar | 同一コース内のステップのみ | **同一カテゴリ内の全コース**をアコーディオン表示 |
| パンくずリスト | `ダッシュボード > ステップ名` | `カリキュラム > カテゴリ名 > コース名 > ステップ名` |
| useLearningStep | 4コースから検索 | **CATEGORIES ベース**の全コース検索 |
| ロック判定 | 全20ステップ通し番号 | **コース内order + 前提コース制御** |

---

### D5-4. 各練習モード画面

**共通構成**: 全練習モード画面は左に**簡易ナビ**（練習モード4種へのリンク）+ メインエリア。

```
┌── 簡易ナビ ──┬──────── メインエリア ────────────┐
│ 📅 デイリー   │                                  │
│ 💉 ドクター   │  （画面ごとに異なる）              │
│ 📦 ミニプロ   │                                  │
│ 📖 リーディング│                                  │
└──────────────┴──────────────────────────────────┘
```

簡易ナビは幅狭（w-48程度）で、現在の画面をハイライト表示。

---

#### デイリーチャレンジ (`/daily`)

簡易ナビ + メインエリア（1カラム・カード型）

```
┌── 簡易ナビ ──┬──────────── メインエリア ───────────────┐
│ ▶ デイリー   │                                        │
│   ドクター   │   ┌── 今日のチャレンジ ──────────────┐  │
│   ミニプロ   │   │  📅 2026/03/27                   │  │
│   リーディング│   │  カテゴリ: [React]  Step: forms  │  │
│              │   │                                  │  │
│              │   │  問題文テキスト...                 │  │
│              │   │                                  │  │
│              │   │  ┌─ 入力/選択エリア ──────────┐   │  │
│              │   │  │  (穴埋め or 選択式)         │   │  │
│              │   │  └────────────────────────────┘   │  │
│              │   │                                  │  │
│              │   │  [判定する]                       │  │
│              │   │  判定結果表示エリア               │  │
│              │   └──────────────────────────────────┘  │
│              │                                        │
│              │   ┌── 今週の達成状況 ────────────────┐  │
│              │   │  月✅ 火✅ 水⬜ 木⬜ 金⬜ 土⬜ 日⬜│  │
│              │   │  🔥 ストリーク: 2日連続           │  │
│              │   └──────────────────────────────────┘  │
└──────────────┴────────────────────────────────────────┘
```

- 完了済みの場合は「今日のチャレンジは完了です！」+ 結果サマリーを表示
- 未完了ステップがない場合は「全ステップを完了するとデイリーチャレンジが解禁されます」表示

---

#### コードドクター (`/practice/code-doctor`)

**一覧画面**: 簡易ナビ + メインエリア（問題カードグリッド）

```
┌── 簡易ナビ ──┬──────────── メインエリア ───────────────┐
│   デイリー   │  h2: コードドクター                     │
│ ▶ ドクター   │                                        │
│   ミニプロ   │  フィルタ: [初級] [中級] [上級] [全て]   │
│   リーディング│                                        │
│              │  ┌─ 問題1 ─────┐  ┌─ 問題2 ─────┐     │
│              │  │ 初級 #001    │  │ 初級 #002    │     │
│              │  │ Props型ミス  │  │ JSX構文エラー │     │
│              │  │ ✅ 解決済み   │  │ 🔓 未挑戦    │     │
│              │  └──────────────┘  └──────────────┘     │
│              │  ┌─ 問題3 ─────┐  ...                   │
│              │  │ 中級 #001    │                       │
│              │  │ useEffect   │                       │
│              │  │ 🔓 未挑戦    │                       │
│              │  └──────────────┘                       │
└──────────────┴────────────────────────────────────────┘
```

**問題画面**: 簡易ナビ + 左右分割（問題パネル + Monaco Editor）

```
┌── 簡易ナビ ──┬──── 問題パネル ────┬──── エディタ ─────┐
│   デイリー   │ ▶ 問題タイトル      │                    │
│ ▶ ドクター   │ 難易度: ★★☆       │  Monaco Editor     │
│   ミニプロ   │                    │  (バグ入りコード)   │
│   リーディング│ 期待される動作:     │                    │
│              │ 問題説明テキスト... │                    │
│              │                    │                    │
│              │ [💡 ヒント表示]    │                    │
│              │                    │                    │
│              │ 判定結果:           │  [判定する]        │
│              │ ✅ 正解！ +30 Pt   │                    │
└──────────────┴────────────────────┴────────────────────┘
```

---

#### ミニプロジェクト (`/practice/mini-projects`)

**一覧画面**: 簡易ナビ + メインエリア（プロジェクトカードグリッド）

```
┌── 簡易ナビ ──┬──────────── メインエリア ───────────────┐
│   デイリー   │  h2: ミニプロジェクト                   │
│   ドクター   │                                        │
│ ▶ ミニプロ   │  フィルタ: [基礎] [応用] [実践] [全て]   │
│   リーディング│                                        │
│              │  ┌─ Todo ──────────┐ ┌─ カウンター ──┐  │
│              │  │ ⭐ 基礎          │ │ ⭐ 基礎       │  │
│              │  │ Todoアプリ       │ │ カウンター拡張 │  │
│              │  │ useState/リスト  │ │ 複数state     │  │
│              │  │ ✅ 完了          │ │ 🔓 未着手     │  │
│              │  └─────────────────┘ └───────────────┘  │
│              │  ...                                    │
└──────────────┴────────────────────────────────────────┘
```

**実装画面** (`/:projectId`): 簡易ナビ + 左右分割（仕様パネル + Monaco Editor）

```
┌── 簡易ナビ ──┬──── 仕様パネル ────┬──── エディタ ─────┐
│   デイリー   │ ▶ Todoアプリ       │                    │
│   ドクター   │ 難易度: ⭐ 基礎    │  Monaco Editor     │
│ ▶ ミニプロ   │                    │                    │
│   リーディング│ マイルストーン:     │                    │
│              │ ✅ 1. UI構造作成   │                    │
│              │ ▶ 2. 追加機能      │                    │
│              │ 🔒 3. 完了/削除    │                    │
│              │ 🔒 4. フィルタ     │                    │
│              │                    │                    │
│              │ 現在の仕様:        │  [判定する]        │
│              │ 「入力欄と追加     │                    │
│              │  ボタンを実装...」 │                    │
└──────────────┴────────────────────┴────────────────────┘
```

---

#### コードリーディング (`/practice/code-reading`)

**一覧画面**: 簡易ナビ + メインエリア（問題カードグリッド）

```
┌── 簡易ナビ ──┬──────────── メインエリア ───────────────┐
│   デイリー   │  h2: コードリーディング                  │
│   ドクター   │                                        │
│   ミニプロ   │  フィルタ: [基礎] [応用] [実践] [全て]   │
│ ▶ リーディング│                                        │
│              │  ┌─ 問題1 ────────┐ ┌─ 問題2 ───────┐  │
│              │  │ ⭐ 基礎         │ │ ⭐⭐ 応用      │  │
│              │  │ カスタムフック   │ │ useReducer    │  │
│              │  │ 設問: 3問       │ │ 設問: 4問     │  │
│              │  │ ✅ 正答 3/3     │ │ 🔓 未挑戦     │  │
│              │  └────────────────┘ └───────────────┘  │
└──────────────┴────────────────────────────────────────┘
```

**設問画面**: 簡易ナビ + メインエリア（1カラム・カード型）

```
┌── 簡易ナビ ──┬──────────── メインエリア ───────────────┐
│   デイリー   │  ▶ 問題1: カスタムフック  [⭐ 基礎]     │
│   ドクター   │                                        │
│   ミニプロ   │  ┌── コードスニペット ─────────────┐    │
│ ▶ リーディング│  │  function useCounter(initial) { │    │
│              │  │    const [count, setCount]...   │    │
│              │  │    ...                          │    │
│              │  └─────────────────────────────────┘    │
│              │                                        │
│              │  設問 1/3:                              │
│              │  「この関数は何を返しますか？」           │
│              │                                        │
│              │  ○ A. count の値のみ                   │
│              │  ● B. count と操作関数のオブジェクト     │
│              │  ○ C. setCount 関数のみ                │
│              │  ○ D. JSX要素                          │
│              │                                        │
│              │  [回答する]                             │
│              │  ✅ 正解！  → [次の設問へ]              │
└──────────────┴────────────────────────────────────────┘
```

---

### D5-5. AppHeader — 既存変更

**ナビゲーション変更**:
- 「学習を始める」→「カリキュラム」に変更
- 「カリキュラム」にドロップダウン導入
- Pt・ストリーク表示は維持

#### デスクトップ（md以上）ドロップダウン

「カリキュラム」をホバー or クリックで展開。2セクション構成。

```
  ダッシュボード   カリキュラム ▾    プロフィール    🔥3  💎120
                  ┌───────────────────────────┐
                  │  学習コース                │
                  │    ▸ React                │ → /curriculum#react
                  │    ▸ TypeScript            │ → /curriculum#typescript
                  │───────────────────────────│
                  │  練習モード                │
                  │    ▸ デイリーチャレンジ     │ → /daily
                  │    ▸ コードドクター        │ → /practice/code-doctor
                  │    ▸ ミニプロジェクト      │ → /practice/mini-projects
                  │    ▸ コードリーディング    │ → /practice/code-reading
                  └───────────────────────────┘
```

- 学習コースのリンクはカリキュラムページの該当カテゴリアンカーへ遷移
- 練習モードのリンクは各練習ページへ直接遷移
- ドロップダウン外クリックで閉じる

#### モバイル（sm以下）ハンバーガーメニュー

モバイルではドロップダウンなし。ハンバーガーメニュー（☰）に全項目を統合。

```
┌───────────────────────┐
│  ☰ メニュー           │
├───────────────────────┤
│  ダッシュボード        │
│                       │
│  学習コース            │
│    ▸ React            │
│    ▸ TypeScript        │
│                       │
│  練習モード            │
│    ▸ デイリーチャレンジ │
│    ▸ コードドクター    │
│    ▸ ミニプロジェクト  │
│    ▸ コードリーディング│
│                       │
│  プロフィール          │
│                       │
│  🔥 3日連続  💎 120 Pt│
└───────────────────────┘
```

### D5-6. ログイン画面 / サインアップ画面 — 既存変更

```
┌──────────────────────────┐
│  Coden ロゴ               │
│                          │
│  [🔷 Googleでログイン]    │  ← 新規
│  ─── または ───           │
│  メールアドレス [____]    │
│  パスワード    [____]    │
│  [ログイン]              │
└──────────────────────────┘
```

---

## D6. データ設計

### D6-1. 新規テーブル

```sql
-- デイリーチャレンジ履歴
CREATE TABLE daily_challenge_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id   TEXT NOT NULL,
  completed      BOOLEAN DEFAULT false,
  points_earned  INTEGER DEFAULT 0,
  completed_at   TIMESTAMPTZ,
  challenge_date DATE NOT NULL,
  UNIQUE(user_id, challenge_date)
);

-- コードドクター進捗
CREATE TABLE code_doctor_progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'react',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  solved     BOOLEAN DEFAULT false,
  attempts   INTEGER DEFAULT 0,
  solved_at  TIMESTAMPTZ,
  UNIQUE(user_id, problem_id)
);

-- ミニプロジェクト進捗
CREATE TABLE mini_project_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   TEXT NOT NULL,
  status       TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  code         TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, project_id)
);

-- コードリーディング進捗
CREATE TABLE code_reading_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  correct     BOOLEAN DEFAULT false,
  attempts    INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ,
  UNIQUE(user_id, question_id)
);
```

### D6-2. RLS ポリシー

```sql
ALTER TABLE daily_challenge_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_doctor_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_project_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_reading_progress   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_data" ON daily_challenge_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON code_doctor_progress    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON mini_project_progress   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON code_reading_progress   FOR ALL USING (auth.uid() = user_id);
```

### D6-3. 既存テーブルの変更

既存テーブル変更なし。新コースのステップ進捗は `step_progress` テーブルで管理（`step_id` で区別）。

### D6-4. 進捗保存先

**決定**: 全て Supabase（4テーブルフル活用。端末間同期可能）

---

## D7. ゲーミフィケーション拡張

### D7-1. Pt付与ルール追加

| アクション | 獲得Pt |
|-----------|--------|
| デイリーチャレンジ正解 | 20 Pt |
| デイリー7日連続ボーナス | 50 Pt |
| コードドクター正解（初級） | 15 Pt |
| コードドクター正解（中級） | 30 Pt |
| コードドクター正解（上級） | 50 Pt |
| ミニプロジェクト完了 | 100 Pt |
| コードリーディング正解（基礎） | 10 Pt |
| コードリーディング正解（応用） | 20 Pt |
| コードリーディング正解（実践） | 30 Pt |

### D7-2. 新規バッジ

| badge_id | バッジ名 | 解禁条件 |
|----------|--------|---------|
| `ts-basic-complete` | TypeScript入門者 | TypeScript基礎コース全ステップ完了 |
| `ts-react-complete` | TS×Reactマスター | TypeScript × Reactコース全ステップ完了 |
| `react-modern-complete` | Reactモダンマスター | Reactモダンコース全ステップ完了 |
| `patterns-complete` | 実務パターン習得者 | 実務パターンコース全ステップ完了 |
| `daily-7` | デイリー7日連続 | 7日連続でデイリーチャレンジ完了 |
| `daily-30` | デイリー30日連続 | 30日連続でデイリーチャレンジ完了 |
| `doctor-10` | コードドクター見習い | コードドクター10問正解 |
| `doctor-all-advanced` | 名医 | コードドクター上級を全問正解 |
| `first-mini-project` | 初プロジェクト | ミニプロジェクトを初めて完了 |
| `mini-project-5` | プロジェクトビルダー | ミニプロジェクトを5つ完了 |
| `reader-10` | コードリーダー | コードリーディング10問正解 |

---

## D8. 既存コンポーネント変更一覧

### D8-1. 変更が必要なファイル

| ファイル | 変更内容 | 影響度 |
|---------|---------|--------|
| `main.tsx` | 新ルート追加（/curriculum, /daily, /practice/*） | 中 |
| `content/courseData.ts` | `COURSES` → `CATEGORIES` 再構成。`CategoryMeta` 型追加。コースID リネーム（course-1→react-fundamentals 等、D0-2参照） | **大** |
| `features/dashboard/components/AppHeader.tsx` | ナビ変更 + ドロップダウン追加 | 中 |
| `pages/DashboardPage.tsx` | LearningOverviewCard 削除 → カテゴリカード群・デイリーカード・スキルアップセクション追加 | **大** |
| `features/dashboard/components/LearningOverviewCard.tsx` | **削除** | — |
| `features/dashboard/components/ReviewListWidget.tsx` | **削除** | — |
| `components/LearningSidebar.tsx` | カテゴリ内全コースをアコーディオン表示 | 中 |
| `pages/StepPage.tsx` | パンくず変更、サイドバー連携、ロック判定変更 | 中 |
| `features/learning/hooks/useLearningStep.ts` | CATEGORIES ベースのステップ検索に変更 | 中 |
| `pages/LoginPage.tsx` | Googleログインボタン追加 | 小 |
| `pages/SignUpPage.tsx` | Googleログインボタン追加 | 小 |
| `contexts/AuthContext.tsx` | Google OAuth対応（`signInWithOAuth` 追加） | 小 |
| `contexts/LearningContext.tsx` | CATEGORIES ベースの進捗計算 | 中 |
| `services/achievementService.ts` | 新バッジ定義追加 | 小 |
| `services/pointService.ts` | 新Ptルール追加 | 小 |

### D8-2. 変更不要なファイル

| ファイル | 理由 |
|---------|------|
| `features/learning/ReadMode.tsx` | 4段階フロー各モードは変更なし |
| `features/learning/PracticeMode.tsx` | 同上 |
| `features/learning/TestMode.tsx` | 同上 |
| `features/learning/ChallengeMode.tsx` | 同上 |
| `services/progressService.ts` | step_progress テーブル構造変更なし |
| `services/statsService.ts` | ヒートマップ・ストリーク計算変更なし |
| `pages/ProfilePage.tsx` | v2では変更なし |

---

## D9. ディレクトリ構成（v2 全体）

```text
apps/web/src/
  content/
    courseData.ts              # CATEGORIES 定義（再構成）
    fundamentals/steps.ts      # v1既存
    intermediate/steps.ts      # v1既存
    advanced/steps.ts          # v1既存
    api-practice/steps.ts      # v1既存
    typescript/steps.ts        # v2 NEW: TypeScript基礎
    typescript-react/steps.ts  # v2 NEW: TypeScript × React
    react-modern/steps.ts      # v2 NEW: Reactモダン
    react-patterns/steps.ts    # v2 NEW: 実務パターン
    daily/                     # v2 NEW: デイリーチャレンジ問題
    code-doctor/               # v2 NEW: コードドクター問題
    mini-projects/             # v2 NEW: ミニプロジェクト定義
    code-reading/              # v2 NEW: コードリーディング問題

  pages/
    DashboardPage.tsx          # 変更
    StepPage.tsx               # 変更
    LoginPage.tsx              # 変更
    SignUpPage.tsx              # 変更
    CurriculumPage/            # v2 NEW
    DailyChallengePage/        # v2 NEW
    CodeDoctorPage/            # v2 NEW
    MiniProjectsPage/          # v2 NEW
    CodeReadingPage/           # v2 NEW

  features/
    dashboard/components/      # 変更
    learning/                  # 変更なし（4段階フロー）
    daily-challenge/           # v2 NEW
    code-doctor/               # v2 NEW
    mini-projects/             # v2 NEW
    code-reading/              # v2 NEW

  services/
    dailyChallengeService.ts   # v2 NEW
    codeDoctorService.ts       # v2 NEW
    miniProjectService.ts      # v2 NEW
    codeReadingService.ts      # v2 NEW

  contexts/
    AuthContext.tsx             # 変更: Google OAuth
    LearningContext.tsx         # 変更: CATEGORIES ベース

  components/
    LearningSidebar.tsx         # 変更: カテゴリ対応
    CategoryCard.tsx            # v2 NEW
```

---

## D10. 非機能要件

- 新規ページは全て `React.lazy` + `Suspense` で遅延ロード
- カリキュラムページのコース一覧はアコーディオンで初期描画軽量化
- Supabase Auth の Google OAuth プロバイダー有効化
- 繰り返し学習コンテンツは静的ファイル管理（AI生成はv2では導入しない）

---

## D11. マイルストーン案

| MS | 名称 | 内容 | 前提 |
|----|------|------|------|
| M1 | 開発基盤・情報アーキテクチャ | `dev` ブランチ作成、CATEGORIES 再構成、カリキュラムページ新設、ダッシュボード再設計、ルーティング・ナビ変更、ステップロック再実装 | — |
| M2 | Google ログイン | Supabase Google OAuth 設定、ログイン/サインアップ UI 変更 | M1 |
| M3 | TypeScript基礎コース | 6 ステップのコンテンツ作成 + courseData 登録 | M1 |
| M4 | TypeScript × Reactコース | 4 ステップのコンテンツ作成 + courseData 登録 | M1 |
| M5 | Reactモダンコース | 6 ステップのコンテンツ作成 + courseData 登録 | M1 |
| M6 | 実務パターンコース | 4 ステップのコンテンツ作成 + courseData 登録 | M1 |
| M7 | デイリーチャレンジ | コンテンツ作成、DB テーブル、UI、Pt 連携 | M1 |
| M8 | コードドクター | 問題作成（3 難易度）、DB テーブル、UI、Pt 連携 | M1 |
| M9 | ミニプロジェクト | プロジェクト定義作成、DB テーブル、UI、Pt 連携 | M1 |
| M10 | コードリーディング | 問題作成、DB テーブル、UI、Pt 連携 | M1 |
| M11 | ゲーミフィケーション拡張 | 新バッジ追加、Pt ルール追加 | M3〜M10 |
| M12 | 品質・リリース準備 | テスト、型チェック、レスポンシブ確認、dev→main マージ | M2〜M11 |

---

## D12. 未確定事項一覧

| # | 項目 | セクション | 現状 |
|---|------|-----------|------|
| 1 | **コードドクターの具体的バグ問題** | D3-2 | 難易度別の方針は確定。個別の問題内容は未作成 |
| 2 | **コードリーディングの具体的問題** | D3-4 | 段階的設問・5問の方針は確定。問題内容は未作成 |
| 3 | **デイリーチャレンジの具体的問題** | D3-1 | 各ステップ3問・約120問の方針は確定。問題内容は未作成 |
| 4 | **各コースの具体的コンテンツ** | D2 | ステップ構成・根拠は確定。Read/Practice/Test/Challengeの具体的内容は未作成 |

---

**要件定義・詳細設計書バージョン**: v2.0（ドラフト） | **参照元**: coden-v1.md + Specification.md v2.0

# Coden v3.0 企画書 — モバイル学習体験の抜本的改修（コアバリュー編）

> **ドキュメントバージョン**: v3.0 Draft
> **作成日**: 2026-04-04
> **ステータス**: 企画・要件定義フェーズ
> **前提**: v2.1（Base Nook + レビュー反映）完了済み。main ブランチが最新。

---

## リリース戦略

```
v3.0  コアバリュー — エディタ基盤 + 4段階学習フロー + 練習モードのモバイル化 ← 本書
  ↓
v3.1  全ページ最適化 — ダッシュボード / カリキュラム / プロフィール等のモバイルUI再設計
  ↓
v3.X  仕上げ・QA → main マージ（実質リリース）
```

**方針**: dev ブランチ上で v3.0 → v3.1 → ... と積み上げ、全体が揃ってから main にマージする。ユーザーには中途半端なモバイル体験を見せない。

**v3.0 のスコープ**: エディタ移行（Monaco → CodeMirror 6）と、4段階学習フロー + 練習モードのモバイル最適化に集中する。ダッシュボード等のページレイアウト改修は v3.1 で、v3.0 完了後にスマホで実際に確認してからスコープを確定する。

---

# Part 1: 要件

## 1. ビジョン

**「スマホでも Read→Practice→Test→Challenge の全4段階を妥協なく学べる」**

Coden の最大の価値は4段階学習フロー。v3.0 では、この体験をスマホ画面で制限するのではなく、**入力方法自体を段階に合わせて進化させる**ことでモバイル最適化を実現する。

| 段階 | PC 入力 | スマホ入力（v3.0 新規） |
|------|---------|----------------------|
| Read | 読むだけ | 読むだけ（変更なし） |
| Practice | テキスト穴埋め + 選択肢 | テキスト穴埋め + 選択肢（微調整） |
| Test | コード内インライン入力 | **コードパズル**（トークン組み立て） |
| Challenge | Monaco フルエディタ | **CodeMirror 6 + コードツールバー** |

PC 画面幅の体験は **一切変更しない**。

---

## 2. スコープ・前提

### v3.0 対象（本書）

- **エディタ基盤**: Monaco Editor → CodeMirror 6 移行（全プラットフォーム）
- **4段階学習フロー**: Read / Practice / Test / Challenge のモバイル最適化
- **練習モード**: コードドクター / ミニプロジェクト / デイリー / コードリーディング / ベースヌックのモバイル最適化
- **基盤**: PWA メタ情報、タッチ最適化、useIsMobile フック等
- **学習ページ（StepPage）**: モードステッパーのスティッキー化等、学習体験に直結する改修

### v3.1 に送るもの（本書では扱わない）

- ダッシュボードのモバイルレイアウト再設計
- カリキュラムページのモバイル最適化
- プロフィールページのモバイル最適化
- ログイン / サインアップ画面のモバイル最適化
- AppHeader ドロワーの改善（現状で動作するため優先度低）

### 対象外（v3 全体で扱わない）

- PC 画面幅（768px〜）の UI 変更
- バックエンド（Supabase）の変更
- 新規学習コンテンツの追加
- ネイティブアプリ化（React Native 等）

### 前提条件

- 既存テスト（629件）が全 PASS を維持すること
- 既存のルーティング構造を維持すること
- Tailwind CSS v3 + React 19 + Vite 7 のスタックを維持すること

---

## 3. 対象デバイス

### ブレークポイント戦略

| ブレークポイント | 用途 | v3.0 での役割 |
|----------------|------|--------------|
| `< 640px` (default) | スマホ | **v3.0 の主戦場** |
| `sm:` (640px) | スマホ横 / 小タブレット | 微調整 |
| `md:` (768px) | タブレット | PC/モバイル境界（既存通り） |
| `lg:` (1024px) | デスクトップ | 既存通り（変更なし） |

### 検証対象デバイス

| デバイス | 画面幅 | 優先度 |
|---------|--------|-------|
| iPhone SE | 375px | 最小幅の基準 |
| iPhone 12/13/14 | 390px | メインターゲット |
| iPhone Pro Max | 430px | 大型スマホ |
| Android 標準 | 360-412px | 幅広い層 |
| iPad Mini | 768px | md 境界確認 |

---

## 4. 機能要件

### 4-1. エディタ基盤: Monaco → CodeMirror 6 移行

| 項目 | 現状 (Monaco) | v3.0 (CodeMirror 6) |
|------|-------------|---------------------|
| モバイル対応 | ❌ 実質不可 | ✅ ファーストクラス |
| バンドルサイズ | ~5-10MB | ~300KB (モジュラー) |
| タッチ入力 | 独自実装で問題多数 | ネイティブ contentEditable |
| 実績 | — | Replit がモバイルで採用、リテンション70%向上 |

**影響範囲**: ChallengeMode, CodeDoctorPage, MiniProjectDetailPage

PC でも CodeMirror 6 を使用する（Monaco は完全撤去）。PC の見た目・操作感は Monaco と同等以上を維持する。

### 4-2. 学習フロー（4段階）モバイル対応

#### Read モード

**変更**: 微調整のみ
- フォントサイズ・行間のモバイル最適化
- コードブロックの横スクロール改善
- 「Read を完了」ボタンのタップターゲット確保

#### Practice モード

**変更**: 微調整のみ
- 入力欄のモバイルキーボード対応（`autocorrect="off"`, `spellcheck="false"`）
- 選択肢ボタンのタップターゲット 44px 以上確保
- 複数問題のスクロール体験改善

#### Test モード — コードパズル（モバイル専用）

**変更**: スマホ時にコードパズル UI を表示（PC は従来通りインライン入力）

コードの空欄部分を、用意されたトークン（コード片）をタップして組み立てる方式。

**要件**:
- コード文脈（前後のコード）を読み取り専用で表示する
- 空欄エリアにタップしたトークンが順に配置される
- トークンプールには正解トークン＋ダミートークンが混在する
- 組み立てたトークンをタップすると取り消し（プールに戻る）できる
- 難易度に応じてトークン粒度を変える（初級: 大チャンク / 上級: 細かい単位）
- 判定ロジックは既存の `expectedKeywords` ベースのまま変更しない
- PC（md 以上）では従来のインライン入力を維持する

#### Challenge モード — CodeMirror 6 + コードツールバー

**変更**: エディタ切替 + モバイル専用ツールバー

**要件**:
- CodeMirror 6 でフルコード入力を維持する（学習の核心を制限しない）
- モバイル時にキーボード上部にコードツールバーを表示する
  - 上段: よく使うコード記号（`{}`, `()`, `[]`, `=>`, `;`, `:`, `=`, `""`, `//`）
  - 下段: ステップ固有のキーワードサジェスト（`expectedKeywords` + React 共通語彙から生成）
- スターターコードを表示し、TODO コメント部分から編集開始する
- PC（md 以上）ではツールバーを非表示にする
- 判定ロジックは既存のまま変更しない

### 4-3. 練習モード モバイル対応

#### デイリーチャレンジ

**変更**: 微調整のみ（現状で 90% 対応済み）
- 入力欄・ボタンのタップターゲット確保
- WeeklyStatus ヒートマップのモバイル表示最適化

#### コードドクター — タップ＆修正

**変更**: モバイル専用の修正 UI

**要件**:
- バグ入りコードを CodeMirror 6 で表示する（シンタックスハイライト付き）
- バグの可能性がある行をハイライト表示する（ヒントとして）
- CodeMirror 6 で直接編集する（コードツールバー付き）
- ツールバーの下段に修正に関連するキーワードをサジェストする
- 判定ロジック（`requiredKeywords` + `ngKeywords`）は既存のまま変更しない

#### コードリーディング

**変更**: 微調整のみ（現状で 85% 対応済み）
- コードスニペットの横スクロール確保
- 選択肢のタップターゲット確保
- フォントサイズ調整（コード部分は最小 13px）

#### ミニプロジェクト — ガイドモード（モバイル専用）

**変更**: モバイル時にマイルストーン単位のガイドモードを提供

**要件**:
- モバイル時は一度に1マイルストーンずつ表示する
- 各マイルストーンで必要なコード領域のみ編集可能にする（他は読み取り専用）
- CodeMirror 6 + コードツールバーを使用する
- マイルストーン達成で次へ進むステッパー UI を提供する
- PC（md 以上）では従来通り全コードを自由編集する
- 判定ロジック（マイルストーン単位の `requiredKeywords`）は既存のまま変更しない

#### ベースヌック

**変更**: 微調整のみ（現状で 95% 対応済み）
- 記事の可読性向上（行間・余白）
- クイズ選択肢のタップターゲット確保

### 4-4. 学習ページ（StepPage）レイアウト

**変更**: 学習体験に直結する部分のみ v3.0 で対応

- モードステッパー（Read/Practice/Test/Challenge 切替）をスティッキー化
- 各モードのコンテンツは画面幅いっぱいに使う
- モバイルの余白最適化（`px-4` → `px-3`）
- LearningSidebar の折りたたみ動作は既存のまま維持

> **Note**: ダッシュボード / カリキュラム / プロフィール / ログイン / AppHeader のモバイルレイアウト改修は **v3.1** で対応。v3.0 完了後にスマホで実機確認し、スコープを確定する。

### 4-5. PWA・メタ情報

**変更**: 新規追加

**要件**:
- `manifest.json` を追加し、ホーム画面への追加を可能にする
- `<meta name="theme-color">` を追加する
- `apple-touch-icon` を設定する
- `viewport-fit=cover` + `env(safe-area-inset-*)` でノッチ対応する
- サービスワーカーは最小限（キャッシュ戦略のみ、オフライン学習は将来拡張）

---

## 5. 非機能要件

| 項目 | 要件 |
|------|------|
| パフォーマンス | LCP 2.5秒以下（モバイル 4G 回線） |
| バンドルサイズ | Monaco 撤去による削減（目標: 初回ロード 50% 減） |
| タッチ操作 | 全インタラクティブ要素のタップターゲット 44×44px 以上 |
| タッチ最適化 | `touch-action: manipulation` をグローバル適用 |
| アクセシビリティ | 既存の a11y 対応を維持 + モバイル固有の改善 |
| テスト | 既存 629 テスト全 PASS + モバイル UI テスト追加 |
| ブラウザ | iOS Safari 16+, Chrome Android 最新2バージョン |

---

## 6. 対象外（明示的に除外するもの）

- ダッシュボード / カリキュラム / プロフィール / ログイン のモバイルレイアウト再設計（→ v3.1）
- AppHeader ドロワーの改善（→ v3.1）
- スワイプジェスチャーによるモード切替（将来拡張候補）
- オフライン学習機能（PWA 基盤のみ。オフライン対応は v3.1 以降）
- ダークモード（独立した改修として分離）
- 音声フィードバック・ハプティクス
- 学習コンテンツの追加・変更（既存コンテンツのモバイル表示最適化のみ）

---

# Part 2: 詳細設計

## 7. エディタ基盤: CodeMirror 6 移行

### 技術選定根拠

| 評価軸 | Monaco Editor | CodeMirror 6 |
|--------|-------------|--------------|
| モバイルタッチ | ❌ 独自テキスト編集、iOS で破綻 | ✅ ネイティブ contentEditable |
| バンドルサイズ | ~5-10MB (非圧縮) | ~300KB (基本機能) |
| ツリーシェイキング | ❌ 不可 | ✅ モジュラー設計 |
| React ラッパー | @monaco-editor/react | @uiw/react-codemirror |
| テーマ | vs-dark | oneDark（同等の見た目） |
| 実績 | VS Code (デスクトップ) | Replit (モバイル Web) |

### 導入パッケージ

```
@codemirror/view
@codemirror/state
@codemirror/lang-javascript    (TypeScript/JSX 対応)
@codemirror/theme-one-dark
@codemirror/autocomplete
@uiw/react-codemirror          (React ラッパー)
```

### 移行対象コンポーネント

| コンポーネント | 現在の Monaco 使用箇所 | 移行内容 |
|--------------|---------------------|---------|
| `ChallengeMode.tsx` | Challenge のコード入力 | CodeMirror 6 + ツールバー |
| `CodeDoctorPage.tsx` | バグ修正のコード編集 | CodeMirror 6 + ツールバー |
| `MiniProjectDetailPage.tsx` | プロジェクト実装 | CodeMirror 6 + ガイドモード |

### 共通 CodeEditor コンポーネント

```
components/
  CodeEditor/
    CodeEditor.tsx          # CodeMirror 6 ラッパー（PC/モバイル共通）
    CodeToolbar.tsx         # モバイル専用コードツールバー
    useCodeToolbar.ts       # ツールバーのキーワードサジェストロジック
    useIsMobile.ts          # md 未満判定フック（Tailwind breakpoint 連動）
```

`CodeEditor` は以下のプロパティを受け取る:

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `value` | `string` | 編集中のコード |
| `onChange` | `(value: string) => void` | コード変更コールバック |
| `language` | `'typescript' \| 'javascript'` | シンタックスハイライト言語 |
| `readOnly` | `boolean` | 読み取り専用 |
| `height` | `string` | エディタ高さ（レスポンシブ対応） |
| `toolbarKeywords` | `string[]` | モバイルツールバーに表示するキーワード候補 |

---

## 8. コードパズル（Test モード・モバイル専用）

### 概要

PC では従来のインライン入力。スマホ（md 未満）では **コードトークンの組み立て UI** に切り替える。

### UI 構造

```
┌──────────────────────────────────────┐
│ 指示文                                │
│ 「カウントが1減るように空欄を埋めて」     │
├──────────────────────────────────────┤
│ コード文脈（読み取り専用）              │
│                                      │
│  const [count, setCount] = useState(10) │
│  return (                            │
│    <button onClick={() =>            │
│      ┌──────────────────────┐        │
│      │ 組み立てエリア          │        │
│      │ [setCount] [(] [count]│        │
│      │ [-] [1] [)]           │        │
│      └──────────────────────┘        │
│    }>                                │
│      -1 ({count})                    │
│    </button>                         │
│  )                                   │
├──────────────────────────────────────┤
│ ── 使えるパーツ ──                     │
│                                      │
│ ┌────────┐ ┌───┐ ┌───┐ ┌──────────┐ │
│ │setState│ │ + │ │ 0 │ │ number  │ │  ← ダミー
│ └────────┘ └───┘ └───┘ └──────────┘ │
│ ┌──────┐ ┌───┐                      │
│ │Count │ │ 2 │                      │  ← ダミー
│ └──────┘ └───┘                      │
├──────────────────────────────────────┤
│         [ 判定する ]                   │
└──────────────────────────────────────┘
```

### インタラクション

1. **トークンをタップ** → 組み立てエリアの末尾に追加される
2. **組み立てエリアのトークンをタップ** → トークンが取り除かれ、パーツプールに戻る
3. **判定する** → 組み立てたトークンを結合し、既存の `expectedKeywords` ロジックで判定
4. 不正解 → 赤ハイライト + ヒント表示（既存ロジック流用）
5. 正解 → 既存の合格表示

### トークン生成ロジック

既存コンテンツの `expectedKeywords` と `starterCode` からトークンを**自動生成**する。

```
入力:
  starterCode: "... onClick={() => ____} ..."
  expectedKeywords: ['setCount', 'count - 1']

処理:
  1. expectedKeywords から期待される回答を推定: "setCount(count - 1)"
  2. トークン化: ['setCount', '(', 'count', '-', '1', ')']
  3. ダミー生成: ['setState', '+', '0', 'number', 'Count', '2']
  4. シャッフル: 全トークンをランダム配置

出力:
  correctTokens: ['setCount', '(', 'count', '-', '1', ')']
  distractorTokens: ['setState', '+', '0', 'number', 'Count', '2']
```

### コンテンツデータ拡張

既存の `TestTask` 型に **オプショナル** フィールドを追加:

```typescript
interface TestTask {
  instruction: string
  starterCode: string
  expectedKeywords: string[]
  explanation?: string
  // v3.0 追加（オプション: 未指定時は自動生成）
  mobilePuzzle?: {
    correctTokens: string[]       // 正解トークン列（順序付き）
    distractorTokens: string[]    // ダミートークン
  }
}
```

`mobilePuzzle` 未指定時は `expectedKeywords` と `starterCode` からランタイム生成する。コンテンツ作者が精緻に制御したい場合のみ明示指定する。

### コンポーネント構成

```
features/learning/
  CodePuzzle/
    CodePuzzle.tsx              # パズル全体のコンテナ
    CodeContext.tsx              # 読み取り専用コード文脈表示
    AssemblyArea.tsx             # 組み立てエリア
    TokenPool.tsx               # トークンプール（正解+ダミー）
    Token.tsx                   # 個別トークン（タップ操作）
    useTokenGenerator.ts        # 自動トークン生成ロジック
```

### PC/モバイル切替

```tsx
// TestMode.tsx 内
const isMobile = useIsMobile()  // md 未満を判定

return isMobile
  ? <CodePuzzle task={testTask} onSubmit={handleSubmit} />
  : <InlineTestInput task={testTask} onSubmit={handleSubmit} />  // 既存UI
```

---

## 9. Challenge モード — CodeMirror 6 + コードツールバー

### UI 構造（モバイル）

```
┌──────────────────────────────────────┐
│ 課題: いいねボタンを実装してください      │
│                                      │
│ 要件:                                │
│ ・初期値0から開始する                   │
│ ・クリックで+1される                    │
│ ・現在値を表示する                      │
├──────────────────────────────────────┤
│                                      │
│  import { useState } from 'react';   │
│                                      │  ← CodeMirror 6
│  export function LikeButton() {      │     エディタ
│    // TODO: useState を使って...       │     (高さ: 動的)
│    █                                 │
│  }                                   │
│                                      │
├──────────────────────────────────────┤
│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐   │
│ │{}││()││[]││=>││ ; ││ : ││ = ││""│  │  ← 記号バー
│ └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘   │
│ ┌────────┐┌────────┐┌──────┐        │
│ │useState││setCount ││onClick│        │  ← キーワードサジェスト
│ └────────┘└────────┘└──────┘        │
├──────────────────────────────────────┤
│ [ 判定する ]         [ ヒント (1/2) ] │
├──────────────────────────────────────┤
│ [標準キーボード]                       │
└──────────────────────────────────────┘
```

### コードツールバーの仕様

**上段（記号バー）**: 全ステップ共通

```
{ } ( ) [ ] => ; : = "" '' ` ` // /* */
```

タップでカーソル位置に挿入。`{}`, `()`, `[]`, `""`, `''` はペアで挿入しカーソルを中央に配置。

**下段（キーワードサジェスト）**: ステップ依存

```typescript
// 生成ロジック
const suggestions = [
  ...pattern.expectedKeywords,        // そのステップの期待キーワード
  ...REACT_COMMON_KEYWORDS,           // useState, useEffect, return, etc.
].slice(0, 8)                          // 最大8個（2行×4個）
```

タップでカーソル位置にキーワードを挿入。

**表示条件**: `md` 未満かつキーボードが開いているとき（`VisualViewport API` で判定）

### エディタの高さ

```
モバイル: min(50vh, 300px) — キーボード＋ツールバーの余地を確保
PC:      400px（既存と同等）
```

---

## 10. コードドクター — モバイル対応

### UI 構造（モバイル）

```
┌──────────────────────────────────────┐
│ 🩺 リストに key がない                  │
│ todo リストをレンダリングするが...       │
├──────────────────────────────────────┤
│                                      │
│  function TodoList({ todos }) {      │
│    return (                          │
│      <ul>                            │
│        {todos.map((todo) => (        │
│  >>>     <li>{todo.text}</li>    <<< │  ← バグ行ハイライト
│        ))}                           │
│      </ul>                           │
│    )                                 │
│  }                                   │
│                                      │  ← CodeMirror 6
├──────────────────────────────────────┤    （編集可能）
│ [記号バー]                             │
│ [key= | todo.id | map | ...]         │  ← キーワードサジェスト
├──────────────────────────────────────┤
│ [ 判定する ]            [ ヒント ]     │
└──────────────────────────────────────┘
```

### PC との違い

| 項目 | PC | モバイル |
|------|-----|--------|
| エディタ | CodeMirror 6（フル編集） | CodeMirror 6（フル編集） + ツールバー |
| バグ行 | ハイライトなし | 行ハイライトでヒント表示 |
| 高さ | 480px | 動的（50vh 上限） |

### バグ行ハイライトのデータ

既存コンテンツの `buggyCode` と `requiredKeywords` / `ngKeywords` から、バグの可能性がある行を推定する:

```typescript
// 推定ロジック（ヒューリスティック）
function estimateBuggyLines(problem: CodeDoctorProblem): number[] {
  const lines = problem.buggyCode.split('\n')
  const buggyLines: number[] = []

  // ngKeywords を含む行 = バグ行（確実）
  problem.ngKeywords.forEach(kw => {
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(kw.toLowerCase())) buggyLines.push(i)
    })
  })

  // requiredKeywords を含まない行 = 追加・修正が必要な行（推定）
  // → ヒントとして行番号周辺をハイライト

  return [...new Set(buggyLines)]
}
```

精度が不十分な場合は、コンテンツにオプショナルで `buggyLineNumbers: number[]` を追加する。

---

## 11. ミニプロジェクト — ガイドモード（モバイル専用）

### 概要

PC では全コードを自由編集。モバイルでは**マイルストーン単位のステッパー UI** で段階的に実装する。

### UI 構造（モバイル）

```
┌──────────────────────────────────────┐
│ 📱 Todo App                          │
│ ステップ 2/4: フォームでタスクを追加     │
│                                      │
│ ● ── ◉ ── ○ ── ○                    │  ← マイルストーンステッパー
│ 1    2    3    4                      │
├──────────────────────────────────────┤
│ 💡 input と button でタスクを追加できる  │
├──────────────────────────────────────┤
│                                      │
│  // ✅ マイルストーン1 (達成済み)       │  ← 読み取り専用
│  const [tasks, setTasks] =           │     (折りたたみ可)
│    useState([...])                   │
│                                      │
│  // ── ここを実装 ──                  │
│  █                                   │  ← CodeMirror 6
│                                      │     (編集可能エリア)
│  // 以下は次のマイルストーンで実装       │  ← 読み取り専用
│  // ...                              │     (グレーアウト)
│                                      │
├──────────────────────────────────────┤
│ [記号バー]                             │
│ [setInput | addTask | onChange | ...] │
├──────────────────────────────────────┤
│ [ 判定する ]                           │
└──────────────────────────────────────┘
```

### 動作フロー

1. マイルストーン1 から開始。他のマイルストーンのコードはグレーアウト
2. マイルストーン1 の判定に合格 → 自動で次のマイルストーンへ進む
3. 前のマイルストーンのコードは読み取り専用で表示（折りたたみ可）
4. 全マイルストーン達成 → プロジェクト完了

### コンテンツデータ拡張

既存の `MiniProject` 型にオプショナルフィールドを追加:

```typescript
interface MiniProjectMilestone {
  id: string
  title: string
  description: string
  requiredKeywords: string[]
  // v3.0 追加（オプション）
  scaffoldCode?: string     // マイルストーン開始時の初期コード
  editableRange?: {         // 編集可能な行範囲
    startLine: number
    endLine: number
  }
}
```

`scaffoldCode` 未指定時は `initialCode` 全体を編集可能にする（フォールバック）。

---

## 12. グローバル改修 + 学習ページレイアウト

### グローバル改修

| 項目 | 現状 | v3.0 |
|------|------|------|
| `touch-action` | 未設定 | `manipulation` をグローバル適用 |
| タップターゲット | 可変 | 学習フロー・練習モード内の全要素で最小 44×44px 保証 |
| `h-screen` | 使用なし | `h-dvh` を推奨（SKILL で検出） |
| セーフエリア | 未対応 | `env(safe-area-inset-*)` でノッチ対応 |
| `theme-color` | 未設定 | `<meta name="theme-color">` 追加 |

### 学習ページ（StepPage）

```
┌──────────────────────────────────┐
│ [AppHeader]                       │
├──────────────────────────────────┤
│ [▼ コース一覧]                    │  ← 折りたたみ（既存）
├──────────────────────────────────┤
│ ● Read  ○ Practice  ○ Test  ○ Ch │  ← モードステッパー（sticky）
├──────────────────────────────────┤
│                                  │
│  [各モードのコンテンツ]             │  ← スクロール可能エリア
│                                  │
└──────────────────────────────────┘
```

**変更点**:
- モードステッパーをスティッキー（`sticky top-*`）にして常に見える状態にする
- 各モードのコンテンツは画面幅いっぱいに使う
- `px-4` → `px-3` でモバイルの余白を最適化

> **Note**: ダッシュボード等のページレイアウト改修は v3.1 で対応。

---

## 13. PWA 基盤

### manifest.json

```json
{
  "name": "Coden — React学習プラットフォーム",
  "short_name": "Coden",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2DD4A8",
  "background_color": "#FAFAF9",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### index.html 追加

```html
<meta name="theme-color" content="#2DD4A8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### サービスワーカー

最小限のキャッシュ戦略のみ。オフライン学習機能は v3.1 以降。

```
キャッシュ対象: アプリシェル（HTML, CSS, JS）、フォント
キャッシュ非対象: API リクエスト（Supabase）、学習データ
```

---

## 14. コンポーネント設計まとめ

### 新規コンポーネント

| コンポーネント | 配置先 | 用途 |
|--------------|-------|------|
| `CodeEditor` | `components/CodeEditor/` | CodeMirror 6 共通ラッパー |
| `CodeToolbar` | `components/CodeEditor/` | モバイル専用コードツールバー |
| `CodePuzzle` | `features/learning/CodePuzzle/` | Test モードのモバイル UI |
| `MilestoneGuide` | `features/mini-projects/MilestoneGuide/` | ミニプロジェクトのモバイルガイド |

### 新規フック

| フック | 配置先 | 用途 |
|-------|-------|------|
| `useIsMobile` | `hooks/useIsMobile.ts` | md 未満の判定（Tailwind 連動） |
| `useKeyboardVisible` | `hooks/useKeyboardVisible.ts` | キーボード表示判定（VisualViewport API） |
| `useTokenGenerator` | `features/learning/CodePuzzle/` | コードパズルのトークン自動生成 |

### 修正コンポーネント

| コンポーネント | 変更内容 |
|--------------|---------|
| `ChallengeMode` | Monaco → CodeEditor（CodeMirror 6） |
| `CodeDoctorPage` | Monaco → CodeEditor + バグ行ハイライト |
| `MiniProjectDetailPage` | Monaco → CodeEditor + ガイドモード切替 |
| `TestMode` | PC/モバイル分岐追加（CodePuzzle） |
| `StepPage` | モードステッパーのスティッキー化、余白調整 |

---

## 15. マイルストーン計画

### ブランチ戦略

```
main (v2.1)
 └── dev
      ├── v3/<milestone>          ← v3.0 マイルストーン群（本書）
      │    └── task branches → PR → milestone → PR → dev
      │
      ├── v3.1/<milestone>        ← ページレイアウト改修（別途企画）
      │    └── ...
      │
      └── (v3.X 完了後) → PR → main   ← 実質リリース
```

### v3.0 マイルストーン一覧

| # | マイルストーン | 概要 | 依存 |
|---|-------------|------|------|
| M1 | 基盤構築 | CodeMirror 6 導入、useIsMobile、touch-action、PWA メタ情報 | — |
| M2 | エディタ移行 | Challenge / CodeDoctor / MiniProject の Monaco → CodeMirror 6 移行 | M1 |
| M3 | コードツールバー | モバイル専用ツールバー（記号バー + キーワードサジェスト） | M2 |
| M4 | コードパズル | Test モードのモバイル UI（トークン組み立て） | M1 |
| M5 | 学習フロー調整 | Read / Practice / StepPage のモバイル微調整 | M1 |
| M6 | 練習モード調整 | Daily / CodeReading / BaseNook のモバイル微調整 | M1 |
| M7 | コードドクター拡張 | バグ行ハイライト + モバイル UX | M3 |
| M8 | ミニプロジェクト拡張 | マイルストーンガイドモード | M3 |
| M9 | v3.0 QA | Playwright 検証、バンドル最適化、全モード動作確認 | M1-M8 |

### 依存関係図

```
M1 (基盤) ──────────────────────────────┐
 ├── M2 (エディタ移行) ── M3 (ツールバー) ├── M7 (ドクター拡張)
 │                                      ├── M8 (ミニプロ拡張)
 ├── M4 (コードパズル)                    │
 ├── M5 (学習フロー)                      │
 └── M6 (練習モード)                      │
                                        ↓
                                   M9 (QA)
```

M1 完了後、M2〜M6 は並列作業可能。M7, M8 は M3 完了後に着手。

### v3.0 完了後の流れ

1. v3.0 QA 完了（M9）
2. スマホでダッシュボード / カリキュラム / プロフィール等を実機確認
3. v3.1 の企画書を作成（改修スコープ確定）
4. v3.1 実装
5. v3.X 全体 QA → main マージ

---

## 16. 検証計画

### 自動テスト

- 既存テスト 629件の全 PASS 維持
- 新規コンポーネントテスト: CodePuzzle, CodeEditor, CodeToolbar, MilestoneGuide
- `useIsMobile` / `useKeyboardVisible` のユニットテスト

### Playwright によるビジュアル検証

各マイルストーン完了時に以下のデバイス幅でスクリーンショット検証:

```
375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini)
```

検証ページ（v3.0 スコープ）: StepPage（各モード）, CodeDoctor, MiniProject, 練習モード各ページ

### 手動検証

- iOS Safari 実機テスト（タッチ操作、キーボード表示、ノッチ対応）
- Android Chrome 実機テスト
- モバイルキーボード + CodeMirror 6 の操作性確認
- コードパズルのトークン操作のスムーズさ確認

---

*この企画書は議論を通じて更新する。*

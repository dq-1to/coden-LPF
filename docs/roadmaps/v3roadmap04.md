# v3roadmap04: v3.0 コードドクター拡張・ミニプロジェクト拡張・QA（M7〜M9）

**作成日**: 2026-04-05
**前提**: v3roadmap01（M1〜M4 コア機能）+ v3roadmap02（Design Principles 修正）+ v3roadmap03（M5〜M6 モバイル微調整）完了済み。dev ブランチが最新。企画書 `docs/coden-v3.md` セクション 10, 11, 15, 16 に基づく。
**スコープ**: M7（コードドクター拡張）+ M8（ミニプロジェクト拡張）+ M9（v3.0 QA）。

---

## 1. 背景

v3roadmap01 で CodeMirror 6 基盤 + コードツールバーが完成し、v3roadmap03 でモバイル微調整が完了した。残る M7・M8 はコードドクターとミニプロジェクトの**モバイル UX 拡張**であり、CodeMirror 6 の Decoration API を活用した行ハイライト・編集範囲制御が中心。M9 は v3.0 全体の最終 QA。

### 対象マイルストーン

| # | マイルストーン | 概要 | 依存 |
|---|-------------|------|------|
| M7 | コードドクター拡張 | バグ行ハイライト + モバイル UX 改善 | M3 ✅ |
| M8 | ミニプロジェクト拡張 | マイルストーンガイドモード（モバイル専用） | M3 ✅ |
| M9 | v3.0 QA | Playwright 全モード検証・バンドル最適化・クロスブラウザ確認 | M1-M8 |

M7 と M8 は独立しており並列作業可能。M9 は M5〜M8 全完了後に着手。

---

## 2. モデル判定基準

| 担当 | 基準 |
|------|------|
| `[Opus]` | 新規設計判断を伴う機能（CodeMirror Decoration API 設計、MilestoneGuide アーキテクチャ） |
| `[Sonnet]` | 既存パターンの適用・CSS 調整・テスト実行 |

---

## 3. 共通設計方針

### 3-1. CodeMirror Decoration API

`@codemirror/view` の `Decoration` + `StateField` / `StateEffect` を使って行単位のスタイリングを実現する。

```typescript
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'
```

**パターン**: StateEffect で行番号配列を受け取り、StateField で DecorationSet を管理する。コンポーネントの props 変更時に `view.dispatch` で Effect を発火する。

### 3-2. 既存 CodeEditor の拡張方針

`CodeEditor.tsx`（84行）に新しい props を追加し、内部で extension を動的に構成する。既存の `readOnly` / `toolbarKeywords` の仕組みを踏襲する。

```typescript
interface CodeEditorProps {
  // 既存
  value: string
  onChange?: (value: string) => void
  language?: 'typescript' | 'javascript'
  readOnly?: boolean
  height?: string
  className?: string
  toolbarKeywords?: string[]
  // M7 追加
  highlightLines?: number[]        // バグ行ハイライト（1-indexed）
  // M8 追加
  editableLineRange?: { startLine: number; endLine: number }  // 編集可能行範囲（1-indexed）
}
```

### 3-3. PC への影響

- M7: バグ行ハイライトは **PC・モバイル両方** で表示する（企画書: 「PC: ハイライトなし」だが、表示があっても UX を損なわないため統一）
- M8: マイルストーンガイドモードは **モバイル専用**。PC レイアウトは変更しない

---

## 4. M7: コードドクター拡張

### 概要

コードドクターのバグ入りコードに **バグ行ハイライト** を追加し、モバイルでのデバッグ体験を向上させる。CodeMirror Decoration API で該当行に視覚的なマーカーを表示する。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T1 | CodeEditor に行ハイライト extension を追加 | `[Opus]` | CodeMirror Decoration API の新規設計 |
| T2 | estimateBuggyLines ユーティリティ作成 | `[Sonnet]` | 文字列マッチングの定型ロジック |
| T3 | CodeDoctorPage にバグ行ハイライトを統合 | `[Sonnet]` | 既存コンポーネントへの props 追加 |
| T4 | コンテンツ拡張（buggyLineNumbers） | `[Sonnet]` | 推定精度が低い問題へのオプショナルオーバーライド |
| T5 | M7 テスト + CI 確認 | `[Sonnet]` | ユニットテスト + CI 全通過 |

### T1. CodeEditor に行ハイライト extension を追加 `[Opus]`

**変更ファイル**: `apps/web/src/components/CodeEditor/CodeEditor.tsx`

**新規ファイル**: `apps/web/src/components/CodeEditor/highlightLinesExtension.ts`

**設計**:

#### 1-1. highlightLinesExtension.ts の作成

```typescript
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'

// StateEffect: ハイライト行の更新
const setHighlightLines = StateEffect.define<number[]>()

// CSS クラス
const buggyLineDeco = Decoration.line({ class: 'cm-buggy-line' })

// StateField: DecorationSet を管理
const highlightLinesField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlightLines)) {
        const builder: Range<Decoration>[] = []
        for (const lineNum of e.value) {
          if (lineNum >= 1 && lineNum <= tr.state.doc.lines) {
            const line = tr.state.doc.line(lineNum)
            builder.push(buggyLineDeco.range(line.from))
          }
        }
        return Decoration.set(builder)
      }
    }
    return decos
  },
  provide: (f) => EditorView.decorations.from(f),
})

// テーマ: バグ行のスタイル
const buggyLineTheme = EditorView.baseTheme({
  '.cm-buggy-line': {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',  // rose-500/15
    borderLeft: '3px solid #f43f5e',               // rose-500
  },
})

export { setHighlightLines, highlightLinesField, buggyLineTheme }
```

#### 1-2. CodeEditor.tsx の拡張

**追加 props**: `highlightLines?: number[]`

**extensions の構成変更**:

```typescript
const extensions = useMemo(() => {
  const exts = [javascript({ typescript: language === 'typescript', jsx: true }), fontSizeTheme]
  if (highlightLines && highlightLines.length > 0) {
    exts.push(highlightLinesField, buggyLineTheme)
  }
  return exts
}, [language, highlightLines])
```

**props 変更時の Effect 発火**: `useEffect` で `highlightLines` が変わったら `view.dispatch` する。

```typescript
useEffect(() => {
  const view = cmRef.current?.view
  if (!view || !highlightLines) return
  view.dispatch({ effects: setHighlightLines.of(highlightLines) })
}, [highlightLines])
```

**検証**: `npm run typecheck && npm run test`

---

### T2. estimateBuggyLines ユーティリティ作成 `[Sonnet]`

**新規ファイル**: `apps/web/src/content/code-doctor/estimateBuggyLines.ts`

**ロジック**:

```typescript
import type { CodeDoctorProblem } from './types'

/**
 * ngKeywords を含む行番号を返す（1-indexed）。
 * problem.buggyLineNumbers が指定されていればそちらを優先する。
 */
export function estimateBuggyLines(problem: CodeDoctorProblem): number[] {
  if (problem.buggyLineNumbers) return problem.buggyLineNumbers

  const lines = problem.buggyCode.split('\n')
  const buggyLines: number[] = []

  for (const kw of problem.ngKeywords) {
    const kwLower = kw.toLowerCase()
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(kwLower)) {
        buggyLines.push(i + 1) // 1-indexed
      }
    })
  }

  return [...new Set(buggyLines)].sort((a, b) => a - b)
}
```

**テスト**: `apps/web/src/content/code-doctor/__tests__/estimateBuggyLines.test.ts`

テストケース:
1. ngKeywords にマッチする行を正しく返す
2. 大文字小文字を無視する
3. 重複行を除去する
4. buggyLineNumbers が指定されていればそちらを返す
5. ngKeywords がマッチしない場合は空配列

**検証**: `npm run typecheck && npm run test`

---

### T3. CodeDoctorPage にバグ行ハイライトを統合 `[Sonnet]`

**変更ファイル**: `apps/web/src/pages/CodeDoctorPage.tsx`（307行）

**変更内容**:

#### 3-1. import 追加

```typescript
import { estimateBuggyLines } from '../content/code-doctor/estimateBuggyLines'
```

#### 3-2. バグ行の計算（L72-78 付近）

```typescript
function handleSelectProblem(problem: CodeDoctorProblem) {
  setSelectedProblem(problem)
  setCode(problem.buggyCode)
  setResult(null)
  setShowHint(false)
  setSubmitError(null)
}
```

バグ行は `selectedProblem` から計算するため、`useMemo` で導出:

```typescript
const buggyLines = useMemo(
  () => selectedProblem ? estimateBuggyLines(selectedProblem) : [],
  [selectedProblem],
)
```

#### 3-3. CodeEditor に highlightLines を渡す（L211-217 付近）

**現状**:

```tsx
<CodeEditor
  value={code}
  onChange={(v) => { setCode(v); setResult(null) }}
  language="typescript"
  height={isMobile ? 'min(50vh, 300px)' : '480px'}
  toolbarKeywords={selectedProblem.requiredKeywords}
/>
```

**修正後**:

```tsx
<CodeEditor
  value={code}
  onChange={(v) => { setCode(v); setResult(null) }}
  language="typescript"
  height={isMobile ? 'min(50vh, 300px)' : '480px'}
  toolbarKeywords={selectedProblem.requiredKeywords}
  highlightLines={buggyLines}
/>
```

**検証**: `npm run typecheck && npm run test`

---

### T4. コンテンツ拡張（buggyLineNumbers） `[Sonnet]`

**変更ファイル**: `apps/web/src/content/code-doctor/types.ts`

**変更内容**:

```typescript
export interface CodeDoctorProblem {
  // 既存フィールド...
  // v3.0 追加
  buggyLineNumbers?: number[]  // 推定で不十分な場合の手動オーバーライド（1-indexed）
}
```

**コンテンツ更新**: 30問全てをチェックし、`estimateBuggyLines` の推定が不正確な問題に `buggyLineNumbers` を追加する。初回は全問の推定結果を目視確認し、必要な問題のみに追加する（全問に追加する必要はない）。

**検証**: `npm run typecheck && npm run test`

---

### T5. M7 テスト + CI 確認 `[Sonnet]`

**新規テスト**:

| ファイル | テスト内容 |
|---------|----------|
| `estimateBuggyLines.test.ts` | T2 で作成（5ケース） |
| `highlightLinesExtension.test.ts` | StateEffect / StateField の基本動作（省略可 — Decoration は DOM 依存が強いため、Playwright で代替） |

**既存テスト**: 全 PASS 維持

**Playwright 検証**:

```
375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini)
```

検証ページ: `/practice/code-doctor` → 問題選択 → バグ行がローズ背景 + 左ボーダーで表示されることを確認

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 5. M8: ミニプロジェクト拡張

### 概要

ミニプロジェクトに**マイルストーンガイドモード**（モバイル専用）を追加する。マイルストーン単位のステッパー UI で段階的に実装を進め、編集可能な行範囲を制御する。PC レイアウトは変更しない。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T6 | CodeEditor に editableLineRange extension を追加 | `[Opus]` | CodeMirror Decoration API + 編集制御の新規設計 |
| T7 | MilestoneGuide コンポーネント作成 | `[Opus]` | 新規 UI コンポーネント設計 |
| T8 | MiniProjectDetailPage にガイドモード統合 | `[Opus]` | 条件分岐ロジック + 既存レイアウトとの統合 |
| T9 | コンテンツ拡張（scaffoldCode + editableRange） | `[Sonnet]` | 8プロジェクト × マイルストーンのデータ追加 |
| T10 | M8 テスト + CI 確認 | `[Sonnet]` | テスト + CI 全通過 |

### T6. CodeEditor に editableLineRange extension を追加 `[Opus]`

**変更ファイル**: `apps/web/src/components/CodeEditor/CodeEditor.tsx`

**新規ファイル**: `apps/web/src/components/CodeEditor/editableRangeExtension.ts`

**設計**:

#### 6-1. editableRangeExtension.ts の作成

2つの機能を提供する:

1. **視覚的インジケーター**: 編集不可行をグレーアウト表示（Decoration API）
2. **編集制御**: 編集不可行への入力をブロック（EditorView.updateListener もしくは changeFilter）

```typescript
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'

// StateEffect: 編集可能範囲の更新
const setEditableRange = StateEffect.define<{ startLine: number; endLine: number } | null>()

// 読み取り専用行のデコレーション
const readonlyLineDeco = Decoration.line({ class: 'cm-readonly-line' })

// StateField: 読み取り専用行の DecorationSet
const editableRangeField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setEditableRange)) {
        if (!e.value) return Decoration.none
        const { startLine, endLine } = e.value
        const builder: Range<Decoration>[] = []
        for (let i = 1; i <= tr.state.doc.lines; i++) {
          if (i < startLine || i > endLine) {
            const line = tr.state.doc.line(i)
            builder.push(readonlyLineDeco.range(line.from))
          }
        }
        return Decoration.set(builder)
      }
    }
    return decos
  },
  provide: (f) => EditorView.decorations.from(f),
})

// 編集フィルター: 編集可能範囲外の変更をブロック
function editableRangeFilter(range: { startLine: number; endLine: number } | null) {
  return EditorState.changeFilter.of((tr) => {
    if (!range) return true
    // tr.changes の各変更が範囲内かチェック
    // 範囲外への変更はブロック
  })
}

// テーマ
const editableRangeTheme = EditorView.baseTheme({
  '.cm-readonly-line': {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',  // slate-500/10
    opacity: '0.6',
  },
})

export { setEditableRange, editableRangeField, editableRangeTheme, editableRangeFilter }
```

#### 6-2. CodeEditor.tsx の拡張

**追加 props**: `editableLineRange?: { startLine: number; endLine: number }`

**extensions の構成変更**: `highlightLines` と同様のパターンで、editableRange 用の extension を条件追加する。

**注意点**:
- `readOnly` prop と `editableLineRange` は排他的に使用する（`readOnly=true` 時は `editableLineRange` は無視）
- `editableLineRange` 指定時は `editable` は `true` のまま（行単位のフィルターで制御）

**検証**: `npm run typecheck && npm run test`

---

### T7. MilestoneGuide コンポーネント作成 `[Opus]`

**新規ファイル**: `apps/web/src/features/mini-projects/components/MilestoneGuide.tsx`

**設計**:

#### 7-1. UI 構造

```
┌─────────────────────────────────────┐
│ ● ── ◉ ── ○ ── ○                   │  ← ステッパー（水平）
│ 1    2    3    4                     │
├─────────────────────────────────────┤
│ 💡 [現在のマイルストーンの description] │  ← ヒントエリア
└─────────────────────────────────────┘
```

#### 7-2. Props

```typescript
interface MilestoneGuideProps {
  milestones: MiniProjectMilestone[]
  currentIndex: number              // 現在のマイルストーン（0-indexed）
  milestoneResults: MilestoneJudgeResult[] | null
}
```

#### 7-3. ステッパーの状態表現

| 状態 | アイコン | スタイル |
|------|---------|---------|
| 完了 | ● (●✅) | `bg-emerald-500 text-white` |
| 現在 | ◉ | `bg-amber-500 text-white ring-2 ring-amber-300` |
| 未着手 | ○ | `bg-slate-200 text-slate-400` |

#### 7-4. 44px タップターゲット

ステッパーの各ノードは `min-h-[44px] min-w-[44px]` を保証する（タップで該当マイルストーンの説明を表示）。

**検証**: `npm run typecheck && npm run test` — コンポーネント単体テストを作成

---

### T8. MiniProjectDetailPage にガイドモード統合 `[Opus]`

**変更ファイル**: `apps/web/src/pages/MiniProjectDetailPage.tsx`（228行）

**設計**:

#### 8-1. モバイル / PC の分岐

```typescript
const isMobile = useIsMobile()
```

- **PC (`!isMobile`)**: 既存レイアウトをそのまま使用（変更なし）
- **モバイル (`isMobile`)**: ガイドモード UI を表示

#### 8-2. ガイドモードの状態管理

```typescript
// 現在フォーカスしているマイルストーンのインデックス
const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0)
```

マイルストーン判定成功時に `currentMilestoneIndex` を自動インクリメント。

#### 8-3. 編集可能範囲の計算

```typescript
const currentMilestone = project.milestones[currentMilestoneIndex]
const editableRange = currentMilestone?.editableRange ?? null
```

`editableRange` が未指定の場合はコード全体を編集可能にする（フォールバック）。

#### 8-4. モバイルレイアウト

```tsx
{isMobile ? (
  <div className="flex flex-col gap-3">
    <MilestoneGuide
      milestones={project.milestones}
      currentIndex={currentMilestoneIndex}
      milestoneResults={milestoneResults}
    />
    <div className="overflow-hidden rounded-xl border border-border">
      <CodeEditor
        value={code}
        onChange={handleCodeChange}
        language="typescript"
        height="min(50vh, 300px)"
        toolbarKeywords={currentMilestone?.requiredKeywords ?? []}
        editableLineRange={editableRange ?? undefined}
      />
    </div>
    <button ...>判定する</button>
  </div>
) : (
  // 既存の PC レイアウト（変更なし）
)}
```

#### 8-5. マイルストーン単位の判定

既存の `handleSubmit` は全マイルストーンを一括判定する。ガイドモードでも同じ `submitProject` を使用するが、結果から `currentMilestoneIndex` を更新する:

```typescript
// submitResult を受け取った後
if (submitResult) {
  const firstFailing = submitResult.milestoneResults.findIndex(r => !r.passed)
  if (firstFailing === -1) {
    // 全マイルストーン達成
  } else {
    setCurrentMilestoneIndex(firstFailing)
  }
}
```

**検証**: `npm run typecheck && npm run test`

---

### T9. コンテンツ拡張（scaffoldCode + editableRange） `[Sonnet]`

**変更ファイル**:
- `apps/web/src/content/mini-projects/types.ts`
- `apps/web/src/content/mini-projects/projects.ts`（および各プロジェクトファイル）

#### 9-1. 型拡張

```typescript
export interface MiniProjectMilestone {
  id: string
  title: string
  description: string
  requiredKeywords: string[]
  // v3.0 追加（オプション）
  scaffoldCode?: string
  editableRange?: { startLine: number; endLine: number }
}
```

#### 9-2. コンテンツデータ追加

8プロジェクト（初級3 / 中級3 / 上級2）の各マイルストーンに `editableRange` を追加する。

**作業手順**:
1. 各プロジェクトの `initialCode` を読み、マイルストーンごとの編集対象行を特定する
2. `editableRange` の `startLine` / `endLine` を設定する
3. 必要に応じて `scaffoldCode`（マイルストーン開始時点のコード）を追加する

**注意**: `scaffoldCode` は「マイルストーン開始時にエディタに表示するコード」。`initialCode` と異なる場合のみ指定する。多くの初級プロジェクトでは `initialCode` のままで良いため、オプショナルフィールドとして未指定で進める。精度が不十分な場合に後から追加する。

**検証**: `npm run typecheck && npm run test`

---

### T10. M8 テスト + CI 確認 `[Sonnet]`

**新規テスト**:

| ファイル | テスト内容 |
|---------|----------|
| `MilestoneGuide.test.tsx` | ステッパー表示（完了/現在/未着手の状態切り替え）、44px タップターゲット |
| `editableRangeExtension.test.ts` | 基本動作（省略可 — Playwright で代替） |
| `MiniProjectDetailPage.test.tsx` | ガイドモード分岐（useIsMobile モック）、マイルストーン進行 |

**既存テスト**: 全 PASS 維持

**Playwright 検証**:

```
375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini)
```

検証ページ: `/practice/mini-projects/{projectId}` → マイルストーンステッパー表示、編集範囲制御、判定結果でのステッパー進行を確認

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 6. M9: v3.0 QA

### 概要

M1〜M8 の全変更を対象とした最終品質確認。Playwright による自動ビジュアル検証、バンドルサイズ確認、クロスブラウザ動作確認を行う。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T11 | Playwright 全ページビジュアル検証 | `[Sonnet]` | スクリーンショット取得 + 目視確認の定型作業 |
| T12 | バンドルサイズ確認 + 最適化 | `[Sonnet]` | Vite analyze + 必要に応じた動的 import 調整 |
| T13 | クロスブラウザ確認 + 最終修正 | `[Sonnet]` | 既知パターンの確認 + 軽微な修正 |
| T14 | Design Principles 監査 | `[Opus]` | 7原則に基づく FAIL/PASS 判定 |

### T11. Playwright 全ページビジュアル検証 `[Sonnet]`

**検証デバイス幅**:

```
375px (iPhone SE), 390px (iPhone 14), 768px (iPad Mini), 1280px (PC)
```

**検証ページ一覧**:

| ページ | パス | 検証ポイント |
|-------|------|-------------|
| 学習ページ (Read) | `/step/usestate-basic` | prose-sm / prose-base 切り替え、コードブロック 13px |
| 学習ページ (Practice) | `/step/usestate-basic` → Practice | 44px タップターゲット、キーボード属性 |
| 学習ページ (Test) | `/step/usestate-basic` → Test | コードパズル表示 |
| 学習ページ (Challenge) | `/step/usestate-basic` → Challenge | CodeMirror + ツールバー |
| デイリーチャレンジ | `/daily` | DailyChallengeCard + WeeklyStatus |
| コードドクター一覧 | `/practice/code-doctor` | フィルター + カード表示 |
| コードドクター問題 | `/practice/code-doctor` → 問題選択 | バグ行ハイライト + ツールバー |
| コードリーディング | `/practice/code-reading` | フィルター + 選択肢 |
| ミニプロジェクト一覧 | `/practice/mini-projects` | カード表示 |
| ミニプロジェクト詳細 | `/practice/mini-projects/{id}` | ガイドモード（モバイル）/ 2カラム（PC） |
| BaseNook | `/base-nook/{topic}` | 記事可読性 + クイズ選択肢 |

各ページで以下を確認:
- 44px タップターゲット（全インタラクティブ要素）
- テキストの可読性（最小 13px）
- レイアウト崩れがないこと
- ステッキー要素の動作

**検証**: スクリーンショットを `docs/qa/v3.0/` に保存

---

### T12. バンドルサイズ確認 + 最適化 `[Sonnet]`

**確認内容**:

```bash
npx vite-bundle-visualizer
```

**チェックポイント**:

| 項目 | 基準 |
|------|------|
| CodeMirror 関連 | 動的 import で分離されているか |
| コードパズル | 動的 import で分離されているか |
| MilestoneGuide | メインバンドルに含まれていないか |
| 総バンドルサイズ | v2.1 比で大幅な増加がないか（+20% 以内を目安） |

**最適化が必要な場合**:
- `React.lazy()` + `Suspense` で遅延ロード
- コンテンツデータ（30問 / 8プロジェクト）の動的 import

---

### T13. クロスブラウザ確認 + 最終修正 `[Sonnet]`

**対象ブラウザ**:
- iOS Safari 16+
- Chrome Android（最新）
- Chrome Desktop（最新）
- Firefox Desktop（最新）

**確認項目**:
- CodeMirror 6 のタッチ操作（iOS Safari のバグに注意）
- `touch-action: manipulation` の動作
- `env(safe-area-inset-*)` の適用
- コードパズルのドラッグ操作
- CodeToolbar のスクロール挙動

**既知の注意点**:
- iOS Safari ではコピー&ペーストバーが CodeMirror と干渉する場合がある
- Android Chrome の仮想キーボード表示時に `dvh` が変動する

---

### T14. Design Principles 監査 `[Opus]`

M7・M8 で追加・変更した全コンポーネントに対して `/design-audit` を実行する。

**対象ファイル**:
- `CodeEditor.tsx`（highlightLines / editableLineRange 追加後）
- `highlightLinesExtension.ts`
- `editableRangeExtension.ts`
- `MilestoneGuide.tsx`
- `MiniProjectDetailPage.tsx`（ガイドモード追加後）
- `CodeDoctorPage.tsx`（buggyLines 追加後）
- `estimateBuggyLines.ts`

**判定基準**: 7原則全 PASS で M9 完了。FAIL がある場合は修正してから完了とする。

---

## 7. ブランチ戦略

```
dev
 ├── v3/m7-code-doctor-extend       ← M7: コードドクター拡張
 │    ├── v3/m7_t1-highlight-ext
 │    ├── v3/m7_t2-t3-estimate-integrate
 │    └── v3/m7_t4-t5-content-ci
 │    → PR → dev
 │
 ├── v3/m8-mini-project-guide       ← M8: ミニプロジェクト拡張
 │    ├── v3/m8_t6-editable-range-ext
 │    ├── v3/m8_t7-milestone-guide
 │    ├── v3/m8_t8-page-integration
 │    └── v3/m8_t9-t10-content-ci
 │    → PR → dev
 │
 └── v3/m9-qa                       ← M9: v3.0 QA
      ├── v3/m9_t11-playwright
      ├── v3/m9_t12-bundle
      └── v3/m9_t13-t14-browser-audit
      → PR → dev
```

M7 と M8 は独立しているため並列作業可能。タスクブランチはローカルでマイルストーンブランチにマージしてから次のタスクブランチを作成する。M9 は M5〜M8 全完了後に着手。

---

## 8. 完了条件

### M7: コードドクター拡張

- [x] T1: CodeEditor に `highlightLines` prop が追加され、Decoration API でバグ行がハイライトされる `[Opus]` — PR #207
- [x] T2: `estimateBuggyLines` が ngKeywords ベースで行番号を返し、テスト 5件 PASS `[Sonnet]` — PR #207
- [x] T3: CodeDoctorPage で問題選択時にバグ行がローズ背景 + 左ボーダーで表示される `[Sonnet]` — PR #207
- [x] T4: types.ts に `buggyLineNumbers?` が追加され、必要な問題にオーバーライドが設定されている `[Sonnet]` — PR #207
- [x] T5: CI 全通過（691件 PASS） `[Sonnet]` — PR #207

### M8: ミニプロジェクト拡張

- [x] T6: CodeEditor に `editableLineRange` prop が追加され、範囲外行がグレーアウト + 編集不可になる `[Opus]` — PR #208
- [x] T7: MilestoneGuide コンポーネントが作成され、ステッパー UI が 44px タップターゲットを満たす `[Opus]` — PR #208
- [x] T8: MiniProjectDetailPage でモバイル時にガイドモードが表示され、PC レイアウトは変更なし `[Opus]` — PR #208
- [x] T9: 8プロジェクトのマイルストーンに `editableRange` が設定されている `[Sonnet]` — PR #208
- [x] T10: CI 全通過（695件 PASS） `[Sonnet]` — PR #208

### M9: v3.0 QA

- [x] T11: 全対象ページの Playwright スクリーンショットが `docs/qa/v3.0/` に保存されている `[Sonnet]` — PR #209
- [x] T12: バンドルサイズが v2.1 比 +20% 以内であることを確認 `[Sonnet]` — PR #209
- [x] T13: クロスブラウザ確認で重大な不具合がないことを確認 `[Sonnet]` — PR #209
- [x] T14: Design Principles 7原則監査で全 PASS `[Opus]` — PR #209

### 品質ゲート

- [x] `typecheck` / `lint` / `test` / `build` 全通過（各マイルストーン完了時）
- [x] 既存テスト全 PASS 維持（M5-M6 完了時のテスト数ベース）
- [x] Playwright で 375px / 390px / 768px / 1280px のスクリーンショット検証（M9 完了時）

---

## 9. 注意事項

- **CodeMirror Decoration API の import**: `@codemirror/view` と `@codemirror/state` は既に CodeEditor で使用しているため追加 install 不要。ただし `Range` 型の import に注意（`@codemirror/state` から取得）。
- **editableLineRange と readOnly の排他性**: 両方指定された場合は `readOnly` を優先する。`editableLineRange` は行単位の部分的な読み取り専用を実現するためのものであり、全体 `readOnly` とは異なる。
- **MilestoneGuide のモバイル専用**: `useIsMobile()` で分岐し、PC では既存の左パネル（マイルストーン一覧）をそのまま表示する。
- **コンテンツ editableRange の精度**: 初回は大まかな行範囲で設定し、Playwright テストで実際のガイドモード動作を確認してから微調整する。完璧な行範囲は不要 — フォールバック（全体編集可能）があるため。
- **M9 の Design Principles 監査**: v3roadmap02 の経験から、監査で FAIL が出た場合の修正工数を見込んでおく。FAIL 数が多い場合は別途修正タスクを追加する。
- **M7 T1 と M8 T6 の共通性**: 両方とも CodeEditor.tsx の extensions を拡張する。実装順序に注意し、T1（highlightLines）を先に実装してパターンを確立してから T6（editableLineRange）を実装すると効率的。ただし M7 と M8 は並列作業可能なため、同一セッションで両方を進める場合はコンフリクトに注意。
- **バンドルサイズ**: CodeMirror の Decoration 関連コードは `@codemirror/view` に含まれており追加パッケージ不要。バンドルサイズへの影響は最小限。

---

*v3roadmap04 完了により v3.0 の全マイルストーン（M1〜M9）のロードマップが完成。*

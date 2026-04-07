# v3roadmap01: v3.0 コア機能（M1〜M4）

**作成日**: 2026-04-04
**前提**: v2.1（Base Nook + レビュー反映）完了済み。main ブランチが最新。企画書 `docs/coden-v3.md` に基づく。
**スコープ**: M1（基盤構築）〜 M4（コードパズル）のコア機能4マイルストーン。M5〜M9 は別途 v3roadmap02 で扱う。

---

## 1. 背景

Coden の4段階学習フロー（Read/Practice/Test/Challenge）はモバイルで体験が破綻している。根本原因は Monaco Editor のモバイル非対応（GitHub Issue #246、2016年から未解決）。v3.0 では Monaco → CodeMirror 6 に全面移行し、モバイル専用 UI（コードパズル・コードツールバー）を導入することで「入力方法自体が学習段階に合わせて進化する」体験を実現する。

### 対象マイルストーン

| # | マイルストーン | 概要 | 依存 |
|---|-------------|------|------|
| M1 | 基盤構築 | CodeMirror 6 導入、共通フック、グローバル最適化、PWA メタ | — |
| M2 | エディタ移行 | Challenge / CodeDoctor / MiniProject の Monaco → CodeMirror 6 | M1 |
| M3 | コードツールバー | モバイル専用ツールバー（記号バー + キーワードサジェスト） | M2 |
| M4 | コードパズル | Test モードのモバイル UI（トークン組み立て） | M1 |

### 依存関係図

```
M1 (基盤) ───┬── M2 (エディタ移行) ── M3 (ツールバー)
             └── M4 (コードパズル)
```

M1 完了後、M2 と M4 は並列作業可能。M3 は M2 完了後に着手。

---

## 2. モデル判定基準

| 担当 | 基準 |
|------|------|
| `[Opus]` | 新規アーキテクチャ設計・ブラウザ API 差異対応・複雑なロジック設計 |
| `[Sonnet]` | 既存パターンの横展開・定型的なコード修正・設定変更 |
| `[手動]` | コード外の作業（Supabase ダッシュボード操作等） |

---

## 3. M1: 基盤構築

### 概要

CodeMirror 6 のパッケージ導入、共通コンポーネント・フックの作成、グローバルタッチ最適化、PWA メタ情報の追加。全後続マイルストーンの土台。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T1 | CodeMirror 6 パッケージ導入 + Vite 設定 | `[Sonnet]` | npm install + manualChunks 追加の定型作業 |
| T2 | CodeEditor 共通ラッパー作成 | `[Opus]` | PC/モバイル共通 API 設計 + CodeMirror 6 の拡張構成を決定する新規設計 |
| T3 | useIsMobile フック作成 | `[Sonnet]` | matchMedia の標準パターン、Tailwind md breakpoint 連動 |
| T4 | useKeyboardVisible フック作成 | `[Opus]` | VisualViewport API のブラウザ差異（iOS Safari/Android Chrome）対応が必要 |
| T5 | グローバルタッチ CSS 追加 | `[Sonnet]` | globals.css への CSS 追記のみ |
| T6 | PWA メタ情報 + manifest.json + アイコン生成 | `[Sonnet]` | 定型的な設定ファイル追加 + sharp-cli でリサイズ |
| T7 | サービスワーカー最小実装 | `[Sonnet]` | キャッシュ戦略のみの最小構成 |
| T8 | M1 テスト + CI 確認 | `[Sonnet]` | 新規フック・コンポーネントのユニットテスト |

### T1. CodeMirror 6 パッケージ導入 + Vite 設定 `[Sonnet]`

**理由**: npm install + manualChunks 追加の定型作業

**導入パッケージ**:

```bash
cd apps/web
npm install @codemirror/view @codemirror/state @codemirror/lang-javascript @codemirror/theme-one-dark @codemirror/autocomplete @uiw/react-codemirror
```

**Vite 設定変更** (`apps/web/vite.config.ts` L26-33):

```typescript
// Before:
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-monaco': ['@monaco-editor/react'],
  'vendor-markdown': ['react-markdown', 'remark-gfm'],
  'vendor-prism': ['prismjs'],
  'vendor-icons': ['lucide-react'],
}

// After:
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-monaco': ['@monaco-editor/react'],          // M2 完了時に削除
  'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/view', '@codemirror/state'],
  'vendor-markdown': ['react-markdown', 'remark-gfm'],
  'vendor-prism': ['prismjs'],
  'vendor-icons': ['lucide-react'],
}
```

**注意**: Monaco のチャンクは M2 完了まで残す（既存コンポーネントが依存中）。

**検証**: `npm run build`（チャンク分割確認）

---

### T2. CodeEditor 共通ラッパー作成 `[Opus]`

**理由**: PC/モバイル共通の API 設計 + CodeMirror 6 の拡張（言語・テーマ・readOnly・高さ）構成を決定する新規設計

**配置先**: `apps/web/src/components/CodeEditor/`

**ファイル構成**:

```
components/CodeEditor/
  CodeEditor.tsx          # CodeMirror 6 ラッパー（PC/モバイル共通）
  index.ts                # re-export
```

**CodeEditor Props**:

```typescript
interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: 'typescript' | 'javascript'  // default: 'typescript'
  readOnly?: boolean                       // default: false
  height?: string                          // default: レスポンシブ（後述）
  className?: string
  // M3 で追加予定: toolbarKeywords?: string[]
}
```

**設計要件**:
- `@uiw/react-codemirror` をベースに `oneDark` テーマ適用
- `@codemirror/lang-javascript` で TypeScript/JSX 対応
- `minimap` なし（CodeMirror 6 にはデフォルトで存在しない）
- `fontSize: 14` を CSS で適用
- `readOnly` 時は `EditorState.readOnly.of(true)` 拡張を追加
- 高さ: props 優先、未指定時は PC `400px` / モバイル `min(50vh, 300px)`（useIsMobile 連動）
- `Suspense` + フォールバック UI は呼び出し側の責務（ラッパー内には含めない）
- lazy import は **しない**（CodeMirror 6 は 300KB 程度で Monaco ほど重くない）

**既存 Monaco との互換**:
- `value` + `onChange` の制御コンポーネントパターンを維持
- `theme="vs-dark"` 相当の見た目を `oneDark` で再現
- `options={{ minimap: { enabled: false }, fontSize: 14 }}` 相当は拡張で対応

**検証**: Storybook 不使用のため、テストで基本レンダリングを確認

---

### T3. useIsMobile フック作成 `[Sonnet]`

**理由**: matchMedia の標準パターン、Tailwind md breakpoint（768px）連動

**配置先**: `apps/web/src/hooks/useIsMobile.ts`

**実装方針**:

```typescript
import { useState, useEffect } from 'react'

/** Tailwind の md breakpoint (768px) 未満かを判定する */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
```

**使用箇所（M2〜M4 で利用）**:
- `TestMode.tsx`: CodePuzzle / InlineInput の切替（M4）
- `ChallengeMode.tsx`: ツールバー表示制御（M3）
- `CodeDoctorPage.tsx`: ツールバー + バグ行ハイライト制御（M3）
- `MiniProjectDetailPage.tsx`: ガイドモード切替（M3）
- `CodeEditor.tsx`: 高さの動的切替（T2）

**テスト**: `matchMedia` モックで true/false 両ケース + リサイズイベント

---

### T4. useKeyboardVisible フック作成 `[Opus]`

**理由**: VisualViewport API のブラウザ差異（iOS Safari の resize イベントタイミング、Android Chrome の viewport 計算差異）対応が必要

**配置先**: `apps/web/src/hooks/useKeyboardVisible.ts`

**実装方針**:

```typescript
import { useState, useEffect } from 'react'

/** モバイルキーボードが表示されているかを判定する */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return  // デスクトップブラウザではスキップ

    const THRESHOLD = 150  // キーボード高さの最小閾値（px）

    const handler = () => {
      const keyboardHeight = window.innerHeight - vv.height
      setVisible(keyboardHeight > THRESHOLD)
    }

    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    return () => {
      vv.removeEventListener('resize', handler)
      vv.removeEventListener('scroll', handler)
    }
  }, [])

  return visible
}
```

**設計上の注意点**:
- iOS Safari: `visualViewport.resize` は keyboard show/hide で発火する
- Android Chrome: `resize` + `scroll` 両方を監視する必要がある
- 閾値 `150px` は一般的なモバイルキーボード高さの下限（実機テストで調整）
- デスクトップでは `visualViewport` が存在しても keyboard は開かないため常に `false`

**テスト**: `visualViewport` モックで resize イベント発火テスト

---

### T5. グローバルタッチ CSS 追加 `[Sonnet]`

**理由**: globals.css への CSS 追記のみ

**変更ファイル**: `apps/web/src/styles/globals.css`

**追加内容**（`@tailwind utilities` の後に追記）:

```css
/* v3.0: モバイルタッチ最適化 */
@layer base {
  /* ダブルタップズーム遅延を除去 */
  html {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* セーフエリア対応（ノッチ端末） */
  body {
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
}
```

**検証**: `npm run build`（CSS パース確認）

---

### T6. PWA メタ情報 + manifest.json + アイコン生成 `[Sonnet]`

**理由**: 定型的な設定ファイル追加 + sharp-cli でリサイズ

**新規ファイル**: `apps/web/public/manifest.json`

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

**index.html 変更** (`apps/web/index.html`):

```html
<!-- Before: -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- After: -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#2DD4A8" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**アイコン生成**（`coden_logo.png` から `sharp-cli` でリサイズ）:

```bash
mkdir -p apps/web/public/icons
npx sharp-cli -i apps/web/public/coden_logo.png -o apps/web/public/icons/icon-192.png resize 192 192
npx sharp-cli -i apps/web/public/coden_logo.png -o apps/web/public/icons/icon-512.png resize 512 512
```

**検証**: `npm run build` + ブラウザ DevTools Application タブで manifest 確認

---

### T7. サービスワーカー最小実装 `[Sonnet]`

**理由**: キャッシュ戦略のみの最小構成

**新規ファイル**: `apps/web/public/sw.js`

```javascript
const CACHE_NAME = 'coden-v3-shell'
const SHELL_URLS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Network-first: API やデータはキャッシュしない
  if (event.request.url.includes('/rest/') || event.request.url.includes('supabase')) return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
```

**SW 登録** (`apps/web/src/main.tsx` の末尾に追加):

```typescript
// サービスワーカー登録（本番のみ）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW 登録失敗は致命的でないため無視
    })
  })
}
```

**検証**: `npm run build` + `npx serve dist` でローカル確認

---

### T8. M1 テスト + CI 確認 `[Sonnet]`

**理由**: 新規フック・コンポーネントのユニットテスト追加は既存パターン準拠

**テスト対象**:

| ファイル | テストファイル | 主要ケース |
|---------|-------------|-----------|
| `useIsMobile.ts` | `hooks/__tests__/useIsMobile.test.ts` | 初期値判定、リサイズイベント切替 |
| `useKeyboardVisible.ts` | `hooks/__tests__/useKeyboardVisible.test.ts` | visualViewport 未対応時 false、resize イベント |
| `CodeEditor.tsx` | `components/CodeEditor/__tests__/CodeEditor.test.tsx` | 基本レンダリング、readOnly、onChange コールバック |

**CI 確認**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

**完了基準**: 既存 629 テスト全 PASS + 新規テスト追加

---

## 4. M2: エディタ移行

### 概要

ChallengeMode / CodeDoctorPage / MiniProjectDetailPage の Monaco Editor を M1 で作成した CodeEditor（CodeMirror 6）に置換する。この時点ではツールバーは未実装（M3）。PC/モバイル共に CodeMirror 6 で動作することを確認する。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T9 | ChallengeMode のエディタ移行 | `[Sonnet]` | Monaco → CodeEditor の置換は Props 対応表に従う定型作業 |
| T10 | CodeDoctorPage のエディタ移行 | `[Sonnet]` | 同上、height と scrollBeyondLastLine の差異のみ |
| T11 | MiniProjectDetailPage のエディタ移行 | `[Sonnet]` | 同上、height 差異のみ |
| T12 | Monaco パッケージ撤去 + Vite 設定更新 | `[Sonnet]` | npm uninstall + manualChunks 削除の定型作業 |
| T13 | ErrorBoundary / Suspense 整理 | `[Sonnet]` | lazy import 不要化に伴う簡素化 |
| T14 | M2 テスト + CI 確認 | `[Sonnet]` | 既存テスト全 PASS の確認が主 |

### T9. ChallengeMode のエディタ移行 `[Sonnet]`

**理由**: Monaco → CodeEditor の Props 対応表に従う定型置換

**変更ファイル**: `apps/web/src/features/learning/ChallengeMode.tsx`

**現状** (L9, L91-102):

```typescript
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// ...
<ErrorBoundary fallback={<div>...</div>}>
  <Suspense fallback={<div className="flex h-80 ...">...</div>}>
    <MonacoEditor
      height={MONACO_EDITOR_HEIGHT}     // '320px'
      defaultLanguage="typescript"
      theme="vs-dark"
      value={code}
      onChange={handleCodeChange}
      options={{ minimap: { enabled: false }, fontSize: 14 }}
    />
  </Suspense>
</ErrorBoundary>
```

**移行後**:

```typescript
import { CodeEditor } from '../../components/CodeEditor'

// ...
<CodeEditor
  value={code}
  onChange={handleCodeChange}
  language="typescript"
  height="320px"
/>
```

**Props 対応表**:

| Monaco | CodeEditor | 備考 |
|--------|-----------|------|
| `height={MONACO_EDITOR_HEIGHT}` | `height="320px"` | 定数展開。M3 でレスポンシブ化 |
| `defaultLanguage="typescript"` | `language="typescript"` | |
| `theme="vs-dark"` | — | oneDark がデフォルト |
| `value={code}` | `value={code}` | そのまま |
| `onChange={handleCodeChange}` | `onChange={handleCodeChange}` | 型互換確認 |
| `options={{ minimap: false, fontSize: 14 }}` | — | CodeEditor 内部で設定済み |

**注意**: `handleCodeChange` の型が `(value: string | undefined) => void` から `(value: string) => void` に変わる可能性。CodeEditor 側で `undefined` を空文字にフォールバックすること。

**検証**: `npm run typecheck && npm run test`

---

### T10. CodeDoctorPage のエディタ移行 `[Sonnet]`

**理由**: T9 と同パターン、height と scrollBeyondLastLine の差異のみ

**変更ファイル**: `apps/web/src/pages/CodeDoctorPage.tsx`

**現状** (L12, L204-220):

```typescript
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// ...
<Suspense fallback={<div className="flex h-80 ...">...</div>}>
  <MonacoEditor
    height="480px"
    defaultLanguage="typescript"
    theme="vs-dark"
    value={code}
    onChange={(val) => { setCode(val ?? ''); setResult(null) }}
    options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
  />
</Suspense>
```

**移行後**:

```typescript
import { CodeEditor } from '../components/CodeEditor'

// ...
<CodeEditor
  value={code}
  onChange={(val) => { setCode(val); setResult(null) }}
  language="typescript"
  height="480px"
/>
```

**注意**: `scrollBeyondLastLine: false` は CodeMirror 6 のデフォルト動作と同等（設定不要）。

**検証**: `npm run typecheck && npm run test`

---

### T11. MiniProjectDetailPage のエディタ移行 `[Sonnet]`

**理由**: T9/T10 と同パターン、height 差異のみ

**変更ファイル**: `apps/web/src/pages/MiniProjectDetailPage.tsx`

**現状** (L12, L171-189):

```typescript
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// ...
<Suspense fallback={<div className="flex h-96 ...">...</div>}>
  <MonacoEditor
    height="520px"
    defaultLanguage="typescript"
    theme="vs-dark"
    value={code}
    onChange={(val) => { setCode(val ?? ''); setMilestoneResults(null) }}
    options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
  />
</Suspense>
```

**移行後**:

```typescript
import { CodeEditor } from '../components/CodeEditor'

// ...
<CodeEditor
  value={code}
  onChange={(val) => { setCode(val); setMilestoneResults(null) }}
  language="typescript"
  height="520px"
/>
```

**検証**: `npm run typecheck && npm run test`

---

### T12. Monaco パッケージ撤去 + Vite 設定更新 `[Sonnet]`

**理由**: npm uninstall + manualChunks 削除の定型作業

**手順**:

```bash
cd apps/web
npm uninstall @monaco-editor/react
```

**Vite 設定変更** (`apps/web/vite.config.ts`):

```typescript
// 'vendor-monaco' チャンクを削除
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/view', '@codemirror/state'],
  'vendor-markdown': ['react-markdown', 'remark-gfm'],
  'vendor-prism': ['prismjs'],
  'vendor-icons': ['lucide-react'],
}
```

**MONACO_EDITOR_HEIGHT 定数** (`apps/web/src/shared/constants.ts` L51):
- 使用箇所が ChallengeMode のみで、T9 で直接値に変更済みなら削除
- 他に参照箇所があれば残す（Grep で確認）

**検証**: `npm run build`（Monaco 関連チャンクが消えていること + バンドルサイズ減少を確認）

---

### T13. ErrorBoundary / Suspense 整理 `[Sonnet]`

**理由**: lazy import 不要化に伴う Suspense ラッパーの簡素化

**変更内容**:

CodeMirror 6 は Monaco ほど重くないため lazy import を使わない（T2 の設計方針）。各コンポーネントから Monaco 用の `Suspense` + `ErrorBoundary` ラッパーを除去する。

| ファイル | 除去対象 |
|---------|---------|
| `ChallengeMode.tsx` | `ErrorBoundary` + `Suspense` ラッパー |
| `CodeDoctorPage.tsx` | `Suspense` ラッパー |
| `MiniProjectDetailPage.tsx` | `Suspense` ラッパー |

**注意**: `ErrorBoundary` は CodeEditor 内部ではなく呼び出し側で使う場合は残してもよい。ただし Monaco 固有のエラー（Web Worker 起動失敗等）が発生しなくなるため、基本的には不要。

**検証**: `npm run typecheck && npm run test`

---

### T14. M2 テスト + CI 確認 `[Sonnet]`

**理由**: 既存テスト全 PASS の確認が主

**確認内容**:

- 既存 629 テスト全 PASS
- ChallengeMode / CodeDoctorPage / MiniProjectDetailPage の既存テストが Monaco モックではなく CodeEditor で動作すること
- `@monaco-editor/react` の vi.mock が残っていれば CodeEditor のモックに更新

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

**バンドルサイズ比較**: `npm run build` 出力で Monaco チャンク消滅 + CodeMirror チャンク追加を確認。総バンドルサイズの減少を記録。

---

## 5. M3: コードツールバー

### 概要

モバイル専用のコードツールバーを作成し、Challenge / CodeDoctor / MiniProject に統合する。上段は記号バー（全ステップ共通）、下段はステップ固有のキーワードサジェスト。キーボード表示時のみ表示。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T15 | CodeToolbar コンポーネント作成 | `[Opus]` | 記号ペア挿入ロジック + キーワードサジェスト生成の新規設計 |
| T16 | CodeEditor へのツールバー統合 | `[Opus]` | CodeMirror 6 の EditorView API 経由でカーソル位置挿入を実装する設計判断 |
| T17 | ChallengeMode へのツールバー統合 | `[Sonnet]` | expectedKeywords を toolbarKeywords に渡す接続作業 |
| T18 | CodeDoctorPage へのツールバー統合 | `[Sonnet]` | requiredKeywords を toolbarKeywords に渡す接続作業 |
| T19 | MiniProjectDetailPage へのツールバー統合 | `[Sonnet]` | マイルストーンの requiredKeywords を渡す接続作業 |
| T20 | エディタ高さのレスポンシブ化 | `[Sonnet]` | useIsMobile で高さを切替える定型修正 |
| T21 | M3 テスト + CI 確認 | `[Sonnet]` | CodeToolbar のユニットテスト + 既存テスト全 PASS |

### T15. CodeToolbar コンポーネント作成 `[Opus]`

**理由**: 記号ペア挿入ロジック（`{}` → カーソル中央配置）+ キーワードサジェスト生成ロジックの新規設計

**配置先**: `apps/web/src/components/CodeEditor/CodeToolbar.tsx`

**Props**:

```typescript
interface CodeToolbarProps {
  keywords?: string[]               // ステップ固有キーワード
  onInsert: (text: string) => void  // カーソル位置に挿入するコールバック
}
```

**UI 構造**:

```
┌──────────────────────────────────────────────┐
│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐   │  ← 記号バー（横スクロール）
│ │{}││()││[]││=>││ ; ││ : ││ = ││""││''││``│   │
│ └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘   │
│ ┌────────┐┌────────┐┌──────┐┌────────┐      │  ← キーワード（flex-wrap）
│ │useState││setCount ││return││onClick │      │
│ └────────┘└────────┘└──────┘└────────┘      │
└──────────────────────────────────────────────┘
```

**記号バー定数**:

```typescript
const SYMBOL_PAIRS: Array<{ label: string; insert: string; cursorOffset?: number }> = [
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '=>', insert: '=> ' },
  { label: ';', insert: ';' },
  { label: ':', insert: ': ' },
  { label: '=', insert: '= ' },
  { label: '" "', insert: '""', cursorOffset: 1 },
  { label: "' '", insert: "''", cursorOffset: 1 },
  { label: '` `', insert: '``', cursorOffset: 1 },
  { label: '//', insert: '// ' },
]
```

**ペア挿入**: `cursorOffset` が指定されている場合、挿入後にカーソルを offset 分戻す。この制御は `onInsert` コールバック経由で CodeEditor が処理する（T16）。

**キーワードサジェスト**:

```typescript
const REACT_COMMON_KEYWORDS = [
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'return', 'export', 'import', 'function', 'const',
]

// keywords prop + REACT_COMMON_KEYWORDS から重複排除して最大 8 個
const suggestions = [...new Set([...(keywords ?? []), ...REACT_COMMON_KEYWORDS])].slice(0, 8)
```

**表示条件**: `useIsMobile() && useKeyboardVisible()` が両方 true のとき

**スタイル**:
- 記号バー: `overflow-x-auto` で横スクロール、各ボタン `min-w-[44px] min-h-[44px]`（タップターゲット確保）
- キーワード: `flex flex-wrap gap-1.5`、各ボタン `px-3 py-2 text-sm rounded-lg bg-slate-700 text-slate-200`
- コンテナ: `sticky bottom-0 bg-slate-800 border-t border-slate-600 px-2 py-1.5`

---

### T16. CodeEditor へのツールバー統合 `[Opus]`

**理由**: CodeMirror 6 の EditorView API（`dispatch` + `replaceSelection`）経由でカーソル位置への文字列挿入を実装する設計判断が必要

**変更ファイル**: `apps/web/src/components/CodeEditor/CodeEditor.tsx`

**追加 Props**:

```typescript
interface CodeEditorProps {
  // ... 既存
  toolbarKeywords?: string[]  // 指定時にモバイルツールバーを表示
}
```

**挿入ロジック**:

```typescript
// EditorView の ref を保持
const viewRef = useRef<EditorView | null>(null)

const handleInsert = useCallback((text: string, cursorOffset?: number) => {
  const view = viewRef.current
  if (!view) return

  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length - (cursorOffset ?? 0) },
  })
  view.focus()
}, [])
```

**CodeToolbar の配置**: CodeEditor の直下（エディタとキーボードの間）に表示

```tsx
<div className="flex flex-col">
  <ReactCodeMirror ... />
  {isMobile && toolbarKeywords && (
    <CodeToolbar keywords={toolbarKeywords} onInsert={handleInsert} />
  )}
</div>
```

**検証**: 記号ペア挿入のカーソル位置テスト

---

### T17. ChallengeMode へのツールバー統合 `[Sonnet]`

**理由**: expectedKeywords を toolbarKeywords Props に渡す接続作業

**変更ファイル**: `apps/web/src/features/learning/ChallengeMode.tsx`

**変更内容**:

```typescript
// 現在の pattern から expectedKeywords を取得して渡す
<CodeEditor
  value={code}
  onChange={handleCodeChange}
  language="typescript"
  height="320px"
  toolbarKeywords={currentPattern.expectedKeywords}
/>
```

**高さ**: T20 でレスポンシブ化するため、この時点では固定値のまま。

**検証**: `npm run typecheck && npm run test`

---

### T18. CodeDoctorPage へのツールバー統合 `[Sonnet]`

**理由**: requiredKeywords を toolbarKeywords Props に渡す接続作業

**変更ファイル**: `apps/web/src/pages/CodeDoctorPage.tsx`

**変更内容**:

```typescript
<CodeEditor
  value={code}
  onChange={(val) => { setCode(val); setResult(null) }}
  language="typescript"
  height="480px"
  toolbarKeywords={selectedProblem?.requiredKeywords}
/>
```

**検証**: `npm run typecheck && npm run test`

---

### T19. MiniProjectDetailPage へのツールバー統合 `[Sonnet]`

**理由**: 現在のマイルストーンの requiredKeywords を渡す接続作業

**変更ファイル**: `apps/web/src/pages/MiniProjectDetailPage.tsx`

**変更内容**:

```typescript
// 現在のマイルストーンの requiredKeywords を取得
const currentMilestoneKeywords = project.milestones[currentMilestoneIndex]?.requiredKeywords ?? []

<CodeEditor
  value={code}
  onChange={(val) => { setCode(val); setMilestoneResults(null) }}
  language="typescript"
  height="520px"
  toolbarKeywords={currentMilestoneKeywords}
/>
```

**注意**: `currentMilestoneIndex` は既存の milestoneResults から未達成の最初のインデックスを算出。ロジックは既存の `calcStatus` / `milestoneResults` から導出可能。

**検証**: `npm run typecheck && npm run test`

---

### T20. エディタ高さのレスポンシブ化 `[Sonnet]`

**理由**: useIsMobile で高さを切替える定型修正

**変更内容**: 各コンポーネントのエディタ高さをモバイル対応に変更

| コンポーネント | PC | モバイル |
|--------------|-----|--------|
| ChallengeMode | `320px` | `min(50vh, 300px)` |
| CodeDoctorPage | `480px` | `min(50vh, 300px)` |
| MiniProjectDetailPage | `520px` | `min(50vh, 300px)` |

**実装パターン**:

```typescript
const isMobile = useIsMobile()
const editorHeight = isMobile ? 'min(50vh, 300px)' : '320px'  // PC 値はコンポーネントごと

<CodeEditor height={editorHeight} ... />
```

**代替案**: CodeEditor 内部で useIsMobile を使い、height 未指定時にデフォルトを自動切替する。ただし呼び出し側で明示するほうが透明性が高い。

**検証**: Playwright で 375px / 768px の高さ差を確認

---

### T21. M3 テスト + CI 確認 `[Sonnet]`

**理由**: CodeToolbar のユニットテスト + 既存テスト全 PASS 確認

**テスト対象**:

| ファイル | テストファイル | 主要ケース |
|---------|-------------|-----------|
| `CodeToolbar.tsx` | `CodeEditor/__tests__/CodeToolbar.test.tsx` | 記号タップで onInsert 発火、キーワード表示、最大8個制限 |

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 6. M4: コードパズル

### 概要

Test モードのモバイル専用 UI を作成する。PC は従来のインライン入力を維持し、スマホ（md 未満）ではコードトークンの組み立て UI に切り替える。

### タスク一覧

| # | タスク | 担当 | 理由 |
|---|--------|------|------|
| T22 | useTokenGenerator フック作成 | `[Opus]` | expectedKeywords からトークン分割 + ダミー生成の新規アルゴリズム設計 |
| T23 | Token コンポーネント作成 | `[Sonnet]` | タップ可能なボタンの定型 UI |
| T24 | TokenPool コンポーネント作成 | `[Sonnet]` | Token の flex-wrap コンテナ |
| T25 | AssemblyArea コンポーネント作成 | `[Sonnet]` | 組み立てエリアの定型 UI（Token 再利用） |
| T26 | CodeContext コンポーネント作成 | `[Sonnet]` | starterCode の読み取り専用表示（Prism.js ハイライト） |
| T27 | CodePuzzle コンテナ作成 | `[Opus]` | 全サブコンポーネントの統合 + 判定ロジック接続の設計 |
| T28 | TestMode の PC/モバイル分岐 | `[Sonnet]` | useIsMobile による条件分岐の定型実装 |
| T29 | M4 テスト + CI 確認 | `[Sonnet]` | 全コンポーネントのテスト + 既存テスト全 PASS |

### T22. useTokenGenerator フック作成 `[Opus]`

**理由**: expectedKeywords からのトークン分割（記号・空白の境界判定）+ ダミートークン生成（紛らわしいが正解にならない）の新規アルゴリズム設計

**配置先**: `apps/web/src/features/learning/CodePuzzle/useTokenGenerator.ts`

**入力**:

```typescript
interface TokenGeneratorInput {
  starterCode: string         // "... onClick={() => ____} ..."
  expectedKeywords: string[]  // ['setCount', 'count - 1']
  mobilePuzzle?: {            // オプション: コンテンツ作者が手動指定
    correctTokens: string[]
    distractorTokens: string[]
  }
}
```

**出力**:

```typescript
interface TokenGeneratorOutput {
  correctTokens: string[]     // 正解トークン列（順序付き）
  distractorTokens: string[]  // ダミートークン
  allTokens: string[]         // シャッフル済み全トークン
}
```

**自動生成ロジック**（`mobilePuzzle` 未指定時）:

```typescript
function generateTokens(input: TokenGeneratorInput): TokenGeneratorOutput {
  // 1. expectedKeywords を結合して期待される回答を推定
  const expectedAnswer = input.expectedKeywords.join('')

  // 2. トークン化: 記号・空白境界で分割
  //    'setCount(count - 1)' → ['setCount', '(', 'count', '-', '1', ')']
  const correctTokens = tokenize(expectedAnswer)

  // 3. ダミー生成: 紛らわしいトークンを生成
  const distractorTokens = generateDistractors(correctTokens, input.starterCode)

  // 4. シャッフル
  const allTokens = shuffle([...correctTokens, ...distractorTokens])

  return { correctTokens, distractorTokens, allTokens }
}
```

**トークン化ルール** (`tokenize`):
- 識別子（連続する英数字 + `_`）は1トークン
- 記号（`(`, `)`, `{`, `}`, `[`, `]`, `=>`, `===`, `!==` 等）は1トークン
- 空白・改行はトークンに含めない（表示時に自動で空白を補完）
- ドット記法（`todo.id`）は1トークンとして扱う

**ダミー生成ルール** (`generateDistractors`):
- 正解トークンの類似語: `setCount` → `setState`, `Count`
- 正解トークンの演算子反転: `-` → `+`
- 正解トークンの数値隣接: `1` → `0`, `2`
- コンテキストに登場する無関係な識別子
- ダミー数 = 正解トークン数の 50〜100%（最低3個、最大正解数と同数）

**注意**: ダミー生成の品質は学習体験に直結するため、代表的なコンテンツ（`usestate-basic`, `events`, `conditional`）で動作確認する。

---

### T23. Token コンポーネント作成 `[Sonnet]`

**理由**: タップ可能なボタンの定型 UI コンポーネント

**配置先**: `apps/web/src/features/learning/CodePuzzle/Token.tsx`

**Props**:

```typescript
interface TokenProps {
  text: string
  onClick: () => void
  variant: 'pool' | 'assembled'  // プール内 or 組み立てエリア内
  disabled?: boolean
}
```

**スタイル**:
- `pool`: `bg-slate-700 text-emerald-300 border border-slate-500 rounded-lg px-3 py-2 font-mono text-sm`
- `assembled`: `bg-emerald-800/30 text-emerald-300 border border-emerald-500/50 rounded-lg px-3 py-2 font-mono text-sm`
- 共通: `min-h-[44px] min-w-[44px]`（タップターゲット確保）
- `disabled`: `opacity-50 cursor-not-allowed`

---

### T24. TokenPool コンポーネント作成 `[Sonnet]`

**理由**: Token の flex-wrap コンテナ

**配置先**: `apps/web/src/features/learning/CodePuzzle/TokenPool.tsx`

**Props**:

```typescript
interface TokenPoolProps {
  tokens: string[]
  usedTokens: Set<number>        // 使用済みトークンのインデックス
  onTokenTap: (index: number) => void
}
```

**UI**: `flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg` + 「使えるパーツ」ヘッダー

---

### T25. AssemblyArea コンポーネント作成 `[Sonnet]`

**理由**: 組み立てエリアの定型 UI（Token コンポーネント再利用）

**配置先**: `apps/web/src/features/learning/CodePuzzle/AssemblyArea.tsx`

**Props**:

```typescript
interface AssemblyAreaProps {
  tokens: string[]               // 組み立て済みトークン列
  onTokenTap: (index: number) => void  // タップで取り消し
}
```

**UI**:
- 空の状態: 破線ボーダー + 「パーツをタップして組み立てよう」プレースホルダー
- トークンあり: `flex flex-wrap gap-1.5 p-3 min-h-[60px] bg-slate-900/50 rounded-lg border border-slate-600`

---

### T26. CodeContext コンポーネント作成 `[Sonnet]`

**理由**: starterCode の読み取り専用表示は Prism.js ハイライトの既存パターン

**配置先**: `apps/web/src/features/learning/CodePuzzle/CodeContext.tsx`

**Props**:

```typescript
interface CodeContextProps {
  code: string          // starterCode（____ を含む）
  blankLabel?: string   // 空欄部分の表示ラベル（default: '▼ ここを組み立て'）
}
```

**表示**:
- `starterCode` を `____` で分割し、前半・後半を Prism.js でハイライト表示
- `____` 部分を AssemblyArea の位置インジケーターとして表示
- `overflow-x-auto` で横スクロール対応
- `font-mono text-sm bg-slate-900 rounded-lg p-3`

---

### T27. CodePuzzle コンテナ作成 `[Opus]`

**理由**: 全サブコンポーネントの統合 + トークン状態管理（追加・取り消し・シャッフル）+ 既存 expectedKeywords 判定ロジックへの接続設計

**配置先**: `apps/web/src/features/learning/CodePuzzle/CodePuzzle.tsx`

**Props**:

```typescript
interface CodePuzzleProps {
  task: TestTask
  onSubmit: (mergedCode: string) => void  // 既存の判定ロジックに接続
}
```

**内部状態**:

```typescript
const [assembledTokens, setAssembledTokens] = useState<string[]>([])
const [usedPoolIndices, setUsedPoolIndices] = useState<Set<number>>(new Set())
const { correctTokens, distractorTokens, allTokens } = useTokenGenerator({
  starterCode: task.starterCode,
  expectedKeywords: task.expectedKeywords,
  mobilePuzzle: task.mobilePuzzle,
})
```

**インタラクション**:
1. プールのトークンをタップ → `assembledTokens` に追加 + `usedPoolIndices` に追記
2. 組み立てエリアのトークンをタップ → `assembledTokens` から除去 + `usedPoolIndices` から除去
3. 「判定する」タップ → `assembledTokens.join(' ')` を `starterCode` の `____` に埋めて `onSubmit` に渡す

**レンダリング構成**:

```tsx
<div className="flex flex-col gap-3">
  <p className="font-medium text-text-dark">{task.instruction}</p>
  <CodeContext code={task.starterCode} />
  <AssemblyArea tokens={assembledTokens} onTokenTap={handleRemoveToken} />
  <TokenPool tokens={allTokens} usedTokens={usedPoolIndices} onTokenTap={handleAddToken} />
  <button onClick={handleSubmit} className="...">判定する</button>
</div>
```

**判定接続**: `onSubmit` で渡された `mergedCode` は既存 TestMode の `expectedKeywords` チェックロジックにそのまま流れる。CodePuzzle 自体は判定ロジックを持たない。

---

### T28. TestMode の PC/モバイル分岐 `[Sonnet]`

**理由**: useIsMobile による条件分岐は定型実装

**変更ファイル**: `apps/web/src/features/learning/TestMode.tsx`

**変更内容**:

```typescript
import { useIsMobile } from '../../hooks/useIsMobile'
import { CodePuzzle } from './CodePuzzle/CodePuzzle'

// ...
const isMobile = useIsMobile()

// レンダリング
return isMobile
  ? <CodePuzzle task={testTask} onSubmit={handlePuzzleSubmit} />
  : (/* 既存のインライン入力 UI をそのまま維持 */)
```

**handlePuzzleSubmit の接続**:

```typescript
const handlePuzzleSubmit = (mergedCode: string) => {
  // 既存の判定ロジックを流用
  const isCorrect = task.expectedKeywords.every((kw) =>
    mergedCode.toLowerCase().includes(kw.toLowerCase()),
  )
  // 既存の結果表示ロジックに接続
  onSubmitResult(isCorrect)
}
```

**注意**: 既存の `handleInputChange` / `handleSubmit` / `mergedCode` ロジック（L22-48）は PC 用としてそのまま残す。

**検証**: `npm run typecheck && npm run test`

---

### T29. M4 テスト + CI 確認 `[Sonnet]`

**理由**: 全コンポーネントのテスト追加 + 既存テスト全 PASS 確認

**テスト対象**:

| ファイル | テストファイル | 主要ケース |
|---------|-------------|-----------|
| `useTokenGenerator.ts` | `CodePuzzle/__tests__/useTokenGenerator.test.ts` | 自動トークン化、ダミー生成数、mobilePuzzle 優先、シャッフル |
| `Token.tsx` | `CodePuzzle/__tests__/Token.test.tsx` | タップでクリック発火、variant 切替 |
| `CodePuzzle.tsx` | `CodePuzzle/__tests__/CodePuzzle.test.tsx` | トークン追加→組み立て→判定の統合テスト |
| `TestMode.tsx` | 既存テスト更新 | モバイル時に CodePuzzle が表示されること |

**代表コンテンツでの動作確認**:

| ステップ | expectedKeywords | 期待されるトークン化 |
|---------|-----------------|-------------------|
| `usestate-basic` | `['setCount', 'count + 1']` | `['setCount', '(', 'count', '+', '1', ')']` |
| `events` | `['onClick', 'handleClick']` | `['onClick', '=', '{', 'handleClick', '}']` |
| `conditional` | `['isLoggedIn', '&&']` | `['isLoggedIn', '&&']` |

**CI**:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 7. ブランチ戦略

```
main (v2.1)
 └── dev
      ├── v3/m1-foundation          ← M1: 基盤構築
      │    ├── v3/m1_t1-codemirror-packages
      │    ├── v3/m1_t2-code-editor
      │    ├── v3/m1_t3-t4-hooks
      │    ├── v3/m1_t5-touch-css
      │    ├── v3/m1_t6-t7-pwa
      │    └── v3/m1_t8-tests
      │    → PR → dev
      │
      ├── v3/m2-editor-migration    ← M2: エディタ移行
      │    ├── v3/m2_t9-t11-migration
      │    ├── v3/m2_t12-remove-monaco
      │    └── v3/m2_t13-t14-cleanup
      │    → PR → dev
      │
      ├── v3/m3-code-toolbar        ← M3: コードツールバー
      │    ├── v3/m3_t15-t16-toolbar-core
      │    ├── v3/m3_t17-t19-integration
      │    └── v3/m3_t20-t21-responsive
      │    → PR → dev
      │
      └── v3/m4-code-puzzle         ← M4: コードパズル（M2と並列可）
           ├── v3/m4_t22-token-generator
           ├── v3/m4_t23-t26-sub-components
           ├── v3/m4_t27-puzzle-container
           └── v3/m4_t28-t29-integration
           → PR → dev
```

タスクブランチはローカルでマイルストーンブランチにマージしてから次のタスクブランチを作成する（v2 M9 で確立したパターン）。

---

## 8. 完了条件

### M1: 基盤構築

- [x] T1: CodeMirror 6 パッケージがインストールされ、Vite チャンク設定が完了 `[Sonnet]`
- [x] T2: CodeEditor コンポーネントが作成され、基本レンダリング・readOnly・onChange が動作 `[Opus]`
- [x] T3: useIsMobile フックが md 未満を正しく判定 `[Sonnet]`
- [x] T4: useKeyboardVisible フックが VisualViewport API でキーボード検出 `[Opus]`
- [x] T5: touch-action: manipulation がグローバル適用 `[Sonnet]`
- [x] T6: manifest.json + meta タグ + apple-touch-icon + アイコン生成が完了 `[Sonnet]`
- [x] T7: サービスワーカーが登録され、アプリシェルをキャッシュ `[Sonnet]`
- [x] T8: 新規フック・コンポーネントのテストが存在し、CI 全通過 `[Sonnet]`

### M2: エディタ移行

- [x] T9: ChallengeMode が CodeEditor（CodeMirror 6）で動作 `[Sonnet]`
- [x] T10: CodeDoctorPage が CodeEditor で動作 `[Sonnet]`
- [x] T11: MiniProjectDetailPage が CodeEditor で動作 `[Sonnet]`
- [x] T12: Monaco パッケージが撤去され、vendor-monaco チャンクが消滅 `[Sonnet]`
- [x] T13: 不要な Suspense/ErrorBoundary が除去 `[Sonnet]`
- [x] T14: 既存テスト全 PASS + バンドルサイズ減少を確認 `[Sonnet]`

### M3: コードツールバー

- [x] T15: CodeToolbar が記号バー + キーワードサジェストを表示 `[Opus]`
- [x] T16: CodeEditor からカーソル位置に文字列挿入が動作 `[Opus]`
- [x] T17: ChallengeMode でモバイル時にツールバーが表示 `[Sonnet]`
- [x] T18: CodeDoctorPage でモバイル時にツールバーが表示 `[Sonnet]`
- [x] T19: MiniProjectDetailPage でモバイル時にツールバーが表示 `[Sonnet]`
- [x] T20: エディタ高さがモバイル / PC で適切に切替 `[Sonnet]`
- [x] T21: CodeToolbar のテストが存在し、CI 全通過 `[Sonnet]`

### M4: コードパズル

- [x] T22: useTokenGenerator が expectedKeywords から正解 + ダミートークンを生成 `[Opus]`
- [x] T23: Token コンポーネントがタップ操作に対応 `[Sonnet]`
- [x] T24: TokenPool がトークン一覧を表示し、使用済みをグレーアウト `[Sonnet]`
- [x] T25: AssemblyArea が組み立て済みトークンを表示し、タップで取り消し `[Sonnet]`
- [x] T26: CodeContext が starterCode を読み取り専用でハイライト表示 `[Sonnet]`
- [x] T27: CodePuzzle が全サブコンポーネントを統合し、判定ロジックに接続 `[Opus]`
- [x] T28: TestMode がモバイル時に CodePuzzle、PC 時にインライン入力を表示 `[Sonnet]`
- [x] T29: 全コンポーネントのテストが存在し、CI 全通過 `[Sonnet]`

### 品質ゲート

- [ ] `typecheck` / `lint` / `test` / `build` 全通過（各マイルストーン完了時）
- [ ] 既存テスト 629 件全 PASS 維持
- [ ] Playwright で 375px / 390px / 768px のスクリーンショット検証（M3, M4 完了時）

---

## 9. 注意事項

- **M2 と M4 の並列作業**: M2（エディタ移行）と M4（コードパズル）は M1 完了後に並列着手可能。ただし M4 は Monaco に依存しないため、M2 の Monaco 撤去と競合しない。
- **T2 の API 設計が全体に波及**: CodeEditor の Props 設計（T2）は M2〜M3 の全タスクに影響する。T2 を慎重に設計し、M2 のタスク着手前に API を確定させること。
- **T22 のトークン化品質**: ダミートークン生成の品質が学習体験に直結する。代表的な3ステップ（`usestate-basic`, `events`, `conditional`）で手動確認してから全ステップに展開する。
- **Monaco のテストモック**: 既存テストで `@monaco-editor/react` を `vi.mock` している箇所は M2 で CodeEditor のモックに更新が必要。
- **サービスワーカーのキャッシュ**: 開発中は SW が古いキャッシュを返す問題が起きやすい。開発サーバーでは SW を登録しない（`import.meta.env.PROD` ガード済み）。
- **PWA アイコン**: `npx sharp-cli` で `coden_logo.png` からリサイズ生成する（T6 に統合済み）。`sharp-cli` は devDependencies に追加不要（npx 経由で実行）。

---

*M5〜M9（学習フロー調整・練習モード調整・コードドクター拡張・ミニプロジェクト拡張・QA）は v3roadmap02 で扱う。*

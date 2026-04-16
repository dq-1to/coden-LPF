import type { LearningStepContent } from '@/content/fundamentals/steps'

export const concurrentFeaturesStep: LearningStepContent = {
  id: 'concurrent-features',
  order: 33,
  title: 'Concurrent Features',
  summary: 'useTransition・useDeferredValue・startTransitionを使い、UIの応答性を保ちながら重い更新を非緊急として処理する方法を学ぶ。',
  readMarkdown: `# Concurrent Features

## Concurrent モードとは

React の Concurrent 機能を使うと、**緊急度の高い更新と低い更新を分離**できます。ユーザー入力（高優先度）を妨げずに、重いレンダリング（低優先度）をバックグラウンドで処理できます。

## useTransition — 非緊急な更新を遅延する

\`useTransition\` は、UI をブロックせずに state を更新できるフックです。

\`\`\`jsx
import { useState, useTransition } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    // 入力欄の更新は即時（緊急）
    setQuery(e.target.value)

    // 重い検索結果の更新は非緊急
    startTransition(() => {
      setResults(searchItems(e.target.value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? (
        <p>検索中...</p>
      ) : (
        <ul>{results.map(item => <li key={item.id}>{item.name}</li>)}</ul>
      )}
    </div>
  )
}
\`\`\`

\`isPending\` は transition が処理中のときに \`true\` になります。これを使ってローディング表示を制御できます。

## useDeferredValue — 値を遅延させる

\`useDeferredValue\` は、値の更新を遅延させ、古い値を保持しながら新しい値でレンダリングします。props や外部から来る値に使います。

\`\`\`jsx
import { useState, useDeferredValue, memo } from 'react'

const HeavyList = memo(function HeavyList({ query }) {
  // 重い処理（実際には多数のアイテム計算）
  const items = filterItems(query)
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
})

function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* deferredQuery は遅延した値（古い値）を保持 */}
      <HeavyList query={deferredQuery} />
    </div>
  )
}
\`\`\`

入力中は \`deferredQuery\` が古い値のままになるため、\`HeavyList\` の再レンダリングが遅延されます。

## useTransition と useDeferredValue の使い分け

| フック | 使う場面 | 更新をコントロールする場所 |
|--------|---------|------------------------|
| \`useTransition\` | 自分が state の更新を制御できるとき | setState 呼び出し側 |
| \`useDeferredValue\` | props や外部の値を受け取るとき | 値を使うコンポーネント側 |

## startTransition — フック外での使用

\`useTransition\` が使えない場所（React ツリー外など）では、直接 \`startTransition\` をインポートできます。

\`\`\`jsx
import { startTransition } from 'react'

// イベントハンドラの外など
startTransition(() => {
  setHeavyState(newValue)
})
\`\`\`

## memo との組み合わせ

\`useDeferredValue\` は \`memo\` と組み合わせることで最大の効果を発揮します。遅延した値で重いコンポーネントのレンダリングをスキップできます。

\`\`\`jsx
const SlowList = memo(function SlowList({ text }) {
  // text が変わらないときは再レンダリングしない
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    text: text ? \`\${text} \${i}\` : \`Item \${i}\`,
  }))
  return <ul>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
})
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`const [isPending, startTransition] = useTransition()` — `isPending` はいつ `true` になる？',
      answer: 'transition が処理中のとき',
      hint: '「保留中」を意味する英単語です。',
      explanation: 'isPending は startTransition に渡した関数内の state 更新が完了するまで true になります。これを使ってローディング表示を出せます。',
      choices: ['transition が処理中のとき', 'コンポーネントが初回マウントされたとき', 'エラーが発生したとき', 'データ取得中のとき'],
    },
    {
      id: 'q2',
      prompt: '`startTransition(() => { setState(newValue) })` でラップした更新の優先度は？',
      answer: '低優先度（非緊急）',
      hint: 'ユーザー入力より後回しにされます。',
      explanation: 'startTransition でラップされた更新は「非緊急」として扱われます。ユーザーのタイピングなど緊急度の高い更新が優先されます。',
      choices: ['低優先度（非緊急）', '高優先度（緊急）', '通常の優先度', 'バックグラウンド処理'],
    },
    {
      id: 'q3',
      prompt: '`useDeferredValue` は自分が state 更新を制御「できない」場合（外から受け取る props など）に使う。正しい？',
      answer: '正しい',
      hint: 'useTransition と useDeferredValue の使い分けがポイントです。',
      explanation: 'useTransition は setState を自分で呼び出す場合に使います。useDeferredValue は外部から受け取った値（props など）を遅延させる場合に使います。',
      choices: ['正しい', '誤り（useTransition を使う）', '誤り（どちらでも同じ）', '誤り（memo を使う）'],
    },
    {
      id: 'q4',
      prompt: '`useDeferredValue` と組み合わせると最も効果的なフック/APIは？',
      answer: 'memo',
      hint: '「遅延した値が変わらないときはスキップする」仕組みが必要です。',
      explanation: 'useDeferredValue で遅延した値を memo でラップしたコンポーネントに渡すと、値が変わらない間は再レンダリングをスキップできます。両方の組み合わせで最大効果を発揮します。',
      choices: ['memo', 'useCallback', 'useMemo', 'useRef'],
    },
    {
      id: 'q5',
      prompt: '`useTransition` が使えない場所（React ツリー外）で使える代替は？',
      answer: 'startTransition（react から直接インポート）',
      hint: '同名の関数を直接 import できます。',
      explanation: 'react パッケージから startTransition を直接インポートして使えます。useTransition フックが使えない場所（Redux ミドルウェアなど）で役立ちます。',
      choices: ['startTransition（react から直接インポート）', 'setTimeout', 'requestIdleCallback', 'flushSync'],
    },
  ],
  testTask: {
    instruction: '入力とリスト更新を分離してください。`setQuery` は即時更新し、重い `setResults` の呼び出しを `startTransition` でラップします。',
    starterCode: `import { useState, useTransition } from 'react'

function SearchPage({ searchItems }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, ____] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value)
    ____(____) {
      setResults(searchItems(e.target.value))
    })
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <p>検索中...</p> : <ul>{results.map(r => <li key={r}>{r}</li>)}</ul>}
    </div>
  )
}`,
    expectedKeywords: ['startTransition'],
    explanation: 'useTransition から [isPending, startTransition] を取得し、重い更新を startTransition(() => { ... }) でラップします。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'concurrent-features-1',
        prompt: 'useTransition を使って検索UIを改善してください。',
        requirements: [
          'useTransition を使って入力（緊急）と検索結果（非緊急）を分離する',
          'isPending が true のとき検索結果欄を半透明（opacity-50 など）にする',
          '検索結果は 500件 のダミーデータをフィルタリングする重い処理とする',
          '入力中もUIがスムーズに動くことを確認する',
        ],
        hints: [
          'setQuery は startTransition の外に置きます（緊急更新）',
          'setResults は startTransition の中に置きます（非緊急更新）',
          'isPending を使って検索結果のスタイルを動的に変えます',
        ],
        expectedKeywords: ['useTransition', 'startTransition', 'isPending'],
        starterCode: `import { useState, useTransition } from 'react'

const ITEMS = Array.from({ length: 500 }, (_, i) => ({ id: i, name: \`Item \${i}\` }))

function SearchApp() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(ITEMS)
  // TODO: useTransition を使う

  function handleChange(e) {
    // TODO: 緊急更新と非緊急更新を分離
  }

  return (
    <div>
      <input value={query} onChange={handleChange} placeholder="検索..." />
      {/* TODO: isPending で opacity を変える */}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState, useTransition } from 'react'\n\nconst ITEMS = Array.from({ length: 500 }, (_, i) => ({ id: i, name: "Item " + i }))\n\nfunction SearchApp() {\n  const [query, setQuery] = useState('')\n  const [results, setResults] = useState(ITEMS)\n  ____0\n\n  function handleChange(e) {\n    ____1\n  }\n\n  return (\n    <div>\n      <input value={query} onChange={handleChange} placeholder="検索..." />\n      <ul className={isPending ? 'opacity-50' : ''}>\n        {results.map(item => (\n          <li key={item.id}>{item.name}</li>\n        ))}\n      </ul>\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'use-transition',
                label: 'useTransition',
                correctTokens: ['const', '[isPending, startTransition]', '=', 'useTransition()'],
                distractorTokens: ['useDeferredValue', 'useState', 'useCallback', 'useMemo'],
              },
              {
                id: 'handle-change',
                label: 'handleChange',
                correctTokens: ['setQuery(e.target.value)', 'startTransition', '(', '() =>', '{', 'setResults(ITEMS.filter(item => item.name.includes(e.target.value)))', '}', ')'],
                distractorTokens: ['useDeferredValue', 'useCallback', 'setTimeout', 'useMemo'],
              },
            ],
          },
      },
      {
        id: 'concurrent-features-2',
        prompt: 'useDeferredValue と memo を組み合わせて重いリストを最適化してください。',
        requirements: [
          'useDeferredValue で query を遅延させて deferredQuery を作る',
          'SlowList コンポーネントを memo でラップする',
          'SlowList に deferredQuery を渡す（query でなく）',
          'deferredQuery !== query のとき「更新中...」を表示する',
        ],
        hints: [
          'const deferredQuery = useDeferredValue(query)',
          'const SlowList = memo(function SlowList({ text }) { ... })',
          'isStale = deferredQuery !== query で更新状態を検知できます',
        ],
        expectedKeywords: ['useDeferredValue', 'memo', 'deferredQuery'],
        starterCode: `import { useState, useDeferredValue, memo } from 'react'

// TODO: SlowList を memo でラップ
function SlowList({ text }) {
  const items = Array.from({ length: 200 }, (_, i) => \`\${text} - item \${i}\`)
  return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
}

function App() {
  const [query, setQuery] = useState('')
  // TODO: useDeferredValue で query を遅延させる

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* TODO: 更新中の表示と SlowList への deferredQuery 渡し */}
      <SlowList text={query} />
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState, useDeferredValue, memo } from 'react'\n\n____0\n\nfunction App() {\n  const [query, setQuery] = useState('')\n  ____1\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} />\n      {deferredQuery !== query && <p>更新中...</p>}\n      <SlowList text={deferredQuery} />\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'memo-wrap',
                label: 'memo化',
                correctTokens: ['const', 'SlowList', '=', 'memo', '(', 'function SlowList({ text }) {', 'const items = Array.from({ length: 200 }, (_, i) => `${text} - item ${i}`)', 'return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>', '}', ')'],
                distractorTokens: ['useCallback', 'useRef', 'useMemo', 'forwardRef'],
              },
              {
                id: 'deferred-value',
                label: 'useDeferredValue',
                correctTokens: ['const', 'deferredQuery', '=', 'useDeferredValue', '(', 'query', ')'],
                distractorTokens: ['useTransition', 'startTransition', 'useCallback', 'useRef'],
              },
            ],
          },
      },
    ],
  },
}

import type { CodeReadingProblem } from './types'

export const CODE_READING_PROBLEMS: CodeReadingProblem[] = [
  // ─── basic ─────────────────────────────────────────────────────────────────

  {
    id: 'cr-001',
    difficulty: 'basic',
    title: 'カスタムフック（useCounter）',
    description: 'useState を使ったカスタムフックを読んで、返り値や挙動を理解しましょう。',
    language: 'typescript',
    codeSnippet: `import { useState } from 'react'

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => prev - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}`,
    questions: [
      {
        id: 'q1',
        text: 'この `useCounter` フックが返す値は何ですか？',
        choices: [
          'count の数値のみ',
          '{ count, increment, decrement, reset } オブジェクト',
          'increment と decrement 関数のみ',
          'useState フックの戻り値そのまま',
        ],
        correctIndex: 1,
        explanation:
          '最終行の `return { count, increment, decrement, reset }` でオブジェクトを返しています。',
      },
      {
        id: 'q2',
        text: '`useCounter(5)` を呼び出したとき、初期の `count` 値は何ですか？',
        choices: ['0', '5', 'undefined', 'null'],
        correctIndex: 1,
        explanation:
          '`useState(initialValue)` の `initialValue` に引数の `5` が渡されるため、初期値は `5` です。',
      },
      {
        id: 'q3',
        text: '`reset()` を呼び出すと `count` はどうなりますか？',
        choices: [
          '常に 0 になる',
          'initialValue の値に戻る',
          'コンポーネントがアンマウントされる',
          'setCount が undefined になる',
        ],
        correctIndex: 1,
        explanation:
          '`reset = () => setCount(initialValue)` により、フック作成時の `initialValue` の値に戻ります。',
      },
    ],
  },

  {
    id: 'cr-002',
    difficulty: 'basic',
    title: 'useEffect クリーンアップ',
    description: 'setInterval と useEffect のクリーンアップを使ったタイマーコンポーネントを読み解きましょう。',
    language: 'tsx',
    codeSnippet: `import { useState, useEffect } from 'react'

function TimerComponent() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <p>経過時間: {seconds} 秒</p>
}`,
    questions: [
      {
        id: 'q1',
        text: '依存配列 `[]` が空の場合、この useEffect はいつ実行されますか？',
        choices: [
          'state が更新されるたびに',
          'コンポーネントがマウントされたときのみ',
          '毎レンダリングごとに',
          'setSeconds が呼ばれるたびに',
        ],
        correctIndex: 1,
        explanation:
          '依存配列が空 `[]` の場合、エフェクトはマウント時に 1 回だけ実行されます。',
      },
      {
        id: 'q2',
        text: '`return () => clearInterval(interval)` の役割は何ですか？',
        choices: [
          'タイマーを一時停止する',
          'コンポーネントのアンマウント時にタイマーをクリアしてメモリリークを防ぐ',
          '次のレンダリングの前にタイマーをリセットする',
          'interval 変数を再宣言する',
        ],
        correctIndex: 1,
        explanation:
          'useEffect の return はクリーンアップ関数です。アンマウント時に呼ばれ、setInterval が動き続けるメモリリークを防ぎます。',
      },
      {
        id: 'q3',
        text: 'クリーンアップ関数 `return () => clearInterval(interval)` を削除するとどうなりますか？',
        choices: [
          'コードが正常に動作する',
          'タイマーが停止しなくなり、メモリリークが発生する',
          'seconds のカウントが止まる',
          'コンパイルエラーになる',
        ],
        correctIndex: 1,
        explanation:
          'クリーンアップ関数がないと、コンポーネントがアンマウントされてもタイマーが動き続け、メモリリークと不要な state 更新が発生します。',
      },
    ],
  },

  // ─── intermediate ──────────────────────────────────────────────────────────

  {
    id: 'cr-003',
    difficulty: 'intermediate',
    title: 'useReducer によるカウンター',
    description: 'useReducer を使ったカウンターの reducer 関数と dispatch の動作を読み解きましょう。',
    language: 'tsx',
    codeSnippet: `import { useReducer } from 'react'

type State = { count: number; step: number }
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    case 'reset':
      return { count: 0, step: 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })

  return (
    <div>
      <p>count: {state.count} (step: {state.step})</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  )
}`,
    questions: [
      {
        id: 'q1',
        text: '初期状態（count=0, step=1）で `dispatch({ type: "increment" })` を呼ぶと count はいくつになりますか？',
        choices: ['常に +1 で 1 になる', 'step の値だけ増えて 1 になる', '0 にリセットされる', 'step と count の両方が増加する'],
        correctIndex: 1,
        explanation:
          '`case "increment": return { ...state, count: state.count + state.step }` なので、step（=1）の値だけ増加して 1 になります。',
      },
      {
        id: 'q2',
        text: '`reducer` 関数の第 1 引数は何ですか？',
        choices: ['dispatch 関数', '現在の state', 'action の type 文字列', 'useReducer の初期値'],
        correctIndex: 1,
        explanation:
          'reducer の引数は `(state, action)` で、第 1 引数は現在の state です。',
      },
      {
        id: 'q3',
        text: '`dispatch({ type: "setStep", payload: 5 })` を実行するとどうなりますか？',
        choices: ['count が 5 になる', 'step が 5 になる', 'count と step が両方 5 になる', 'TypeScript エラーになる'],
        correctIndex: 1,
        explanation:
          '`case "setStep": return { ...state, step: action.payload }` で step のみが payload の値（5）に更新されます。',
      },
      {
        id: 'q4',
        text: '`useReducer(reducer, { count: 0, step: 1 })` の第 2 引数の役割は何ですか？',
        choices: ['reducer 関数の型定義', 'state の初期値', 'dispatch の設定オプション', 'action の初期値'],
        correctIndex: 1,
        explanation:
          '`useReducer(reducer, initialState)` の第 2 引数は state の初期値です。',
      },
    ],
  },

  {
    id: 'cr-004',
    difficulty: 'intermediate',
    title: 'React.lazy と Suspense',
    description: 'React.lazy と Suspense を使ったコード分割の仕組みを読み解きましょう。',
    language: 'tsx',
    codeSnippet: `import { Suspense, lazy } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <div>
      <h1>アプリ</h1>
      <Suspense fallback={<div>読み込み中...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  )
}`,
    questions: [
      {
        id: 'q1',
        text: '`React.lazy` の引数に渡す関数が返すものは何ですか？',
        choices: [
          'コンポーネントの JSX',
          'dynamic import の Promise',
          'コンポーネントのクラス定義',
          'useEffect フック',
        ],
        correctIndex: 1,
        explanation:
          '`lazy(() => import("./HeavyComponent"))` のように、dynamic `import()` を返す関数を渡します。コンポーネントが必要になったときに初めてファイルが読み込まれます。',
      },
      {
        id: 'q2',
        text: '`HeavyComponent` の読み込み中に表示されるものは何ですか？',
        choices: [
          '何も表示されない（画面が真っ白）',
          '`<div>読み込み中...</div>`',
          'エラーメッセージ',
          'HeavyComponent の空のレンダリング',
        ],
        correctIndex: 1,
        explanation:
          'Suspense の `fallback` prop に指定した要素が、子コンポーネントの読み込み中に表示されます。',
      },
      {
        id: 'q3',
        text: '`Suspense` コンポーネントを削除すると何が起きますか？',
        choices: [
          'HeavyComponent が同期的に読み込まれる',
          'React がエラーをスローする',
          'ローディング表示がなくなるだけで正常に動作する',
          'HeavyComponent が表示されなくなる',
        ],
        correctIndex: 1,
        explanation:
          '`React.lazy` で読み込んだコンポーネントは `Suspense` でラップする必要があります。ない場合、React はエラーをスローします。',
      },
    ],
  },

  // ─── advanced ──────────────────────────────────────────────────────────────

  {
    id: 'cr-005',
    difficulty: 'advanced',
    title: 'React.memo と useCallback による最適化',
    description: 'memo と useCallback を組み合わせた再レンダリング最適化のコードを読み解きましょう。',
    language: 'tsx',
    codeSnippet: `import { useState, useCallback, memo } from 'react'

const ChildButton = memo(function ChildButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  console.log(\`\${label} がレンダリングされました\`)
  return <button onClick={onClick}>{label}</button>
})

function Parent() {
  const [countA, setCountA] = useState(0)
  const [countB, setCountB] = useState(0)

  const incrementA = useCallback(() => {
    setCountA(prev => prev + 1)
  }, [])

  const incrementB = useCallback(() => {
    setCountB(prev => prev + 1)
  }, [])

  return (
    <div>
      <p>A: {countA}, B: {countB}</p>
      <ChildButton onClick={incrementA} label="A を増やす" />
      <ChildButton onClick={incrementB} label="B を増やす" />
    </div>
  )
}`,
    questions: [
      {
        id: 'q1',
        text: '`memo` でラップされた `ChildButton` の役割は何ですか？',
        choices: [
          'コンポーネントを非同期で読み込む',
          'props が変わらない限りコンポーネントの再レンダリングをスキップする',
          'コンポーネントのレンダリングを強制する',
          'state の更新を防ぐ',
        ],
        correctIndex: 1,
        explanation:
          '`React.memo` は props が変わっていない場合、前回のレンダリング結果を再利用してレンダリングをスキップします。',
      },
      {
        id: 'q2',
        text: '`useCallback` で `incrementA` をメモ化しない場合、どんな問題が起きますか？',
        choices: [
          'countA の更新が遅くなる',
          'Parent が再レンダリングされるたびに新しい関数が生成され、ChildButton も再レンダリングされる',
          'incrementA が複数回実行される',
          'setCountA が呼ばれなくなる',
        ],
        correctIndex: 1,
        explanation:
          '関数コンポーネント内の関数は毎レンダリングで新しく生成されます。memo は props の参照を比較するため、関数が毎回変わると再レンダリングが走ります。',
      },
      {
        id: 'q3',
        text: '「A を増やす」ボタンをクリックしたとき、コンソールに何が出力されますか？',
        choices: [
          '「A を増やす がレンダリングされました」と「B を増やす がレンダリングされました」の両方',
          '「A を増やす がレンダリングされました」のみ',
          'どちらも出力されない',
          'Parent がレンダリングされたというメッセージ',
        ],
        correctIndex: 2,
        explanation:
          'countA の更新で Parent は再レンダリングされますが、useCallback により両関数の参照は変わりません。memo の ChildButton は props（onClick, label）が変わらないため、どちらも再レンダリングをスキップします。',
      },
      {
        id: 'q4',
        text: 'この memo + useCallback の最適化が逆効果になるケースはどれですか？',
        choices: [
          'レンダリングコストが高い複雑なコンポーネント',
          '頻繁に props が変わるコンポーネント',
          '子コンポーネントの数が多い場合',
          'useState を使っていないコンポーネント',
        ],
        correctIndex: 1,
        explanation:
          'memo と useCallback は比較処理のオーバーヘッドを伴います。props が頻繁に変わるコンポーネントでは、毎回の比較コストが余分にかかるだけで最適化の恩恵が得られません。',
      },
    ],
  },
]

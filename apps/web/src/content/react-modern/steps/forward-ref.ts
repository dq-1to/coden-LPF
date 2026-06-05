import type { LearningStepContent } from '@/content/fundamentals/steps'

export const forwardRefStep: LearningStepContent = {
  id: 'forward-ref',
  order: 36,
  title: 'forwardRef と useImperativeHandle',
  summary: 'forwardRefで親コンポーネントへDOM参照を公開する方法・useImperativeHandleで公開APIをカスタマイズするパターンを学ぶ。',
  readMarkdown: `# forwardRef と useImperativeHandle

## forwardRef とは

通常、親コンポーネントから子コンポーネントの DOM 要素に \`ref\` を渡すことはできません。\`forwardRef\` を使うと、子コンポーネントが受け取った \`ref\` を内部の DOM 要素に転送（フォワード）できます。

## 基本的な使い方

\`\`\`jsx
import { forwardRef } from 'react'

// forwardRef でラップすることで、親から ref を受け取れる
const FancyInput = forwardRef(function FancyInput(props, ref) {
  return (
    <input
      ref={ref}  // ref を input 要素に転送
      className="fancy-input"
      {...props}
    />
  )
})

// 親コンポーネントから DOM に直接アクセスできる
function Form() {
  const inputRef = useRef(null)

  function handleFocus() {
    inputRef.current.focus()  // FancyInput 内の <input> が focus される
  }

  return (
    <>
      <FancyInput ref={inputRef} placeholder="入力してください" />
      <button onClick={handleFocus}>フォーカス</button>
    </>
  )
}
\`\`\`

## useImperativeHandle — 公開 API のカスタマイズ

\`forwardRef\` だけだと DOM 要素そのものが丸ごと公開されます。\`useImperativeHandle\` を組み合わせると、**公開するメソッドを限定**できます。

\`\`\`jsx
import { forwardRef, useImperativeHandle, useRef } from 'react'

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null)

  // ref に公開するメソッドをカスタマイズ
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus()
    },
    clear() {
      inputRef.current.value = ''
    },
    // DOM 要素自体は公開しない
  }))

  return <input ref={inputRef} {...props} />
})

// 使う側
function Form() {
  const inputRef = useRef(null)

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>フォーカス</button>
      <button onClick={() => inputRef.current.clear()}>クリア</button>
      {/* inputRef.current.value など DOM プロパティには直接アクセスできない */}
    </>
  )
}
\`\`\`

## TypeScript での型付け

\`forwardRef\` に型引数を渡すことで型安全に使えます。

\`\`\`tsx
import { forwardRef, useRef } from 'react'

interface InputProps {
  placeholder?: string
  className?: string
}

// forwardRef<転送先DOM型, Props型>
const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ placeholder, className }, ref) {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        className={className}
      />
    )
  }
)

// 使う側
function App() {
  const inputRef = useRef<HTMLInputElement>(null)

  return <Input ref={inputRef} placeholder="入力" />
}
\`\`\`

## useImperativeHandle の TypeScript 型付け

\`\`\`tsx
interface InputHandle {
  focus: () => void
  clear: () => void
}

const Input = forwardRef<InputHandle, InputProps>(
  function Input(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = ''
      },
    }))

    return <input ref={inputRef} {...props} />
  }
)

// 使う側
const inputRef = useRef<InputHandle>(null)
inputRef.current?.focus()  // InputHandle の型で補完が効く
\`\`\`

## forwardRef を使うべき場面

| 用途 | 例 |
|------|-----|
| フォーカス制御 | 送信後に入力欄へフォーカスを戻す |
| スクロール制御 | リスト末尾へスクロール |
| アニメーション制御 | GSAP など外部ライブラリとの連携 |
| 再利用可能な UI ライブラリ | ボタン・入力欄などの汎用コンポーネント |

## 注意点

- \`ref\` は prop ではないため、\`props.ref\` でアクセスすることはできません。\`forwardRef\` の第2引数として受け取ります。
- 必要なければ \`forwardRef\` を使わないほうがシンプルです。DOM へのアクセスが本当に必要な場合に限定して使いましょう。
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`forwardRef` を使う目的は？',
      answer: '親コンポーネントから子コンポーネント内の DOM 要素に ref を渡すため',
      hint: '通常は props として ref を渡せません。',
      explanation: '関数コンポーネントは ref を props として受け取れません。forwardRef でラップすることで、親から渡された ref を子の DOM 要素に転送できます。',
      choices: ['親コンポーネントから子コンポーネント内の DOM 要素に ref を渡すため', 'コンポーネントをメモ化するため', 'context を転送するため', 'イベントを転送するため'],
    },
    {
      id: 'q2',
      prompt: '`forwardRef((props, ref) => ...)` の `ref` は何に転送すべき？',
      answer: '子の DOM 要素の ref prop',
      hint: '`<input ref={ref} />` のように使います。',
      explanation: 'forwardRef の第2引数 ref を内部の DOM 要素の ref prop に渡すことで、親が useRef で取得する ref が実際の DOM を指すようになります。',
      choices: ['子の DOM 要素の ref prop', '親コンポーネントの state', '別の forwardRef コンポーネント', 'useContext の値'],
    },
    {
      id: 'q3',
      prompt: '`useImperativeHandle(ref, () => ({ focus() {...} }))` の目的は？',
      answer: '親に公開する ref のメソッドを限定・カスタマイズするため',
      hint: 'DOM 要素を丸ごと公開しないカプセル化のパターンです。',
      explanation: 'useImperativeHandle を使うと、DOM 要素を直接公開する代わりに focus や clear などの特定のメソッドだけを公開できます。カプセル化の原則を守れます。',
      choices: ['親に公開する ref のメソッドを限定・カスタマイズするため', 'ref の型を変換するため', 'ref の更新をバッチ処理するため', 'forwardRef を使わずに ref を転送するため'],
    },
    {
      id: 'q4',
      prompt: 'TypeScript で `forwardRef<HTMLInputElement, Props>` の第1型引数は何を表す？',
      answer: '転送先 DOM 要素の型',
      hint: '`useRef<HTMLInputElement>(null)` と同じ考え方です。',
      explanation: 'forwardRef の第1型引数は ref が指す DOM 要素の型です。HTMLInputElement, HTMLDivElement など。第2型引数はコンポーネントの Props の型です。',
      choices: ['転送先 DOM 要素の型', 'コンポーネントの Props の型', '戻り値の JSX 型', 'ref オブジェクトの型'],
    },
    {
      id: 'q5',
      prompt: '`useImperativeHandle` で独自のハンドル型を定義したとき、親側の `useRef` の型引数は何にすべき？',
      answer: 'カスタムハンドルのインターフェース型',
      hint: '`useRef<InputHandle>(null)` のように使います。',
      explanation: 'useImperativeHandle で { focus, clear } などを公開する場合、親側は useRef<InputHandle>(null) とすることで inputRef.current.focus() などに型補完が効きます。',
      choices: ['カスタムハンドルのインターフェース型', 'HTMLInputElement', 'null', 'any'],
    },
  ],
  testTask: {
    instruction: 'FancyInput を forwardRef でラップし、親から input 要素の ref にアクセスできるようにしてください。',
    starterCode: `import { ____, useRef } from 'react'

const FancyInput = ____(function FancyInput(props, ref) {
  return <input ref={____} className="fancy" {...props} />
})

function Form() {
  const inputRef = useRef(null)

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>フォーカス</button>
    </>
  )
}`,
    expectedKeywords: ['forwardRef'],
    explanation: 'forwardRef でコンポーネントをラップし、第2引数 ref を input 要素の ref prop に渡します。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'forward-ref-1',
        prompt: 'forwardRef を使ってフォーカスを親からコントロールできる Input コンポーネントを実装してください。',
        requirements: [
          'forwardRef を使って Input コンポーネントを作成する',
          'ref を内部の input 要素に転送する',
          '親コンポーネントから ref.current.focus() を呼べるようにする',
          '送信ボタンクリック後に入力欄へフォーカスを戻す',
        ],
        hints: [
          'const Input = forwardRef(function Input(props, ref) { return <input ref={ref} {...props} /> })',
          '親で const inputRef = useRef(null) を作り、<Input ref={inputRef} /> に渡します',
          '送信ハンドラの末尾で inputRef.current?.focus() を呼びます',
        ],
        expectedKeywords: ['forwardRef', 'ref', 'focus'],
        starterCode: `import { forwardRef, useRef } from 'react'

// TODO: forwardRef を使って Input を実装する（ref を input に転送）
function Input(props) {
  return <input {...props} />
}

function SearchForm() {
  const inputRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const query = e.target.search.value
    console.log('検索:', query)
    e.target.reset()
    // TODO: 送信後に input へフォーカスを戻す
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input ref={inputRef} name="search" placeholder="検索..." />
      <button type="submit">検索</button>
    </form>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { forwardRef, useRef } from 'react'\n\n____0\n\nfunction SearchForm() {\n  const inputRef = useRef(null)\n\n  function handleSubmit(e) {\n    e.preventDefault()\n    const query = e.target.search.value\n    console.log('検索:', query)\n    e.target.reset()\n    ____1\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <Input ref={inputRef} name="search" placeholder="検索..." />\n      <button type="submit">検索</button>\n    </form>\n  )\n}`,
            blanks: [
              {
                id: 'forward-ref-wrap',
                label: 'forwardRef',
                correctTokens: ['const', 'Input', '=', 'forwardRef', '(', 'function Input(props, ref) {', 'return', '<input ref={ref} {...props} />', '}', ')'],
                distractorTokens: ['useRef', 'createRef', 'useCallback', 'memo'],
              },
              {
                id: 'focus-call',
                label: 'focus呼出',
                correctTokens: ['inputRef.current', '?.', 'focus()'],
                distractorTokens: ['useRef', 'blur()', 'click()', 'value'],
              },
            ],
          },
      },
      {
        id: 'forward-ref-2',
        prompt: 'useImperativeHandle を使って公開 API を限定した VideoPlayer コンポーネントを実装してください。',
        requirements: [
          'forwardRef と useImperativeHandle を組み合わせる',
          '公開する API は play() と pause() のみ（video 要素自体は公開しない）',
          '内部の useRef で video 要素を参照する',
          '親から ref.current.play() / ref.current.pause() を呼べることを確認する',
        ],
        hints: [
          'const videoRef = useRef(null) で内部参照を作り、<video ref={videoRef} /> に渡す',
          'useImperativeHandle(ref, () => ({ play: () => videoRef.current.play(), pause: () => videoRef.current.pause() }))',
          '親側は const playerRef = useRef(null) で playerRef.current.play() を呼ぶ',
        ],
        expectedKeywords: ['forwardRef', 'useImperativeHandle', 'play', 'pause'],
        starterCode: `import { forwardRef, useRef, useImperativeHandle } from 'react'

// TODO: forwardRef + useImperativeHandle で VideoPlayer を実装
// 公開API: play() と pause() のみ
const VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {
  const videoRef = useRef(null)

  // TODO: useImperativeHandle で play / pause のみ公開する

  return <video ref={videoRef} src={src} />
})

function App() {
  const playerRef = useRef(null)

  return (
    <div>
      <VideoPlayer
        ref={playerRef}
        src="https://example.com/video.mp4"
      />
      <button onClick={() => playerRef.current.play()}>再生</button>
      <button onClick={() => playerRef.current.pause()}>一時停止</button>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { forwardRef, useRef, useImperativeHandle } from 'react'\n\nconst VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {\n  const videoRef = useRef(null)\n\n  ____0\n\n  return <video ref={videoRef} src={src} />\n})\n\nfunction App() {\n  const playerRef = useRef(null)\n\n  return (\n    <div>\n      <VideoPlayer ref={playerRef} src="https://example.com/video.mp4" />\n      ____1\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'imperative-handle',
                label: 'useImperativeHandle',
                correctTokens: ['useImperativeHandle', '(', 'ref', ',', '() => ({', 'play:', '() => videoRef.current.play(),', 'pause:', '() => videoRef.current.pause()', '})', ')'],
                distractorTokens: ['useRef', 'createRef', 'useCallback', 'useEffect'],
              },
              {
                id: 'control-buttons',
                label: '制御ボタン',
                correctTokens: ['<button', 'onClick={() => playerRef.current.play()}>再生</button>', '<button', 'onClick={() => playerRef.current.pause()}>一時停止</button>'],
                distractorTokens: ['stop()', 'reset()', 'onClick={play}', 'useRef'],
              },
            ],
          },
      },
    ],
  },
}

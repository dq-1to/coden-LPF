import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsReactHooksStep: LearningStepContent = {
  id: 'ts-react-hooks',
  order: 29,
  title: 'Hooks型定義',
  summary: 'useRef<T>のDOM参照・useContextの型付きコンテキスト・カスタムフックの戻り値型・forwardRefなど、型安全なHooks活用を学ぶ。',
  readMarkdown: `# Hooks型定義

## useRef<T> — DOM要素参照

\`useRef\` をDOM要素参照に使うときは、HTML要素の型を型引数に渡します。

\`\`\`tsx
import { useRef } from 'react'

function SearchInput() {
  // HTMLInputElement を型引数に指定
  const inputRef = useRef<HTMLInputElement>(null)

  function focusInput() {
    // current は HTMLInputElement | null 型
    inputRef.current?.focus()
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>フォーカス</button>
    </div>
  )
}
\`\`\`

初期値 \`null\` と型引数 \`HTMLInputElement\` の組み合わせで、\`current\` の型は \`HTMLInputElement | null\` になります。

## useRef<T> — 可変値保持（レンダリングなし）

DOM参照ではなくタイマーIDなど「再レンダリングを起こさない可変値」を保持する使い方もあります。

\`\`\`tsx
const timerRef = useRef<number | null>(null)

function startTimer() {
  timerRef.current = window.setInterval(() => {
    // 処理
  }, 1000)
}

function stopTimer() {
  if (timerRef.current !== null) {
    clearInterval(timerRef.current)
  }
}
\`\`\`

## useContext と型付きコンテキスト

\`createContext\` に型引数を渡してコンテキストを型安全にします。

\`\`\`tsx
import { createContext, useContext, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// createContext の型引数で型を確定
const ThemeContext = createContext<ThemeContextType | null>(null)

// カスタムフックで null チェックをラップ
function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (ctx === null) throw new Error('ThemeProvider の外で useTheme を使っています')
  return ctx
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
\`\`\`

## カスタムフックの戻り値型

カスタムフックの戻り値はタプルまたはオブジェクトで型を定義します。

\`\`\`tsx
// オブジェクト形式（フィールドが多い場合）
function useCounter(initial: number) {
  const [count, setCount] = useState(initial)
  const increment = () => setCount((c) => c + 1)
  const decrement = () => setCount((c) => c - 1)
  const reset = () => setCount(initial)
  return { count, increment, decrement, reset }
}

// 戻り値型を明示する場合
interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

function useCounter2(initial: number): UseCounterReturn {
  // ...
}
\`\`\`

## forwardRef<T, P>

親コンポーネントから子の DOM 要素に ref を渡すには \`forwardRef\` を使います。

\`\`\`tsx
import { forwardRef } from 'react'

interface InputProps {
  label: string
  placeholder?: string
}

// forwardRef<DOM要素型, Props型>
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} placeholder={placeholder} />
    </div>
  )
)

// 使う側
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <Input ref={inputRef} label="名前" />
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`const ref = useRef<____>(null)` — input 要素を参照するときの型引数は？',
      answer: 'HTMLInputElement',
      hint: 'HTMLInputElement は input タグのDOM型です。',
      explanation: 'input 要素への ref には useRef<HTMLInputElement>(null) を使います。current の型は HTMLInputElement | null になります。',
      choices: ['HTMLInputElement', 'HTMLElement', 'InputElement', 'Element'],
    },
    {
      id: 'q2',
      prompt: '`const ref = useRef<HTMLButtonElement>(null)` — ref.current?.click() の `?.` は何のため？',
      answer: 'current が null の可能性があるため',
      hint: 'refの初期値はnullです。',
      explanation: 'useRef<T>(null) の current は T | null 型なので、null チェックをせずにアクセスするとコンパイルエラーになります。オプショナルチェーン `?.` で安全にアクセスできます。',
      choices: ['current が null の可能性があるため', 'TypeScriptの文法上必須のため', 'clickメソッドが存在しないため', 'async処理のため'],
    },
    {
      id: 'q3',
      prompt: '`createContext<ThemeContextType | null>(null)` で null を初期値にする理由は？',
      answer: 'Provider の外で使われたことを検知するため',
      hint: 'null チェックでエラーを投げる実装と組み合わせます。',
      explanation: 'createContext の初期値を null にし、useContext で取得した値が null なら「Provider の外で使われている」と判断してエラーを投げる設計です。',
      choices: ['Provider の外で使われたことを検知するため', 'TypeScript の仕様上必須のため', 'パフォーマンス最適化のため', 'null セーフにするため'],
    },
    {
      id: 'q4',
      prompt: 'カスタムフックが `{ count, increment }` を返す場合、呼び出し側で count を取得するには？',
      answer: 'const { count, increment } = useCounter(0)',
      hint: 'オブジェクト分割代入を使います。',
      explanation: 'カスタムフックがオブジェクトを返す場合は分割代入で取得します。const { count, increment } = useCounter(0) のように書きます。',
      choices: ['const { count, increment } = useCounter(0)', 'const [count, increment] = useCounter(0)', 'const count = useCounter(0).count', 'const count, increment = useCounter(0)'],
    },
    {
      id: 'q5',
      prompt: '`forwardRef<HTMLInputElement, InputProps>` の第1型引数と第2型引数はそれぞれ何？',
      answer: 'ref の参照先DOM型 / コンポーネントのProps型',
      hint: 'forwardRef は ref 型と Props 型の2つを受け取ります。',
      explanation: 'forwardRef<T, P> の T は ref.current の型（DOM要素型）、P はコンポーネントの Props 型です。',
      choices: ['ref の参照先DOM型 / コンポーネントのProps型', 'Props型 / ref の参照先DOM型', '親コンポーネント型 / 子コンポーネント型', '戻り値型 / 引数型'],
    },
  ],
  testTask: {
    instruction: 'input 要素に自動フォーカスする AutoFocusInput を実装してください。useRef を使って input への参照を取得し、マウント時に focus() を呼びます。',
    starterCode: `import { useRef, useEffect } from 'react'

function AutoFocusInput() {
  const ref = useRef<____>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return <input ref={ref} placeholder="自動フォーカス" />
}`,
    expectedKeywords: ['HTMLInputElement'],
    explanation: 'input 要素への ref は useRef<HTMLInputElement>(null) で定義します。useEffect 内で ref.current?.focus() を呼ぶと、マウント時に自動フォーカスされます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-react-hooks-1',
        prompt: '型付き ThemeContext を設計・実装してください。',
        requirements: [
          'theme（"light" | "dark"）と toggleTheme（() => void）を持つ ThemeContextType interface を定義する',
          'createContext<ThemeContextType | null>(null) でコンテキストを作成する',
          'null チェック付きの useTheme カスタムフックを実装する',
          'ThemeProvider コンポーネントを実装する',
        ],
        hints: [
          'createContext の初期値は null にします',
          'useContext の戻り値が null のとき Error を throw します',
          'useState<"light" | "dark"> で theme を管理します',
        ],
        expectedKeywords: ['ThemeContextType', 'createContext', 'useTheme', 'ThemeProvider', 'toggleTheme'],
        starterCode: `import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

// TODO: ThemeContextType interface を定義してください

// TODO: ThemeContext を createContext で作成してください

// TODO: useTheme カスタムフック（null チェック付き）を実装してください

// TODO: ThemeProvider コンポーネントを実装してください
function ThemeProvider({ children }: { children: ReactNode }) {
  // TODO: theme state と toggleTheme を実装
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { createContext, useContext, useState } from 'react'\\nimport type { ReactNode } from 'react'\\n\\n____0\\n\\nconst ThemeContext = createContext<ThemeContextType | null>(null)\\n\\n____1\\n\\nfunction ThemeProvider({ children }: { children: ReactNode }) {\\n  const [theme, setTheme] = useState<'light' | 'dark'>('light')\\n  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')\\n  return (\\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\\n      {children}\\n    </ThemeContext.Provider>\\n  )\\n}`,
            blanks: [
              {
                id: 'theme-context-type',
                label: 'Context型',
                correctTokens: ['interface', 'ThemeContextType', '{', 'theme', ':', "'light' | 'dark'", ';', 'toggleTheme', ':', '() => void', '}'],
                distractorTokens: ['useState', 'useReducer', 'any', 'string'],
              },
              {
                id: 'use-theme',
                label: 'useTheme',
                correctTokens: ['function', 'useTheme', '()', ':', 'ThemeContextType', '{', 'const', 'ctx', '=', 'useContext(ThemeContext)', 'if', '(!ctx)', 'throw', "new Error('ThemeProvider外です')", 'return', 'ctx', '}'],
                distractorTokens: ['null', 'useReducer', 'useState', 'createContext'],
              },
            ],
          },
      },
      {
        id: 'ts-react-hooks-2',
        prompt: 'useLocalStorage カスタムフックを型安全に実装してください。',
        requirements: [
          'ジェネリクス型引数 T を持つ `useLocalStorage<T>(key: string, initialValue: T)` 関数を実装する',
          '戻り値は [T, (value: T) => void] のタプル型にする',
          'localStorage から読み込み・書き込みを行う',
          'localStorage が利用できない場合は initialValue を使う',
        ],
        hints: [
          'function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]',
          'JSON.parse / JSON.stringify でシリアライズします',
          'try/catch で localStorage の読み込みエラーを処理します',
        ],
        expectedKeywords: ['useLocalStorage', 'localStorage', 'JSON', 'useState'],
        starterCode: `import { useState } from 'react'

// TODO: useLocalStorage<T> カスタムフックを実装してください
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // TODO: 実装
}

// 動作確認
function App() {
  const [name, setName] = useLocalStorage<string>('name', '')
  const [count, setCount] = useLocalStorage<number>('count', 0)
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState } from 'react'\\n\\nfunction useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {\\n  ____0\\n\\n  ____1\\n\\n  return [storedValue, setValue]\\n}\\n\\nfunction App() {\\n  const [name, setName] = useLocalStorage<string>('name', '')\\n  return <input value={name} onChange={e => setName(e.target.value)} />\\n}`,
            blanks: [
              {
                id: 'hook-state',
                label: 'state初期化',
                correctTokens: ['const', '[storedValue, setStoredValue]', '=', 'useState<T>', '(', '() => {', 'const item = localStorage.getItem(key)', 'return item ?', 'JSON.parse(item)', ':', 'initialValue', '}', ')'],
                distractorTokens: ['sessionStorage', 'useRef', 'useEffect', 'any'],
              },
              {
                id: 'set-value',
                label: 'setValue',
                correctTokens: ['const', 'setValue', '=', '(value: T)', '=>', '{', 'setStoredValue(value)', 'localStorage.setItem(key, JSON.stringify(value))', '}'],
                distractorTokens: ['sessionStorage', 'useRef', 'JSON.parse', 'getItem'],
              },
            ],
          },
      },
    ],
  },
}

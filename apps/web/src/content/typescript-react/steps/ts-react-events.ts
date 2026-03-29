import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsReactEventsStep: LearningStepContent = {
  id: 'ts-react-events',
  order: 30,
  title: 'イベント型定義',
  summary: 'React.ChangeEvent・MouseEvent・FormEvent・KeyboardEventなど、Reactイベントハンドラの型定義を学ぶ。',
  readMarkdown: `# イベント型定義

## React.ChangeEvent<T>

input/select/textarea の \`onChange\` ハンドラで使います。型引数にHTML要素型を渡します。

\`\`\`tsx
function TextInput() {
  const [value, setValue] = React.useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return <input value={value} onChange={handleChange} />
}
\`\`\`

select 要素の場合は \`HTMLSelectElement\`、textarea の場合は \`HTMLTextAreaElement\` を使います。

## React.MouseEvent<T>

ボタンなどのクリックイベントハンドラで使います。

\`\`\`tsx
function ClickButton() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log('クリック座標:', e.clientX, e.clientY)
  }

  return <button onClick={handleClick}>クリック</button>
}
\`\`\`

## React.FormEvent<T>

フォームの \`onSubmit\` ハンドラで使います。

\`\`\`tsx
function LoginForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // フォーム送信処理
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">送信</button>
    </form>
  )
}
\`\`\`

## React.KeyboardEvent<T>

キーボード操作のイベントハンドラで使います。

\`\`\`tsx
function SearchField() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('検索実行')
    }
    if (e.key === 'Escape') {
      console.log('キャンセル')
    }
  }

  return <input onKeyDown={handleKeyDown} placeholder="Enterで検索" />
}
\`\`\`

## イベントハンドラを変数として宣言する

イベントハンドラをJSX外で定義する場合も型を明示できます。

\`\`\`tsx
import type { ChangeEventHandler, MouseEventHandler, FormEventHandler } from 'react'

const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
  console.log(e.target.value)
}

const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
  e.stopPropagation()
}

const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
  e.preventDefault()
}
\`\`\`

ハンドラ型エイリアス（\`ChangeEventHandler\` など）を使うと、型引数が1つになって簡潔に書けます。

## イベント型の早見表

| イベント | 型 | よく使う要素 |
|---------|-----|-------------|
| onChange | ChangeEvent<T> | input, select, textarea |
| onClick | MouseEvent<T> | button, div |
| onSubmit | FormEvent<T> | form |
| onKeyDown/Up/Press | KeyboardEvent<T> | input, div |
| onFocus/Blur | FocusEvent<T> | input, button |
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`<input onChange={handleChange} />` の handleChange 引数の型は？',
      answer: 'React.ChangeEvent<HTMLInputElement>',
      hint: 'input 要素の onChange イベントです。',
      explanation: 'input の onChange は React.ChangeEvent<HTMLInputElement> 型の引数を受け取ります。e.target.value で入力値を取得できます。',
      choices: ['React.ChangeEvent<HTMLInputElement>', 'React.InputEvent<HTMLInputElement>', 'Event<HTMLInputElement>', 'React.ChangeEvent<HTMLElement>'],
    },
    {
      id: 'q2',
      prompt: '`<button onClick={handleClick} />` の handleClick 引数の型は？',
      answer: 'React.MouseEvent<HTMLButtonElement>',
      hint: 'button 要素の onClick イベントです。',
      explanation: 'button の onClick は React.MouseEvent<HTMLButtonElement> 型の引数を受け取ります。e.clientX/Y でクリック座標を取得できます。',
      choices: ['React.MouseEvent<HTMLButtonElement>', 'React.ClickEvent<HTMLButtonElement>', 'React.MouseEvent<HTMLElement>', 'MouseEvent<HTMLButtonElement>'],
    },
    {
      id: 'q3',
      prompt: '`<form onSubmit={handleSubmit} />` で `e.preventDefault()` を呼ぶための e の型は？',
      answer: 'React.FormEvent<HTMLFormElement>',
      hint: 'form 要素の onSubmit イベントです。',
      explanation: 'form の onSubmit は React.FormEvent<HTMLFormElement> 型です。e.preventDefault() でデフォルトのフォーム送信（ページリロード）を防ぎます。',
      choices: ['React.FormEvent<HTMLFormElement>', 'React.SubmitEvent<HTMLFormElement>', 'React.Event<HTMLFormElement>', 'FormEvent'],
    },
    {
      id: 'q4',
      prompt: '`<input onKeyDown={handler} />` で Enter キーを検出するコードは？',
      answer: "if (e.key === 'Enter')",
      hint: 'e.key でキー名を取得できます。',
      explanation: 'React.KeyboardEvent の e.key プロパティでキー名（"Enter", "Escape" など）を取得できます。',
      choices: ["if (e.key === 'Enter')", "if (e.keyCode === 13)", "if (e.which === 'enter')", "if (e.code === 'Enter')"],
    },
    {
      id: 'q5',
      prompt: '`const handleChange: ____<HTMLInputElement> = (e) => { ... }` の ____ に入るハンドラ型エイリアスは？',
      answer: 'ChangeEventHandler',
      hint: 'react から import できるハンドラ型エイリアスです。',
      explanation: 'ChangeEventHandler<T> は React.ChangeEventHandler の型エイリアスです。import type { ChangeEventHandler } from "react" で import できます。',
      choices: ['ChangeEventHandler', 'ChangeHandler', 'InputHandler', 'EventHandler'],
    },
  ],
  testTask: {
    instruction: '`handleChange` 関数に正しいイベント型を付けてください。input の onChange ハンドラで、入力値を state にセットします。',
    starterCode: `import { useState } from 'react'

function TextInput() {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<____>) => {
    setValue(e.target.value)
  }

  return <input value={value} onChange={handleChange} />
}`,
    expectedKeywords: ['HTMLInputElement'],
    explanation: 'input 要素の onChange ハンドラの引数は React.ChangeEvent<HTMLInputElement> 型です。e.target.value で入力値を取得できます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-react-events-1',
        prompt: '型付きフォームコンポーネントを実装してください。',
        requirements: [
          'name（string）と email（string）を持つ FormData interface を定義する',
          'useState で FormData を管理する',
          'input の onChange ハンドラに React.ChangeEvent<HTMLInputElement> 型を使う',
          'form の onSubmit ハンドラに React.FormEvent<HTMLFormElement> 型を使い、e.preventDefault() を呼ぶ',
          '送信時にコンソールに FormData を出力する',
        ],
        hints: [
          'スプレッド構文で部分更新: setForm((prev) => ({ ...prev, name: value }))',
          'input の name 属性と e.target.name を使うと汎用的なハンドラが書けます',
          'e.target.name as keyof FormData でキーの型安全性を確保できます',
        ],
        expectedKeywords: ['FormData', 'ChangeEvent', 'FormEvent', 'preventDefault', 'useState'],
        starterCode: `import { useState } from 'react'

// TODO: FormData interface を定義してください

function ContactForm() {
  // TODO: useState で FormData を管理してください

  // TODO: onChange ハンドラを実装してください（型付き）

  // TODO: onSubmit ハンドラを実装してください（型付き）

  return (
    <form>
      <input name="name" placeholder="お名前" />
      <input name="email" type="email" placeholder="メールアドレス" />
      <button type="submit">送信</button>
    </form>
  )
}`,
      },
      {
        id: 'ts-react-events-2',
        prompt: 'キーボードイベントを使った検索フィールドを実装してください。',
        requirements: [
          'query（string）と results（string[]）を state で管理する',
          'input の onChange に React.ChangeEvent<HTMLInputElement> 型を使う',
          'input の onKeyDown に React.KeyboardEvent<HTMLInputElement> 型を使う',
          'Enter キーで検索実行、Escape キーで入力をクリアする',
          '検索結果をリスト表示する（ダミーデータで可）',
        ],
        hints: [
          'e.key === "Enter" で Enter キーを検出します',
          'e.key === "Escape" で Escape キーを検出します',
          '検索関数は query を元にフィルタリングするモック実装でOKです',
        ],
        expectedKeywords: ['ChangeEvent', 'KeyboardEvent', 'Enter', 'Escape', 'useState'],
        starterCode: `import { useState } from 'react'

const DUMMY_DATA = ['TypeScript', 'React', 'JavaScript', 'CSS', 'HTML', 'Node.js']

function SearchField() {
  // TODO: query と results の state を宣言してください

  // TODO: onChange ハンドラ（型付き）を実装してください

  // TODO: onKeyDown ハンドラ（型付き）を実装してください
  // Enter: 検索実行、Escape: クリア

  return (
    <div>
      <input placeholder="Enterで検索、Escapeでクリア" />
      <ul>
        {/* TODO: results を表示 */}
      </ul>
    </div>
  )
}`,
      },
    ],
  },
}

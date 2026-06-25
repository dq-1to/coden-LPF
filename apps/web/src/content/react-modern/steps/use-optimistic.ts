import type { LearningStepContent } from '@/content/fundamentals/steps'

export const useOptimisticStep: LearningStepContent = {
  id: 'use-optimistic',
  order: 34,
  title: 'useOptimistic',
  summary: 'useOptimisticを使ってサーバー応答を待たずにUIを先行更新し、非同期処理中も快適な操作感を実現する方法を学ぶ。',
  readMarkdown: `# useOptimistic

## Optimistic UI とは

**Optimistic UI**（楽観的 UI）は、サーバーへのリクエストが完了する前に、成功したと仮定して UI を先行更新するパターンです。ユーザーが送信ボタンを押した瞬間にリストへ追加し、サーバー応答後に確定（または失敗時に元に戻す）します。

## useOptimistic — 楽観的更新フック

\`useOptimistic(state, updateFn)\` は、非同期アクション中に使う一時的な「楽観的な状態」を管理するフックです（React 19+）。

\`\`\`jsx
import { useOptimistic } from 'react'

const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (currentMessages, newMessage) => [...currentMessages, newMessage]
)
\`\`\`

- \`messages\`: 実際の state（サーバー確定済み）
- \`updateFn(currentState, payload)\`: 楽観的な状態を生成する関数
- \`optimisticMessages\`: アクション中は楽観的な値、完了後は実際の値に戻る
- \`addOptimisticMessage(payload)\`: 楽観的更新をトリガーする関数

## 基本的な使い方

\`\`\`jsx
import { useState, useOptimistic } from 'react'

function MessageList({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const text = e.target.message.value
    e.target.reset()

    // 即時 UI 更新（楽観的）
    addOptimisticMessage(text)

    // サーバーへ送信（非同期）
    await sendMessage(text)
    // 完了後、optimisticMessages は自動的に実際の messages に同期される
  }

  return (
    <div>
      <ul>
        {optimisticMessages.map((msg) => (
          <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
            {msg.text}
            {msg.sending && ' (送信中...)'}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input name="message" />
        <button type="submit">送信</button>
      </form>
    </div>
  )
}
\`\`\`

## sending フラグでローディング状態を表現

楽観的なアイテムに \`sending: true\` のようなフラグを付けることで、送信中と確定済みを区別できます。

\`\`\`jsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (state, newTitle) => [
    ...state,
    { id: \`temp-\${Date.now()}\`, title: newTitle, sending: true },
  ]
)
\`\`\`

## エラー時の自動ロールバック

非同期アクションが失敗した場合、\`optimisticMessages\` は自動的に元の \`messages\` に戻ります。エラーハンドリングは通常の try/catch で行います。

\`\`\`jsx
async function handleSubmit(text) {
  addOptimisticMessage(text) // 楽観的更新

  try {
    await sendToServer(text)
    // 成功: 親から渡された messages が更新され、楽観的状態と一致する
  } catch (err) {
    // 失敗: optimisticMessages が元の messages に自動的に戻る
    console.error('送信失敗', err)
  }
}
\`\`\`

## useTransition との組み合わせ

\`useOptimistic\` は \`startTransition\` または Server Actions と組み合わせて使います。

\`\`\`jsx
import { useOptimistic, useTransition } from 'react'

function App({ items, addItem }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem) => [...state, { ...newItem, pending: true }]
  )

  function handleAdd(item) {
    startTransition(async () => {
      addOptimisticItem(item)
      await addItem(item)
    })
  }

  return (
    <ul>
      {optimisticItems.map((item) => (
        <li key={item.id} className={item.pending ? 'opacity-50' : ''}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`useOptimistic(state, updateFn)` の `updateFn` の引数は？',
      answer: '(currentState, payload)',
      hint: '現在の状態と、addOptimistic に渡した値を受け取ります。',
      explanation: 'updateFn は (currentState, payload) を受け取り、楽観的な新しい状態を返す純粋関数です。payload は addOptimistic(payload) で渡した値です。',
      choices: ['(currentState, payload)', '(payload)', '(currentState)', '(prevState, newState)'],
    },
    {
      id: 'q2',
      prompt: 'サーバーへのリクエストが失敗した場合、楽観的な状態はどうなる？',
      answer: '元の state に自動的に戻る',
      hint: '「楽観的」なので、失敗したら元に戻るのが自然な挙動です。',
      explanation: 'useOptimistic の楽観的状態は非同期アクションが失敗すると自動的に元の state に戻ります。明示的なロールバック処理は不要です。',
      choices: ['元の state に自動的に戻る', '楽観的な状態のまま残る', 'undefined になる', 'エラーがスローされる'],
    },
    {
      id: 'q3',
      prompt: '`const [optimisticItems, addOptimisticItem] = useOptimistic(...)` — `optimisticItems` はいつ実際の state と同じ値になる？',
      answer: '非同期アクションが完了したとき',
      hint: 'アクション中は楽観的な値、それ以外は実際の値です。',
      explanation: '非同期アクション（startTransition や Server Action）が完了すると、optimisticItems は自動的に実際の state と同期されます。',
      choices: ['非同期アクションが完了したとき', 'addOptimisticItem を呼んだ直後', 'コンポーネントが再レンダリングされたとき', '常に同じ値'],
    },
    {
      id: 'q4',
      prompt: '送信中のアイテムを半透明にするには `sending: true` フラグをどこに付ける？',
      answer: 'updateFn で返す楽観的なアイテムオブジェクト',
      hint: 'updateFn の返却値に含めます。',
      explanation: 'updateFn で [...state, { ...newItem, sending: true }] のように楽観的なアイテムに sending フラグを付け、UI 側で sending プロパティを参照してスタイルを変えます。',
      choices: ['updateFn で返す楽観的なアイテムオブジェクト', 'useOptimistic の第3引数', 'addOptimisticItem の第2引数', '実際の state オブジェクト'],
    },
    {
      id: 'q5',
      prompt: '`useOptimistic(state, updateFn)` の updateFn で守るべきことは？',
      answer: '現在の state と payload から新しい state を返す純粋関数にする',
      hint: '副作用や直接変更ではなく、新しい楽観的 state を返します。',
      explanation: 'updateFn は (currentState, payload) を受け取り、直接 state を変更せずに新しい楽観的 state を返す純粋関数にします。失敗時のロールバックもこの前提で扱いやすくなります。',
      choices: [
        '現在の state と payload から新しい state を返す純粋関数にする',
        'currentState を直接 push して同じ配列を返す',
        'updateFn の中で fetch を実行する',
        '必ず React のバージョン番号を返す',
      ],
      level: 'applied',
      testedConcept: 'useOptimistic updateFn とロールバック前提',
    },
  ],
  testTask: {
    instruction: 'メッセージ送信後に即座にリストへ追加する楽観的更新を実装してください。`useOptimistic` を使い、送信中は `sending: true` を付けます。',
    starterCode: `import { useOptimistic } from 'react'

function MessageList({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = ____(
    messages,
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const text = e.target.message.value
    e.target.reset()
    addOptimisticMessage(text)
    await sendMessage(text)
  }

  return (
    <ul>
      {optimisticMessages.map((msg) => (
        <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </li>
      ))}
    </ul>
  )
}`,
    expectedKeywords: ['useOptimistic'],
    conditions: [
      {
        id: 'use-optimistic',
        label: 'useOptimistic を呼び出している',
        requiredKeywords: ['useOptimistic'],
        explanation: '実stateから楽観的stateを作るために useOptimistic を使います。',
      },
      {
        id: 'optimistic-update-fn',
        label: 'updateFn で送信中メッセージを追加している',
        requiredKeywords: ['sending: true', 'text: newText'],
        explanation: 'updateFn は既存stateに sending フラグ付きの一時メッセージを追加します。',
      },
      {
        id: 'call-add-optimistic',
        label: '送信時に addOptimisticMessage を呼んでいる',
        requiredKeywords: ['addOptimisticMessage', 'sendMessage'],
        explanation: 'サーバー送信前に楽観的更新を発火させます。',
      },
    ],
    explanation: 'useOptimistic(state, updateFn) でフックを呼び出し、楽観的な状態と更新関数を取得します。',
    solutionCode: `import { useOptimistic } from 'react'

function MessageList({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const text = e.target.message.value
    e.target.reset()
    addOptimisticMessage(text)
    await sendMessage(text)
  }

  return (
    <ul>
      {optimisticMessages.map((msg) => (
        <li key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </li>
      ))}
    </ul>
  )
}`,
  },
  challengeTask: {
    primaryPatternId: 'use-optimistic-1',
    patterns: [
      {
        id: 'use-optimistic-1',
        prompt: 'useOptimistic を使って「いいね」ボタンを楽観的に更新してください。',
        requirements: [
          'useOptimistic で likes カウントを楽観的に+1する',
          'ボタンクリック時に addOptimisticLike() を呼び、即座に表示を更新する',
          'toggleLike(postId) という非同期関数でサーバーへ送信する',
          '送信中は liked フラグを反転した楽観的な値を表示する',
        ],
        hints: [
          'updateFn: (state) => ({ ...state, likes: state.likes + 1, liked: !state.liked })',
          'addOptimisticLike は引数なし（payload 不要）でも使えます',
          'startTransition 内で addOptimisticLike と await toggleLike を呼びます',
        ],
        expectedKeywords: ['useOptimistic', 'addOptimistic'],
        conditions: [
          {
            id: 'optimistic-state',
            label: 'useOptimistic で post を楽観的に更新している',
            requiredKeywords: ['useOptimistic', 'optimisticPost', 'addOptimisticLike'],
            explanation: 'post から optimisticPost と楽観的更新関数を取得します。',
          },
          {
            id: 'update-likes',
            label: 'updateFn で likes と liked を更新している',
            requiredKeywords: ['likes', 'state.likes + 1', 'liked', '!state.liked'],
            explanation: 'いいね数を増やし、liked を反転した楽観的な post を返します。',
          },
          {
            id: 'transition-submit',
            label: 'startTransition 内で楽観的更新と送信を行っている',
            requiredKeywords: ['startTransition', 'addOptimisticLike', 'toggleLike'],
            explanation: '楽観的更新とサーバー送信を transition の中で実行します。',
          },
        ],
        solutionCode: `import { useOptimistic, useTransition } from 'react'

function LikeButton({ post, toggleLike }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPost, addOptimisticLike] = useOptimistic(
    post,
    (state) => ({
      ...state,
      likes: state.likes + 1,
      liked: !state.liked,
    })
  )

  function handleClick() {
    startTransition(async () => {
      addOptimisticLike()
      await toggleLike(post.id)
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {optimisticPost.liked ? '❤️' : '🤍'} {optimisticPost.likes}
    </button>
  )
}`,
        starterCode: `import { useOptimistic, useTransition } from 'react'

function LikeButton({ post, toggleLike }) {
  const [isPending, startTransition] = useTransition()
  // TODO: useOptimistic で likes と liked を楽観的に管理する
  // updateFn: likes を+1し、liked を反転する

  function handleClick() {
    startTransition(async () => {
      // TODO: 楽観的更新 → サーバー送信
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {/* TODO: 楽観的な likes と liked を表示 */}
      {post.liked ? '❤️' : '🤍'} {post.likes}
    </button>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useOptimistic, useTransition } from 'react'\n\nfunction LikeButton({ post, toggleLike }) {\n  const [isPending, startTransition] = useTransition()\n  ____0\n\n  function handleClick() {\n    startTransition(async () => {\n      ____1\n    })\n  }\n\n  return (\n    <button onClick={handleClick} disabled={isPending}>\n      {optimisticPost.liked ? '❤️' : '🤍'} {optimisticPost.likes}\n    </button>\n  )\n}`,
            blanks: [
              {
                id: 'use-optimistic',
                label: 'useOptimistic',
                correctTokens: ['const', '[optimisticPost, addOptimisticLike]', '=', 'useOptimistic', '(', 'post', ',', '(state) => ({', '...state,', 'likes: state.likes + 1,', 'liked: !state.liked', '})', ')'],
                distractorTokens: ['useState', 'useReducer', 'setState', 'dispatch'],
              },
              {
                id: 'optimistic-update',
                label: '楽観的更新',
                correctTokens: ['addOptimisticLike()', 'await', 'toggleLike(post.id)'],
                distractorTokens: ['setState', 'dispatch', 'useState', 'useReducer'],
              },
            ],
          },
      },
      {
        id: 'use-optimistic-2',
        prompt: 'useOptimistic を使ったTodoリストの追加を実装してください。',
        requirements: [
          'useOptimistic で todos リストを楽観的に更新する',
          'フォーム送信時に新しい Todo を即座にリストへ追加する（pending: true 付き）',
          'pending な Todo は opacity-50 で半透明表示する',
          'createTodo(title) でサーバーへ送信し、完了後に実際のリストが更新される',
        ],
        hints: [
          'updateFn: (state, title) => [...state, { id: `temp-${Date.now()}`, title, pending: true }]',
          'フォームの onSubmit で addOptimisticTodo(title) を呼ぶ',
          'className={`${todo.pending ? "opacity-50" : ""}`} でスタイルを制御',
        ],
        expectedKeywords: ['useOptimistic', 'pending'],
        starterCode: `import { useOptimistic } from 'react'

function TodoList({ todos, createTodo }) {
  // TODO: useOptimistic で todo リストを楽観的に管理する

  async function handleSubmit(e) {
    e.preventDefault()
    const title = e.target.title.value
    e.target.reset()
    // TODO: 楽観的更新 + サーバー送信
  }

  return (
    <div>
      <ul>
        {/* TODO: optimisticTodos をレンダリング（pending で opacity-50）*/}
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="新しい Todo" />
        <button type="submit">追加</button>
      </form>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useOptimistic } from 'react'\n\nfunction TodoList({ todos, createTodo }) {\n  ____0\n\n  async function handleSubmit(e) {\n    e.preventDefault()\n    const title = e.target.title.value\n    e.target.reset()\n    addOptimisticTodo(title)\n    await createTodo(title)\n  }\n\n  return (\n    <div>\n      <ul>\n        {optimisticTodos.map((todo) => (\n          ____1\n        ))}\n      </ul>\n      <form onSubmit={handleSubmit}>\n        <input name="title" placeholder="新しい Todo" />\n        <button type="submit">追加</button>\n      </form>\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'use-optimistic',
                label: 'useOptimistic',
                correctTokens: ['const', '[optimisticTodos, addOptimisticTodo]', '=', 'useOptimistic', '(', 'todos', ',', '(state, title) => [', '...state,', '{', 'id: `temp-${Date.now()}`,', 'title,', 'pending: true', '}', ']', ')'],
                distractorTokens: ['useState', 'useTransition', 'filter', 'reduce'],
              },
              {
                id: 'pending-item',
                label: 'pending表示',
                correctTokens: ['<li', 'key={todo.id}', "className={todo.pending ? 'opacity-50' : ''}>", '{todo.title}', '</li>'],
                distractorTokens: ['<div>', 'className', 'hidden', 'disabled'],
              },
            ],
          },
      },
    ],
  },
}

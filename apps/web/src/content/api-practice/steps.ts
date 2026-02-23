import type { LearningStepContent } from '../fundamentals/steps'

export const apiPracticeSteps: LearningStepContent[] = [
  // ─────────────────────────────────────────
  // Step 13: api-counter-get
  // ─────────────────────────────────────────
  {
    id: 'api-counter-get',
    order: 13,
    title: 'カウンターAPI (GET)',
    summary: 'APIからデータを取得し、画面に表示する基本パターンを学びます。',
    readMarkdown: `# カウンターAPI (GET)：データ取得の基本

## fetch API とは？

\`fetch\` は、ブラウザに標準搭載されている HTTP リクエスト関数です。外部 API からデータを取得するために使います。

\`\`\`ts
const response = await fetch('http://localhost:3001/counter')
const data = await response.json()
console.log(data) // { value: 0 }
\`\`\`

## useEffect でマウント時に GET する

React コンポーネントで「表示したときにデータを取得する」には、**useEffect** を使います。

\`\`\`tsx
import { useEffect, useState } from 'react'

export function CounterDisplay() {
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:3001/counter')
      const data = await res.json()
      setValue(data.value)
    }
    void load()
  }, []) // [] = マウント時に1回だけ実行

  return <p>カウンター: {value ?? '読み込み中...'}</p>
}
\`\`\`

## ローディング状態を管理する

ユーザーに「読み込み中」を伝えるために、**loading** フラグを状態として持ちます。

\`\`\`tsx
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function load() {
    setLoading(true)
    const res = await fetch('http://localhost:3001/counter')
    const data = await res.json()
    setValue(data.value)
    setLoading(false)
  }
  void load()
}, [])

if (loading) return <p>読み込み中...</p>
return <p>カウンター: {value}</p>
\`\`\`

## エラー状態を管理する

ネットワークエラーや API エラーをユーザーに伝えるために、**error** 状態も持ちましょう。

\`\`\`tsx
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('http://localhost:3001/counter')
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      const data = await res.json()
      setValue(data.value)
    } catch (e) {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }
  void load()
}, [])
\`\`\`

## まとめ

| 状態 | 役割 |
|------|------|
| \`loading\` | リクエスト中に true → UIにスピナー表示 |
| \`error\` | 失敗時に文字列 → UIにエラーメッセージ |
| \`data\` | 成功時にデータ → UIに結果を表示 |
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'fetch でレスポンスの JSON を取得するには、res の後にどのメソッドを呼び出しますか？',
        answer: 'json',
        hint: 'res.___() の形で、非同期メソッドです。',
      },
      {
        id: 'q2',
        prompt: 'コンポーネントがマウントされた直後に1回だけ処理を実行するには、useEffect の依存配列に何を渡しますか？（記号で答えてください）',
        answer: '[]',
        hint: '空の配列を渡すと「初回マウント時のみ」実行されます。',
      },
      {
        id: 'q3',
        prompt: 'fetch のレスポンスが成功かどうかを確認するプロパティは何ですか？（`res.___` の形で）',
        answer: 'ok',
        hint: 'HTTP ステータスコードが 200〜299 の場合に true になります。',
      },
      {
        id: 'q4',
        prompt: 'ローディング・エラー・成功の3状態を管理するパターンで、エラー時にユーザーへ文字列で伝えるために使う state の型は何ですか？（TypeScript で書いてください）',
        answer: 'string | null',
        hint: 'エラーがない時は null、エラー時はメッセージ文字列を入れます。',
      },
      {
        id: 'q5',
        prompt: 'try-catch の最後に必ず実行したい処理（ローディング解除など）は、どのブロックに書きますか？',
        answer: 'finally',
        hint: '成功でも失敗でも実行されるブロックです。',
      },
    ],
    testTask: {
      instruction: `GET /counter を呼び出してカウンター値を表示するコンポーネントを実装してください。

要件:
- useEffect でマウント時に fetch('http://localhost:3001/counter') を呼ぶ
- ローディング中は「読み込み中...」を表示する
- データ取得後はカウンター値（value）を表示する
- エラー時は「エラーが発生しました」を表示する`,
      starterCode: `import { useEffect, useState } from 'react';

export function CounterDisplay() {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: fetch で /counter を取得し、value をセットしてください
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;
  return <p>カウンター: {value}</p>;
}`,
      expectedKeywords: ['fetch', 'useEffect', 'setValue', 'setLoading', 'setError', 'json'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: '再取得ボタン付きカウンター表示コンポーネントを実装してください。',
          requirements: [
            'マウント時に GET /counter でカウンター値を取得して表示する',
            'ローディング・エラー状態を適切に管理する',
            '「再読み込み」ボタンをクリックすると再度 API を呼び出す',
            'エラー時にはエラーメッセージとボタンを表示する',
          ],
          hints: [
            'fetch 処理を関数として切り出すと、ボタンのクリックハンドラで再利用できます',
            'useEffect 内でその関数を呼び出す形にするとスッキリします',
          ],
          expectedKeywords: ['fetch', 'useEffect', 'useState', 'onClick', 'setValue'],
          starterCode: `import { useEffect, useState } from 'react';

export function CounterDisplay() {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: fetch 処理を loadCounter 関数として実装してください
  // async function loadCounter() { ... }

  useEffect(() => {
    // TODO: loadCounter を呼び出してください
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return (
    <div>
      <p>{error}</p>
      {/* TODO: 再読み込みボタン */}
    </div>
  );
  return (
    <div>
      <p>カウンター: {value}</p>
      {/* TODO: 再読み込みボタン */}
    </div>
  );
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 14: api-counter-post
  // ─────────────────────────────────────────
  {
    id: 'api-counter-post',
    order: 14,
    title: 'カウンターAPI (POST)',
    summary: 'APIにデータを送信し、サーバーの状態を更新する方法を学びます。',
    readMarkdown: `# カウンターAPI (POST)：データ送信の基本

## GET と POST の違い

| 目的 | メソッド | 説明 |
|------|----------|------|
| データ取得 | GET | URL にパラメータを含めて取得 |
| データ送信・更新 | POST / PUT / PATCH | リクエストボディにデータを含めて送信 |

## fetch で PUT リクエストを送る

json-server の \`/counter\` は PUT でカウンター値を更新できます。

\`\`\`ts
const response = await fetch('http://localhost:3001/counter', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 5 }),
})
const updated = await response.json()
console.log(updated) // { value: 5 }
\`\`\`

## ボタンクリックでカウンターを更新する

\`\`\`tsx
import { useEffect, useState } from 'react'

export function Counter() {
  const [value, setValue] = useState(0)

  // マウント時に現在値を取得
  useEffect(() => {
    async function load() {
      const res = await fetch('http://localhost:3001/counter')
      const data = await res.json()
      setValue(data.value)
    }
    void load()
  }, [])

  // ボタンクリックで +1
  async function handleIncrement() {
    const nextValue = value + 1
    const res = await fetch('http://localhost:3001/counter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: nextValue }),
    })
    const updated = await res.json()
    setValue(updated.value) // サーバーから返った値で更新
  }

  return (
    <div>
      <p>カウンター: {value}</p>
      <button onClick={() => void handleIncrement()}>+1</button>
    </div>
  )
}
\`\`\`

## 送信中状態（submitting）を管理する

ボタンを連打されないよう、送信中はボタンを無効化しましょう。

\`\`\`tsx
const [submitting, setSubmitting] = useState(false)

async function handleIncrement() {
  if (submitting) return
  setSubmitting(true)
  try {
    const res = await fetch('http://localhost:3001/counter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: value + 1 }),
    })
    const updated = await res.json()
    setValue(updated.value)
  } finally {
    setSubmitting(false)
  }
}

<button disabled={submitting} onClick={() => void handleIncrement()}>
  {submitting ? '送信中...' : '+1'}
</button>
\`\`\`

## Content-Type ヘッダーを忘れずに

JSON を送る場合は **必ず** \`Content-Type: application/json\` を指定します。これがないとサーバーがリクエストボディを JSON として解釈できません。
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'fetch でPUTリクエストを送る際に、method オプションに指定する文字列を答えてください。',
        answer: 'PUT',
        hint: 'HTTP メソッドは大文字で書きます。',
      },
      {
        id: 'q2',
        prompt: 'JSON をリクエストボディに含めて送る際、headers に指定するヘッダー名とその値を「名前: 値」の形で答えてください。',
        answer: 'Content-Type: application/json',
        hint: 'サーバーがボディの形式を判断するために必要なヘッダーです。',
      },
      {
        id: 'q3',
        prompt: 'JavaScript のオブジェクト { value: 5 } をリクエストボディに含める際に使う関数を答えてください。',
        answer: 'JSON.stringify',
        hint: 'オブジェクトを JSON 文字列に変換する関数です。',
      },
      {
        id: 'q4',
        prompt: 'ボタン連打を防ぐために送信中フラグを管理する state 変数の一般的な名前を答えてください。',
        answer: 'submitting',
        hint: '「送信している最中」を表す英単語を使います。',
      },
      {
        id: 'q5',
        prompt: 'ボタンを押せなくするための HTML 属性名を答えてください。',
        answer: 'disabled',
        hint: '「無効化」を意味する属性です。',
      },
    ],
    testTask: {
      instruction: `カウンター値を +1 する PUT リクエストを実装してください。

要件:
- マウント時に GET /counter でカウンター値を取得して表示する
- 「+1」ボタンをクリックすると PUT /counter で値を +1 更新する
- 送信中はボタンを disabled にし「送信中...」と表示する`,
      starterCode: `import { useEffect, useState } from 'react';

export function Counter() {
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/counter')
      .then(res => res.json())
      .then(data => setValue(data.value));
  }, []);

  async function handleIncrement() {
    // TODO: PUT /counter で value + 1 を送信し、レスポンスの value で setValue してください
    // 送信中は submitting を true にし、finally で false に戻してください
  }

  return (
    <div>
      <p>カウンター: {value}</p>
      <button disabled={submitting} onClick={() => void handleIncrement()}>
        {submitting ? '送信中...' : '+1'}
      </button>
    </div>
  );
}`,
      expectedKeywords: ['PUT', 'JSON.stringify', 'Content-Type', 'setSubmitting', 'setValue', 'finally'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: '+1 / -1 / リセットの3操作ができるカウンターコンポーネントを実装してください。',
          requirements: [
            'マウント時に GET /counter で初期値を取得する',
            '+1 ボタン: PUT /counter で value を +1 する',
            '-1 ボタン: PUT /counter で value を -1 する（0未満にならないよう制御する）',
            'リセットボタン: PUT /counter で value を 0 にする',
            '各ボタンの操作中は disabled にする',
          ],
          hints: [
            'sendValue(newValue) のような共通関数を作ると DRY に書けます',
            'Math.max(0, value - 1) で 0 未満を防げます',
          ],
          expectedKeywords: ['fetch', 'PUT', 'JSON.stringify', 'useState', 'useEffect', 'disabled'],
          starterCode: `import { useEffect, useState } from 'react';

export function Counter() {
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/counter')
      .then(res => res.json())
      .then(data => setValue(data.value));
  }, []);

  // TODO: PUT /counter に nextValue を送る共通関数を実装してください
  // async function sendValue(nextValue: number) { ... }

  return (
    <div>
      <p>カウンター: {value}</p>
      {/* TODO: +1 / -1 / リセット ボタンを追加してください */}
    </div>
  );
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 15: api-tasks-list
  // ─────────────────────────────────────────
  {
    id: 'api-tasks-list',
    order: 15,
    title: 'タスク一覧 (GET)',
    summary: 'リストデータを API から取得して一覧表示するパターンを実装します。',
    readMarkdown: `# タスク一覧 (GET)：リストデータの取得と表示

## 配列データを取得する

json-server の \`/tasks\` は配列を返します。

\`\`\`ts
const res = await fetch('http://localhost:3001/tasks')
const tasks = await res.json()
// [
//   { id: '1', title: 'Reactの基礎を学ぶ', completed: true },
//   { id: '2', title: 'useEffectを理解する', completed: false },
// ]
\`\`\`

## 型を定義してデータを安全に扱う

\`\`\`ts
interface Task {
  id: string
  title: string
  completed: boolean
}

const [tasks, setTasks] = useState<Task[]>([])
\`\`\`

## タスク一覧コンポーネント

\`\`\`tsx
import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  completed: boolean
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:3001/tasks')
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        const data: Task[] = await res.json()
        setTasks(data)
      } catch {
        setError('タスクの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) return <p>読み込み中...</p>
  if (error) return <p>{error}</p>

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </li>
      ))}
    </ul>
  )
}
\`\`\`

## key プロパティの重要性

リストを \`map\` でレンダリングする際、各要素に **一意な \`key\` プロパティ**が必要です。
- ✅ 安定した一意の ID: \`key={task.id}\`
- ❌ インデックス: \`key={index}\`（並び替え・削除時にバグの原因になる）

## 空の配列のハンドリング

データが0件の場合のUIも忘れずに実装しましょう。

\`\`\`tsx
if (tasks.length === 0) {
  return <p>タスクはまだありません</p>
}
\`\`\`
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'Task 型の配列を useState で初期化する書き方を答えてください（TypeScript）。',
        answer: 'useState<Task[]>([])',
        hint: 'ジェネリクスで型を指定し、初期値は空配列です。',
      },
      {
        id: 'q2',
        prompt: 'リストを map でレンダリングする際、各要素に必要なプロパティ名を答えてください。',
        answer: 'key',
        hint: 'Reactが各要素を識別するために使う特別なプロパティです。',
      },
      {
        id: 'q3',
        prompt: 'task.completed が true のとき打ち消し線を表示するインラインスタイルのプロパティ値を答えてください。',
        answer: 'line-through',
        hint: 'CSS の text-decoration の値です。',
      },
      {
        id: 'q4',
        prompt: '配列データの取得に成功したら呼び出す state 更新関数の名前（setXxx 形式）の一般的な例を答えてください。',
        answer: 'setTasks',
        hint: 'tasks state に対応した setter 関数です。',
      },
      {
        id: 'q5',
        prompt: 'map でレンダリングする際、key にインデックスを使うべきではない理由を一言で答えてください。',
        answer: '並び替えや削除時にバグが起きる',
        hint: 'インデックスは要素の順序が変わると変化してしまいます。',
      },
    ],
    testTask: {
      instruction: `GET /tasks を呼び出してタスク一覧を表示するコンポーネントを実装してください。

要件:
- useEffect でマウント時に fetch('http://localhost:3001/tasks') を呼ぶ
- ローディング中は「読み込み中...」を表示する
- 各タスクを <li> で表示し、completed が true なら打ち消し線を適用する
- タスクが0件なら「タスクはありません」を表示する`,
      starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch で /tasks を取得し、setTasks してください
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (tasks.length === 0) return <p>タスクはありません</p>;

  return (
    <ul>
      {tasks.map((task) => (
        // TODO: key を設定し、completed なら打ち消し線を適用してください
        <li>{task.title}</li>
      ))}
    </ul>
  );
}`,
      expectedKeywords: ['fetch', 'useEffect', 'setTasks', 'setLoading', 'map', 'key', 'task.id'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: 'ローディング・エラー・空状態・一覧表示を完全に実装したタスク一覧コンポーネントを作ってください。',
          requirements: [
            'マウント時に GET /tasks でタスク一覧を取得する',
            'ローディング・エラー・空状態（0件）・一覧の4状態を適切に表示する',
            'completed が true のタスクは打ち消し線で表示する',
            'エラー時は再読み込みボタンを表示する',
          ],
          hints: [
            'ローディング → エラー → 空 → 一覧 の順でアーリーリターンすると読みやすくなります',
            '再読み込みには fetch を呼ぶ関数を切り出して再利用しましょう',
          ],
          expectedKeywords: ['fetch', 'useEffect', 'useState', 'map', 'key', 'task.id', 'completed'],
          starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: loadTasks 関数と useEffect を実装してください

  if (loading) return <p>読み込み中...</p>;
  if (error) return (
    <div>
      <p>{error}</p>
      {/* TODO: 再読み込みボタン */}
    </div>
  );
  if (tasks.length === 0) return <p>タスクはありません</p>;

  return (
    <ul>
      {tasks.map((task) => (
        // TODO: 完成させてください
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 16: api-tasks-create
  // ─────────────────────────────────────────
  {
    id: 'api-tasks-create',
    order: 16,
    title: 'タスク追加 (POST)',
    summary: 'フォームからデータを送信し、リストに追加する処理を実装します。',
    readMarkdown: `# タスク追加 (POST)：フォームからのデータ送信

## POST でタスクを作成する

json-server の \`POST /tasks\` はリクエストボディのオブジェクトを保存し、自動で \`id\` を付与して返します。

\`\`\`ts
const res = await fetch('http://localhost:3001/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '新しいタスク', completed: false }),
})
const newTask = await res.json()
// { id: 'abc123', title: '新しいタスク', completed: false }
\`\`\`

## フォームの入力値を管理する

\`\`\`tsx
const [inputValue, setInputValue] = useState('')

<input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  placeholder="タスク名を入力..."
/>
\`\`\`

## POST 後にリストを更新する2つのパターン

### パターン1: 再フェッチ（シンプル）

\`\`\`tsx
async function handleCreate() {
  await fetch('http://localhost:3001/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: inputValue, completed: false }),
  })
  // POST 後に GET で最新リストを再取得
  const res = await fetch('http://localhost:3001/tasks')
  setTasks(await res.json())
  setInputValue('') // 入力欄をクリア
}
\`\`\`

### パターン2: 楽観的更新（レスポンスで即時反映）

\`\`\`tsx
async function handleCreate() {
  const res = await fetch('http://localhost:3001/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: inputValue, completed: false }),
  })
  const newTask = await res.json()
  setTasks((prev) => [...prev, newTask]) // レスポンスで即時追加
  setInputValue('')
}
\`\`\`

## フォーム送信の基本パターン

\`\`\`tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault() // デフォルトのページリロードを防ぐ
  if (!inputValue.trim()) return // 空入力を無視

  setSubmitting(true)
  try {
    await handleCreate()
  } finally {
    setSubmitting(false)
  }
}

<form onSubmit={(e) => void handleSubmit(e)}>
  <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
  <button type="submit" disabled={submitting}>
    {submitting ? '追加中...' : '追加'}
  </button>
</form>
\`\`\`

## バリデーション

送信前に入力値を検証することでユーザビリティが上がります。

\`\`\`ts
if (!inputValue.trim()) {
  setError('タスク名を入力してください')
  return
}
\`\`\`
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'フォームの submit 時のデフォルト動作（ページリロード）を防ぐために呼ぶメソッドは何ですか？',
        answer: 'e.preventDefault',
        hint: 'イベントオブジェクト e のメソッドです。',
      },
      {
        id: 'q2',
        prompt: 'POST 後に既存リストの末尾に新アイテムを追加する state 更新の書き方を答えてください（スプレッド構文を使った形で）。',
        answer: 'setTasks((prev) => [...prev, newTask])',
        hint: '関数形式の setState でスプレッド演算子を使います。',
      },
      {
        id: 'q3',
        prompt: '空文字列や空白のみの入力を検出するために使う String のメソッドは何ですか？',
        answer: 'trim',
        hint: '前後の空白を取り除くメソッドです。',
      },
      {
        id: 'q4',
        prompt: 'POST リクエスト後に GET でリストを再取得するパターンと、レスポンスで即時追加するパターンのうち、ネットワーク往復が1回で済むのはどちらですか？',
        answer: 'レスポンスで即時追加（楽観的更新）',
        hint: 'POST のレスポンスに作成されたアイテムが含まれています。',
      },
      {
        id: 'q5',
        prompt: 'input の value を state で管理する際、onChange に渡す関数の中で何を呼びますか？（e.target.___ を使って）',
        answer: 'setInputValue(e.target.value)',
        hint: '入力イベントのターゲット要素の現在値を state にセットします。',
      },
    ],
    testTask: {
      instruction: `フォームからタスクを追加する機能を実装してください。

要件:
- 入力欄（input）とフォーム送信ボタンを配置する
- フォームを送信すると POST /tasks を呼び出し、タスクを作成する
- 作成後、リストに新しいタスクを追加する（スプレッド構文で）
- 送信後は入力欄を空にする
- 空入力の場合は送信しない（trim でチェック）`,
      starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // TODO: POST /tasks で新しいタスクを作成してください
    // 作成後: setTasks で追加し、setInputValue('') で入力欄をクリア
  }

  return (
    <div>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="タスク名を入力..."
        />
        <button type="submit" disabled={submitting}>
          {submitting ? '追加中...' : '追加'}
        </button>
      </form>
      <ul>
        {tasks.map(task => <li key={task.id}>{task.title}</li>)}
      </ul>
    </div>
  );
}`,
      expectedKeywords: ['POST', 'JSON.stringify', 'Content-Type', 'setTasks', 'prev', 'setInputValue', 'trim'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: 'バリデーション・ローディング・エラー表示を備えたタスク追加フォームを実装してください。',
          requirements: [
            'マウント時に GET /tasks でタスク一覧を取得する',
            'タスク名の入力欄と「追加」ボタンを持つフォームを実装する',
            '空入力の場合はバリデーションエラーを表示する',
            'POST 後にレスポンスで即時リストへ追加し、入力欄をクリアする',
            '送信中はボタンを disabled にする',
          ],
          hints: [
            'バリデーションエラーは error state に文字列を入れ、送信成功時は null にリセットします',
            'setTasks(prev => [...prev, newTask]) でリストを更新します',
          ],
          expectedKeywords: ['fetch', 'POST', 'JSON.stringify', 'useState', 'useEffect', 'trim', 'setTasks', 'prev'],
          starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: バリデーション → POST → リスト更新 の流れを実装してください
  }

  return (
    <div>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="タスク名を入力..."
        />
        <button type="submit" disabled={submitting}>
          {submitting ? '追加中...' : '追加'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {tasks.map(task => <li key={task.id}>{task.title}</li>)}
      </ul>
    </div>
  );
}`,
        },
      ],
    },
  },
]

export function getApiPracticeStep(stepId: string) {
  return apiPracticeSteps.find((step) => step.id === stepId)
}

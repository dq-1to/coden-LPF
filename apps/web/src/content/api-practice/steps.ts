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
        explanation: 'fetchで取得したレスポンスはそのままでは使えません。res.json()でJSONをパースしてJavaScriptオブジェクトに変換します。',
      },
      {
        id: 'q2',
        prompt: 'コンポーネントがマウントされた直後に1回だけ処理を実行するには、useEffect の依存配列に何を渡しますか？（記号で答えてください）',
        answer: '[]',
        hint: '空の配列を渡すと「初回マウント時のみ」実行されます。',
        explanation: 'useEffectの第二引数に[]を渡すとコンポーネントのマウント時に1回だけ実行されます。APIのデータ初回取得に使う基本パターンです。',
      },
      {
        id: 'q3',
        prompt: 'fetch のレスポンスが成功かどうかを確認するプロパティは何ですか？（`res.___` の形で）',
        answer: 'ok',
        hint: 'HTTP ステータスコードが 200〜299 の場合に true になります。',
        explanation: 'fetchはネットワークエラー以外では例外を投げません。res.okを確認することで404や500などのエラーレスポンスも検出できます。',
      },
      {
        id: 'q4',
        prompt: 'ローディング・エラー・成功の3状態を管理するパターンで、エラー時にユーザーへ文字列で伝えるために使う state の型は何ですか？（TypeScript で書いてください）',
        answer: 'string | null',
        hint: 'エラーがない時は null、エラー時はメッセージ文字列を入れます。',
        explanation: 'string | nullとすることで「エラーなし（null）」と「エラーあり（文字列）」の2状態を1つのstateで表現できます。',
      },
      {
        id: 'q5',
        prompt: 'try-catch の最後に必ず実行したい処理（ローディング解除など）は、どのブロックに書きますか？',
        answer: 'finally',
        hint: '成功でも失敗でも実行されるブロックです。',
        explanation: 'finallyブロックはtryとcatchのどちらが実行されても必ず実行されます。ローディング解除はここに書くのが確実です。',
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
      explanation: 'useEffect内でfetchを呼びloading/error/dataの3状態を管理するのがReactのGETデータ取得の基本パターンです。',
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
        explanation: 'fetchのオプションにmethod: "PUT"を指定することで、GETデフォルトから変更してPUTリクエストを送ることができます。',
      },
      {
        id: 'q2',
        prompt: 'JSON をリクエストボディに含めて送る際、headers に指定するヘッダー名とその値を「名前: 値」の形で答えてください。',
        answer: 'Content-Type: application/json',
        hint: 'サーバーがボディの形式を判断するために必要なヘッダーです。',
        explanation: 'JSONを送るときはContent-Type: application/jsonを必ずheadersに指定します。これがないとサーバーがボディをJSONと認識しません。',
      },
      {
        id: 'q3',
        prompt: 'JavaScript のオブジェクト { value: 5 } をリクエストボディに含める際に使う関数を答えてください。',
        answer: 'JSON.stringify',
        hint: 'オブジェクトを JSON 文字列に変換する関数です。',
        explanation: 'fetchのbodyにはオブジェクトをそのまま渡せないためJSON.stringifyで文字列に変換します。受け取り側はJSON.parseで戻します。',
      },
      {
        id: 'q4',
        prompt: 'ボタン連打を防ぐために送信中フラグを管理する state 変数の一般的な名前を答えてください。',
        answer: 'submitting',
        hint: '「送信している最中」を表す英単語を使います。',
        explanation: 'submitting stateでリクエスト中かどうかを管理します。trueのときボタンをdisabledにすることで連打を防止できます。',
      },
      {
        id: 'q5',
        prompt: 'ボタンを押せなくするための HTML 属性名を答えてください。',
        answer: 'disabled',
        hint: '「無効化」を意味する属性です。',
        explanation: 'disabled={submitting}とすることで送信中はボタンが押せなくなります。連打によるAPIの重複呼び出しを防ぐためのUIパターンです。',
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
      explanation: 'PUT /counterにJSON.stringifyしたボディを送り、finallyでsubmittingをfalseに戻すのが送信処理の基本パターンです。',
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
        explanation: 'useState<Task[]>([])のようにジェネリクスで型を指定することで、TypeScriptが配列の要素の型を正しく推論できます。',
      },
      {
        id: 'q2',
        prompt: 'リストを map でレンダリングする際、各要素に必要なプロパティ名を答えてください。',
        answer: 'key',
        hint: 'Reactが各要素を識別するために使う特別なプロパティです。',
        explanation: 'mapでリストをレンダリングするとき、keyに一意なIDを渡すことでReactが要素の追加・削除・順序変更を効率的に処理できます。',
      },
      {
        id: 'q3',
        prompt: 'task.completed が true のとき打ち消し線を表示するインラインスタイルのプロパティ値を答えてください。',
        answer: 'line-through',
        hint: 'CSS の text-decoration の値です。',
        explanation: 'textDecoration: task.completed ? "line-through" : "none"のように三項演算子で条件付きスタイルを適用できます。',
      },
      {
        id: 'q4',
        prompt: '配列データの取得に成功したら呼び出す state 更新関数の名前（setXxx 形式）の一般的な例を答えてください。',
        answer: 'setTasks',
        hint: 'tasks state に対応した setter 関数です。',
        explanation: 'APIから取得した配列データをsetTasksに渡すことで、tasksステートが更新されReactが再レンダリングしてリストが表示されます。',
      },
      {
        id: 'q5',
        prompt: 'map でレンダリングする際、key にインデックスを使うべきではない理由を一言で答えてください。',
        answer: '並び替えや削除時にバグが起きる',
        hint: 'インデックスは要素の順序が変わると変化してしまいます。',
        explanation: '要素が追加・削除・並び替えされるとインデックスが変わり、Reactが誤って別の要素と認識してバグが発生することがあります。',
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
      explanation: 'useEffectでGET /tasksを呼び、setTasksでstateを更新してからmapでリストをレンダリングします。keyにはtask.idを使います。',
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
        explanation: 'e.preventDefault()を呼ばないとフォーム送信時にページがリロードされます。ReactのSPAではこれを必ず防ぐ必要があります。',
      },
      {
        id: 'q2',
        prompt: 'POST 後に既存リストの末尾に新アイテムを追加する state 更新の書き方を答えてください（スプレッド構文を使った形で）。',
        answer: 'setTasks((prev) => [...prev, newTask])',
        hint: '関数形式の setState でスプレッド演算子を使います。',
        explanation: 'setTasks(prev => [...prev, newTask])とすることで既存のリストを保ちながら末尾に新要素を追加できます。直接mutateしない重要なパターンです。',
      },
      {
        id: 'q3',
        prompt: '空文字列や空白のみの入力を検出するために使う String のメソッドは何ですか？',
        answer: 'trim',
        hint: '前後の空白を取り除くメソッドです。',
        explanation: 'inputValue.trim()で前後の空白を除去した上で空かどうかチェックします。空白だけの入力を無効として扱えます。',
      },
      {
        id: 'q4',
        prompt: 'POST リクエスト後に GET でリストを再取得するパターンと、レスポンスで即時追加するパターンのうち、ネットワーク往復が1回で済むのはどちらですか？',
        answer: 'レスポンスで即時追加（楽観的更新）',
        hint: 'POST のレスポンスに作成されたアイテムが含まれています。',
        explanation: 'POSTのレスポンスには作成されたオブジェクト（IDつき）が返ってきます。これをそのままリストに追加すれば再GETが不要です。',
      },
      {
        id: 'q5',
        prompt: 'input の value を state で管理する際、onChange に渡す関数の中で何を呼びますか？（e.target.___ を使って）',
        answer: 'setInputValue(e.target.value)',
        hint: '入力イベントのターゲット要素の現在値を state にセットします。',
        explanation: 'onChange={(e) => setInputValue(e.target.value)}でinputの入力値をリアルタイムにstateと同期させる制御されたコンポーネントのパターンです。',
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
      explanation: 'POST /tasksにタスクを送信し、レスポンスのnewTaskをスプレッド構文でリストに追加します。送信後は入力欄を空にします。',
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

  // ─────────────────────────────────────────
  // Step 17: api-tasks-update
  // ─────────────────────────────────────────
  {
    id: 'api-tasks-update',
    order: 17,
    title: 'タスク更新 (PATCH)',
    summary: '完了状態の切り替えなど、既存データの部分更新処理を実装します。',
    readMarkdown: `# タスク更新 (PATCH)：部分更新の実装

## PATCH と PUT の違い

| メソッド | 用途 | ボディ |
|---------|------|--------|
| PUT | リソース全体を置き換える | 全フィールドを含む |
| PATCH | 一部のフィールドだけ更新する | 変更するフィールドのみ |

タスクの「完了/未完了」を切り替えるだけなら、PATCH で \`completed\` フィールドだけ送るのが適切です。

\`\`\`ts
// PATCH: completed フィールドだけ更新
const response = await fetch(\`http://localhost:3001/tasks/\${id}\`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true }),
})
const updated = await response.json()
\`\`\`

## チェックボックスでタスクの完了状態を切り替える

\`\`\`tsx
async function handleToggle(task: Task) {
  const res = await fetch(\`http://localhost:3001/tasks/\${task.id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !task.completed }),
  })
  const updated: Task = await res.json()

  // 該当タスクだけ置き換えてリストを更新
  setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
}
\`\`\`

## 楽観的更新（Optimistic Update）

API レスポンスを待たずに UI を先に更新し、失敗時にロールバックする手法です。

\`\`\`tsx
async function handleToggle(task: Task) {
  // 先に UI を更新（楽観的）
  setTasks((prev) =>
    prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
  )

  try {
    await fetch(\`http://localhost:3001/tasks/\${task.id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
  } catch {
    // 失敗したら元に戻す（ロールバック）
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
    )
  }
}
\`\`\`

## まとめ

| パターン | 特徴 |
|---------|------|
| 通常更新 | API 完了後に UI を更新。確実だが遅く感じる |
| 楽観的更新 | UI を先に更新。高速に感じるが失敗時のロールバックが必要 |
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'リソースの一部フィールドだけを更新するために使う HTTP メソッドはどれですか？',
        answer: 'PATCH',
        hint: 'PUT は全体を置き換えますが、___ は一部だけ更新します。',
        explanation: 'PATCHは変更したいフィールドだけをボディに含めて送ります。completedだけ更新したい場合はPATCHが適切なHTTPメソッドです。',
      },
      {
        id: 'q2',
        prompt: 'fetch で PATCH リクエストを送るとき、headers に設定する Content-Type の値は何ですか？（完全な文字列で答えてください）',
        answer: 'application/json',
        hint: 'JSON 形式でデータを送るときの MIME タイプです。',
        explanation: 'PATCHでもPOSTと同様に、JSONを送るときはheadersにContent-Type: application/jsonを指定する必要があります。',
      },
      {
        id: 'q3',
        prompt: 'PATCH でタスクの completed を更新した後、リスト state を更新するには配列の何メソッドを使うのが適切ですか？',
        answer: 'map',
        hint: '各要素を変換して新しい配列を返すメソッドです。ID が一致する要素だけ書き換えます。',
        explanation: 'prev.map(t => t.id === updated.id ? updated : t)とすることで、更新した要素だけを新しいオブジェクトに置き換えた配列が得られます。',
      },
      {
        id: 'q4',
        prompt: 'API レスポンスを待たずに先に UI を更新し、失敗時に元に戻す手法を何と呼びますか？（カタカナ）',
        answer: '楽観的更新',
        hint: '「Optimistic Update」の日本語訳です。',
        explanation: '楽観的更新はAPIのレスポンスを待たずにUIを先に更新します。操作が成功すると仮定して即座に反映し、UXを向上させる手法です。',
      },
      {
        id: 'q5',
        prompt: 'fetch で URL にタスク ID を埋め込む場合、テンプレートリテラルで書くとどうなりますか？（task.id を使って）',
        answer: '`http://localhost:3001/tasks/${task.id}`',
        hint: 'バッククォートで囲み、${ } でJSの値を埋め込みます。',
        explanation: 'テンプレートリテラルでURLにIDを動的に埋め込めます。`/tasks/${task.id}`のようにすると特定リソースのURLが作れます。',
      },
    ],
    testTask: {
      instruction: `チェックボックスでタスクの完了状態を切り替えるコンポーネントを実装してください。

要件:
- マウント時に GET /tasks でタスク一覧を取得する
- 各タスクにチェックボックスを表示し、クリックで completed を反転させる
- チェックボックスのクリックで PATCH /tasks/:id を呼び出す
- API レスポンスで該当タスクの状態を更新する`,
      starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // TODO: GET /tasks でタスク一覧を取得してください
  }, []);

  async function handleToggle(task: Task) {
    // TODO: PATCH /tasks/:id で completed を反転してください
    // レスポンスで該当タスクを更新してください
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => void handleToggle(task)}
          />
          {task.title}
        </li>
      ))}
    </ul>
  );
}`,
      expectedKeywords: ['PATCH', 'fetch', 'setTasks', 'map', 'completed', 'handleToggle'],
      explanation: 'PATCH /tasks/:idにcompletedの反転値を送り、レスポンスでsetTasks+mapを使って該当タスクだけを更新します。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: '楽観的更新でタスクの完了状態を切り替える TaskList を実装してください。',
          requirements: [
            'マウント時に GET /tasks でタスク一覧を取得する',
            'チェックボックスのクリックで UI を先に更新する（楽観的更新）',
            'PATCH /tasks/:id を呼び出し、失敗時は元の状態に戻す',
            'ローディング中はチェックボックスを disabled にする',
          ],
          hints: [
            '楽観的更新: setTasks で先に completed を反転させてから fetch を呼ぶ',
            'ロールバック: catch ブロックで元の task.completed に戻す',
            '更新中のタスク ID を Set で管理すると disabled 制御がしやすい',
          ],
          expectedKeywords: ['PATCH', 'setTasks', 'map', 'try', 'catch', 'disabled'],
          starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: タスク一覧を取得してください
  }, []);

  async function handleToggle(task: Task) {
    // TODO: 楽観的更新を実装してください
    // 1. updatingIds に task.id を追加
    // 2. setTasks で completed を先に反転
    // 3. PATCH を呼び出す
    // 4. 失敗時はロールバック
    // 5. finally で updatingIds から task.id を除去
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            disabled={updatingIds.has(task.id)}
            onChange={() => void handleToggle(task)}
          />
          {task.title}
        </li>
      ))}
    </ul>
  );
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 18: api-tasks-delete
  // ─────────────────────────────────────────
  {
    id: 'api-tasks-delete',
    order: 18,
    title: 'タスク削除 (DELETE)',
    summary: 'APIで削除処理を行い、リストから即時除去するUIを実装します。',
    readMarkdown: `# タスク削除 (DELETE)：削除処理の実装

## DELETE リクエストの基本

DELETE は指定したリソースを削除するメソッドです。通常、リクエストボディは不要で URL に ID を含めます。

\`\`\`ts
const response = await fetch(\`http://localhost:3001/tasks/\${id}\`, {
  method: 'DELETE',
})
// 成功時: 200 OK（json-server は削除されたオブジェクトを返す）
\`\`\`

## 削除後にリストから除去する

API で削除成功後、\`filter\` で該当タスクを配列から取り除きます。

\`\`\`tsx
async function handleDelete(id: string) {
  await fetch(\`http://localhost:3001/tasks/\${id}\`, {
    method: 'DELETE',
  })

  // 削除したタスクを除外して state を更新
  setTasks((prev) => prev.filter((t) => t.id !== id))
}
\`\`\`

## 削除中の二重クリックを防ぐ

削除ボタンを連打されないよう、削除中は無効化します。

\`\`\`tsx
const [deletingId, setDeletingId] = useState<string | null>(null)

async function handleDelete(id: string) {
  if (deletingId) return
  setDeletingId(id)
  try {
    await fetch(\`http://localhost:3001/tasks/\${id}\`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  } finally {
    setDeletingId(null)
  }
}

// ボタン側
<button
  onClick={() => void handleDelete(task.id)}
  disabled={deletingId === task.id}
>
  {deletingId === task.id ? '削除中...' : '削除'}
</button>
\`\`\`

## まとめ

| 操作 | コード |
|------|--------|
| 削除リクエスト | \`fetch(url, { method: 'DELETE' })\` |
| リストから除去 | \`setTasks(prev => prev.filter(t => t.id !== id))\` |
| 二重クリック防止 | \`deletingId\` state でボタンを \`disabled\` に |
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'リソースを削除するための HTTP メソッドは何ですか？',
        answer: 'DELETE',
        hint: '「削除する」を英語にするとそのままメソッド名になります。',
        explanation: 'fetchのオプションにmethod: "DELETE"を指定することで削除リクエストを送れます。ボディは不要で、URLにIDを含めます。',
      },
      {
        id: 'q2',
        prompt: 'DELETE リクエストでは URL にどのような情報を含めますか？',
        answer: 'ID',
        hint: 'どのリソースを削除するかを URL で指定します。`/tasks/___` の形です。',
        explanation: '`/tasks/${id}`のようにURLにIDを含めることで、サーバーはどのリソースを削除するかを判断できます。',
      },
      {
        id: 'q3',
        prompt: '削除成功後に特定 ID のタスクをリストから除去するには、配列の何メソッドを使いますか？',
        answer: 'filter',
        hint: '条件に一致しない要素を取り除いて新しい配列を返すメソッドです。',
        explanation: 'prev.filter(t => t.id !== id)で削除したタスク以外の要素だけの新しい配列を作りstateを更新します。',
      },
      {
        id: 'q4',
        prompt: '削除処理中のボタンを無効化するため、処理中のタスク ID を保持する state の型は何が適切ですか？（TypeScript で）',
        answer: 'string | null',
        hint: '削除中のタスク ID（string）か、処理なし（null）のどちらかです。',
        explanation: 'deletingId stateに削除中のIDを入れることで、そのタスクのボタンだけをdisabledにして二重クリックを防げます。',
      },
      {
        id: 'q5',
        prompt: '削除完了・失敗どちらの場合でも `deletingId` を null に戻すには、try-catch の何ブロックに書きますか？',
        answer: 'finally',
        hint: '成功でも失敗でも必ず実行されるブロックです。',
        explanation: 'finallyブロックにdeletingId = nullを書くことで、削除成功・失敗どちらの場合もボタンが再び有効になります。',
      },
    ],
    testTask: {
      instruction: `削除ボタンでタスクをリストから除去するコンポーネントを実装してください。

要件:
- マウント時に GET /tasks でタスク一覧を取得する
- 各タスクに「削除」ボタンを表示する
- ボタンのクリックで DELETE /tasks/:id を呼び出す
- 削除成功後にリストから該当タスクを除去する
- 削除中はボタンを disabled にする`,
      starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: GET /tasks でタスク一覧を取得してください
  }, []);

  async function handleDelete(id: string) {
    // TODO: DELETE /tasks/:id を呼び出してリストから除去してください
    // deletingId を使って二重クリックを防いでください
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title}
          <button
            onClick={() => void handleDelete(task.id)}
            disabled={deletingId === task.id}
          >
            {deletingId === task.id ? '削除中...' : '削除'}
          </button>
        </li>
      ))}
    </ul>
  );
}`,
      expectedKeywords: ['DELETE', 'fetch', 'filter', 'setTasks', 'setDeletingId', 'disabled'],
      explanation: 'DELETE /tasks/:idを呼び、成功後にfilterで該当タスクを除去します。deletingIdで削除中ボタンをdisabledにします。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: '確認ダイアログ付きでタスクを削除する TaskList を実装してください。',
          requirements: [
            'マウント時に GET /tasks でタスク一覧を取得する',
            '削除ボタンをクリックしたら window.confirm でユーザーに確認する',
            'OK なら DELETE /tasks/:id を呼び出してリストから除去する',
            'キャンセルなら何もしない',
            '削除中はボタンを disabled にして「削除中...」と表示する',
          ],
          hints: [
            'window.confirm はユーザーが OK を押すと true を返します',
            'deletingId が null でない場合は処理をスキップする',
            'finally ブロックで deletingId を null に戻すのを忘れずに',
          ],
          expectedKeywords: ['DELETE', 'confirm', 'filter', 'setTasks', 'setDeletingId', 'finally'],
          starterCode: `import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: タスク一覧を取得してください
  }, []);

  async function handleDelete(task: Task) {
    // TODO: window.confirm で確認してから DELETE を呼び出してください
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title}
          <button
            onClick={() => void handleDelete(task)}
            disabled={deletingId === task.id}
          >
            {deletingId === task.id ? '削除中...' : '削除'}
          </button>
        </li>
      ))}
    </ul>
  );
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 19: api-custom-hook
  // ─────────────────────────────────────────
  {
    id: 'api-custom-hook',
    order: 19,
    title: 'useTasksフック',
    summary: 'API操作をカスタムフックに集約し、コンポーネントをシンプルに保ちます。',
    readMarkdown: `# useTasksフック：API操作のカスタムフック化

## カスタムフックとは？

**カスタムフック**は、React の hooks（useState / useEffect など）を組み合わせたロジックを再利用可能な関数として切り出す仕組みです。名前は必ず \`use\` で始めます。

## なぜカスタムフックに分けるのか？

コンポーネントにロジックが増えると、「表示」と「データ処理」が混在して読みにくくなります。

\`\`\`tsx
// ❌ ロジックとUIが混在したコンポーネント（200行超え）
export function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // fetchTasks, createTask, updateTask, deleteTask ... 100行のロジック

  return <div>...</div>  // UIが埋もれている
}

// ✅ カスタムフックに分離
export function TaskPage() {
  const { tasks, loading, error, createTask, toggleTask, deleteTask } = useTasks()

  return <div>...</div>  // UIに集中できる
}
\`\`\`

## useTasks の実装

\`\`\`ts
import { useCallback, useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  completed: boolean
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
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
  }, [])

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (title: string) => {
    const res = await fetch('http://localhost:3001/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false }),
    })
    const newTask: Task = await res.json()
    setTasks((prev) => [...prev, newTask])
  }, [])

  const toggleTask = useCallback(async (task: Task) => {
    const res = await fetch(\`http://localhost:3001/tasks/\${task.id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    const updated: Task = await res.json()
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    await fetch(\`http://localhost:3001/tasks/\${id}\`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { tasks, loading, error, createTask, toggleTask, deleteTask, refetch: fetchTasks }
}
\`\`\`

## useCallback を使う理由

\`useEffect\` の依存配列に関数を入れるとき、毎レンダーで新しい関数が作られると無限ループになります。\`useCallback\` でメモ化することで、この問題を防げます。

## まとめ

| 原則 | 説明 |
|------|------|
| 名前は use で始める | React の hooks ルールを守るため |
| ロジックをフックに集約 | コンポーネントは UI に集中できる |
| useCallback でメモ化 | useEffect との依存関係を安全に管理 |
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'カスタムフックの関数名は必ず何で始める必要がありますか？',
        answer: 'use',
        hint: 'React の linting ルール（eslint-plugin-react-hooks）も this naming convention を強制します。',
        explanation: 'useで始まる関数名はReactのHookとして認識されます。この命名規則によりHooksのルール違反をlintツールが検出できます。',
      },
      {
        id: 'q2',
        prompt: 'useEffect の依存配列に関数を渡すとき、毎レンダーで新しい関数が生成されるのを防ぐために使う hooks は何ですか？',
        answer: 'useCallback',
        hint: '関数をメモ化する hooks です。依存配列が変わらない限り同じ関数参照を返します。',
        explanation: 'useCallbackなしだと毎レンダーで新しい関数が生成され、useEffectの依存配列に含めると無限ループが発生します。',
      },
      {
        id: 'q3',
        prompt: 'useTasks フックが return すべき値を3つ挙げてください。（例: tasks, loading, ___）',
        answer: 'error',
        hint: 'loading/error/data の3状態管理パターンです。',
        explanation: 'useTasksはtasks/loading/errorの3状態をまとめて返します。コンポーネントはこれらを受け取るだけでUIの表示分岐ができます。',
      },
      {
        id: 'q4',
        prompt: 'カスタムフックにロジックを分離する最大のメリットは何ですか？（日本語で）',
        answer: '再利用できる',
        hint: '同じロジックを複数のコンポーネントで使えます。また「テストしやすい」「読みやすい」も正解です。',
        explanation: 'カスタムフックにロジックを分離すると複数のコンポーネントで再利用できます。またコンポーネントがUIだけに集中できて読みやすくなります。',
      },
      {
        id: 'q5',
        prompt: 'useCallback の第2引数（依存配列）が空配列 [] の場合、関数はいつ再生成されますか？',
        answer: '再生成されない',
        hint: '依存が変わらないため、コンポーネントが何度再レンダーされても同じ関数参照を維持します。',
        explanation: 'useCallbackの依存配列が[]（空）なら初回のみ関数を生成し、以降は常に同じ参照を返します。不必要な再生成を防げます。',
      },
    ],
    testTask: {
      instruction: `useTasks フックを使ってタスク一覧を表示するコンポーネントを実装してください。

useTasks フックは既に実装されており、以下を返します:
- tasks: Task[] — タスク一覧
- loading: boolean — ローディング中か
- error: string | null — エラーメッセージ
- createTask: (title: string) => Promise<void>
- toggleTask: (task: Task) => Promise<void>
- deleteTask: (id: string) => Promise<void>

要件:
- useTasks フックを呼び出してタスク一覧を取得する
- ローディング中は「読み込み中...」を表示する
- エラー時は「エラー: {error}」を表示する
- タスク一覧を表示する（title と completed チェックボックス）`,
      starterCode: `import { useTasks } from './useTasks';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskPage() {
  // TODO: useTasks フックを呼び出してください
  const { tasks, loading, error } = { tasks: [], loading: false, error: null };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <ul>
      {tasks.map((task: Task) => (
        <li key={task.id}>
          {/* TODO: チェックボックスと task.title を表示してください */}
        </li>
      ))}
    </ul>
  );
}`,
      expectedKeywords: ['useTasks', 'tasks', 'loading', 'error', 'map', 'task.title'],
      explanation: 'useTasksを呼び出すだけでタスク一覧とローディング・エラー状態が取得できます。コンポーネントはUI表示だけに専念できます。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: 'useTasks カスタムフックを実装してください。',
          requirements: [
            'マウント時に GET /tasks でタスク一覧を取得する',
            'createTask(title): POST でタスクを追加し、リストに追加する',
            'toggleTask(task): PATCH でタスクの completed を反転し、リストを更新する',
            'deleteTask(id): DELETE でタスクを削除し、リストから除去する',
            'loading / error / tasks の3状態を管理して return する',
          ],
          hints: [
            'useCallback で各操作をメモ化すると useEffect の依存配列が安定します',
            'fetchTasks を useCallback でメモ化して useEffect の deps に入れましょう',
            'return 値: { tasks, loading, error, createTask, toggleTask, deleteTask }',
          ],
          expectedKeywords: ['useCallback', 'useEffect', 'useState', 'fetch', 'setTasks', 'return'],
          starterCode: `import { useCallback, useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: fetchTasks を useCallback で実装してください
  const fetchTasks = useCallback(async () => {
    // GET /tasks
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // TODO: createTask を useCallback で実装してください
  const createTask = useCallback(async (title: string) => {
    // POST /tasks
  }, []);

  // TODO: toggleTask を useCallback で実装してください
  const toggleTask = useCallback(async (task: Task) => {
    // PATCH /tasks/:id
  }, []);

  // TODO: deleteTask を useCallback で実装してください
  const deleteTask = useCallback(async (id: string) => {
    // DELETE /tasks/:id
  }, []);

  return { tasks, loading, error, createTask, toggleTask, deleteTask };
}`,
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Step 20: api-error-loading
  // ─────────────────────────────────────────
  {
    id: 'api-error-loading',
    order: 20,
    title: 'エラー/ローディングUI',
    summary: 'APIの通信状態に応じたUI表示を実装し、UXを向上させます。',
    readMarkdown: `# エラー/ローディングUI：通信状態に応じた表示

## 4つの通信状態

API と通信するコンポーネントには4つの状態があります。

| 状態 | 説明 | 表示例 |
|------|------|--------|
| \`idle\` | 未取得・待機中 | 何も表示しない |
| \`loading\` | 通信中 | スピナー / 「読み込み中...」 |
| \`success\` | 成功 | データを表示 |
| \`error\` | 失敗 | エラーメッセージ + 再試行ボタン |

## ApiState 型でまとめて管理する

\`\`\`ts
type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

interface ApiState<T> {
  status: ApiStatus
  data: T | null
  error: string | null
}

// 初期値
const initialState: ApiState<Task[]> = {
  status: 'idle',
  data: null,
  error: null,
}
\`\`\`

## useReducer で状態遷移を管理する

複数の state を別々に持つと更新の順序が崩れることがあります。useReducer でまとめると安全です。

\`\`\`ts
type Action<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string }

function apiReducer<T>(state: ApiState<T>, action: Action<T>): ApiState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', data: state.data, error: null }
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null }
    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.payload }
  }
}
\`\`\`

## UI コンポーネントで状態を表示する

\`\`\`tsx
export function TaskListWithState() {
  const [state, dispatch] = useReducer(apiReducer<Task[]>, initialState)

  async function load() {
    dispatch({ type: 'FETCH_START' })
    try {
      const res = await fetch('http://localhost:3001/tasks')
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      const data: Task[] = await res.json()
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: e instanceof Error ? e.message : 'エラーが発生しました' })
    }
  }

  useEffect(() => { void load() }, [])

  if (state.status === 'loading') {
    return <div className="spinner">読み込み中...</div>
  }

  if (state.status === 'error') {
    return (
      <div>
        <p>エラー: {state.error}</p>
        <button onClick={() => void load()}>再試行</button>
      </div>
    )
  }

  return (
    <ul>
      {state.data?.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

## スケルトンUIでUXを向上させる

ローディング中に実際のレイアウトと似た形のグレーボックスを表示すると、コンテンツが突然出現する「ガタつき」を防げます。

\`\`\`tsx
if (state.status === 'loading') {
  return (
    <ul>
      {[1, 2, 3].map((i) => (
        <li key={i} className="animate-pulse bg-gray-200 h-6 rounded mb-2" />
      ))}
    </ul>
  )
}
\`\`\`

## まとめ

- **4状態**（idle / loading / success / error）を明示的に管理する
- **useReducer** で状態遷移をまとめると更新の一貫性が保てる
- **エラーUI** には必ず再試行手段を提供する
- **スケルトンUI** はローディング体験を向上させる
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'API 通信の4つの状態を答えてください。（英語カンマ区切りで）',
        answer: 'idle, loading, success, error',
        hint: '待機・取得中・成功・失敗の4つです。',
        explanation: 'APIの通信状態をidle/loading/success/errorの4段階で明示的に管理することで、各状態に応じた適切なUIを表示できます。',
      },
      {
        id: 'q2',
        prompt: '複数の API 状態（status/data/error）をまとめて管理するのに useState より適した hooks は何ですか？',
        answer: 'useReducer',
        hint: '状態遷移を reducer 関数で管理する hooks です。',
        explanation: 'useReducerを使うとstatus/data/errorを1つのstateオブジェクトでまとめて管理でき、状態の不整合が起きにくくなります。',
      },
      {
        id: 'q3',
        prompt: 'エラー UI に必ず含めるべき、ユーザーが自己解決できる UI 要素は何ですか？',
        answer: '再試行ボタン',
        hint: 'ユーザーが自分で問題を解決できる手段を提供します。',
        explanation: 'エラーUIには再試行ボタンを設けることで、ユーザーがページリロードせずに自己解決できるようになります。UX向上の重要なポイントです。',
      },
      {
        id: 'q4',
        prompt: 'ローディング中に実際のレイアウトと似た形のグレーボックスを表示する手法を何と呼びますか？',
        answer: 'スケルトンUI',
        hint: '「Skeleton UI」とも呼ばれます。コンテンツが突然現れるガタつきを防ぎます。',
        explanation: 'スケルトンUIはコンテンツの形に合わせたプレースホルダーを表示します。ローディング中の体験を向上させる定番のUIパターンです。',
      },
      {
        id: 'q5',
        prompt: 'useReducer の第1引数に渡す、状態遷移のロジックを定義した関数を何と呼びますか？',
        answer: 'reducer',
        hint: '(state, action) => newState の形を持つ純粋関数です。',
        explanation: 'reducer関数は現在のstateとactionを受け取り、新しいstateを返す純粋関数です。useReducerの第1引数として渡します。',
      },
    ],
    testTask: {
      instruction: `ApiState を使って通信状態に応じた UI を表示するコンポーネントを実装してください。

要件:
- useReducer と apiReducer を使って status / data / error を管理する
- マウント時に GET /tasks でタスク一覧を取得する
- status === 'loading' のとき「読み込み中...」を表示する
- status === 'error' のとき「エラー: {error}」と「再試行」ボタンを表示する
- status === 'success' のときタスク一覧を表示する`,
      starterCode: `import { useEffect, useReducer } from 'react';

interface Task { id: string; title: string; completed: boolean; }
type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
interface ApiState { status: ApiStatus; data: Task[] | null; error: string | null; }
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_ERROR'; payload: string };

function apiReducer(state: ApiState, action: Action): ApiState {
  switch (action.type) {
    case 'FETCH_START': return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR': return { status: 'error', data: null, error: action.payload };
    default: return state;
  }
}

export function TaskListWithState() {
  const [state, dispatch] = useReducer(apiReducer, { status: 'idle', data: null, error: null });

  async function load() {
    // TODO: FETCH_START をディスパッチしてから fetch してください
    // 成功時: FETCH_SUCCESS, 失敗時: FETCH_ERROR
  }

  useEffect(() => { void load(); }, []);

  // TODO: status に応じて loading / error / success UI を表示してください

  return <ul>{state.data?.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
}`,
      expectedKeywords: ['dispatch', 'FETCH_START', 'FETCH_SUCCESS', 'FETCH_ERROR', 'useReducer', 'status'],
      explanation: 'useReducerとdispatchでFETCH_START/FETCH_SUCCESS/FETCH_ERRORを管理し、statusに応じてloading/error/successのUIを分岐します。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'c1',
          prompt: 'スケルトンUIを含む完全な通信状態管理コンポーネントを実装してください。',
          requirements: [
            'useReducer と apiReducer で4状態（idle/loading/success/error）を管理する',
            'マウント時に GET /tasks でタスク一覧を取得する',
            'loading 中はスケルトンUI（グレーの矩形3つ）を表示する',
            'error 時はエラーメッセージと「再試行」ボタンを表示する',
            'success 時はタスク一覧を表示する',
          ],
          hints: [
            'スケルトンUI: [1,2,3].map(i => <li key={i} className="animate-pulse bg-gray-200 h-6 ..."/>)',
            '再試行ボタンの onClick で load 関数を呼び出す',
            'load 関数は useCallback でメモ化すると useEffect の依存配列に安全に追加できる',
          ],
          expectedKeywords: ['useReducer', 'dispatch', 'animate-pulse', 'retry', 'useCallback', 'FETCH_START'],
          starterCode: `import { useCallback, useEffect, useReducer } from 'react';

interface Task { id: string; title: string; completed: boolean; }
type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
interface ApiState { status: ApiStatus; data: Task[] | null; error: string | null; }
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_ERROR'; payload: string };

function apiReducer(state: ApiState, action: Action): ApiState {
  switch (action.type) {
    case 'FETCH_START': return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR': return { status: 'error', data: null, error: action.payload };
    default: return state;
  }
}

export function TaskListWithState() {
  const [state, dispatch] = useReducer(apiReducer, { status: 'idle', data: null, error: null });

  const load = useCallback(async () => {
    // TODO: 4状態を適切に dispatch しながら GET /tasks を実装してください
  }, []);

  useEffect(() => { void load(); }, [load]);

  // TODO: スケルトンUI / エラーUI / 成功UI を実装してください
  // loading: グレーの矩形3つ (animate-pulse bg-gray-200)
  // error: エラーメッセージ + 再試行ボタン
  // success: タスク一覧

  return <p>実装してください</p>;
}`,
        },
      ],
    },
  },
]

export function getApiPracticeStep(stepId: string) {
  return apiPracticeSteps.find((step) => step.id === stepId)
}

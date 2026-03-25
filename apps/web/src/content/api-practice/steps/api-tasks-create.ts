import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiTasksCreateStep: LearningStepContent = {
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
        answer: 'レスポンスで即時追加',
        hint: 'POST のレスポンスに作成されたアイテムが含まれています。',
        explanation: 'POSTのレスポンスには作成されたオブジェクト（IDつき）が返ってきます。これをそのままリストに追加すれば再GETが不要です。',
        choices: ['レスポンスで即時追加', 'GETでリストを再取得'],
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
      instruction: 'POST リクエストで新しいタスクを作成する際の HTTP メソッド名を空欄に入力してください。',
      starterCode: `const res = await fetch('/tasks', {
  method: '____',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: inputValue }),
});
const newTask = await res.json();
setTasks(prev => [...prev, newTask]);
setInputValue('');`,
      expectedKeywords: ['POST'],
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
}

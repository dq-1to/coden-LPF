import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiTasksListStep: LearningStepContent = {
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
      instruction: 'map でリストをレンダリングする際に、各要素に一意の値を渡す属性の空欄を埋めてください。',
      starterCode: `<ul>
  {tasks.map((task) => (
    <li ____={task.id}>
      {task.title}
    </li>
  ))}
</ul>`,
      expectedKeywords: ['key'],
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
}

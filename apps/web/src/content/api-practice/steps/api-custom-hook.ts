import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiCustomHookStep: LearningStepContent = {
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
      instruction: 'カスタムフックを呼び出してタスク一覧を取得する空欄を埋めてください。フック名を入力します。',
      starterCode: `import { useTasks } from './useTasks';

export function TaskPage() {
  const { tasks, loading, error } = ____();

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}`,
      expectedKeywords: ['useTasks'],
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
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useCallback, useEffect, useState } from 'react';\n\ninterface Task { id: string; title: string; completed: boolean; }\n\nexport function useTasks() {\n  const [tasks, setTasks] = useState<Task[]>([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  ____0\n\n  useEffect(() => {\n    void fetchTasks();\n  }, [fetchTasks]);\n\n  ____1\n\n  ____2\n\n  return { tasks, loading, error, fetchTasks, createTask, deleteTask };\n}`,
            blanks: [
              {
                id: 'fetch-tasks',
                label: 'fetchTasks',
                correctTokens: ['const', 'fetchTasks', '=', 'useCallback', '(', 'async', '(', ')', '=>', '{', 'setLoading', '(', 'true', ')', 'try', '{', 'const', 'res', '=', 'await', 'fetch', '(', "'/tasks'", ')', 'const', 'data', '=', 'await', 'res.json', '(', ')', 'setTasks', '(', 'data', ')', '}', 'catch', '{', 'setError', '(', "'取得失敗'", ')', '}', 'finally', '{', 'setLoading', '(', 'false', ')', '}', '}', ',', '[', ']', ')'],
                distractorTokens: ['useMemo', 'useEffect', 'axios', 'XMLHttpRequest', 'setData'],
              },
              {
                id: 'create-task',
                label: 'createTask',
                correctTokens: ['const', 'createTask', '=', 'useCallback', '(', 'async', '(', 'title', ':', 'string', ')', '=>', '{', 'const', 'res', '=', 'await', 'fetch', '(', "'/tasks'", ',', '{', 'method', ':', "'POST'", ',', 'headers', ':', '{', "'Content-Type'", ':', "'application/json'", '}', ',', 'body', ':', 'JSON.stringify', '(', '{', 'title', ',', 'completed', ':', 'false', '}', ')', '}', ')', 'const', 'newTask', '=', 'await', 'res.json', '(', ')', 'setTasks', '(', 'prev', '=>', '[', '...prev', ',', 'newTask', ']', ')', '}', ',', '[', ']', ')'],
                distractorTokens: ["'PUT'", 'useMemo', 'axios', 'JSON.parse', 'setData'],
              },
              {
                id: 'delete-task',
                label: 'deleteTask',
                correctTokens: ['const', 'deleteTask', '=', 'useCallback', '(', 'async', '(', 'id', ':', 'string', ')', '=>', '{', 'await', 'fetch', '(', '`/tasks/${id}`', ',', '{', 'method', ':', "'DELETE'", '}', ')', 'setTasks', '(', 'prev', '=>', 'prev.filter', '(', 't', '=>', 't.id', '!==', 'id', ')', ')', '}', ',', '[', ']', ')'],
                distractorTokens: ["'PATCH'", 'prev.map', 'useMemo', 'axios', 'splice'],
              },
            ],
          },
        },
      ],
    },
}

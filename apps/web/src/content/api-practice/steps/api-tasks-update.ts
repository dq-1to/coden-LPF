import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiTasksUpdateStep: LearningStepContent = {
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
        prompt: 'API レスポンスを待たずに先に UI を更新し、失敗時に元に戻す手法を何と呼びますか？',
        answer: '楽観的更新',
        hint: '「Optimistic Update」の日本語訳です。',
        explanation: '楽観的更新はAPIのレスポンスを待たずにUIを先に更新します。操作が成功すると仮定して即座に反映し、UXを向上させる手法です。',
        choices: ['楽観的更新', '悲観的ロック', 'ポーリング', 'デバウンス'],
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
      instruction: '既存リソースの一部を更新する HTTP メソッド名を空欄に入力してください。',
      starterCode: `async function handleToggle(task: Task) {
  const res = await fetch(\`/tasks/\${task.id}\`, {
    method: '____',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !task.completed }),
  });
  const updated = await res.json();
  setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
}`,
      expectedKeywords: ['PATCH'],
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
}

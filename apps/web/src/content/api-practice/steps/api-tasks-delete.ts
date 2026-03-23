import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiTasksDeleteStep: LearningStepContent = {
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
      instruction: '削除成功後にリストから該当タスクを除外する配列メソッドの空欄を埋めてください。',
      starterCode: `async function handleDelete(id: string) {
  setDeletingId(id);
  try {
    await fetch(\`/tasks/\${id}\`, { method: 'DELETE' });
    setTasks(prev => prev.____(t => t.id !== id));
  } finally {
    setDeletingId(null);
  }
}`,
      expectedKeywords: ['filter'],
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
}

import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiErrorLoadingStep: LearningStepContent = {
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
        choices: ['再試行ボタン', '詳細ログ表示', 'カウントダウンタイマー', 'お問い合わせフォーム'],
      },
      {
        id: 'q4',
        prompt: 'ローディング中に実際のレイアウトと似た形のグレーボックスを表示する手法を何と呼びますか？',
        answer: 'スケルトンUI',
        hint: '「Skeleton UI」とも呼ばれます。コンテンツが突然現れるガタつきを防ぎます。',
        explanation: 'スケルトンUIはコンテンツの形に合わせたプレースホルダーを表示します。ローディング中の体験を向上させる定番のUIパターンです。',
        choices: ['スケルトンUI', 'スピナー', 'プログレスバー', 'トースト通知'],
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
      instruction: 'useReducer で状態を更新するために action を送る関数名を空欄に入力してください。',
      starterCode: `const [state, dispatch] = useReducer(apiReducer, initialState);

async function load() {
  ____({ type: 'FETCH_START' });
  try {
    const res = await fetch('/tasks');
    const data = await res.json();
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  } catch (e) {
    dispatch({ type: 'FETCH_ERROR', payload: (e as Error).message });
  }
}`,
      expectedKeywords: ['dispatch'],
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
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useCallback, useEffect, useReducer } from 'react';\n\ninterface Task { id: string; title: string; completed: boolean; }\ntype ApiStatus = 'idle' | 'loading' | 'success' | 'error';\ninterface ApiState { status: ApiStatus; data: Task[] | null; error: string | null; }\ntype Action =\n  | { type: 'FETCH_START' }\n  | { type: 'FETCH_SUCCESS'; payload: Task[] }\n  | { type: 'FETCH_ERROR'; payload: string };\n\nfunction apiReducer(state: ApiState, action: Action): ApiState {\n  switch (action.type) {\n    case 'FETCH_START': return { ...state, status: 'loading', error: null };\n    case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null };\n    case 'FETCH_ERROR': return { status: 'error', data: null, error: action.payload };\n    default: return state;\n  }\n}\n\nexport function TaskListWithState() {\n  const [state, dispatch] = useReducer(apiReducer, { status: 'idle', data: null, error: null });\n\n  const load = useCallback(async () => {\n    ____0\n  }, []);\n\n  useEffect(() => { void load(); }, [load]);\n\n  ____1\n\n  return (\n    <ul>\n      {state.data?.map((task) => (\n        <li key={task.id}>{task.title}</li>\n      ))}\n    </ul>\n  );\n}`,
            blanks: [
              {
                id: 'load-body',
                label: 'load関数',
                correctTokens: ['dispatch', '(', '{', 'type', ':', "'FETCH_START'", '}', ')', 'try', '{', 'const', 'res', '=', 'await', 'fetch', '(', "'/tasks'", ')', 'const', 'data', '=', 'await', 'res.json', '(', ')', 'dispatch', '(', '{', 'type', ':', "'FETCH_SUCCESS'", ',', 'payload', ':', 'data', '}', ')', '}', 'catch', '(', 'e', ')', '{', 'dispatch', '(', '{', 'type', ':', "'FETCH_ERROR'", ',', 'payload', ':', '(', 'e', 'as', 'Error', ')', '.message', '}', ')', '}'],
                distractorTokens: ['setState', 'setLoading', 'axios', 'useCallback', "'FETCH_RESET'"],
              },
              {
                id: 'state-ui',
                label: '状態別UI',
                correctTokens: ['if', '(', 'state.status', '===', "'loading'", ')', 'return', '(', '<ul>', '{', '[', '1', ',', '2', ',', '3', ']', '.map', '(', 'i', '=>', '(', '<li', 'key', '=', '{', 'i', '}', 'className', '=', '"animate-pulse bg-gray-200 h-6 rounded mb-2"', '/>', ')', ')', '}', '</ul>', ')', 'if', '(', 'state.status', '===', "'error'", ')', 'return', '(', '<div>', '<p>', '{', 'state.error', '}', '</p>', '<button onClick={() => void load()}>', '再試行', '</button>', '</div>', ')'],
                distractorTokens: ['state.loading', 'isLoading', "'idle'", 'retry', 'setError', 'console.log'],
              },
            ],
          },
        },
      ],
    },
}

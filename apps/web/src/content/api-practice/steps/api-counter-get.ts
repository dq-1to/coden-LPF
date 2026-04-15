import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiCounterGetStep: LearningStepContent = {
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
      instruction: 'useEffect 内でデータを取得する関数の空欄を埋めてください。HTTP リクエストを送る関数名を入力します。',
      starterCode: `useEffect(() => {
  async function load() {
    try {
      const res = await ____('/counter');
      const data = await res.json();
      setValue(data.value);
    } catch {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }
  void load();
}, []);`,
      expectedKeywords: ['fetch'],
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
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useEffect, useState } from 'react';\n\nexport function CounterDisplay() {\n  const [value, setValue] = useState<number | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  async function loadCounter() {\n    try {\n      setLoading(true);\n      ____0\n    } catch {\n      setError('エラーが発生しました');\n    } finally {\n      setLoading(false);\n    }\n  }\n\n  useEffect(() => {\n    void loadCounter();\n  }, []);\n\n  if (loading) return <p>読み込み中...</p>;\n  if (error) return (\n    <div>\n      <p>{error}</p>\n      ____1\n    </div>\n  );\n  return (\n    <div>\n      <p>カウンター: {value}</p>\n      ____1\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'fetch-set',
                label: 'fetch処理',
                correctTokens: ['const', 'res', '=', 'await', 'fetch', '(', "'/counter'", ')', 'const', 'data', '=', 'await', 'res.json', '(', ')', 'setValue', '(', 'data.value', ')'],
                distractorTokens: ['axios', 'XMLHttpRequest', 'data.count', 'setData', 'useCallback'],
              },
              {
                id: 'reload-btn',
                label: '再読み込み',
                correctTokens: ['<button onClick={loadCounter}>', '再読み込み', '</button>'],
                distractorTokens: ['<button onClick={fetch}>', '<a href="/">', 'onSubmit', 'refetch', 'useEffect'],
              },
            ],
          },
        },
      ],
    },
}

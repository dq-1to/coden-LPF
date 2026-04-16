import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiCounterPostStep: LearningStepContent = {
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
      instruction: 'PUT リクエストで JSON ボディを送信する際に、オブジェクトを文字列に変換する関数名を空欄に入力してください。',
      starterCode: `async function handleIncrement() {
  setSubmitting(true);
  try {
    const res = await fetch('/counter', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: ____(({ value: value + 1 })),
    });
    const updated = await res.json();
    setValue(updated.value);
  } finally {
    setSubmitting(false);
  }
}`,
      expectedKeywords: ['JSON.stringify'],
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
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useEffect, useState } from 'react';\n\nexport function Counter() {\n  const [value, setValue] = useState(0);\n  const [submitting, setSubmitting] = useState(false);\n\n  useEffect(() => {\n    fetch('http://localhost:3001/counter')\n      .then(res => res.json())\n      .then(data => setValue(data.value));\n  }, []);\n\n  async function sendValue(nextValue: number) {\n    setSubmitting(true);\n    try {\n      ____0\n    } finally {\n      setSubmitting(false);\n    }\n  }\n\n  return (\n    <div>\n      <p>カウンター: {value}</p>\n      ____1\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'put-fetch',
                label: 'PUT送信',
                correctTokens: ['const', 'res', '=', 'await', 'fetch', '(', "'/counter'", ',', '{', 'method', ':', "'PUT'", ',', 'headers', ':', '{', "'Content-Type'", ':', "'application/json'", '}', ',', 'body', ':', 'JSON.stringify', '(', '{', 'value', ':', 'nextValue', '}', ')', '}', ')', 'const', 'data', '=', 'await', 'res.json', '(', ')', 'setValue', '(', 'data.value', ')'],
                distractorTokens: ["'POST'", "'PATCH'", 'axios', 'setData', 'JSON.parse'],
              },
              {
                id: 'buttons',
                label: '3ボタン',
                correctTokens: ['<button onClick={() => void sendValue(value + 1)} disabled={submitting}>', '+1', '</button>', '<button onClick={() => void sendValue(Math.max(0, value - 1))} disabled={submitting}>', '-1', '</button>', '<button onClick={() => void sendValue(0)} disabled={submitting}>', 'リセット', '</button>'],
                distractorTokens: ['<button onClick={sendValue}>', 'onChange', 'onSubmit', '<a href="#">'],
              },
            ],
          },
        },
      ],
    },
}

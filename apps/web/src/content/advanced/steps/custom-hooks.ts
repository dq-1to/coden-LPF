import type { LearningStepContent } from '@/content/fundamentals/steps'

export const customHooksStep: LearningStepContent = {
    id: 'custom-hooks',
    order: 9,
    title: 'カスタムHooks',
    summary: '再利用可能なロジックをカスタムHookとして切り出し、コンポーネントをシンプルに保つ方法を学ぶ。',
    readMarkdown: `# カスタムHooks：ロジックの再利用

## カスタムHookとは？

Reactでは、コンポーネントが複雑になるにつれてロジックが肥大化しやすくなります。カスタムHookは、**コンポーネントから「ロジック」だけを関数として切り出す**仕組みです。

\`\`\`tsx
// ❌ Before: ロジックとUIが混在したコンポーネント
export function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(0);
  return <div>{count} <button onClick={increment}>+</button></div>;
}

// ✅ After: ロジックをカスタムHookに分離
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

export function Counter() {
  const { count, increment } = useCounter(0);
  return <div>{count} <button onClick={increment}>+</button></div>;
}
\`\`\`

## 必須ルール：命名は \`use\` で始める

カスタムHookは必ず **\`use\` で始まる名前**にします。この規則は単なる慣習ではなく、Reactのリントツールがフック違反（例：条件分岐の中でHookを呼び出す）を検出するために利用しています。

\`\`\`ts
// ✅ 正しい命名
function useCounter() { ... }
function useInput(initialValue: string) { ... }
function useLocalStorage<T>(key: string) { ... }

// ❌ 間違い（useで始まっていない）
function getCounter() { ... }
function inputHelper() { ... }
\`\`\`

## カスタムHookが「共有」するのはロジックであり、Stateではない

重要な点として、カスタムHookをコンポーネントで使うと、**それぞれ独立したStateが生成**されます。Stateそのものが共有されるわけではありません。

\`\`\`tsx
function useCounter() {
  const [count, setCount] = useState(0); // 各コンポーネントで独立したcount
  return { count, increment: () => setCount(c => c + 1) };
}

export function App() {
  const counterA = useCounter(); // counterA.count は独立した State
  const counterB = useCounter(); // counterB.count も独立した State
  // counterA と counterB は別物
}
\`\`\`

## 実践例：useInput（フォーム入力管理）

\`\`\`tsx
function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const reset = () => setValue(initialValue);
  return { value, onChange, reset };
}

export function SearchForm() {
  const nameInput = useInput('');
  const emailInput = useInput('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(nameInput.value, emailInput.value);
    nameInput.reset();
    emailInput.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={nameInput.value} onChange={nameInput.onChange} placeholder="名前" />
      <input value={emailInput.value} onChange={emailInput.onChange} placeholder="メール" />
      <button type="submit">送信</button>
    </form>
  );
}
\`\`\`

## カスタムHookの利点まとめ

| 利点 | 説明 |
|------|------|
| **再利用性** | 同じロジックを複数のコンポーネントで使える |
| **コンポーネントの簡素化** | UIだけに集中できる |
| **テストの容易さ** | ロジック単独でテストできる |
| **関心の分離** | 何をするか（ロジック）と何を表示するか（UI）を分ける |

## Hooksのルール（再確認）

カスタムHookの中でも **Hooksのルール** は守る必要があります：

1. **ループ・条件分岐・ネストした関数の中でHookを呼ばない**
2. **Reactの関数コンポーネントかカスタムHookの中でのみ呼び出す**

\`\`\`tsx
// ❌ NG: 条件分岐の中でHookを呼ぶ
function useBad(condition: boolean) {
  if (condition) {
    const [value, setValue] = useState(0); // エラー！
  }
}

// ✅ OK: 条件はHookの中の処理で制御する
function useGood() {
  const [value, setValue] = useState(0);
  // 条件は state を使う側（return値や内部ロジック）で制御する
}
\`\`\`
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'カスタムHookを定義する際、関数名は必ず何で始めなければなりませんか？',
        answer: 'use',
        hint: '「use」＋名詞または動詞の形が一般的です（例: useCounter, useInput）。',
        explanation: 'カスタムHookの関数名をuseで始めることで、Reactのlintツールがフックルール違反を検出できるようになります。',
      },
      {
        id: 'q2',
        prompt: 'カスタムHookがコンポーネント間で「共有」するのは、StateそのものではなくなんですA？',
        answer: 'ロジック',
        hint: '各コンポーネントでHookを呼ぶたびに、独立したStateが生成されます。',
        explanation: 'カスタムHookを使う各コンポーネントは独立したStateを持ちます。共有されるのはロジック（関数の定義）だけです。',
        choices: ['ロジック', 'State', 'Props', 'コンテキスト'],
      },
      {
        id: 'q3',
        prompt: 'カスタムHookの中では、useStateやuseEffectなどのReactの何を呼び出すことができますか？',
        answer: 'Hook',
        hint: 'カスタムHookも「Hook」の一種です。他のHookを組み合わせて新しいHookを作れます。',
        explanation: 'カスタムHookはuseState・useEffectなど既存のHookを内部で呼び出して、ロジックを再利用可能な形にまとめた関数です。',
      },
      {
        id: 'q4',
        prompt: 'Hooksのルールとして、「ループ・条件分岐・ネストした関数の中でHookを呼ばない」のはなぜですか？それを一言で表すと？',
        answer: '実行順序',
        hint: 'ReactはHookの呼び出し順序を追跡して状態を管理します。順序が変わると正しく動作しません。',
        explanation: 'Reactは毎レンダーでHookが同じ順序で呼ばれることを前提に動作します。条件分岐の中でHookを呼ぶと順序が変わりバグになります。',
        choices: ['実行順序', 'パフォーマンス', 'メモリ使用量', 'セキュリティ'],
      },
      {
        id: 'q5',
        prompt: 'カスタムHookから値を返す方法として、一般的に使われる2つのデータ構造は何ですか？',
        answer: '配列とオブジェクト',
        hint: 'useState は配列 [value, setter] を、カスタムHookはオブジェクト { value, setValue } を返すことが多いです。',
        explanation: '配列で返すと分割代入時に任意の名前を付けられ、オブジェクトで返すと名前付きで受け取れます。用途に応じて使い分けます。',
        choices: ['配列とオブジェクト', '文字列と数値', 'MapとSet', 'PromiseとCallback'],
      },
    ],
    testTask: {
      instruction: 'useToggle カスタムHookの toggle 関数を完成させてください。setValue に現在値の反転を渡す1行を埋めてください。',
      starterCode: `import { useState } from 'react';

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => ____;
  return { value, toggle };
}`,
      expectedKeywords: ['setValue', '!'],
      explanation: 'toggle関数ではsetValueにコールバック v => !v を渡すか、setValue(!value) で現在値を反転させます。',
    },
    challengeTask: {
      patterns: [
        {
          id: 'custom-hooks-1',
          prompt: '`useLocalStorage` カスタムHookを実装してください。',
          requirements: [
            'useLocalStorage<T>(key: string, initialValue: T) というシグネチャにする',
            'localStorageから初期値を読み込み、存在しない場合は initialValue を使う',
            '値を更新したらlocalStorageにも保存する（JSON.stringify/JSON.parse を使用）',
            '{ value, setValue } を返す',
          ],
          hints: [
            'useState の初期値に関数を渡すと、初回レンダリングのみ実行される（遅延初期化）',
            'localStorage.getItem(key) が null のとき initialValue を使う',
            'setValue を呼んだとき localStorage.setItem(key, JSON.stringify(newValue)) を実行する',
          ],
          expectedKeywords: ['useLocalStorage', 'useState', 'localStorage', 'JSON.parse', 'JSON.stringify'],
          starterCode: `import { useState } from 'react';

// TODO: useLocalStorage カスタムHookを実装してください
function useLocalStorage<T>(key: string, initialValue: T) {
  // TODO: localStorageから初期値を読み込んで useState を初期化する（遅延初期化を使用）
  // ヒント: useState(() => { ... }) の形で関数を渡すと初回のみ実行される

  // TODO: 値を更新すると localStorage にも保存する setValue を実装する

  // TODO: { value, setValue } を返す
}

// 動作確認用コンポーネント
export function PersistentCounter() {
  const { value: count, setValue: setCount } = useLocalStorage('count', 0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(0)}>リセット</button>
      <p>（ページをリロードしても値が保持されます）</p>
    </div>
  );
}`,
        },
      ],
    },
}

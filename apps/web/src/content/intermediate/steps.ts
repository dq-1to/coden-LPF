import type { LearningStepContent } from '../fundamentals/steps'

export const intermediateSteps: LearningStepContent[] = [
    {
        id: 'useeffect',
        order: 5,
        title: 'useEffect',
        summary: '副作用とライフサイクルを理解し、データ取得や購読処理を実装します。',
        readMarkdown: `# useEffect: 副作用の管理

Reactコンポーネントは基本的に「Reactの状態(state)からUIを生成する」純粋な関数ですが、外部データの取得（Fetch）、DOMの直接操作、タイマーの設定など、コンポーネントの外部に影響を与える処理も必要になります。これらを**副作用（Side Effects）**と呼びます。

## useEffectの基本

副作用を扱うために \`useEffect\` フックを使用します。

\`\`\`tsx
import { useEffect, useState } from 'react';

export function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // コンポーネントがマウント（画面に表示）された後に実行される
    console.log('Component Mounted!');
    
    // タイマーを開始
    const timerId = setInterval(() => setCount(c => c + 1), 1000);

    // クリーンアップ関数（アンマウント時や依存配列が変わった際に実行される）
    return () => {
      clearInterval(timerId); // タイマーを解除してメモリリークを防ぐ
    };
  }, []); // 空の依存配列を渡すことで、初回マウント時の一度だけ実行される

  return <p>Count: {count}</p>;
}
\`\`\`

## 依存配列 (Dependency Array)

\`useEffect\` の第二引数には**依存配列**を渡します。この配列に指定した値が**前回のレンダリング時から変化した場合のみ**、第一引数の関数が再度実行されます。

- **\`[]\`（空配列）**: 初回描画（マウント）時のみ実行されます。初期データ取得時などに便利です。
- **\`[propA, stateB]\`**: 指定した \`propA\` または \`stateB\` が変わった時に実行されます。
- **指定なし**: 毎回のレンダリング後に実行されます。（無限ループに注意！）

副作用の処理が不要になった時（例えばコンポーネントが画面から消える時）のために、 \`return\` でクリーンアップ処理を行うことが推奨されます。
`,
        practiceQuestions: [
            {
                id: 'q1',
                prompt: 'Reactコンポーネントにおける「外部 API からのデータ取得」や「タイマーのセット」などは、何と呼ばれますか？',
                answer: '副作用',
                hint: 'Side Effect の日本語訳です。',
            },
            {
                id: 'q2',
                prompt: '副作用の処理を記述するための React の Hook は何ですか？',
                answer: 'useEffect',
                hint: '`use` + 副作用の英単語',
            },
            {
                id: 'q3',
                prompt: 'useEffect の第二引数に渡す配列を何と呼びますか？',
                answer: '依存配列',
                hint: '処理を実行するかどうかを「依存」する変数を列挙する配列です。',
            },
            {
                id: 'q4',
                prompt: '初回マウント時に一度だけ処理を実行させたい場合、第二引数には何を渡しますか？',
                answer: '[]',
                hint: '空の配列を渡します。',
            },
            {
                id: 'q5',
                prompt: 'コンポーネント破棄時にタイマーを止めるなどの後処理を行うため、useEffect の第一引数の関数から return する関数を何と呼びますか？',
                answer: 'クリーンアップ関数',
                hint: 'お掃除（クリーン）を行う関数です。',
            },
        ],
        testTask: {
            instruction: '初回描画時のみ alert("Hello!") が実行されるように空欄を埋めてください。',
            starterCode: `useEffect(() => {\n  alert('Hello!')\n}, ____)`,
            expectedKeywords: ['[]'],
        },
        challengeTask: {
            patterns: [
                {
                    id: 'useeffect-timer',
                    prompt: 'マウント時に timer をセットし、アンマウント時にクリアする処理を実装してください。',
                    requirements: ['useEffect を使う', 'setInterval で毎秒ログを出す', 'クリーンアップ関数で clearInterval する', '初回のみセットする依存配列にする'],
                    hints: ['useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, []);'],
                    expectedKeywords: ['useEffect', 'setInterval', 'clearInterval', 'return ()'],
                    starterCode: `import { useEffect } from 'react';\n\nexport function LogTimer() {\n  // TODO: useEffectを使って、毎秒 (1000ms間隔) console.log('tick') を実行するようにしてください。\n  // TODO: 第二引数を適切に設定し、初回マウント時だけタイマーが作動するようにしてください。\n  // TODO: クリーンアップ関数を返し、その中で clearInterval(タイマーID) を実行してメモリリークを防いでください。\n\n  return <div>Check console for ticks!</div>;\n}`
                },
                {
                    id: 'useeffect-fetch',
                    prompt: '初回マウント時に API を擬似的にフェッチする処理を書き、結果のテキストを画面に出してください。',
                    requirements: ['useEffect と useState を使用する', 'setTimeout等で擬似的な非同期処理を行う', '状態を更新して画面表示する'],
                    hints: ['useEffect 内で setState を呼ぶ'],
                    expectedKeywords: ['useEffect', 'useState', 'setTimeout'],
                    starterCode: `import { useState, useEffect } from 'react';\n\nexport function DataFetcher() {\n  // TODO: データを保持する string の state を定義してください (初期値: "Loading...")\n  \n  // TODO: useEffect と setTimeout を使い、初回マウントから2秒後に state を "Data Loaded!" に変更してください\n  \n  return <div>{/* TODO: stateをここに表示してください */}</div>;\n}`
                }
            ]
        },
    },
    {
        id: 'forms',
        order: 6,
        title: 'フォーム処理',
        summary: '入力値の管理とバリデーションを実装し、実用的なフォームを作ります。',
        readMarkdown: `# フォーム処理

Reactでフォームを実装する際、入力要素の状態をReact側で管理するかどうかで2つのアプローチがあります。

## 制御されたコンポーネント (Controlled Components)

Reactの \`useState\` を用いて、入力値を常にReactのStateと同期させる手法です。
入力値が変更されるたびに \`onChange\` イベントが発火し、Stateが更新されます。

\`\`\`tsx
import { useState } from 'react';

export function SimpleForm() {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // ページリロードを防ぐ
    console.log('送信データ:', text);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
      <button disabled={text.length === 0}>送信</button>
    </form>
  );
}
\`\`\`

この手法の最大の利点は、**入力中にリアルタイムでバリデーション(検証)** を行ったり、別のUI（送信ボタンの活性状態など）を即座に切り替えられることです。

## フォーム送信の基本

HTMLのフォームはデフォルトで送信時にページ全体の再読み込み（リロード）を伴います。
SPA (Single Page Application) であるReactではこれを防ぐため、必ず \`onSubmit\` イベントハンドラの中で \`e.preventDefault()\` を呼び出します。
`,
        practiceQuestions: [
            {
                id: 'q1',
                prompt: 'ReactのStateで常に入力要素（input等）の値を管理し、同期させる手法を何コンポーネントと呼びますか？',
                answer: '制御されたコンポーネント',
                hint: 'Controlled Componentの日本語訳です。',
            },
            {
                id: 'q2',
                prompt: '制御されたコンポーネントを利用する利点として、入力中にリアルタイムで入力チェックなどを行うことができます。入力チェックのことを何と呼びますか？',
                answer: 'バリデーション',
                hint: 'validation とも書きます。',
            },
            {
                id: 'q3',
                prompt: 'フォームのデフォルトの送信動作（ページリロード）を防ぐためのメソッド名は何ですか？',
                answer: 'preventDefault',
                hint: 'イベント(e)に対して呼び出す e.〇〇(); です。',
            },
            {
                id: 'q4',
                prompt: '制御された input 要素で、現在の state の値を反映させるために指定するプロパティは何ですか？',
                answer: 'value',
                hint: '入力欄の中身を指定する属性です。',
            },
            {
                id: 'q5',
                prompt: 'ボタンを「非活性（押せない状態）」にするための HTML/JSX プロパティ名は何ですか？',
                answer: 'disabled',
                hint: '無能化、無効化を意味する英単語です。',
            },
        ],
        testTask: {
            instruction: 'ユーザーの入力が3文字未満の時はボタンを非活性(disabled)にするよう空欄を埋めてください。',
            starterCode: `<button ____={text.length < 3}>送信</button>`,
            expectedKeywords: ['disabled'],
        },
        challengeTask: {
            patterns: [
                {
                    id: 'forms-controlled',
                    prompt: '制御されたフォームを作成し、入力内容が5文字以上の時のみ送信可能にしてください。',
                    requirements: ['制御された input を実装', 'onChange で state を同期', '文字数による disabled 制御'],
                    hints: ['value に state を、onChange で setState にイベント値を渡す'],
                    expectedKeywords: ['useState', 'value=', 'onChange', 'disabled='],
                    starterCode: `import { useState } from 'react';\n\nexport function ValidationForm() {\n  // TODO: 文字列の state (text) を定義してください\n  \n  return (\n    <form>\n      {/* TODO: 制御されたコンポーネントとして input を実装してください */}\n      <input placeholder="5文字以上入力" />\n      {/* TODO: text の長さが 5 文字未満の場合、disabled になるボタンを実装してください */}\n      <button type="submit">送信</button>\n    </form>\n  );\n}`
                },
                {
                    id: 'forms-multiple',
                    prompt: 'ユーザー名とメールアドレスの2つの入力フィールドを持つフォームを作成し、片方でも空ならボタンを非操作にしてください。',
                    requirements: ['2つの state または オブジェクト state を利用', 'それぞれの入力状態を同期', '両方の値が入力済みかチェックする'],
                    hints: ['disabled={!name || !email}'],
                    expectedKeywords: ['useState', 'value=', 'onChange', 'disabled='],
                    starterCode: `import { useState } from 'react';\n\nexport function UserForm() {\n  // TODO: name と email を管理する state を定義してください\n\n  return (\n    <form>\n      {/* TODO: name 用の controlled input を作成 */}\n      \n      {/* TODO: email 用の controlled input を作成 */}\n      \n      {/* TODO: どちらか一方でも空文字なら disabled になる送信ボタンを実装 */}\n      <button type="submit">登録</button>\n    </form>\n  );\n}`
                }
            ]
        },
    },
    {
        id: 'usecontext',
        order: 7,
        title: 'useContext',
        summary: 'コンテキストAPIでグローバル状態を管理し、prop drillingを解消します。',
        readMarkdown: `# useContext: 深いコンポーネントツリーへのデータ受け渡し

通常、Reactではデータを親コンポーネントから子コンポーネントへ **Props（プロパティ）** で渡します。しかし、コンポーネントの階層が深くなると、中間のコンポーネントが自分では使わないデータをバケツリレーのようにただ渡すだけの作業（**Prop Drilling**）が発生し、コードの保守性が低下します。

## Context API の仕組み

\`Context\` を利用することで、ツリーの奥深くにあるコンポーネントに直接データを「テレポート」させることができます。

1. **Contextを作成する (\`createContext\`)**
   \`\`\`tsx
   import { createContext } from 'react';
   export const ThemeContext = createContext('light'); 
   // 'light'はデフォルト値
   \`\`\`

2. **データを供給する (\`Provider\`)**
   親コンポーネントを \`Provider\` でラップし、受け渡したい値を \`value\` props に渡します。
   \`\`\`tsx
   export function App() {
     return (
       <ThemeContext.Provider value="dark">
         <Toolbar />
       </ThemeContext.Provider>
     );
   }
   \`\`\`

3. **データを受け取る (\`useContext\`)**
   深い階層の子コンポーネントで \`useContext\` フックを使用し、値を取り出します。
   \`\`\`tsx
   import { useContext } from 'react';

   export function Button() {
     // Providerで渡された "dark" という値が直接手に入る
     const theme = useContext(ThemeContext);
     
     return <button className={theme}>ボタン</button>;
   }
   \`\`\`

テーマ（ダークモード）やログイン状態の実装によく使われるパターンです。
`,
        practiceQuestions: [
            {
                id: 'q1',
                prompt: 'コンポーネント階層の深い場所にデータを渡すため、中間コンポーネントがただデータをリレーするだけになる問題を何と呼びますか？',
                answer: 'Prop Drilling',
                hint: 'ドリルで穴を掘る（Drilling）ように深く掘り下げる現象です。',
            },
            {
                id: 'q2',
                prompt: 'そのリレー問題を解決し、ツリーの奥深くに直接データを届けるために利用するReactのAPIは何ですか？',
                answer: 'Context API',
                hint: '「文脈」などを意味する英単語です。〇〇〇〇 API。',
            },
            {
                id: 'q3',
                prompt: 'Context を新たに作成するための関数は何ですか？',
                answer: 'createContext',
                hint: 'Contextを生成（create）します。',
            },
            {
                id: 'q4',
                prompt: 'ツリーの下流コンポーネントに対して値を供給するときに使うコンポーネント名は、Contextオブジェクトに付随する何ですか？ (例: ThemeContext.〇〇〇)',
                answer: 'Provider',
                hint: '供給者という意味です。',
            },
            {
                id: 'q5',
                prompt: '深い階層の子孫コンポーネントで、Context に供給された値を取り出すために使用する Hook は何ですか？',
                answer: 'useContext',
                hint: '`use` に続けて Context を使います。',
            },
        ],
        testTask: {
            instruction: 'ThemeContextから値を取り出し、theme変数に格納するように空欄を埋めてください。',
            starterCode: `const theme = ____(ThemeContext);`,
            expectedKeywords: ['useContext'],
        },
        challengeTask: {
            patterns: [
                {
                    id: 'usecontext-basic',
                    prompt: 'UserContextから現在のユーザー名を直接取り出して表示する Greetingコンポーネントを完成させてください。',
                    requirements: ['useContext を使用する', 'UserContext から値を取り出す', '取得した値を画面に表示する'],
                    hints: ['useContext(UserContext) で Context の値を取得できます', '取得した変数を JSX で描画します'],
                    expectedKeywords: ['useContext', 'UserContext'],
                    starterCode: `import { createContext, useContext } from 'react';\n\nexport const UserContext = createContext('Guest');\n\nexport function Greeting() {\n  // TODO: useContext を使って UserContext から値を取り出し、変数 user に格納してください。\n  \n  return (\n    <div>\n      {/* TODO: user 変数を表示してください */}\n      こんにちは、！\n    </div>\n  );\n}`
                },
                {
                    id: 'usecontext-provider',
                    prompt: 'ThemeContext.Provider を使って、子コンポーネントに "dark" テーマの値を供給してください。',
                    requirements: ['ThemeContext.Provider で子要素をラップする', 'valueプロパティを渡す'],
                    hints: ['<ThemeContext.Provider value="dark">'],
                    expectedKeywords: ['Provider', 'value=', '"dark"'],
                    starterCode: `import { createContext, useContext } from 'react';\n\nexport const ThemeContext = createContext('light');\n\nfunction ComponentDeepDown() {\n  const theme = useContext(ThemeContext);\n  return <p>現在のテーマは {theme} です。</p>;\n}\n\nexport function App() {\n  return (\n    // TODO: ComponentDeepDown が "dark" テーマを受け取れるように、\n    // ThemeContext の Provider で ComponentDeepDown を囲み、value プロパティに "dark" を渡してください。\n    <div>\n      <ComponentDeepDown />\n    </div>\n  );\n}`
                }
            ]
        },
    },
    {
        id: 'usereducer',
        order: 8,
        title: 'useReducer',
        summary: '複雑な状態ロジックをreducerパターンで整理します。',
        readMarkdown: `# useReducer: 複雑な状態管理の整理

コンポーネント内で管理する状態の数が多くなったり、次の状態を計算するロジックが複雑になってきた場合、\`useState\` を多数並べるよりも **\`useReducer\`** を使うとコードが見通しやすくなります。（Reduxの考え方に基づいています）

## Reducer関数の概念

Reducer関数は、「現在の状態(\`state\`)」と「発生したアクション(\`action\`)」を受け取り、「次の新しい状態」を返す純粋な関数です。

\`\`\`tsx
type State = { count: number };
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
\`\`\`

## useReducerの使い方

コンポーネント内で \`useReducer\` を呼び出します。第一引数に Reducer関数、第二引数に初期状態を渡します。

\`\`\`tsx
import { useReducer } from 'react';

export function CounterApp() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      {/* dispatch関数にアクションオブジェクトを渡すことで、Reducerが実行される */}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
}
\`\`\`

**ポイント**
1. どのように状態を更新するか（How）のロジックは React コンポーネントの外部に切り出されます。
2. 画面内では「何が起きたか（What、例えばINCREMENTした）」という \`action\` を **\`dispatch\`（送出）** するだけになります。
`,
        practiceQuestions: [
            {
                id: 'q1',
                prompt: '複雑な状態遷移を外部に切り出して管理するために用いるHook名は何ですか？',
                answer: 'useReducer',
                hint: 'Reduce（減らす・まとめる）という英単語が由来です。',
            },
            {
                id: 'q2',
                prompt: '現在の状態とアクションを受け取り、新しい状態を返す「純粋な関数」のことを何関数と呼びますか？',
                answer: 'Reducer関数',
                hint: '〇〇〇〇関数。',
            },
            {
                id: 'q3',
                prompt: 'useReducer から返される配列の2つ目の要素は、Reducer関数に対して「アクション」を送信するための関数です。この関数名は何と名付けるのが一般的ですか？',
                answer: 'dispatch',
                hint: '「派遣する」「発送する」などの意味を持つ英単語です。',
            },
            {
                id: 'q4',
                prompt: 'ディスパッチするアクションオブジェクトには、一般的に「どのような操作を行うか」を識別するためのプロパティを含めます。このプロパティ名としてよく使われるのは何ですか？',
                answer: 'type',
                hint: 'action.〇〇〇 で分岐します。',
            },
            {
                id: 'q5',
                prompt: 'Reducer関数の中で action.type による条件分岐を行う際によく使われる、JavaScriptの構文は何ですか？',
                answer: 'switch文',
                hint: 'if-elseの連番よりも、case を使って記述する構文です。',
            },
        ],
        testTask: {
            instruction: 'ユーザーがリセットボタンを押すと actionの type を "RESET" にして dispatch する空欄を埋めてください。',
            starterCode: `<button onClick={() => ____({ type: 'RESET' })}>Reset</button>`,
            expectedKeywords: ['dispatch'],
        },
        challengeTask: {
            patterns: [
                {
                    id: 'usereducer-calc',
                    prompt: 'STEP_UP アクションを受け取った時に、count を 5 増やす処理を Reducer 内に追加してください。',
                    requirements: ['switch文に STEP_UP 用の case を追加する', '現在の count に 5 加算して返す'],
                    hints: ['case "STEP_UP": return { count: state.count + 5 };'],
                    expectedKeywords: ['case', 'STEP_UP', 'state.count + 5'],
                    starterCode: `function reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n    // TODO: ここに 'STEP_UP' アクションを受け取った場合、\n    // state.count に 5 を足した新しいオブジェクトを返す case ブロックを追記してください\n\n    default:\n      return state;\n  }\n}`
                },
                {
                    id: 'usereducer-dispatch',
                    prompt: 'ボタンクリック時に { type: "DECREMENT" } アクションをディスパッチするようにしてください。',
                    requirements: ['onClickを使用する', 'dispatch関数を呼び、適切なActionを渡す'],
                    hints: ['onClick={() => dispatch({ type: "DECREMENT" })}'],
                    expectedKeywords: ['onClick', 'dispatch', 'type:', '"DECREMENT"'],
                    starterCode: `import { useReducer } from 'react';\n\n// (reducerの実装等がある前提)\n\nexport function CounterApp() {\n  // const [state, dispatch] = useReducer(reducer, { count: 0 });\n  // ...\n\n  return (\n    <div>\n      {/* TODO: クリック時(onClick)に、dispatch を使って { type: 'DECREMENT' } のアクションを送出してください */}\n      <button>減らす</button>\n    </div>\n  );\n}`
                }
            ]
        },
    },
]

export function getIntermediateStep(stepId: string) {
    return intermediateSteps.find((step) => step.id === stepId)
}

export type LearningMode = 'read' | 'practice' | 'test' | 'challenge'

export interface PracticeQuestion {
  id: string
  prompt: string
  answer: string
  hint: string
}

export interface TestTask {
  instruction: string
  starterCode: string
  expectedKeywords: string[]
}

export interface ChallengeTask {
  prompt: string
  requirements: string[]
  hints: string[]
}

export interface LearningStepContent {
  id: string
  order: number
  title: string
  summary: string
  readMarkdown: string
  practiceQuestions: PracticeQuestion[]
  testTask: TestTask
  challengeTask: ChallengeTask
}

export const fundamentalsSteps: LearningStepContent[] = [
  {
    id: 'usestate-basic',
    order: 1,
    title: 'useState基礎',
    summary: '状態管理の基本を学び、ユーザー操作で値が変わるUIを作る。',
    readMarkdown: `# useStateの基本

- \`useState\` は関数コンポーネントで状態を持つためのHookです。
- \`const [count, setCount] = useState(0)\` のように定義します。
- setterを呼ぶと再レンダリングされ、画面に最新の状態が反映されます。`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'stateを更新する関数名は何ですか？（countの例）',
        answer: 'setCount',
        hint: '`const [count, ???] = useState(0)` の形を思い出してください。',
      },
    ],
    testTask: {
      instruction: 'ボタンを押すと count が 1 増えるように空欄を埋めてください。',
      starterCode: `const [count, setCount] = useState(0)
return <button onClick={() => ____}>+1 ({count})</button>`,
      expectedKeywords: ['setCount', 'count + 1'],
    },
    challengeTask: {
      prompt: 'いいねボタンを実装し、クリックで数値が増えるコンポーネントを作ってください。',
      requirements: ['初期値0から開始する', 'クリックで+1される', '現在値を表示する'],
      hints: ['まず state を 1 つ定義する', 'イベントハンドラで setter を呼ぶ'],
    },
  },
  {
    id: 'events',
    order: 2,
    title: 'イベント処理',
    summary: 'onClick や onChange を使ってユーザー入力を処理する。',
    readMarkdown: `# イベント処理

- Reactのイベント名はキャメルケース（例: \`onClick\`）です。
- イベントハンドラには関数を渡します。
- フォーム入力では \`event.target.value\` を使います。`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '入力欄の変更イベントで使うプロパティ名は？',
        answer: 'onChange',
        hint: '`input` の値変更で発火するイベントです。',
      },
    ],
    testTask: {
      instruction: 'ボタン押下時に "clicked" をコンソール出力してください。',
      starterCode: `<button ____={() => console.log('clicked')}>Run</button>`,
      expectedKeywords: ['onClick'],
    },
    challengeTask: {
      prompt: '入力値をリアルタイム表示するフォームを作成してください。',
      requirements: ['入力欄を1つ置く', '入力値を下に表示する', '表示は即時反映される'],
      hints: ['onChange で値を受け取る', 'useStateで保持する'],
    },
  },
  {
    id: 'conditional',
    order: 3,
    title: '条件付きレンダリング',
    summary: '条件によって表示する要素を切り替える。',
    readMarkdown: `# 条件付きレンダリング

- \`if\` 文で分岐して JSX を返せます。
- JSX 内では三項演算子（\`condition ? A : B\`）や \`&&\` が使えます。
- ログイン状態などの切り替え表現で多用します。`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '条件が真の時だけ表示したい場合によく使う演算子は？',
        answer: '&&',
        hint: '短絡評価を使う記法です。',
      },
    ],
    testTask: {
      instruction: 'isLoggedIn が true の時だけ Welcome を表示してください。',
      starterCode: `{isLoggedIn ____ <p>Welcome</p>}`,
      expectedKeywords: ['&&'],
    },
    challengeTask: {
      prompt: '切替ボタンで「表示中/非表示」を切り替えるUIを作ってください。',
      requirements: ['表示状態をstateで持つ', 'ボタンで反転する', '文言を条件分岐で表示する'],
      hints: ['booleanのstateを使う', 'setState(prev => !prev) を使う'],
    },
  },
  {
    id: 'lists',
    order: 4,
    title: 'リスト表示',
    summary: '配列データを map で描画し、key を適切に設定する。',
    readMarkdown: `# リスト表示

- 配列は \`array.map\` で JSX に変換します。
- それぞれの要素には安定した \`key\` を渡します。
- key には index よりも一意なIDを使うのが基本です。`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'リスト描画で必須になる属性名は？',
        answer: 'key',
        hint: 'Reactが差分更新で使う識別子です。',
      },
    ],
    testTask: {
      instruction: 'items を li で描画し、id を key に指定してください。',
      starterCode: `{items.map((item) => <li ____>{item.name}</li>)}`,
      expectedKeywords: ['key={item.id}'],
    },
    challengeTask: {
      prompt: 'Todo配列を受け取り、未完了件数を表示するリストを実装してください。',
      requirements: ['mapで一覧描画する', 'keyを設定する', '未完了件数を表示する'],
      hints: ['filter で未完了を抽出', 'lengthで件数を算出'],
    },
  },
]

export function getFundamentalsStep(stepId: string) {
  return fundamentalsSteps.find((step) => step.id === stepId)
}

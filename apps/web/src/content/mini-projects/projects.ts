import type { MiniProject } from './types'

export const MINI_PROJECTS: MiniProject[] = [
  // ─── beginner ──────────────────────────────────────────────────────────────

  {
    id: 'todo-app',
    difficulty: 'beginner',
    title: 'Todo App',
    description: 'useState を使ってタスクの追加・完了切り替え・フィルタリングができる Todo アプリを作成してください。',
    keyElements: ['useState', 'filter', 'map', 'onChange'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'useState でタスクリストを管理',
        description: 'useState でタスク配列を状態管理し、初期タスクを表示できる',
        requiredKeywords: ['usestate(', 'settasks('],
        editableRange: { startLine: 12, endLine: 14 },
      },
      {
        id: 'milestone-2',
        title: 'フォームでタスクを追加',
        description: 'input と button でタスクを追加できる',
        requiredKeywords: ['oninputchange', 'setinput(', 'addtask'],
        editableRange: { startLine: 12, endLine: 18 },
      },
      {
        id: 'milestone-3',
        title: '完了/未完了の切り替え',
        description: 'タスクをクリックして completed を toggle できる',
        requiredKeywords: ['toggletask', 'completed'],
        editableRange: { startLine: 20, endLine: 22 },
      },
      {
        id: 'milestone-4',
        title: 'フィルター機能',
        description: 'all / active / completed でタスクを絞り込める',
        requiredKeywords: ['filter(', 'setfilter('],
        editableRange: { startLine: 24, endLine: 33 },
      },
    ],
    initialCode: `import { useState } from 'react'

interface Task {
  id: number
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

export default function TodoApp() {
  // TODO: tasks の useState を定義する
  // TODO: input の useState を定義する
  // TODO: filter の useState を定義する

  function addTask() {
    // TODO: 新しいタスクを tasks に追加する
  }

  function toggleTask(id: number) {
    // TODO: 指定 id の completed を反転する
  }

  // TODO: filter に応じて tasks をフィルタリングする
  const filteredTasks: Task[] = []

  return (
    <div>
      <h1>Todo App</h1>
      {/* TODO: input と追加ボタンを実装する */}
      {/* TODO: フィルターボタン (all / active / completed) を実装する */}
      {/* TODO: filteredTasks を map でリスト表示する */}
    </div>
  )
}
`,
  },

  {
    id: 'counter-extended',
    difficulty: 'beginner',
    title: 'カウンター拡張',
    description: '複数のカウンターを管理し、個別にインクリメント/デクリメントして合計を表示するアプリを作成してください。',
    keyElements: ['useState', 'map', '合計計算', 'reduce'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'useState でカウンター配列を管理',
        description: '複数カウンターの初期状態を useState で管理できる',
        requiredKeywords: ['usestate(', 'setcounters('],
        editableRange: { startLine: 9, endLine: 11 },
      },
      {
        id: 'milestone-2',
        title: '複数カウンターの個別操作',
        description: '各カウンターを個別にインクリメント/デクリメントできる',
        requiredKeywords: ['increment(', 'decrement(', 'map('],
        editableRange: { startLine: 12, endLine: 18 },
      },
      {
        id: 'milestone-3',
        title: '合計表示',
        description: '全カウンターの合計値をリアルタイムに表示できる',
        requiredKeywords: ['reduce(', 'total'],
        editableRange: { startLine: 20, endLine: 27 },
      },
    ],
    initialCode: `import { useState } from 'react'

interface Counter {
  id: number
  label: string
  value: number
}

export default function CounterExtended() {
  // TODO: counters の useState を定義する（初期値は 3 つ程度）

  function increment(id: number) {
    // TODO: 指定 id のカウンターを +1 する
  }

  function decrement(id: number) {
    // TODO: 指定 id のカウンターを -1 する
  }

  // TODO: reduce で合計値を計算する
  const total = 0

  return (
    <div>
      <h1>カウンター拡張</h1>
      {/* TODO: counters を map でカウンター表示 */}
      {/* TODO: 合計値を表示 */}
    </div>
  )
}
`,
  },

  {
    id: 'rock-paper-scissors',
    difficulty: 'beginner',
    title: 'じゃんけん',
    description: 'Math.random を使ってコンピューターとじゃんけんできるアプリを作成してください。勝敗を判定して結果を表示します。',
    keyElements: ['useState', 'Math.random', '勝敗判定', 'onClick'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'Math.random でコンピューターの手を生成',
        description: 'Math.random() を使ってグー/チョキ/パーをランダムに選択できる',
        requiredKeywords: ['math.random()', 'choices'],
        editableRange: { startLine: 11, endLine: 14 },
      },
      {
        id: 'milestone-2',
        title: '勝敗判定ロジック',
        description: 'プレイヤーとコンピューターの手を比較して勝敗を判定できる',
        requiredKeywords: ['judgeresult', 'winner'],
        editableRange: { startLine: 16, endLine: 19 },
      },
      {
        id: 'milestone-3',
        title: 'useState で結果を管理',
        description: 'プレイヤーの手・コンピューターの手・結果を useState で管理して表示できる',
        requiredKeywords: ['usestate(', 'setresult('],
        editableRange: { startLine: 8, endLine: 23 },
      },
    ],
    initialCode: `import { useState } from 'react'

type Hand = 'グー' | 'チョキ' | 'パー'
type Result = '勝ち' | '負け' | '引き分け' | null

const HANDS: Hand[] = ['グー', 'チョキ', 'パー']

export default function RockPaperScissors() {
  // TODO: playerHand, computerHand, result の useState を定義する

  function getComputerHand(): Hand {
    // TODO: Math.random() で HANDS からランダムに選ぶ
    return 'グー'
  }

  function judgeResult(player: Hand, computer: Hand): Result {
    // TODO: 勝敗を判定する（引き分け / 勝ち / 負け）
    return null
  }

  function play(hand: Hand) {
    // TODO: コンピューターの手を取得し、judgeResult で結果を判定して state を更新する
  }

  return (
    <div>
      <h1>じゃんけん</h1>
      {/* TODO: グー/チョキ/パー の選択ボタンを表示する */}
      {/* TODO: プレイヤー・コンピューターの手と結果を表示する */}
    </div>
  )
}
`,
  },

  // ─── intermediate ──────────────────────────────────────────────────────────

  {
    id: 'timer-app',
    difficulty: 'intermediate',
    title: 'タイマー',
    description: 'setInterval を使ったカウントダウンタイマーを作成してください。開始・停止・リセット機能と時間のフォーマット表示を実装します。',
    keyElements: ['setInterval', 'clearInterval', 'useEffect', 'useState'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'setInterval でカウントダウン',
        description: 'setInterval を使って 1 秒ごとに時間を減らせる',
        requiredKeywords: ['setinterval(', 'settimeremaining('],
        editableRange: { startLine: 8, endLine: 11 },
      },
      {
        id: 'milestone-2',
        title: 'clearInterval でクリーンアップ',
        description: 'useEffect の return で clearInterval を呼んでメモリリークを防げる',
        requiredKeywords: ['clearinterval(', 'return () =>'],
        editableRange: { startLine: 8, endLine: 11 },
      },
      {
        id: 'milestone-3',
        title: 'isRunning で開始/停止を管理',
        description: 'isRunning フラグで開始・停止ボタンを切り替えられる',
        requiredKeywords: ['isrunning', 'setisrunning('],
        editableRange: { startLine: 5, endLine: 25 },
      },
      {
        id: 'milestone-4',
        title: '時間のフォーマット表示',
        description: '秒数を「MM:SS」形式でフォーマットして表示できる',
        requiredKeywords: ['formattime(', 'padstart('],
        editableRange: { startLine: 13, endLine: 16 },
      },
    ],
    initialCode: `import { useState, useEffect } from 'react'

const INITIAL_TIME = 60

export default function TimerApp() {
  // TODO: timeRemaining と isRunning の useState を定義する

  useEffect(() => {
    // TODO: isRunning が true のとき setInterval で 1 秒ごとに時間を減らす
    // TODO: return でクリーンアップ（clearInterval）する
  }, [/* TODO: 依存配列 */])

  function formatTime(seconds: number): string {
    // TODO: 秒数を "MM:SS" 形式に変換する（String.padStart を使う）
    return String(seconds)
  }

  return (
    <div>
      <h1>タイマー</h1>
      {/* TODO: formatTime で時間を表示 */}
      {/* TODO: 開始/停止ボタン（isRunning で切り替え）を実装 */}
      {/* TODO: リセットボタンを実装 */}
    </div>
  )
}
`,
  },

  {
    id: 'markdown-previewer',
    difficulty: 'intermediate',
    title: 'Markdown プレビュー',
    description: 'textarea に入力した Markdown テキストをリアルタイムでプレビューする2カラムエディタを作成してください。',
    keyElements: ['useState', 'dangerouslySetInnerHTML', 'replace', 'onChange'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'textarea で入力を管理',
        description: 'textarea の onChange で入力テキストを useState に保存できる',
        requiredKeywords: ['usestate(', 'setmarkdown(', 'onchange'],
        editableRange: { startLine: 16, endLine: 22 },
      },
      {
        id: 'milestone-2',
        title: 'dangerouslySetInnerHTML でプレビュー',
        description: 'dangerouslySetInnerHTML を使って HTML を描画できる',
        requiredKeywords: ['dangerouslysetinnerhtml', '__html'],
        editableRange: { startLine: 19, endLine: 24 },
      },
      {
        id: 'milestone-3',
        title: 'replace で Markdown を変換',
        description: 'String.replace で見出し・太字・コードブロックなど基本構文を HTML に変換できる',
        requiredKeywords: ['replace(/', 'parsemarkdown('],
        editableRange: { startLine: 10, endLine: 14 },
      },
    ],
    initialCode: `import { useState } from 'react'

const INITIAL_MARKDOWN = \`# Hello Markdown

**太字** や *斜体* が使えます。

\\\`コード\\\` もインライン表示できます。
\`

function parseMarkdown(text: string): string {
  // TODO: replace を使って Markdown を HTML に変換する
  // ヒント: # 見出し → <h1>, **太字** → <strong>, *斜体* → <em>, \`コード\` → <code>
  return text
}

export default function MarkdownPreviewer() {
  // TODO: markdown テキストの useState を定義する（初期値は INITIAL_MARKDOWN）

  return (
    <div style={{ display: 'flex', gap: '16px', height: '400px' }}>
      {/* TODO: 左カラム: textarea で入力エリアを実装 */}
      {/* TODO: 右カラム: dangerouslySetInnerHTML でプレビューを表示 */}
    </div>
  )
}
`,
  },

  {
    id: 'quiz-app',
    difficulty: 'intermediate',
    title: 'クイズアプリ',
    description: '複数問のクイズを順番に出題し、正誤判定・画面遷移・最終スコア表示まで実装してください。',
    keyElements: ['useState', '正誤判定', '画面遷移', 'スコア集計'],
    milestones: [
      {
        id: 'milestone-1',
        title: '問題データを表示',
        description: 'クイズデータの配列から現在の問題を取得して表示できる',
        requiredKeywords: ['currentindex', 'questions['],
        editableRange: { startLine: 16, endLine: 35 },
      },
      {
        id: 'milestone-2',
        title: '正誤判定',
        description: '選択肢クリックで正解かどうかを判定してフィードバックを表示できる',
        requiredKeywords: ['iscorrect', 'setscore('],
        editableRange: { startLine: 19, endLine: 21 },
      },
      {
        id: 'milestone-3',
        title: '次の問題へ遷移',
        description: '「次へ」ボタンで currentIndex を進めて次の問題を表示できる',
        requiredKeywords: ['setcurrentindex(', 'currentindex + 1'],
        editableRange: { startLine: 23, endLine: 25 },
      },
      {
        id: 'milestone-4',
        title: 'スコアと結果画面',
        description: '全問終了後にスコアを表示する結果画面に切り替えられる',
        requiredKeywords: ['isfinished', 'score'],
        editableRange: { startLine: 27, endLine: 35 },
      },
    ],
    initialCode: `import { useState } from 'react'

interface Question {
  id: number
  text: string
  choices: string[]
  correctIndex: number
}

const QUESTIONS: Question[] = [
  { id: 1, text: 'React の状態管理フックは？', choices: ['useEffect', 'useState', 'useRef', 'useMemo'], correctIndex: 1 },
  { id: 2, text: '副作用を扱うフックは？', choices: ['useState', 'useCallback', 'useEffect', 'useContext'], correctIndex: 2 },
  { id: 3, text: 'コンテキストの値を取得するフックは？', choices: ['useRef', 'useReducer', 'useMemo', 'useContext'], correctIndex: 3 },
]

export default function QuizApp() {
  // TODO: currentIndex, score, isFinished, selectedIndex の useState を定義する

  function handleSelect(index: number) {
    // TODO: 正誤判定してスコアを更新し selectedIndex を設定する
  }

  function handleNext() {
    // TODO: currentIndex を進め、最後の問題なら isFinished を true にする
  }

  // TODO: isFinished が true なら結果画面を表示する

  return (
    <div>
      <h1>クイズ ({/* TODO: 現在の問題番号 / 全問題数 */})</h1>
      {/* TODO: 現在の問題文と選択肢ボタンを表示する */}
      {/* TODO: 選択後に正誤フィードバックと「次へ」ボタンを表示する */}
    </div>
  )
}
`,
  },

  // ─── advanced ──────────────────────────────────────────────────────────────

  {
    id: 'weather-api',
    difficulty: 'advanced',
    title: '天気 API アプリ',
    description: 'fetch と async/await を使って天気 API からデータを取得し、ローディング・エラーハンドリングを実装してください。',
    keyElements: ['fetch', 'async/await', 'useEffect', 'ローディング', 'エラーハンドリング'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'fetch + async/await でデータ取得',
        description: 'fetch と async/await で API からデータを取得できる',
        requiredKeywords: ['async ', 'await fetch('],
        editableRange: { startLine: 21, endLine: 24 },
      },
      {
        id: 'milestone-2',
        title: 'ローディング状態を管理',
        description: 'isLoading フラグでローディング UI を表示できる',
        requiredKeywords: ['isloading', 'setisloading('],
        editableRange: { startLine: 17, endLine: 24 },
      },
      {
        id: 'milestone-3',
        title: 'エラーハンドリング',
        description: 'try/catch でエラーを捕捉してエラーメッセージを表示できる',
        requiredKeywords: ['try {', 'catch (', 'seterror('],
        editableRange: { startLine: 21, endLine: 24 },
      },
      {
        id: 'milestone-4',
        title: 'useEffect でマウント時に取得',
        description: 'useEffect で都市変更時に自動的にデータ取得できる',
        requiredKeywords: ['useeffect(', '[city]'],
        editableRange: { startLine: 21, endLine: 24 },
      },
    ],
    initialCode: `import { useState, useEffect } from 'react'

interface WeatherData {
  city: string
  temperature: number
  description: string
  humidity: number
}

// モック API 関数（実際の API の代わり）
async function fetchWeather(city: string): Promise<WeatherData> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  if (city === 'error') throw new Error('都市が見つかりません')
  return { city, temperature: Math.round(15 + Math.random() * 20), description: '晴れ', humidity: Math.round(40 + Math.random() * 40) }
}

export default function WeatherApp() {
  const [city, setCity] = useState('Tokyo')
  // TODO: weather, isLoading, error の useState を定義する

  useEffect(() => {
    // TODO: async 関数を定義して fetchWeather(city) でデータを取得する
    // TODO: isLoading, error も適切に管理する
  }, [city])

  return (
    <div>
      <h1>天気アプリ</h1>
      {/* TODO: 都市名入力欄を実装する */}
      {/* TODO: isLoading, error, weather を条件分岐して表示する */}
    </div>
  )
}
`,
  },

  {
    id: 'shopping-cart',
    difficulty: 'advanced',
    title: 'ショッピングカート',
    description: 'useReducer と useContext を使って商品一覧とカート機能を実装してください。カートへの追加・削除・合計計算が対象です。',
    keyElements: ['useReducer', 'useContext', 'createContext', 'dispatch'],
    milestones: [
      {
        id: 'milestone-1',
        title: 'useReducer でカート状態を管理',
        description: 'useReducer でカート内アイテム配列を管理できる',
        requiredKeywords: ['usereducer(', 'cartreducer'],
        editableRange: { startLine: 16, endLine: 20 },
      },
      {
        id: 'milestone-2',
        title: 'Action 定義と dispatch',
        description: 'ADD_ITEM / REMOVE_ITEM のアクションを定義して dispatch できる',
        requiredKeywords: ['add_item', 'remove_item', 'dispatch('],
        editableRange: { startLine: 13, endLine: 20 },
      },
      {
        id: 'milestone-3',
        title: 'useContext でカートを共有',
        description: 'createContext + useContext でカートの状態と dispatch を子コンポーネントに共有できる',
        requiredKeywords: ['createcontext(', 'usecontext(', 'cartcontext'],
        editableRange: { startLine: 22, endLine: 44 },
      },
      {
        id: 'milestone-4',
        title: '合計金額を計算',
        description: 'reduce で合計金額をリアルタイムに計算して表示できる',
        requiredKeywords: ['reduce(', 'totalprice'],
        editableRange: { startLine: 31, endLine: 45 },
      },
    ],
    initialCode: `import { useReducer, useContext, createContext } from 'react'

interface Product {
  id: number
  name: string
  price: number
}

interface CartItem extends Product {
  quantity: number
}

// TODO: CartAction 型を定義する（ADD_ITEM / REMOVE_ITEM）
type CartAction = never

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  // TODO: ADD_ITEM: 既存アイテムなら quantity を増やし、なければ追加する
  // TODO: REMOVE_ITEM: 指定 id のアイテムを除去する
  return state
}

// TODO: CartContext を createContext で定義する
const CartContext = createContext<never>(null as never)

const PRODUCTS: Product[] = [
  { id: 1, name: 'React 入門書', price: 2980 },
  { id: 2, name: 'TypeScript 完全ガイド', price: 3480 },
  { id: 3, name: 'Node.js ハンドブック', price: 2580 },
]

export default function ShoppingCart() {
  // TODO: useReducer でカート状態を初期化する

  // TODO: totalPrice を reduce で計算する

  return (
    // TODO: CartContext.Provider で state と dispatch を提供する
    <div>
      <h1>ショッピングカート</h1>
      {/* TODO: 商品一覧と「カートに追加」ボタンを表示する */}
      {/* TODO: カート内アイテム一覧と「削除」ボタンを表示する */}
      {/* TODO: 合計金額を表示する */}
    </div>
  )
}
`,
  },
]

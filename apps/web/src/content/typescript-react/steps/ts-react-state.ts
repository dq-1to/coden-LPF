import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsReactStateStep: LearningStepContent = {
  id: 'ts-react-state',
  order: 28,
  title: 'State型定義',
  summary: 'useState<T>の型注釈・null/undefinedを含む状態・useReducerのAction型定義など、型安全な状態管理を学ぶ。',
  readMarkdown: `# State型定義

## useState<T> の型注釈

\`useState\` に型引数を渡すと、state と setter の型が確定します。

\`\`\`tsx
// 型推論に任せる（初期値から自動推論）
const [count, setCount] = useState(0)           // number
const [name, setName] = useState('Alice')       // string

// 明示的に型を指定する（初期値が空配列など推論が難しい場合）
const [items, setItems] = useState<string[]>([])
const [tags, setTags] = useState<number[]>([])
\`\`\`

## null/undefined を含む状態

初期値が null の場合は **ユニオン型** で定義します。

\`\`\`tsx
interface User {
  id: number
  name: string
}

// null を許容するユーザー state
const [user, setUser] = useState<User | null>(null)

// ロード完了後に値をセット
function handleLogin(userData: User) {
  setUser(userData)
}

// null チェック後に安全にアクセス
if (user !== null) {
  console.log(user.name)  // TypeScript は User 型と認識
}
\`\`\`

## 複雑な状態オブジェクト

フォームなど複数フィールドを持つ状態も interface で型定義できます。

\`\`\`tsx
interface FormState {
  email: string
  password: string
  isSubmitting: boolean
}

const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  isSubmitting: false,
})

// 部分更新（スプレッド構文）
setForm((prev) => ({ ...prev, email: 'test@example.com' }))
\`\`\`

## useReducer の Action 型定義

\`useReducer\` では Action をユニオン型で定義し、型安全な dispatch を実現します。

\`\`\`tsx
type CountAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }

function reducer(state: number, action: CountAction): number {
  switch (action.type) {
    case 'increment': return state + 1
    case 'decrement': return state - 1
    case 'reset':     return action.payload  // payload は number 型と確定
    default:          return state
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0)

  return (
    <div>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>リセット</button>
    </div>
  )
}
\`\`\`

## 判別共用体（Discriminated Union）によるフォーム状態管理

より厳密な状態管理には判別共用体が有効です。

\`\`\`tsx
type FormAction =
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'SET_PASSWORD'; password: string }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
\`\`\`

\`type\` フィールドで状態を区別することで、各ケースで必要なデータのみアクセスできます。
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`const [count, setCount] = useState(____)` — 初期値0で number 型の state を作るには？',
      answer: '0',
      hint: '数値リテラルを渡すと型推論されます。',
      explanation: 'useState(0) と書くと TypeScript は count を number 型、setCount を (value: number | (prev: number) => number) => void 型と推論します。',
      choices: ['0', '"0"', 'number', '<number>0'],
    },
    {
      id: 'q2',
      prompt: '初期値が空配列 `[]` のとき、string配列のstateを作るには？',
      answer: 'useState<string[]>([])',
      hint: '空配列では型が推論できないので明示が必要です。',
      explanation: 'useState([]) だと TypeScript は never[] と推論してしまいます。useState<string[]>([]) のように型引数を明示します。',
      choices: ['useState<string[]>([])', 'useState([])', 'useState<string>([])', 'useState<Array>([])'],
    },
    {
      id: 'q3',
      prompt: 'null を含む User state の型は？',
      answer: 'User | null',
      hint: 'ユニオン型で null を許容します。',
      explanation: 'useState<User | null>(null) とすることで、未ロード時は null、ロード後は User 型の値を持てます。',
      choices: ['User | null', 'User?', 'Nullable<User>', 'User | undefined'],
    },
    {
      id: 'q4',
      prompt: 'useReducer の Action 型で `{ type: "reset"; payload: number }` のように定義した場合、`case "reset":` 内で `action.payload` の型は？',
      answer: 'number',
      hint: '判別共用体によって型が絞り込まれます。',
      explanation: 'switch の case "reset": ブランチでは TypeScript が action を `{ type: "reset"; payload: number }` に絞り込むため、action.payload は number 型として扱えます。',
      choices: ['number', 'string', 'unknown', 'any'],
    },
    {
      id: 'q5',
      prompt: '`setForm((prev) => ({ ...prev, email: "new@example.com" }))` — この書き方の目的は？',
      answer: '既存フィールドを保ちながら部分更新する',
      hint: 'スプレッド構文で既存の値をコピーしています。',
      explanation: 'スプレッド構文 `...prev` で既存のフィールドをコピーし、変更したいフィールドだけ上書きします。これにより他のフィールドが失われません。',
      choices: ['既存フィールドを保ちながら部分更新する', '全フィールドをリセットする', 'emailだけのオブジェクトを作る', '非同期で状態を更新する'],
    },
  ],
  testTask: {
    instruction: '`useState` でユーザー情報（User型またはnull）を管理するstateを宣言してください。初期値はnullです。',
    starterCode: `interface User {
  id: number
  name: string
}

function UserProfile() {
  const [user, setUser] = useState<____ | null>(null)

  return <div>{user ? user.name : '未ログイン'}</div>
}`,
    expectedKeywords: ['User'],
    explanation: '`useState<User | null>(null)` とすることで、ユーザー情報がない状態（null）とある状態（User）を型安全に扱えます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-react-state-1',
        prompt: 'null 許容ユーザー状態を型安全に管理するコンポーネントを実装してください。',
        requirements: [
          'id（number）と name（string）と email（string）を持つ User interface を定義する',
          '`useState<User | null>` でユーザー状態を管理する',
          'ログイン関数でstateをUserにセット、ログアウト関数でnullにリセットする',
          'ユーザーがnullのとき「ログインしてください」、そうでないとき名前とメールを表示する',
        ],
        hints: [
          'useState<User | null>(null) で初期値をnullにします',
          'null チェックで条件付きレンダリングを行います',
          'setUser(userData) でログイン、setUser(null) でログアウトします',
        ],
        expectedKeywords: ['User', 'useState', 'null', 'setUser'],
        starterCode: `// TODO: User interface を定義してください

function UserProfile() {
  // TODO: useState で User | null の state を宣言してください

  function handleLogin() {
    // TODO: ダミーユーザーデータをセット
    // { id: 1, name: 'Alice', email: 'alice@example.com' }
  }

  function handleLogout() {
    // TODO: null にリセット
  }

  return (
    <div>
      {/* TODO: ログイン状態に応じて表示を切り替える */}
      <button onClick={handleLogin}>ログイン</button>
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `interface User {\\n  id: number;\\n  name: string;\\n  email: string;\\n}\\n\\nfunction UserProfile() {\\n  ____0\\n\\n  ____1\\n\\n  return (\\n    <div>\\n      {user ? <p>{user.name} ({user.email})</p> : <p>ログインしてください</p>}\\n      <button onClick={handleLogin}>ログイン</button>\\n      <button onClick={handleLogout}>ログアウト</button>\\n    </div>\\n  )\\n}`,
            blanks: [
              {
                id: 'user-state',
                label: 'useState定義',
                correctTokens: ['const', '[user, setUser]', '=', 'useState', '<User | null>', '(', 'null', ')'],
                distractorTokens: ['undefined', 'any', 'string', 'useRef'],
              },
              {
                id: 'login-logout',
                label: 'login/logout',
                correctTokens: ['function', 'handleLogin', '()', '{', 'setUser', '(', "{ id: 1, name: 'Alice', email: 'alice@example.com' }", ')', '}', 'function', 'handleLogout', '()', '{', 'setUser', '(', 'null', ')', '}'],
                distractorTokens: ['dispatch', 'setState', 'resetUser', 'useRef'],
              },
            ],
          },
      },
      {
        id: 'ts-react-state-2',
        prompt: 'useReducer でフォーム状態を型安全に管理してください。',
        requirements: [
          'email（string）と password（string）と error（string | null）を持つ FormState type を定義する',
          '`SET_EMAIL`、`SET_PASSWORD`、`CLEAR_ERROR` の3種類の Action ユニオン型を定義する',
          'reducer 関数を実装して各 action に応じて state を更新する',
          'useReducer を使ったフォームコンポーネントを実装する',
        ],
        hints: [
          'type FormAction = | { type: "SET_EMAIL"; email: string } | ...',
          'reducer の引数は (state: FormState, action: FormAction): FormState',
          'switch(action.type) で各ケースを処理します',
        ],
        expectedKeywords: ['FormState', 'FormAction', 'useReducer', 'reducer', 'dispatch'],
        starterCode: `// TODO: FormState type を定義してください

// TODO: FormAction ユニオン型を定義してください

// TODO: reducer 関数を実装してください

function LoginForm() {
  // TODO: useReducer でフォーム状態を管理してください
  const initialState = { email: '', password: '', error: null }

  return (
    <form>
      {/* TODO: dispatch を使って状態を更新する入力フォームを実装 */}
    </form>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `type FormState = {\\n  email: string;\\n  password: string;\\n  error: string | null;\\n}\\n\\n____0\\n\\nfunction reducer(state: FormState, action: FormAction): FormState {\\n  ____1\\n}\\n\\nfunction LoginForm() {\\n  const [state, dispatch] = useReducer(reducer, { email: '', password: '', error: null })\\n  return (\\n    <form>\\n      <input value={state.email}\\n        onChange={e => dispatch({ type: 'SET_EMAIL', email: e.target.value })} />\\n      <input type="password" value={state.password}\\n        onChange={e => dispatch({ type: 'SET_PASSWORD', password: e.target.value })} />\\n    </form>\\n  )\\n}`,
            blanks: [
              {
                id: 'form-action',
                label: 'FormAction型',
                correctTokens: ['type', 'FormAction', '=', "{ type: 'SET_EMAIL'; email: string }", '|', "{ type: 'SET_PASSWORD'; password: string }", '|', "{ type: 'CLEAR_ERROR' }"],
                distractorTokens: ['useState', 'setState', 'enum', 'any'],
              },
              {
                id: 'reducer-body',
                label: 'reducer実装',
                correctTokens: ['switch', '(action.type)', '{', "case 'SET_EMAIL':", 'return', '{ ...state,', 'email: action.email }', "case 'SET_PASSWORD':", 'return', '{ ...state,', 'password: action.password }', "case 'CLEAR_ERROR':", 'return', '{ ...state,', 'error: null }', 'default:', 'return', 'state', '}'],
                distractorTokens: ['useState', 'dispatch', 'action.value', 'any'],
              },
            ],
          },
      },
    ],
  },
}

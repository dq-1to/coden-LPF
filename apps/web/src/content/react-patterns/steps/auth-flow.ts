import type { LearningStepContent } from '@/content/fundamentals/steps'

export const authFlowStep: LearningStepContent = {
  id: 'auth-flow',
  order: 40,
  title: '認証フロー実装',
  summary: 'ログイン/ログアウト/保護ルートの設計パターン・認証状態の Context 管理・トークン管理の考え方を学ぶ。',
  readMarkdown: `# 認証フロー実装

## 認証フローの全体像

\`\`\`
[ログイン画面]
  ↓ 認証情報を送信
[APIサーバー]
  ↓ トークン返却
[フロントエンド] トークンを保存
  ↓ 保護ルートへ
[ダッシュボード] トークンを Authorization ヘッダーに付与してAPIリクエスト
\`\`\`

## 認証状態の管理 — Context パターン

認証状態をアプリ全体で共有するには Context API を使います。

\`\`\`tsx
// types
interface User {
  id: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Context の作成
const AuthContext = createContext<AuthContextValue | null>(null)

// Provider の実装
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
\`\`\`

## 保護ルート（ProtectedRoute）

未認証ユーザーをリダイレクトするコンポーネントです。

\`\`\`tsx
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// ルーティングでの使用
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
\`\`\`

## トークンの保存場所と比較

| 保存場所 | 特徴 | XSS | CSRF | 実務での推奨 |
|---------|------|-----|------|------------|
| localStorage | JavaScript でアクセス可能 | 脆弱 | 安全 | 低セキュリティ要件のみ |
| sessionStorage | タブを閉じると消える | 脆弱 | 安全 | 短期セッション |
| HttpOnly Cookie | JavaScript からアクセス不可 | 安全 | 要対策（SameSite） | 推奨 |
| メモリ（state） | 最もセキュア、リロードで消える | 安全 | 安全 | 高セキュリティ要件 |

**HttpOnly Cookie** は JavaScript からアクセスできないため、XSS 攻撃でトークンを盗まれるリスクがありません。

## 初期化時のセッション復元

ページリロード後も認証状態を維持するには、保存済みトークンの検証が必要です。

\`\`\`tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化: 保存済みトークンでセッション復元
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: \`Bearer \${token}\` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) return <p>読み込み中...</p>

  // ...
}
\`\`\`

## ログイン後のリダイレクト

ログイン成功後に元のページへ戻る実装パターンです。

\`\`\`tsx
function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // ログイン前にアクセスしようとしていたパスを取得
  const from = location.state?.from ?? '/dashboard'

  const handleSubmit = async (data) => {
    await login(data.email, data.password)
    navigate(from, { replace: true })
  }
  // ...
}

// ProtectedRoute での元パスの記録
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '認証状態をアプリ全体で共有するのに最適な React の仕組みは？',
      answer: 'Context API',
      hint: 'prop drilling を避けてデータをグローバルに共有する仕組みです。',
      explanation: 'Context API を使うと、Provider でラップされた全コンポーネントから useContext で認証状態にアクセスできます。ユーザー情報・login/logout 関数をまとめて共有できます。',
      choices: ['Context API', 'props の受け渡し', 'localStorage 直接アクセス', 'Redux'],
    },
    {
      id: 'q2',
      prompt: '未認証ユーザーを /login にリダイレクトするコンポーネントの慣用名は？',
      answer: 'ProtectedRoute',
      hint: '「保護されたルート」という意味の名前です。',
      explanation: 'ProtectedRoute は isAuthenticated をチェックし、未認証なら <Navigate to="/login" /> を返します。認証済みなら children をレンダリングします。PrivateRoute とも呼ばれます。',
      choices: ['ProtectedRoute', 'AuthRoute', 'SecureRoute', 'GuardRoute'],
    },
    {
      id: 'q3',
      prompt: 'XSS 攻撃に対して最も安全なトークン保存場所は？',
      answer: 'HttpOnly Cookie',
      hint: 'JavaScript からアクセスできない Cookie の種類です。',
      explanation: 'HttpOnly Cookie は JavaScript の document.cookie からアクセスできないため、XSS でスクリプトが注入されてもトークンを盗めません。localStorage は JavaScript でアクセス可能なため XSS に脆弱です。',
      choices: ['HttpOnly Cookie', 'localStorage', 'sessionStorage', 'メモリ（変数）'],
    },
    {
      id: 'q4',
      prompt: 'React Router v6 でリダイレクトを行うコンポーネントは？',
      answer: 'Navigate',
      hint: '「ナビゲートする」という名前のコンポーネントです。',
      explanation: '<Navigate to="/login" replace /> でリダイレクトします。replace を付けると履歴スタックの現在エントリを置き換え、ブラウザバックで保護ページに戻れなくなります。',
      choices: ['Navigate', 'Redirect', 'Link', 'useNavigate'],
    },
    {
      id: 'q5',
      prompt: 'AuthProvider の初期化で保存済みトークンの有効性を確認するのに適したタイミングは？',
      answer: 'useEffect（マウント時）',
      hint: 'コンポーネントの初回マウント後に非同期処理を行うHookです。',
      explanation: 'useEffect でマウント時に /api/me などのエンドポイントを叩き、トークンが有効かを確認します。有効なら setUser でユーザー情報をセット、無効なら localStorage からトークンを削除します。',
      choices: ['useEffect（マウント時）', 'useState の初期値', 'constructor', 'render 関数内'],
    },
  ],
  testTask: {
    instruction: '保護ルートコンポーネントを実装してください。未認証の場合は /login にリダイレクトします。',
    starterCode: `function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!____) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}`,
    expectedKeywords: ['isAuthenticated'],
    explanation: 'isAuthenticated が false のとき <Navigate to="/login" replace /> でリダイレクトします。replace オプションでブラウザ履歴に残さないようにします。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'auth-flow-1',
        prompt: '認証用 Context（AuthProvider + useAuth）を実装してください。',
        requirements: [
          'User 型（id: string, email: string）と AuthContextValue 型を定義する',
          'AuthProvider で user ステートを管理し、login/logout 関数を提供する',
          'login は email/password を受け取り、ユーザー情報を user にセットする（API呼び出しは省略可）',
          'logout は user を null にリセットする',
          'useAuth カスタムフックを実装し、AuthProvider 外で使うとエラーを throw する',
        ],
        hints: [
          'createContext<AuthContextValue | null>(null) で Context を作成します',
          'isAuthenticated は !!user で計算できます',
          'useContext が null を返した場合は throw new Error(...) で異常を通知します',
        ],
        expectedKeywords: ['createContext', 'useContext', 'isAuthenticated', 'AuthProvider'],
        starterCode: `import { createContext, useContext, useState } from 'react'

// TODO: User 型と AuthContextValue 型を定義

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // TODO: 実際は API を呼ぶ。ここでは簡略化
    setUser({ id: '1', email })
  }

  const logout = () => {
    // TODO: user をリセット
  }

  return (
    <AuthContext.Provider value={/* TODO: value を設定 */}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  // TODO: useContext で取得し、null チェック後に返す
}`,
      },
      {
        id: 'auth-flow-2',
        prompt: 'ProtectedRoute と LoginPage を含む認証フロー全体を実装してください。',
        requirements: [
          'ProtectedRoute: 未認証なら /login へリダイレクト、アクセス元 pathname を state に記録する',
          'LoginPage: login() 後に location.state.from または /dashboard へリダイレクトする',
          'App コンポーネントで AuthProvider / Routes / ProtectedRoute を組み合わせる',
          'ログアウトボタンをダッシュボードに配置し、logout() を呼んで /login へ戻る',
        ],
        hints: [
          '<Navigate to="/login" state={{ from: location.pathname }} replace /> でアクセス元を記録します',
          'useLocation().state?.from ?? "/dashboard" でリダイレクト先を取得します',
          'useNavigate() でプログラム的なリダイレクトが行えます',
        ],
        expectedKeywords: ['ProtectedRoute', 'Navigate', 'useAuth', 'location.state'],
        starterCode: `import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'

// TODO: ProtectedRoute コンポーネントを実装
function ProtectedRoute({ children }) {
  // ...
}

// TODO: LoginPage コンポーネントを実装（login後にリダイレクト）
function LoginPage() {
  // ...
}

// TODO: DashboardPage（ログアウトボタン付き）
function DashboardPage() {
  // ...
}

// アプリのルーティング
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* TODO: /login と /dashboard ルートを設定 */}
      </Routes>
    </AuthProvider>
  )
}`,
      },
    ],
  },
}

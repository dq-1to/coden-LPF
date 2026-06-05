import type { LearningStepContent } from '@/content/fundamentals/steps'

export const suspenseLazyStep: LearningStepContent = {
  id: 'suspense-lazy',
  order: 32,
  title: 'Suspense と lazy',
  summary: 'React.lazyによるコード分割・Suspenseのfallback・非同期データ読み込みとの連携パターンを学ぶ。',
  readMarkdown: `# Suspense と lazy

## React.lazy とは

\`React.lazy\` を使うと、コンポーネントを**動的インポート**で遅延読み込みできます。初期バンドルサイズを削減し、必要なときだけコードを読み込む「コード分割」を実現します。

\`\`\`jsx
import { lazy } from 'react'

// 通常インポート（全体を初期バンドルに含む）
// import HeavyChart from './HeavyChart'

// 遅延インポート（必要なときに読み込む）
const HeavyChart = lazy(() => import('./HeavyChart'))
\`\`\`

## Suspense でローディング UI を表示する

\`React.lazy\` で読み込んだコンポーネントは、**必ず \`Suspense\` でラップ**する必要があります。\`fallback\` prop にローディング UI を渡します。

\`\`\`jsx
import { Suspense, lazy } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<p>グラフを読み込み中...</p>}>
      <HeavyChart />
    </Suspense>
  )
}
\`\`\`

コンポーネントの読み込みが完了するまで \`fallback\` が表示され、完了後に本コンポーネントが表示されます。

## 複数の lazy コンポーネントをまとめる

複数のlazy コンポーネントを1つの \`Suspense\` でまとめてローディングできます。

\`\`\`jsx
const UserList = lazy(() => import('./UserList'))
const UserStats = lazy(() => import('./UserStats'))
const UserChart = lazy(() => import('./UserChart'))

function UserDashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserList />
      <UserStats />
      <UserChart />
    </Suspense>
  )
}
\`\`\`

## Suspense のネスト

細かい単位でローディング状態を制御したい場合はネストします。

\`\`\`jsx
function App() {
  return (
    <Suspense fallback={<p>ページを読み込み中...</p>}>
      <Header />
      <Suspense fallback={<p>コンテンツを読み込み中...</p>}>
        <MainContent />
      </Suspense>
      <Footer />
    </Suspense>
  )
}
\`\`\`

内側の \`Suspense\` が解決されるまでは内側の \`fallback\` が表示され、外側には影響しません。

## ルートベースのコード分割

React Router と組み合わせたルートベースのコード分割はよく使われるパターンです。

\`\`\`jsx
import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function App() {
  return (
    <Suspense fallback={<p>ページを読み込み中...</p>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  )
}
\`\`\`

初回アクセスしたルートのコードだけが読み込まれるため、初期ロード時間を大幅に短縮できます。

## Error Boundary との組み合わせ

読み込み失敗（ネットワークエラーなど）に備えて、Error Boundary と組み合わせるのがベストプラクティスです。

\`\`\`jsx
<ErrorBoundary fallback={<p>コンポーネントの読み込みに失敗しました</p>}>
  <Suspense fallback={<Spinner />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`const Chart = lazy(() => import("./Chart"))` — この書き方の目的は？',
      answer: 'コード分割による遅延読み込み',
      hint: 'バンドルサイズの最適化に関係します。',
      explanation: 'React.lazy を使うと、そのコンポーネントのコードを別チャンクに分割し、必要なときだけ読み込みます。初期バンドルサイズを削減できます。',
      choices: ['コード分割による遅延読み込み', 'コンポーネントのメモ化', 'エラーハンドリング', 'コンポーネントのキャッシュ'],
    },
    {
      id: 'q2',
      prompt: 'React.lazy で読み込んだコンポーネントを使うときに必須のラッパーコンポーネントは？',
      answer: 'Suspense',
      hint: '「一時停止・待機」を意味する英単語です。',
      explanation: 'React.lazy で作成したコンポーネントは、必ず Suspense でラップする必要があります。Suspense がないと React はエラーをスローします。',
      choices: ['Suspense', 'ErrorBoundary', 'Lazy', 'Provider'],
    },
    {
      id: 'q3',
      prompt: 'Suspense の `fallback` prop に渡すべきものは？',
      answer: 'ローディング中に表示するReact要素',
      hint: 'コンポーネント読み込み中に表示される UI です。',
      explanation: 'fallback には ローディングスピナーや「読み込み中...」テキストなど、コンポーネントが読み込まれるまでの間に表示する React 要素を渡します。',
      choices: ['ローディング中に表示するReact要素', 'エラー時のコールバック関数', 'タイムアウト時間（ミリ秒）', '遅延するコンポーネントの配列'],
    },
    {
      id: 'q4',
      prompt: 'ルートベースのコード分割の主なメリットは？',
      answer: '初回アクセス時のバンドルサイズを削減できる',
      hint: 'ユーザーが最初にアクセスしたページのコードだけ読み込まれます。',
      explanation: 'ルートベースのコード分割では、各ページのコードを別チャンクに分けます。初回は現在のルートのコードだけ読み込まれるため、初期ロード時間が短縮されます。',
      choices: ['初回アクセス時のバンドルサイズを削減できる', 'コンポーネントの再レンダリングを防げる', 'TypeScriptの型チェックが不要になる', 'サーバー負荷を軽減できる'],
    },
    {
      id: 'q5',
      prompt: 'lazy コンポーネントの読み込み失敗に備えるために組み合わせるべきものは？',
      answer: 'Error Boundary',
      hint: 'ネットワークエラーが発生したときのフォールバック UI を提供します。',
      explanation: 'ネットワークエラーなどで lazy コンポーネントの読み込みが失敗した場合、Error Boundary がエラーをキャッチしてフォールバック UI を表示します。Suspense と組み合わせて使うのがベストプラクティスです。',
      choices: ['Error Boundary', 'try/catch', 'useErrorHandler', 'onError prop'],
    },
  ],
  testTask: {
    instruction: 'HeavyComponent を遅延読み込みし、Suspense でラップしてください。読み込み中は「読み込み中...」と表示します。',
    starterCode: `import { Suspense, ____ } from 'react'

const HeavyComponent = ____(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <HeavyComponent />
    </Suspense>
  )
}`,
    expectedKeywords: ['lazy'],
    explanation: 'React.lazy（または import した lazy）と動的 import() を組み合わせてコンポーネントを遅延読み込みします。Suspense の fallback にローディング UI を渡します。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'suspense-lazy-1',
        prompt: 'ルートベースのコード分割を実装してください。',
        requirements: [
          'React.lazy で HomePage・AboutPage・ContactPage の3ページを遅延読み込みする',
          '各ページを個別の dynamic import() で読み込む',
          'Suspense と React Router の Routes/Route で各ルートをラップする',
          'Error Boundary と Suspense を組み合わせて堅牢な構造にする',
        ],
        hints: [
          'const Page = lazy(() => import("./pages/Page")) のパターンを3ページ分作ります',
          'Suspense で Routes 全体をラップし、fallback にローディングUIを渡します',
          'Error Boundary は Suspense の外側に配置します',
        ],
        expectedKeywords: ['lazy', 'Suspense', 'fallback', 'import'],
        starterCode: `import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

// TODO: 3ページを lazy で遅延インポートしてください
// ./pages/HomePage, ./pages/AboutPage, ./pages/ContactPage

function App() {
  return (
    // TODO: Error Boundary と Suspense で Routes をラップしてください
    <Routes>
      {/* TODO: 3つのルートを定義してください */}
    </Routes>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { Suspense, lazy } from 'react'\nimport { Routes, Route } from 'react-router-dom'\n\n____0\n\nfunction App() {\n  return (\n    ____1\n  )\n}`,
            blanks: [
              {
                id: 'lazy-imports',
                label: 'lazy定義',
                correctTokens: ['const', 'HomePage', '=', "lazy(() => import('./pages/HomePage'))", 'const', 'AboutPage', '=', "lazy(() => import('./pages/AboutPage'))", 'const', 'ContactPage', '=', "lazy(() => import('./pages/ContactPage'))"],
                distractorTokens: ['require', 'useEffect', 'useState', 'memo'],
              },
              {
                id: 'suspense-routes',
                label: 'Suspense+Routes',
                correctTokens: ['<Suspense fallback={<p>読み込み中...</p>}>', '<Routes>', '<Route path="/" element={<HomePage />} />', '<Route path="/about" element={<AboutPage />} />', '<Route path="/contact" element={<ContactPage />} />', '</Routes>', '</Suspense>'],
                distractorTokens: ['<ErrorBoundary>', '<Provider>', 'fallback=""', 'children'],
              },
            ],
          },
      },
      {
        id: 'suspense-lazy-2',
        prompt: 'Suspense のネストを使って、ヘッダーとコンテンツで異なるローディング状態を実装してください。',
        requirements: [
          'AppHeader と MainContent の2コンポーネントを lazy で遅延読み込みする',
          '外側の Suspense は AppHeader 用（fallback: 「ヘッダー読み込み中...」）',
          '内側の Suspense は MainContent 用（fallback: 「コンテンツ読み込み中...」）',
          'AppHeader は内側 Suspense の外に配置し、MainContent は内側に配置する',
        ],
        hints: [
          'Suspense をネストすることで、各コンポーネントのローディング状態を独立して管理できます',
          'AppHeader が解決されても MainContent はまだローディング中になる構造を作ります',
        ],
        expectedKeywords: ['lazy', 'Suspense', 'fallback', 'AppHeader', 'MainContent'],
        starterCode: `import { Suspense, lazy } from 'react'

// TODO: AppHeader と MainContent を lazy でインポート

function App() {
  return (
    // TODO: Suspense のネスト構造を実装してください
    // 外側: AppHeader のローディング
    // 内側: MainContent のローディング
    <div>ここに実装</div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { Suspense, lazy } from 'react'\n\n____0\n\nfunction App() {\n  return (\n    ____1\n  )\n}`,
            blanks: [
              {
                id: 'lazy-imports',
                label: 'lazy定義',
                correctTokens: ['const', 'AppHeader', '=', "lazy(() => import('./AppHeader'))", 'const', 'MainContent', '=', "lazy(() => import('./MainContent'))"],
                distractorTokens: ['require', 'useEffect', 'useState', 'memo'],
              },
              {
                id: 'nested-suspense',
                label: 'Suspenseネスト',
                correctTokens: ['<Suspense fallback={<p>ヘッダー読み込み中...</p>}>', '<AppHeader />', '<Suspense fallback={<p>コンテンツ読み込み中...</p>}>', '<MainContent />', '</Suspense>', '</Suspense>'],
                distractorTokens: ['<ErrorBoundary>', 'fallback=""', 'children', '<Provider>'],
              },
            ],
          },
      },
    ],
  },
}

import type { LearningStepContent } from '@/content/fundamentals/steps'

export const errorBoundaryStep: LearningStepContent = {
  id: 'error-boundary',
  order: 31,
  title: 'Error Boundary',
  summary: 'クラスコンポーネントを使ったError Boundaryの実装パターン・componentDidCatch・エラー回復UIの設計を学ぶ。',
  readMarkdown: `# Error Boundary

## Error Boundary とは

Error Boundary は、子コンポーネントツリーで発生した **JavaScript エラーをキャッチし**、クラッシュの代わりにフォールバック UI を表示するコンポーネントです。

React 関数コンポーネントには Error Boundary 機能はなく、**クラスコンポーネント**で実装します。

\`\`\`jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // エラーが発生したら state を更新してフォールバック UI を表示
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // エラーログの送信などに使用
    console.error('Error caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <h2>問題が発生しました。ページをリロードしてください。</h2>
    }
    return this.props.children
  }
}
\`\`\`

## 使い方

Error Boundary でラップしたい部分を囲むだけです。

\`\`\`jsx
function App() {
  return (
    <ErrorBoundary>
      <UserProfile />
    </ErrorBoundary>
  )
}
\`\`\`

エラーが発生すると \`UserProfile\` の代わりにフォールバック UI が表示されます。

## getDerivedStateFromError と componentDidCatch の役割

| メソッド | タイミング | 用途 |
|---------|-----------|------|
| \`getDerivedStateFromError\` | レンダリング中（同期） | state を更新してフォールバック UI を表示 |
| \`componentDidCatch\` | コミット後（非同期） | エラーログ送信などの副作用 |

## エラー回復ボタン付き Error Boundary

ユーザーが操作でエラーから回復できる UI を提供できます。

\`\`\`jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>エラーが発生しました: {this.state.error?.message}</p>
          <button onClick={this.handleReset}>再試行</button>
        </div>
      )
    }
    return this.props.children
  }
}
\`\`\`

## Error Boundary がキャッチできないエラー

以下のエラーは Error Boundary ではキャッチされません。

- **イベントハンドラ内のエラー**（try/catch を使う）
- **非同期処理のエラー**（async/await の catch で処理）
- **サーバーサイドレンダリングのエラー**
- **Error Boundary 自身のエラー**

## カスタム fallback prop パターン

再利用しやすい Error Boundary を作るには \`fallback\` prop を使います。

\`\`\`jsx
class ErrorBoundary extends React.Component {
  // ...
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Something went wrong.</p>
    }
    return this.props.children
  }
}

// 使う側
<ErrorBoundary fallback={<p>プロフィールの読み込みに失敗しました</p>}>
  <UserProfile />
</ErrorBoundary>
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: 'Error Boundary は関数コンポーネントとクラスコンポーネントのどちらで実装する？',
      answer: 'クラスコンポーネント',
      hint: '関数コンポーネントには対応するライフサイクルメソッドがありません。',
      explanation: 'Error Boundary は getDerivedStateFromError と componentDidCatch という特殊なライフサイクルメソッドを使うため、クラスコンポーネントでのみ実装できます。',
      choices: ['クラスコンポーネント', '関数コンポーネント', 'どちらでも', 'カスタムフック'],
    },
    {
      id: 'q2',
      prompt: 'フォールバック UI を表示するために state を更新するメソッドは？',
      answer: 'getDerivedStateFromError',
      hint: '「エラーから派生した state を取得する」という名前です。',
      explanation: 'getDerivedStateFromError は static メソッドで、エラーを受け取り新しい state オブジェクトを返します。これによりフォールバック UI がレンダリングされます。',
      choices: ['getDerivedStateFromError', 'componentDidCatch', 'componentDidError', 'onError'],
    },
    {
      id: 'q3',
      prompt: 'エラーログをサーバーに送信するのに適したライフサイクルメソッドは？',
      answer: 'componentDidCatch',
      hint: '副作用（ログ送信）はコミット後のメソッドで行います。',
      explanation: 'componentDidCatch はコミット後に呼ばれ、error と info.componentStack を受け取ります。外部ログサービスへの送信などの副作用に使います。',
      choices: ['componentDidCatch', 'getDerivedStateFromError', 'componentDidMount', 'componentDidUpdate'],
    },
    {
      id: 'q4',
      prompt: 'Error Boundary がキャッチ「できない」エラーはどれ？',
      answer: 'イベントハンドラ内のエラー',
      hint: 'イベントハンドラは React のレンダリングフローの外で実行されます。',
      explanation: 'イベントハンドラ内のエラーは React のレンダリングサイクル外で発生するため、Error Boundary ではキャッチできません。try/catch を使って処理する必要があります。',
      choices: ['イベントハンドラ内のエラー', 'useEffect 内のエラー', '子コンポーネントのレンダリングエラー', 'render メソッド内のエラー'],
    },
    {
      id: 'q5',
      prompt: 'Error Boundary を再利用しやすくするためによく使われる prop は？',
      answer: 'fallback',
      hint: '「代替」を意味する英単語です。',
      explanation: 'fallback prop にフォールバック UI を渡すことで、Error Boundary をさまざまな場所で異なるエラー表示に使い回せます。react-error-boundary ライブラリもこのパターンを採用しています。',
      choices: ['fallback', 'errorUI', 'onError', 'backup'],
    },
  ],
  testTask: {
    instruction: 'シンプルな Error Boundary を実装してください。エラーが発生したら「エラーが発生しました」というメッセージを表示します。',
    starterCode: `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: ____ }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <p>エラーが発生しました</p>
    }
    return this.props.children
  }
}`,
    expectedKeywords: ['hasError'],
    explanation: 'constructor で hasError: false の初期 state を設定します。getDerivedStateFromError がエラーを検知すると hasError: true になり、フォールバック UI が表示されます。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'error-boundary-1',
        prompt: 'エラー詳細とリセットボタン付きの Error Boundary を実装してください。',
        requirements: [
          'hasError と error を state で管理する',
          'getDerivedStateFromError でエラーオブジェクトも state に保存する',
          'componentDidCatch でエラーをコンソールに出力する',
          'エラー発生時にエラーメッセージと「再試行」ボタンを表示する',
          '「再試行」ボタンクリックで state をリセットして再レンダリングする',
        ],
        hints: [
          'state に error フィールドを追加します',
          'getDerivedStateFromError の返却値に error も含めます',
          'handleReset メソッドで state を { hasError: false, error: null } にリセットします',
        ],
        expectedKeywords: ['getDerivedStateFromError', 'componentDidCatch', 'hasError', 'handleReset'],
        starterCode: `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    // TODO: hasError と error を初期化
  }

  static getDerivedStateFromError(error) {
    // TODO: hasError と error を更新する state を返す
  }

  componentDidCatch(error, info) {
    // TODO: エラーをコンソール出力
  }

  handleReset = () => {
    // TODO: state をリセット
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          {/* TODO: エラーメッセージと再試行ボタンを表示 */}
        </div>
      )
    }
    return this.props.children
  }
}`,
      },
      {
        id: 'error-boundary-2',
        prompt: 'fallback prop を受け取る汎用 Error Boundary コンポーネントを実装してください。',
        requirements: [
          'fallback prop（ReactNode）を受け取れる ErrorBoundary を作成する',
          'エラー発生時に fallback prop の内容を表示する',
          'fallback が未指定のときはデフォルトの「予期しないエラーが発生しました」を表示する',
          '3箇所で異なる fallback を使って動作を確認するコードを書く',
        ],
        hints: [
          'this.props.fallback でカスタムフォールバック UI を受け取ります',
          'fallback がない場合は ?? 演算子でデフォルト値を設定できます',
        ],
        expectedKeywords: ['getDerivedStateFromError', 'fallback', 'children', 'hasError'],
        starterCode: `class ErrorBoundary extends React.Component {
  // TODO: Error Boundary を実装（fallback prop 対応）
}

// 動作確認
function App() {
  return (
    <div>
      {/* TODO: 3つの異なる fallback で使う */}
      <ErrorBoundary fallback={<p>ヘッダーエラー</p>}>
        <Header />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>コンテンツエラー</p>}>
        <MainContent />
      </ErrorBoundary>
      <ErrorBoundary>
        {/* fallback なし → デフォルトメッセージ */}
        <Footer />
      </ErrorBoundary>
    </div>
  )
}`,
      },
    ],
  },
}

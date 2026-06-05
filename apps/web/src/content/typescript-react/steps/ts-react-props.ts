import type { LearningStepContent } from '@/content/fundamentals/steps'

export const tsReactPropsStep: LearningStepContent = {
  id: 'ts-react-props',
  order: 27,
  title: 'Props型定義',
  summary: 'interfaceを使ったProps型定義・children型・オプショナルProps・ComponentProps活用など、型安全なコンポーネント設計を学ぶ。',
  readMarkdown: `# Props型定義

## interfaceでPropsを定義する

ReactコンポーネントのpropsをTypeScriptで型安全にするには、**interface**または**type**でProps型を定義します。

\`\`\`tsx
interface ButtonProps {
  label: string
  onClick: () => void
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
\`\`\`

## オプショナルProps

\`?\` を付けるとpropsを省略可能にできます。

\`\`\`tsx
interface CardProps {
  title: string
  description?: string  // 省略可能
  variant?: 'primary' | 'secondary'
}

function Card({ title, description, variant = 'primary' }: CardProps) {
  return (
    <div className={variant}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}
\`\`\`

## children型

子要素を受け取る場合は \`React.ReactNode\` を使います。

\`\`\`tsx
import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

function Container({ children, className }: ContainerProps) {
  return <div className={className}>{children}</div>
}
\`\`\`

\`React.FC\` 型を使う書き方もありますが、現在は Props 型を直接関数引数に書くスタイルが推奨されます。

## ComponentProps<typeof X> でProps型を再利用

既存コンポーネントのProps型を再利用したい場合は \`ComponentProps\` が便利です。

\`\`\`tsx
import type { ComponentProps } from 'react'

// ネイティブ要素のProps型を取得
type NativeButtonProps = ComponentProps<'button'>

// カスタムコンポーネントのProps型を取得
type MyButtonProps = ComponentProps<typeof Button>

// 既存Propsを拡張する
interface EnhancedButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
}
\`\`\`

## 関数型Propsのコールバック

イベントハンドラなどのコールバックPropsには関数型を明示します。

\`\`\`tsx
interface SearchProps {
  onSearch: (query: string) => void
  onClear?: () => void
}

function SearchBar({ onSearch, onClear }: SearchProps) {
  return (
    <div>
      <input onChange={(e) => onSearch(e.target.value)} />
      {onClear && <button onClick={onClear}>クリア</button>}
    </div>
  )
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`interface UserProps { name: ____ }` — name プロパティの型は？',
      answer: 'string',
      hint: '名前は文字列です。',
      explanation: 'ユーザー名などの文字列データはstring型で表します。',
      choices: ['string', 'number', 'boolean', 'text'],
    },
    {
      id: 'q2',
      prompt: 'Propsを省略可能にするには、プロパティ名の後に何を付ける？',
      answer: '?',
      hint: 'TypeScriptのオプショナル記号です。',
      explanation: '`description?: string` のように `?` を付けると省略可能なPropsになります。',
      choices: ['?', '!', '|', '&'],
    },
    {
      id: 'q3',
      prompt: '子要素 `children` を受け取るときに使う型は？',
      answer: 'React.ReactNode',
      hint: 'Reactで描画できるものすべてを表す型です。',
      explanation: 'React.ReactNode（または import した ReactNode）は、文字列・数値・JSX・null など React がレンダリングできる値をすべて含む型です。',
      choices: ['React.ReactNode', 'React.Element', 'JSX.Element', 'React.Component'],
    },
    {
      id: 'q4',
      prompt: '`ComponentProps<typeof Button>` は何を取得する？',
      answer: 'ButtonコンポーネントのProps型',
      hint: '既存コンポーネントの型情報を再利用するユーティリティです。',
      explanation: 'ComponentProps<typeof X> は X コンポーネントが受け取る Props の型を取得します。型を再定義せず再利用できます。',
      choices: ['ButtonコンポーネントのProps型', 'buttonタグのイベント型', 'Buttonの戻り値型', 'Buttonのref型'],
    },
    {
      id: 'q5',
      prompt: '`interface CardProps extends ComponentProps<____>` でdivタグの全Propsを継承するには？',
      answer: "'div'",
      hint: 'HTML要素名を文字列で渡します。',
      explanation: "ComponentProps<'div'> のようにHTML要素名を文字列で指定すると、そのネイティブ要素のProps型（className, id, style など）を取得できます。",
      choices: ["'div'", "'Div'", 'div', 'HTMLDivElement'],
    },
  ],
  testTask: {
    instruction: 'Button コンポーネントの Props interface を完成させてください。label は文字列、onClick はクリック時に呼ばれるコールバックです。',
    starterCode: `interface ButtonProps {
  label: ____
  onClick: () => void
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}`,
    expectedKeywords: ['label'],
    explanation: 'label は string 型、onClick は () => void 型として定義します。interface で Props を定義することでコンポーネントの入力仕様が明確になります。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'ts-react-props-1',
        prompt: 'Card コンポーネントの Props 型を設計してください。',
        requirements: [
          'title（必須・文字列）、description（省略可能・文字列）、children（省略可能・ReactNode）を持つ CardProps interface を定義する',
          'CardProps を使った Card コンポーネントを実装する',
          'description がある場合のみ <p> タグで表示する',
        ],
        hints: [
          'オプショナルプロパティには ? を付けます',
          'children の型は React.ReactNode または ReactNode（import後）を使います',
          '条件付きレンダリングは `{prop && <element />}` パターンが便利です',
        ],
        expectedKeywords: ['CardProps', 'title', 'description', 'children', 'ReactNode'],
        starterCode: `import type { ReactNode } from 'react'

// TODO: CardProps interface を定義してください

// TODO: Card コンポーネントを実装してください
function Card({ title, description, children }: CardProps) {
  // TODO: 実装
}

// 動作確認
// <Card title="React学習">本文テキスト</Card>
// <Card title="TypeScript" description="型安全な開発" />`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import type { ReactNode } from 'react'\\n\\n____0\\n\\n____1 {\\n  return (\\n    <div>\\n      <h2>{title}</h2>\\n      {description && <p>{description}</p>}\\n      {children}\\n    </div>\\n  )\\n}`,
            blanks: [
              {
                id: 'card-props',
                label: 'CardProps定義',
                correctTokens: ['interface', 'CardProps', '{', 'title', ':', 'string', ';', 'description?', ':', 'string', ';', 'children?', ':', 'ReactNode', '}'],
                distractorTokens: ['any', 'Element', 'FC', 'HTMLElement'],
              },
              {
                id: 'card-signature',
                label: 'Card関数',
                correctTokens: ['function', 'Card', '(', '{', 'title', ',', 'description', ',', 'children', '}', ':', 'CardProps', ')'],
                distractorTokens: ['Props', 'React.FC', 'const', '=>'],
              },
            ],
          },
      },
      {
        id: 'ts-react-props-2',
        prompt: 'ネイティブ button の全Props を継承した IconButton を実装してください。',
        requirements: [
          'ComponentProps<"button"> を継承した IconButtonProps を定義する',
          'icon（文字列）と label（文字列）プロパティを追加する',
          'ボタンのすべてのネイティブProps（disabled, type など）が使えることを確認する',
        ],
        hints: [
          'interface IconButtonProps extends ComponentProps<"button"> { ... }',
          'スプレッド構文 {...rest} でネイティブPropsを button 要素に渡せます',
        ],
        expectedKeywords: ['IconButtonProps', 'ComponentProps', 'icon', 'label'],
        starterCode: `import type { ComponentProps } from 'react'

// TODO: IconButtonProps を定義してください

// TODO: IconButton コンポーネントを実装してください
function IconButton({ icon, label, ...rest }: IconButtonProps) {
  // TODO: 実装
}

// 動作確認（disabled などネイティブPropsが使える）
// <IconButton icon="★" label="お気に入り" disabled />`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import type { ComponentProps, ReactNode } from 'react'\\n\\n____0\\n\\nfunction IconButton({ icon, label, ...rest }: IconButtonProps) {\\n  ____1\\n}`,
            blanks: [
              {
                id: 'iconbutton-props',
                label: 'Props定義',
                correctTokens: ['interface', 'IconButtonProps', 'extends', "ComponentProps<'button'>", '{', 'icon', ':', 'ReactNode', ';', 'label', ':', 'string', '}'],
                distractorTokens: ['HTMLAttributes', 'ButtonHTMLAttributes', 'FC', 'DetailedHTMLProps'],
              },
              {
                id: 'iconbutton-return',
                label: 'return文',
                correctTokens: ['return', '(', '<button {...rest}>', '<span>{icon}</span>', '{label}', '</button>', ')'],
                distractorTokens: ['<div>', '<a>', 'onClick', 'className'],
              },
            ],
          },
      },
    ],
  },
}

import type { LearningStepContent } from '@/content/fundamentals/steps'

export const portalsStep: LearningStepContent = {
  id: 'portals',
  order: 35,
  title: 'Portals',
  summary: 'createPortalでDOM階層の外にコンポーネントをレンダリングする方法・モーダルやツールチップへの応用・イベントバブリングの挙動を学ぶ。',
  readMarkdown: `# Portals

## Portals とは

**Portals** を使うと、コンポーネントを**親 DOM 階層の外の任意の DOM ノード**にレンダリングできます。モーダル・ドロップダウン・ツールチップなど、\`overflow: hidden\` や \`z-index\` の制約から抜け出す必要がある UI に使います。

## createPortal の基本構文

\`\`\`jsx
import { createPortal } from 'react-dom'

createPortal(children, domNode)
\`\`\`

- \`children\`: レンダリングする React 要素
- \`domNode\`: レンダリング先の DOM ノード（\`document.body\` など）

## モーダルへの応用

\`\`\`jsx
import { createPortal } from 'react-dom'

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>,
    document.body  // <body> 直下にレンダリング
  )
}

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ overflow: 'hidden' }}>  {/* overflow: hidden でも動作する */}
      <button onClick={() => setIsOpen(true)}>モーダルを開く</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>モーダルのコンテンツ</p>
      </Modal>
    </div>
  )
}
\`\`\`

## カスタムコンテナへのポータル

\`document.body\` 以外にも、任意の DOM 要素を指定できます。

\`\`\`jsx
function Tooltip({ text, targetRef }) {
  const container = document.getElementById('tooltip-container')

  return createPortal(
    <div className="tooltip">{text}</div>,
    container
  )
}
\`\`\`

\`\`\`html
<!-- index.html -->
<div id="root"></div>
<div id="tooltip-container"></div>
\`\`\`

## イベントバブリングの挙動

Portal の重要な特性: **イベントは DOM ツリーではなく React ツリーに沿ってバブリング**します。

\`\`\`jsx
function App() {
  function handleClick() {
    console.log('App がクリックされた')  // Portal 内のクリックでも呼ばれる！
  }

  return (
    <div onClick={handleClick}>
      <Modal>
        <button>クリック</button>  {/* DOM上は body の子だが、React上は App の子 */}
      </Modal>
    </div>
  )
}
\`\`\`

モーダル内でのクリックが親の onClick を誤って発火させてしまう場合は \`e.stopPropagation()\` で防げます。

## useRef と組み合わせたポータル

\`\`\`jsx
import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function PortalWrapper({ children }) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    containerRef.current = document.createElement('div')
    document.body.appendChild(containerRef.current)
    setMounted(true)

    return () => {
      document.body.removeChild(containerRef.current)
    }
  }, [])

  if (!mounted) return null
  return createPortal(children, containerRef.current)
}
\`\`\`

クリーンアップで DOM を削除するパターンです。

## Portals を使うべき場面

| 用途 | 理由 |
|------|------|
| モーダル・ダイアログ | overflow:hidden / z-index 制約を回避 |
| ツールチップ | 親要素のスタイルに影響されないレイアウト |
| ドロップダウンメニュー | 親の位置指定 (position:relative) から独立 |
| トースト通知 | 画面端への固定表示 |
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '`createPortal(children, domNode)` の `domNode` に渡すのは？',
      answer: 'レンダリング先の実際の DOM ノード',
      hint: '`document.body` や `document.getElementById(...)` で取得します。',
      explanation: 'domNode には実際の DOM ノード（HTMLElement）を渡します。document.body や document.getElementById で取得した要素が一般的です。',
      choices: ['レンダリング先の実際の DOM ノード', 'React コンポーネント', 'CSSセレクタ文字列', 'ref オブジェクト'],
    },
    {
      id: 'q2',
      prompt: 'Portal を使うと、イベントバブリングはどのツリーに沿って伝播する？',
      answer: 'React ツリー（DOM ツリーではない）',
      hint: 'Portal でも React の親子関係は変わりません。',
      explanation: 'Portal はレンダリング先を変えるだけで、React のコンポーネントツリーの親子関係は維持されます。そのためイベントバブリングは React ツリーに沿って伝播します。',
      choices: ['React ツリー（DOM ツリーではない）', 'DOM ツリー（React ツリーではない）', 'どちらのツリーにも伝播しない', 'React ツリーと DOM ツリーの両方'],
    },
    {
      id: 'q3',
      prompt: 'モーダルを `document.body` 直下にレンダリングする主な理由は？',
      answer: '親要素の overflow:hidden や z-index の影響を避けるため',
      hint: '親のスタイルに依存しない独立したレイヤーが必要です。',
      explanation: '親コンポーネントに overflow:hidden が設定されていると、その子要素として配置したモーダルは切り取られてしまいます。body 直下にレンダリングすることでこの制約を回避できます。',
      choices: ['親要素の overflow:hidden や z-index の影響を避けるため', 'パフォーマンスが向上するため', 'SEO対策のため', 'TypeScript の型チェックが簡単になるため'],
    },
    {
      id: 'q4',
      prompt: 'Portal 内のクリックが意図せず親の onClick を発火させてしまうときの対処法は？',
      answer: 'e.stopPropagation() を呼ぶ',
      hint: 'イベントの伝播を止める標準的な方法です。',
      explanation: 'Portal 内の要素での onClick に e.stopPropagation() を追加することで、イベントが React ツリーを伝播して親の onClick ハンドラを発火させるのを防げます。',
      choices: ['e.stopPropagation() を呼ぶ', 'e.preventDefault() を呼ぶ', 'portal prop に stopBubbling を渡す', 'createPortal の第3引数に false を渡す'],
    },
    {
      id: 'q5',
      prompt: 'Portal を使ってコンポーネントを動的に作成したコンテナにレンダリングする場合、コンポーネントのアンマウント時に行うべきことは？',
      answer: '作成した DOM 要素を document.body から削除する',
      hint: 'useEffect のクリーンアップ関数で後片付けします。',
      explanation: 'useEffect 内で document.createElement → document.body.appendChild し、クリーンアップ関数で document.body.removeChild を呼びます。これでメモリリークを防げます。',
      choices: ['作成した DOM 要素を document.body から削除する', '何もしなくてよい（自動クリーンアップされる）', 'createPortal の戻り値に .destroy() を呼ぶ', 'ReactDOM.unmountComponentAtNode を呼ぶ'],
    },
  ],
  testTask: {
    instruction: 'isOpen が true のとき document.body へモーダルをレンダリングしてください。createPortal を使います。',
    starterCode: `import { ____ } from 'react-dom'

function Modal({ isOpen, onClose }) {
  if (!isOpen) return null

  return ____(
    <div>
      <p>モーダルの中身</p>
      <button onClick={onClose}>閉じる</button>
    </div>,
    document.body
  )
}`,
    expectedKeywords: ['createPortal'],
    explanation: 'react-dom から createPortal をインポートし、createPortal(children, document.body) でモーダルを body 直下にレンダリングします。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'portals-1',
        prompt: 'createPortal を使ってモーダルコンポーネントを実装してください。',
        requirements: [
          'createPortal で document.body へレンダリングする',
          'isOpen が false のときは null を返す',
          'オーバーレイクリックで onClose を呼ぶ（モーダル内クリックは閉じない）',
          'モーダル内に children を表示し、「閉じる」ボタンを設置する',
        ],
        hints: [
          'オーバーレイの onClick に onClose を設定し、モーダルコンテンツの onClick には e.stopPropagation() を付けます',
          'createPortal の第2引数は document.body です',
        ],
        expectedKeywords: ['createPortal', 'document.body', 'stopPropagation'],
        starterCode: `import { createPortal } from 'react-dom'
import { useState } from 'react'

function Modal({ isOpen, onClose, children }) {
  // TODO: isOpen が false なら null を返す

  // TODO: createPortal で document.body へレンダリング
  // - オーバーレイ全体: onClose を設定
  // - モーダルコンテンツ: stopPropagation で閉じないようにする
  // - 「閉じる」ボタン
}

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ overflow: 'hidden', height: '100px' }}>
      <button onClick={() => setIsOpen(true)}>モーダルを開く</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>モーダルタイトル</h2>
        <p>overflow: hidden の親でも正しく表示される</p>
      </Modal>
    </div>
  )
}`,
      },
      {
        id: 'portals-2',
        prompt: 'useEffect と createPortal を組み合わせた動的コンテナを持つポータルを実装してください。',
        requirements: [
          'useEffect でマウント時に div を document.body に追加し、アンマウント時に削除する',
          'mounted フラグが true になってから createPortal でレンダリングする',
          'children を動的コンテナ経由でレンダリングする',
          'クリーンアップで document.body.removeChild を呼ぶ',
        ],
        hints: [
          'containerRef.current に document.createElement("div") を保存します',
          'useEffect の戻り値（クリーンアップ）で document.body.removeChild(containerRef.current) を呼びます',
          'mounted が false のときは null を返します',
        ],
        expectedKeywords: ['createPortal', 'useEffect', 'removeChild', 'mounted'],
        starterCode: `import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function DynamicPortal({ children }) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    // TODO: div を作成して body に追加、mounted を true に
    // TODO: クリーンアップで body から削除

  }, [])

  // TODO: mounted が false なら null を返す
  // TODO: createPortal で containerRef.current にレンダリング
}

function App() {
  return (
    <div>
      <DynamicPortal>
        <p>動的コンテナにレンダリングされた要素</p>
      </DynamicPortal>
    </div>
  )
}`,
      },
    ],
  },
}

import { withLearningGoals } from '../stepLearningGoals'

export type LearningMode = 'read' | 'practice' | 'test' | 'challenge'

export type PracticeQuestionLevel = 'basic' | 'applied'

export interface KeywordCondition {
  id: string
  label: string
  requiredKeywords: string[]
  explanation: string
}

export interface PracticeQuestion {
  id: string
  prompt: string
  answer: string
  answerAliases?: string[]
  level?: PracticeQuestionLevel
  testedConcept?: string
  hint: string
  explanation?: string
  solutionText?: string
  choices?: string[]
}

export interface TestTask {
  instruction: string
  starterCode: string
  expectedKeywords: string[]
  conditions?: KeywordCondition[]
  hint?: string
  explanation?: string
  solutionCode?: string
}

export interface ChallengeMobilePuzzleMultiBlank {
  id: string
  label: string
  correctTokens: string[]
  distractorTokens: string[]
}

export interface ChallengeMobilePuzzle {
  type: 'multi'
  codeContext: string
  blanks: ChallengeMobilePuzzleMultiBlank[]
}

export interface ChallengePattern {
  id: string
  prompt: string
  requirements: string[]
  hints: string[]
  /** 常に含まれている必要があるキーワード */
  expectedKeywords: string[]
  /** 含まれていてはいけないキーワード（アンチパターン抑止。任意） */
  ngKeywords?: string[]
  /** 複数正解パターン（いずれかを満たせば可。任意） */
  anyOf?: string[][]
  /** 部分点での合格閾値（0-100。未指定なら全要件一致。任意） */
  passThreshold?: number
  conditions?: KeywordCondition[]
  starterCode: string
  solutionCode?: string
  mobilePuzzle?: ChallengeMobilePuzzle
}

export interface ChallengeTask {
  primaryPatternId?: string
  patterns: ChallengePattern[]
}

/**
 * Challenge の代表パターンを決定論的に解決する。
 * `primaryPatternId` が指定され一致するパターンがあればそれを返し、
 * 未指定または不一致の場合は先頭パターンへ fallback する（既存互換）。
 * 出題に `Math.random()` を使わないことで、再マウントやページ離脱で問題が変わらない。
 */
export function resolvePrimaryPattern(task: ChallengeTask): ChallengePattern {
  const primary = task.primaryPatternId
    ? task.patterns.find((pattern) => pattern.id === task.primaryPatternId)
    : undefined
  const pattern = primary ?? task.patterns[0]
  if (!pattern) throw new Error('ChallengeTask has no patterns')
  return pattern
}

export interface LearningStepContent {
  id: string
  order: number
  title: string
  summary: string
  learningGoal?: string
  prerequisites?: string[]
  commonMistakes?: string[]
  relatedBaseNook?: string[]
  readMarkdown: string
  practiceQuestions: PracticeQuestion[]
  testTask: TestTask
  challengeTask: ChallengeTask
}

export const fundamentalsSteps: LearningStepContent[] = withLearningGoals([
  {
    id: 'usestate-basic',
    order: 1,
    title: 'useStateの基礎',
    summary: 'コンポーネントに「記憶」を持たせる useState フックの基本を学ぶ。',
    learningGoal: 'useStateで画面の状態を保持し、ユーザー操作に応じて再レンダリングされる流れを説明・実装できるようになる。',
    prerequisites: ['Reactコンポーネントが関数としてUIを返すこと', 'ボタンのクリックなど、ユーザー操作で画面が変わるイメージを持っていること'],
    commonMistakes: [
      '通常の変数を書き換えても画面が更新されると思い込む',
      'stateを直接代入で変更し、setStateを使わない',
      '更新後の値をすぐ同じ処理内で読もうとして、反映タイミングを誤解する',
    ],
    relatedBaseNook: ['component', 'props-vs-state'],
    readMarkdown: `# State: コンポーネントの記憶

UIの一部はユーザーの操作に応じて変化する必要があります。画面上のカウンターやテキスト入力など、時間とともに変化するデータをReactでは **State（状態）** と呼びます。

## なぜ通常の変数ではダメなのか？

以下のように普通のローカル変数 \`count\` を更新しても、Reactの画面は変わりません。

\`\`\`tsx
export function Counter() {
  let count = 0; // 通常の変数

  function handleClick() {
    count = count + 1; // 値は増えるが、画面は更新されない！
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

理由は2つあります：
1. **ローカル変数はレンダリング間で保持されない:** コンポーネントが再描画されると、また \`count = 0\` からやり直されてしまいます。
2. **ローカル変数の変更は再レンダリングをトリガーしない:** Reactは \`count\` が変わったことに気付けないため、画面を再描画しません。

## useState フックの導入

Reactに「値を保持し続ける」ことと、「値が変わったら再描画する」ことを指示するために、\`useState\` フックを使用します。

\`\`\`tsx
import { useState } from 'react';

export function Counter() {
  // countは現在の状態、setCountは更新するための関数
  const [count, setCount] = useState(0); 

  function handleClick() {
    // setCountを呼ぶとReactに再レンダリングが要求される
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

- **\`useState(0)\`**: 初期状態を \`0\` に設定します。
- **\`[count, setCount]\`**: 配列の分割代入です。1つ目が現在の値 (\`state\`)、2つ目が更新用の関数 (\`setter\`) です。

setter関数（\`setCount\`など）を呼び出すことで、Reactはそのコンポーネントの新しい状態を認識し、画面を最新の状態に更新（再レンダリング）します。

## Hookのルール

\`useState\` のような Hook には、呼び出す場所のルールがあります。**Hook は必ずコンポーネントのトップレベルで呼び出します**。\`if\` 文・ループ・ネストした関数の中では呼び出せません。

\`\`\`tsx
function Counter({ enabled }) {
  if (enabled) {
    const [count, setCount] = useState(0); // NG: 条件分岐の中では呼べない
  }
  // ...
}
\`\`\`

これは、Reactが「何番目に呼ばれた Hook か」で各 state を区別しているためです。呼び出し順が毎回変わると state が正しく対応づけられません。常にトップレベルで、同じ順番で呼び出してください。
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '通常のローカル変数（例: let count = 0）を更新したとき、Reactの画面は再描画されますか？',
        answer: 'いいえ',
        hint: '通常の変数の変更はReactに検知されません。',
        explanation: 'Reactは通常の変数の変更を追跡しません。再描画が起きるのはuseStateの更新関数（setter）が呼ばれたときだけです。',
        choices: ['はい', 'いいえ'],
      },
      {
        id: 'q2',
        prompt: 'useState が返す配列の1つ目の要素は何を表しますか？',
        answer: '現在の状態',
        hint: '`const [count, setCount] = useState(0)` でいうと `count` です。',
        explanation: 'const [count, setCount] = useState(0) の分割代入で、最初の count が現在の値（state）を保持します。',
        choices: ['現在の状態', 'イベントハンドラ', '更新関数', 'コンポーネント名'],
      },
      {
        id: 'q3',
        prompt: 'useState が返す配列の2つ目の要素は何を表しますか？',
        answer: '更新関数',
        hint: '状態を更新し、再レンダリングをトリガーするための関数です。（setterとも呼ばれます）',
        explanation: 'setter（setCountなど）を呼び出すとReactに新しい値が渡され、コンポーネントが再レンダリングされます。',
        choices: ['更新関数', '初期値', '現在の状態', 'コンポーネント参照'],
      },
      {
        id: 'q4',
        prompt: '状態を更新する関数（例: setCount）を呼び出すと、Reactはコンポーネントに対して何をトリガーしますか？',
        answer: '再レンダリング',
        hint: '画面を新しい状態で描き直す一連の処理のことです。',
        explanation: 'setterを呼ぶとReactに「状態が変わった」と通知され、コンポーネントが最新の値で再描画（再レンダリング）されます。',
      },
      {
        id: 'q5',
        prompt: 'Reactにおいて、if文の中など、コンポーネントのトップレベル以外でHookを呼び出すことは可能ですか？',
        answer: 'いいえ',
        hint: 'Hookは常にコンポーネントのトップレベルで呼び出すルールがあります。',
        explanation: 'Reactの「Hookのルール」により、useStateなどのHookはif文・ループ・ネスト関数の中では使えません。常にコンポーネントの最上位で呼び出す必要があります。',
        choices: ['はい', 'いいえ'],
      },
    ],
    testTask: {
      instruction: 'ユーザーがボタンを押すと、カウントが 1 "減る" ように空欄を埋めてください。',
      starterCode: `const [count, setCount] = useState(10)
return <button onClick={() => ____}>-1 ({count})</button>`,
      expectedKeywords: ['setCount', 'count - 1'],
      conditions: [
        {
          id: 'call-setter',
          label: '更新関数 setCount を呼び出している',
          requiredKeywords: ['setCount'],
          explanation: '状態を変えるには更新関数 setCount を呼び出す必要があります。',
        },
        {
          id: 'decrement',
          label: '現在値から1引いた値を渡している',
          requiredKeywords: ['count - 1'],
          explanation: 'setCount に count - 1 を渡すと、現在値より1小さい値がセットされます。',
        },
      ],
      explanation: 'setCount に count - 1 を渡します。setCount(count - 1) と書くと、現在値より1小さい値がセットされます。',
      solutionCode: `const [count, setCount] = useState(10)
return <button onClick={() => setCount(count - 1)}>-1 ({count})</button>`,
    },
    challengeTask: {
      primaryPatternId: 'usestate-like',
      patterns: [
        {
          id: 'usestate-like',
          prompt: 'いいねボタンを実装し、クリックで数値が増えるコンポーネントを作ってください。',
          requirements: ['初期値0から開始する', 'クリックで+1される', '現在値を表示する'],
          hints: ['まず state を 1 つ定義する', 'イベントハンドラで setter を呼ぶ'],
          expectedKeywords: ['useState', 'setCount', 'onClick'],
          conditions: [
            {
              id: 'define-state',
              label: 'state を定義している',
              requiredKeywords: ['useState'],
              explanation: 'useState でいいね数の状態（count）と更新関数（setCount）を定義します。',
            },
            {
              id: 'update-on-click',
              label: 'クリックで更新関数を呼んでいる',
              requiredKeywords: ['setCount', 'onClick'],
              explanation: 'button の onClick で setCount を呼び、count を増やします。',
            },
          ],
          solutionCode: `import { useState } from 'react';\n\nexport function LikeButton() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      いいね {count}\n    </button>\n  );\n}`,
          starterCode: `import { useState } from 'react';\n\nexport function LikeButton() {\n  // TODO: useStateを使って、いいね数(count)と更新関数(setCount)を定義してください。\n  // 初期値は 0 にします。\n\n  return (\n    // TODO: buttonのonClickに、クリックされたら count を +1 する処理を書いてください。\n    <button>\n      {/* TODO: ここに現在のいいね数(count)を表示してください */}\n      いいね 0\n    </button>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState } from 'react';\n\nexport function LikeButton() {\n  ____0\n\n  ____1\n}`,
            blanks: [
              {
                id: 'state',
                label: 'state定義',
                correctTokens: ['const', '[', 'count', ',', 'setCount', ']', '=', 'useState', '(', '0', ')'],
                distractorTokens: ['let', 'useEffect', 'useRef', 'getCount'],
              },
              {
                id: 'return',
                label: 'return文',
                correctTokens: ['return', '(', '<button', 'onClick', '=', '{', '(', ')', '=>', 'setCount', '(', 'count', '+', '1', ')', '}', '>', '{', 'count', '}', '</button>', ')'],
                distractorTokens: ['-', '2', 'useEffect'],
              },
            ],
          },
        },
        {
          id: 'usestate-toggle',
          prompt: 'ON/OFFを切り替えるトグルボタンを作ってください。',
          requirements: ['初期値は false', 'クリックで値を反転する', 'ONまたはOFFのテキストを表示する'],
          hints: ['boolean の state を使う', 'setter で 現在値の反転 (!prev) を渡す'],
          expectedKeywords: ['useState', 'setIsOn', 'onClick'],
          starterCode: `import { useState } from 'react';\n\nexport function Toggle() {\n  // TODO: useStateを使って、ON/OFFを表す boolean 値(isOn)と更新関数(setIsOn)を定義してください。\n  // 初期値は false にします。\n\n  return (\n    // TODO: buttonのonClickに、クリックされたら isOn の値を反転反転(!isOn)させる処理を書いてください。\n    <button>\n      {/* TODO: isOn が true なら "ON"、false なら "OFF" を表示するように変更してください */}\n      OFF\n    </button>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState } from 'react';\n\nexport function Toggle() {\n  ____0\n\n  ____1\n}`,
            blanks: [
              {
                id: 'state',
                label: 'state定義',
                correctTokens: ['const', '[', 'isOn', ',', 'setIsOn', ']', '=', 'useState', '(', 'false', ')'],
                distractorTokens: ['let', 'useEffect', 'true', 'getIsOn'],
              },
              {
                id: 'return',
                label: 'return文',
                correctTokens: ['return', '(', '<button', 'onClick', '=', '{', '(', ')', '=>', 'setIsOn', '(', '!', 'isOn', ')', '}', '>', '{', 'isOn', '?', '"ON"', ':', '"OFF"', '}', '</button>', ')'],
                distractorTokens: ['&&', 'null', 'useEffect'],
              },
            ],
          },
        }
      ]
    },
  },
  {
    id: 'events',
    order: 2,
    title: 'イベントへの応答',
    summary: 'onClick や onChange などのイベントハンドラを設定し、ユーザー操作を処理する。',
    learningGoal: 'onClickやonChangeに関数を渡し、ユーザー操作をきっかけにstateや表示を更新できるようになる。',
    prerequisites: ['JSXでボタンやinputを描画できること', 'useStateで値を保持する基本を理解していること'],
    commonMistakes: [
      'イベントハンドラに関数の実行結果を渡して、描画時に処理が走ってしまう',
      'inputのvalueとonChangeをつなげず、入力欄とstateがずれる',
      'イベントオブジェクトから値を取り出す位置を間違える',
    ],
    relatedBaseNook: ['jsx', 'dom', 'props-vs-state'],
    readMarkdown: `# イベントへの応答

Reactでは、クリックしたり、マウスを重ねたり、入力フォームのテキストが変更されたりといった「ユーザーアクション」に対する処理を簡単に追加できます。

## イベントハンドラの追加

イベントハンドラ（イベントが発生したときに実行される関数）は、タグのプロパティとして \`onClick\` や \`onChange\` を渡すことで設定します（**キャメルケース**を使用します）。

\`\`\`tsx
export function Button() {
  function handleClick() {
    alert('ボタンがクリックされました！');
  }

  return (
    // 関数の "呼び出し結果" ではなく、行いたい "関数そのもの" を渡す点に注意
    <button onClick={handleClick}>
      クリックしてね
    </button>
  );
}
\`\`\`

❌ \`<button onClick={handleClick()}>\` : これだとレンダリング時にすぐ関数が実行されてしまいます。
✅ \`<button onClick={handleClick}>\` : 関数自体を渡すことで、クリックされたときにだけ実行されます。

あるいは、インラインでアロー関数を渡すこともよくあります：
\`<button onClick={() => alert('クリック！')}>\`

## フォーム入力を処理する

テキストボックス (\`<input>\`) などに入力された文字を \`useState\` で管理する場合、\`onChange\` イベントと \`event.target.value\` を使用します。

\`\`\`tsx
import { useState } from 'react';

export function NameInput() {
  const [name, setName] = useState('');

  return (
    <>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="名前を入力" 
      />
      <p>こんにちは、{name}さん！</p>
    </>
  );
}
\`\`\`

- \`onChange\` は入力が変わるたびに呼ばれます。
- 引数の event (\`e\`) オブジェクトを通じて、入力された最新の値 (\`e.target.value\`) を取得し、\`setName\` で状態を更新します。

## フォーム送信のデフォルト動作を止める

\`<form>\` はブラウザ標準の動きとして、送信時にページを再読み込みしようとします。React の SPA では画面全体を再読み込みせず、イベントハンドラの中で処理を続けたいので、\`onSubmit\` に渡した関数の中で \`e.preventDefault()\` を呼びます。

\`\`\`tsx
export function SearchForm() {
  function handleSubmit(e) {
    e.preventDefault();
    alert('送信しました');
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">送信</button>
    </form>
  );
}
\`\`\`

- \`onSubmit\` はフォームが送信されたときに呼ばれます。
- \`e.preventDefault()\` は、ページリロードなどのブラウザ標準動作を止めるメソッドです。
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'ボタンクリック時に実行する関数を渡すためのプロパティ名の綴りは？',
        answer: 'onClick',
        hint: 'Reactのイベント名はキャメルケースになります。',
        explanation: 'ReactのイベントはキャメルケースなのでonClickです。HTMLのonclickとは大文字小文字が異なります。',
      },
      {
        id: 'q2',
        prompt: '入力フィールド(input)の値が変更された時に発火するイベントのプロパティ名は何でしょう？',
        answer: 'onChange',
        hint: '値が「変わった(Change)」ときに呼ばれます。',
        explanation: 'Reactでの入力値変化の検知にはonChangeを使います。キーを押すたびに発火し、e.target.valueで現在の入力値を取得できます。',
      },
      {
        id: 'q3',
        prompt: 'onClick={handleClick()} のように関数本体に括弧をつけて渡すと、その関数はいつ実行されてしまいますか？',
        answer: 'レンダリング時',
        hint: 'クリックを待たず、描画されるタイミングで即座に実行されてしまいます。',
        explanation: 'handleClick() と書くと「handleClickを呼び出した結果」がonClickに渡されます。関数そのものを渡すにはhandleClickと括弧なしで書きます。',
        choices: ['レンダリング時', 'クリック時', 'アンマウント時', 'マウント時'],
      },
      {
        id: 'q4',
        prompt: '入力イベント（onChange）で入力された文字列を取得するには、e.____.value にアクセスします。空欄は？',
        answer: 'target',
        hint: 'イベントを発生させた要素（ターゲット）の値を参照します。',
        explanation: 'e.target はイベントを発生させた要素（input要素）を指します。その .value プロパティに現在入力されているテキストが入っています。',
      },
      {
        id: 'q5',
        prompt: 'フォームの送信などで、ブラウザのデフォルトの動作（ページリロードなど）を防ぐために呼ぶメソッドは何ですか？（e.〇〇〇〇）',
        answer: 'preventDefault',
        answerAliases: ['e.preventDefault', 'preventDefault()', 'e.preventDefault()'],
        hint: 'デフォルト(default)の動作を、防ぐ(prevent)関数です。',
        explanation: 'SPAではページリロードなしで動作させるため、onSubmitハンドラ内でe.preventDefault()を呼び出します。',
      },
    ],
    testTask: {
      instruction: 'input要素に文字が入力されたときに実行されるイベントプロパティを空欄に埋めてください。',
      starterCode: `<input value={name} ____={(e) => setName(e.target.value)} />`,
      expectedKeywords: ['onChange'],
      conditions: [
        {
          id: 'use-onchange',
          label: 'input に onChange を指定している',
          requiredKeywords: ['onChange'],
          explanation: 'input の値変化を検知するイベントプロパティは onChange です。',
        },
      ],
      explanation: 'input要素の値変化を検知するにはonChangeを使います。e.target.valueで入力テキストを取得できます。',
      solutionCode: `<input value={name} onChange={(e) => setName(e.target.value)} />`,
    },
    challengeTask: {
      primaryPatternId: 'events-preview',
      patterns: [
        {
          id: 'events-preview',
          prompt: '入力値をリアルタイム表示するフォームを作成してください。',
          requirements: ['入力欄を1つ置く', '入力値を下に表示する', '表示は即時反映される'],
          hints: ['onChange で値を受け取る', 'useStateで保持する'],
          expectedKeywords: ['onChange', 'target.value', 'useState'],
          conditions: [
            {
              id: 'define-state',
              label: '入力値を保持する state を定義している',
              requiredKeywords: ['useState'],
              explanation: 'useState で入力文字列を保持する state を作ります。',
            },
            {
              id: 'handle-change',
              label: 'onChange で入力値を取得している',
              requiredKeywords: ['onChange', 'target.value'],
              explanation: 'input の onChange で e.target.value を受け取り、state を更新します。',
            },
          ],
          solutionCode: `import { useState } from 'react';\n\nexport function LiveInput() {\n  const [text, setText] = useState('');\n\n  return (\n    <div>\n      <input\n        placeholder="入力してください"\n        value={text}\n        onChange={(e) => setText(e.target.value)}\n      />\n      <p>入力内容: {text}</p>\n    </div>\n  );\n}`,
          starterCode: `import { useState } from 'react';\n\nexport function LiveInput() {\n  // TODO: 入力文字列を保持する text というstateを作成してください。\n  \n  return (\n    <div>\n      {/* TODO: inputにonChangeイベントを設定し、入力値(e.target.value)で text を更新してください */}\n      <input placeholder="入力してください" />\n      <p>入力内容: {/* TODO: text変数をここに表示してください */}</p>\n    </div>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState } from 'react';\n\nexport function LiveInput() {\n  ____0\n  return (\n    <div>\n      <input ____1 placeholder="入力してください" />\n      <p>入力内容: ____2</p>\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'state',
                label: 'state定義',
                correctTokens: ['const', '[', 'text', ',', 'setText', ']', '=', 'useState', '(', "''", ')'],
                distractorTokens: ['let', 'useEffect', 'name', 'setName', '0'],
              },
              {
                id: 'onchange',
                label: 'onChange設定',
                correctTokens: ['onChange', '=', '{', '(', 'e', ')', '=>', 'setText', '(', 'e.target.value', ')', '}'],
                distractorTokens: ['onClick', 'onSubmit', 'e.target.name', 'value'],
              },
              {
                id: 'display',
                label: '表示',
                correctTokens: ['{', 'text', '}'],
                distractorTokens: ['{', 'name', '}', 'count'],
              },
            ],
          },
        },
        {
          id: 'events-submit',
          prompt: 'フォーム送信時にページリロードを防ぐ処理を作ってください。',
          requirements: ['onSubmitを使用する', 'event.preventDefault()を呼ぶ'],
          hints: ['formタグのonSubmitイベントを使う', 'onSubmit内で e.preventDefault() を呼ぶ'],
          expectedKeywords: ['onSubmit', 'preventDefault'],
          starterCode: `export function SimpleForm() {\n  // TODO: handleSubmit という関数を作り、引数で event (e) を受け取るようにしてください。\n  // その中で e.preventDefault() を呼び出して送信時のページリロードを防いでください。\n\n  return (\n    // TODO: formタグの onSubmit イベントに、作成した関数を渡してください。\n    <form>\n      <button type="submit">送信</button>\n    </form>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `export function SimpleForm() {\n  ____0\n\n  return (\n    <form ____1>\n      <button type="submit">送信</button>\n    </form>\n  );\n}`,
            blanks: [
              {
                id: 'handler',
                label: 'ハンドラ定義',
                correctTokens: ['function', 'handleSubmit', '(', 'e', ')', '{', 'e.preventDefault', '(', ')', '}'],
                distractorTokens: ['const', 'handleClick', 'e.stopPropagation', 'return'],
              },
              {
                id: 'onsubmit',
                label: 'onSubmit設定',
                correctTokens: ['onSubmit', '=', '{', 'handleSubmit', '}'],
                distractorTokens: ['onClick', 'onChange', 'handleClick'],
              },
            ],
          },
        }
      ]
    },
  },
  {
    id: 'conditional',
    order: 3,
    title: '条件付きレンダリング',
    summary: '条件によって表示するコンポーネントや要素を分岐させる。',
    learningGoal: 'booleanやstateの値に応じて、必要なUIだけを表示・非表示に切り替えられるようになる。',
    prerequisites: ['JSX内でJavaScript式を埋め込めること', 'stateやpropsの値を画面表示に使う基本を理解していること'],
    commonMistakes: [
      'JSXの中でif文をそのまま式として書こうとする',
      '0や空文字が&&の左辺に来たとき、意図しない値が表示される',
      '条件分岐が深くなり、どのUIが表示されるか読み取りづらくなる',
    ],
    relatedBaseNook: ['jsx', 'javascript'],
    readMarkdown: `# 条件付きレンダリング

コンポーネントは、状態や与えられたプロパティ(Props)に応じて、表示する内容を変えたい場面がよくあります。ReactではJavaScriptの強力な構文を使って柔軟に条件付きレンダリングを記述できます。

## 1. if文を使って早期リターンする

ある条件が真のとき、全く違うコンポーネントや何もない(\`null\`)状態を返したい場合は、 \`if\` 文を使います。

\`\`\`tsx
function Item(props) {
  if (props.isHidden) {
    return null; // 何もレンダリングしない
  }
  return <li>{props.name}</li>;
}
\`\`\`

## 2. 三項演算子 (? :)

JSX の内部で表示を切り替えるには、三項演算子を使うとコンパクトに書けます。
\`条件 ? (trueの場合の表示) : (falseの場合の表示)\` となります。

\`\`\`tsx
function UserPanel({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <p>ログイン済みです、ようこそ！</p>
      ) : (
        <button>ログインする</button>
      )}
    </div>
  );
}
\`\`\`

## 3. 論理積 (&&) 演算子

「もし条件が真ならこれを表示し、偽なら何も表示しない」という場合は、 \`&&\` が最も適しています。

\`\`\`tsx
function Notifications({ unreadCount }) {
  return (
    <div>
      <h2>メッセージ</h2>
      {unreadCount > 0 && <p>未読メッセージが {unreadCount} 件あります！</p>}
    </div>
  );
}
\`\`\`
※注意: \`&&\` の左側に置く値は真偽値（boolean）にしてください。\`0 && <p>...</p>\` のような形だと、画面に \`0\` がそのまま表示されてしまう落とし穴があります（JavaScriptで \`0\` がそのまま評価値として残るため）。
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '条件によって「UIのA」か「UIのB」を切り替える場合、JSX内でコンパクトに書ける JavaScript の演算子は何ですか？',
        answer: '三項演算子',
        hint: '`?` と `:` を使う記法です。',
        explanation: '三項演算子は 条件 ? trueのとき : falseのとき の形式です。JSXの中でどちらか一方を表示する切り替えに最もよく使われます。',
        choices: ['三項演算子', 'typeof演算子', '&&演算子', 'スプレッド演算子'],
      },
      {
        id: 'q2',
        prompt: '「条件が真の時だけ描画し、偽なら何も描画しない」という場合に最もよく使われる演算子は何ですか？',
        answer: '&&',
        hint: '論理積（AND）を表す記号です。',
        explanation: '&& の左辺が true なら右辺（JSX要素）が表示され、false なら何も表示されません。「表示するかしないか」の二択に適しています。',
      },
      {
        id: 'q3',
        prompt: 'ある条件のとき画面に何も描画したくない場合、コンポーネントから何を return すればよいですか？',
        answer: 'null',
        hint: '「何もないこと」を表すJSのプリミティブ値です。',
        explanation: 'return null; とするとReactはそのコンポーネントを描画しません。条件によって非表示にしたい場合に使います。',
      },
      {
        id: 'q4',
        prompt: 'ReactでJSXの内部（タグとタグの間など）に JavaScript の変数や式を埋め込むときに使う括弧の記号は何ですか？',
        answer: '{}',
        hint: '波括弧（ブレース）を使用します。',
        explanation: 'JSXの中で {} を使うとJavaScript式を埋め込めます。例: <p>{count}</p> や {isLoggedIn ? "A" : "B"} のように使います。',
      },
      {
        id: 'q5',
        prompt: '`unreadCount > 0 && <p>New Message</p>` というコードにおいて、短絡評価と呼ばれる性質により、左辺が false の場合、右辺はどう評価されますか？',
        answer: '無視される',
        level: 'applied',
        testedConcept: '&& の短絡評価（左辺が false なら右辺は評価されない）',
        hint: '左辺がfalseであれば、全体もfalseになることが確定するため、右辺の評価はスキップされます。',
        explanation: '&& の短絡評価：左辺がfalseなら全体の結果がfalseで確定するため、右辺は評価されず何も表示されません。なお左辺が 0 のような falsy な数値だと、その 0 が画面に表示される落とし穴があるため、左辺は boolean にするのが安全です。',
        choices: ['無視される', '実行される', 'エラーになる', 'nullが返る'],
      },
    ],
    testTask: {
      instruction: 'isLoggedIn が true の時だけ「Welcome」というパラグラフを表示したいです。最適な演算子を埋めてください。',
      starterCode: `{isLoggedIn ____ <p>Welcome</p>}`,
      expectedKeywords: ['&&'],
      conditions: [
        {
          id: 'use-and',
          label: '&& 演算子を使っている',
          requiredKeywords: ['&&'],
          explanation: 'trueのときだけ表示し、falseなら何も表示しない場合は && を使います。',
        },
      ],
      explanation: '「trueのときだけ表示、falseなら何も表示しない」には && を使います。三項演算子では falseのとき に null を返す必要があり冗長になります。',
      solutionCode: `{isLoggedIn && <p>Welcome</p>}`,
    },
    challengeTask: {
      primaryPatternId: 'conditional-login',
      patterns: [
        {
          id: 'conditional-login',
          prompt: 'ログイン状態(isLoggedIn)に応じて、表示内容を切り替えてください。',
          requirements: ['trueなら「ようこそ」を描画', 'falseならログインボタンを描画', '三項演算子を使う'],
          hints: ['isLoggedIn ? A : B を使う'],
          expectedKeywords: ['isLoggedIn', '?', ':'],
          conditions: [
            {
              id: 'use-ternary',
              label: '三項演算子で分岐している',
              requiredKeywords: ['?', ':'],
              explanation: '三項演算子 条件 ? A : B を使って表示内容を切り替えます。',
            },
            {
              id: 'branch-on-login',
              label: 'ログイン状態で切り替えている',
              requiredKeywords: ['isLoggedIn'],
              explanation: 'isLoggedIn の真偽で「ようこそ」とログインボタンを切り替えます。',
            },
          ],
          solutionCode: `import { useState } from 'react';\n\nexport function AuthPanel() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div>\n      {isLoggedIn ? (\n        <p>ようこそ！</p>\n      ) : (\n        <button onClick={() => setIsLoggedIn(true)}>ログイン</button>\n      )}\n    </div>\n  );\n}`,
          starterCode: `import { useState } from 'react';\n\nexport function AuthPanel() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div>\n      {/* TODO: 以下のコメント部分を三項演算子(?と:)に置き換え、\n          isLoggedInが true なら <p>ようこそ！</p> を、\n          false なら <button onClick={() => setIsLoggedIn(true)}>ログイン</button> を表示してください。 \n      */}\n      {/* ここに三項演算子を書く */}\n    </div>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useState } from 'react';\n\nexport function AuthPanel() {\n  const [isLoggedIn, setIsLoggedIn] = useState(false);\n\n  return (\n    <div>\n      ____0\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'ternary',
                label: '条件分岐',
                correctTokens: ['{', 'isLoggedIn', '?', '<p>', 'ようこそ！', '</p>', ':', '<button', 'onClick', '=', '{', '(', ')', '=>', 'setIsLoggedIn', '(', 'true', ')', '}', '>', 'ログイン', '</button>', '}'],
                distractorTokens: ['&&', '||', 'if', 'isActive', 'false'],
              },
            ],
          },
        },
        {
          id: 'conditional-badge',
          prompt: '新着メッセージがある場合のみバッジを表示してください。',
          requirements: ['&&演算子を使う', 'hasNewMessageがtrueの時のみ表示'],
          hints: ['条件 && 要素 の形を使う'],
          expectedKeywords: ['&&', 'hasNewMessage'],
          starterCode: `export function Notification({ hasNewMessage }) {\n  return (\n    <div>\n      メッセージ\n      {/* TODO: hasNewMessage が true のときだけ <span>New!</span> が表示されるように論理積(&&)演算子を使って記述してください */}\n      \n    </div>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `export function Notification({ hasNewMessage }) {\n  return (\n    <div>\n      メッセージ\n      ____0\n    </div>\n  );\n}`,
            blanks: [
              {
                id: 'conditional',
                label: '条件付き表示',
                correctTokens: ['{', 'hasNewMessage', '&&', '<span>', 'New!', '</span>', '}'],
                distractorTokens: ['||', 'isRead', '?', ':', 'if'],
              },
            ],
          },
        }
      ]
    },
  },
  {
    id: 'lists',
    order: 4,
    title: 'リストのレンダリング',
    summary: '配列のデータを map() メソッドで JSX に変換し、リストを描画する。',
    learningGoal: '配列データをmapでJSXに変換し、安定したkeyを付けてリストUIを描画できるようになる。',
    prerequisites: ['JavaScriptの配列とmapの基本', 'JSXで複数の要素を表示する基本'],
    commonMistakes: [
      'mapの戻り値を書き忘れて、何も表示されない',
      'keyに配列indexを安易に使い、並び替えや削除で表示がずれる',
      'リスト内の各要素に一意なidが必要な理由を見落とす',
    ],
    relatedBaseNook: ['javascript', 'jsx'],
    readMarkdown: `# リストのレンダリング

アプリを作っていると、データの配列をもとに「同じ構造のコンポーネント」をいくつも生成したい場面が多々あります（商品一覧、Todoリスト、など）。

Reactでは、JavaScript標準の \`Array.prototype.map()\` メソッドを利用して、データの配列をJSX要素の配列に変換します。

## map() を使った描画

\`\`\`tsx
const people = [
  { id: '1', name: 'Creola Katherine Johnson' },
  { id: '2', name: 'Mario José Molina' },
  { id: '3', name: 'Mohammad Abdus Salam' }
];

export function List() {
  const listItems = people.map(person => (
    <li key={person.id}>
      {person.name}
    </li>
  ));

  return <ul>{listItems}</ul>;
}
\`\`\`

## なぜ key が必要なのか？

上記のコードで、\`<li>\` 要素に \`key\` というプロパティが渡されていることに気付きましたか？

**配列からリストを描画する際には、各要素に必ず一意な \`key\` を渡すルールがあります。** 

\`key\` は、各要素が「どのデータに対応しているか」を React が追跡するための情報です。例えばアイテムが途中に挿入されたり、削除されたり、並び替えられたりしたとき、React は \`key\` を手がかりにして「どの要素のDOMだけを更新（追加・削除・移動）すればよいか」を最小限の計算で特定します。

**keyの選び方**
- **データのIDを使う:** データベースのレコードIDなど、安定した一意の値が最適です。
- **indexを避ける:** 配列のインデックス（\`0\`, \`1\`, \`2\`...）を \`key\` に使用すると、後からアイテムの順序が変わった場合（並び替えや先頭追加など）に React が要素を取り違えてしまい、予期せぬバグの温床になります。

## 絞り込んで描画する（filter().map()）

「条件に合うものだけ表示したい」場合は、\`map()\` の前に \`filter()\` で配列を絞り込みます。\`filter()\` は条件を満たす要素だけの新しい配列を返すので、\`filter().map()\` とつなげると「絞り込み → 変換」が一度に書けます。

\`\`\`tsx
{todos
  .filter(todo => todo.isCompleted)
  .map(todo => <li key={todo.id}>{todo.title}</li>)}
\`\`\`
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '配列のデータを元に、同じ構造のJSX要素を繰り返し生成するのによく使うJavaScriptの配列メソッドは何ですか？',
        answer: 'map',
        hint: '各要素を変換し、新しい配列を返すメソッドです。',
        explanation: 'map()は配列の各要素を変換して新しい配列を返します。各要素をJSX要素に変換することでリスト描画ができます。',
      },
      {
        id: 'q2',
        prompt: 'リスト内の各要素に必ず指定すべき、Reactが差分を効率的に特定するための属性（prop）は何ですか？',
        answer: 'key',
        hint: '鍵、という意味の英単語です。',
        explanation: 'keyはReactが要素の追加・削除・移動を効率的に追跡するために使います。keyがないと警告が出るだけでなく、更新時にバグが起きる可能性があります。',
      },
      {
        id: 'q3',
        prompt: 'リストの要素の順番が変化する可能性がある場合、key に配列のインデックス（index）を使用することは推奨されますか？',
        answer: 'いいえ',
        hint: '順番が変わると、データとインデックスの紐付けがずれてしまい、バグの原因になります。',
        explanation: '並び替えや先頭挿入が起きるとindexは変化します。データのIDなど、値が変わらない一意の識別子をkeyに使ってください。',
        choices: ['はい', 'いいえ'],
      },
      {
        id: 'q4',
        prompt: 'key はアプリケーション全体で重複してはいけませんか、それとも同じリスト（兄弟要素間）で一意であればよいですか？',
        answer: '兄弟要素間',
        hint: 'Reactは親要素の中での並び順だけを気にします。',
        explanation: 'keyは同じリスト（同じ親要素）の中で一意であれば十分です。異なるリスト間で同じkeyを使っても問題ありません。',
        choices: ['兄弟要素間', 'アプリケーション全体', '同一ファイル内', '親子要素間'],
      },
      {
        id: 'q5',
        prompt: 'リストのデータから、特定の条件に合致する要素だけを描画したい場合、map の前によく使われる配列メソッドは何ですか？',
        answer: 'filter',
        hint: '「フィルターをかける」という言葉が由来です。',
        explanation: 'filter()は条件を満たす要素だけの新しい配列を返します。filter().map()のように繋げて「絞り込んで表示」するパターンがよく使われます。',
      },
    ],
    testTask: {
      instruction: 'ユーザーのリスト (users) を描画するため、map() の要素の li タグに最適な属性を書いてください。',
      starterCode: `{users.map(user => <li ____>{user.name}</li>)}`,
      expectedKeywords: ['key={user.id}'],
      conditions: [
        {
          id: 'specify-key',
          label: 'key プロパティを指定している',
          requiredKeywords: ['key='],
          explanation: 'リストの各要素には key を指定する必要があります。',
        },
        {
          id: 'use-id-not-index',
          label: 'index ではなく user.id を使っている',
          requiredKeywords: ['user.id'],
          explanation: 'key には並び替えても変わらない一意の値（user.id）を使います。',
        },
      ],
      explanation: 'key={user.id} のようにデータの一意な値を渡します。keyは文字列または数値で、インデックスは推奨されません。',
      solutionCode: `{users.map(user => <li key={user.id}>{user.name}</li>)}`,
    },
    challengeTask: {
      primaryPatternId: 'lists-todo',
      patterns: [
        {
          id: 'lists-todo',
          prompt: 'Todoの配列を map を使ってリストとして表示してください。',
          requirements: ['mapメソッドを使う', 'keyプロパティを指定する', 'todoのtitleを表示する'],
          hints: ['todos.map(todo => ...) とする', 'key={todo.id} のように一意な値を渡す'],
          expectedKeywords: ['map', 'key=', 'todo.id'],
          // 配列インデックスを key にするアンチパターンを抑止する
          ngKeywords: ['key={index}', 'key={i}'],
          conditions: [
            {
              id: 'use-map',
              label: 'map で配列を描画している',
              requiredKeywords: ['map'],
              explanation: 'todos.map((todo) => ...) で各要素を <li> に変換します。',
            },
            {
              id: 'unique-key',
              label: '一意な key を指定している',
              requiredKeywords: ['key=', 'todo.id'],
              explanation: '各 <li> に key={todo.id} を渡して一意に識別します。',
            },
          ],
          solutionCode: `export function TodoList() {\n  const todos = [\n    { id: 1, title: 'Reactを学ぶ' },\n    { id: 2, title: 'TypeScriptを学ぶ' },\n  ];\n\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li key={todo.id}>{todo.title}</li>\n      ))}\n    </ul>\n  );\n}`,
          starterCode: `export function TodoList() {\n  const todos = [\n    { id: 1, title: 'Reactを学ぶ' },\n    { id: 2, title: 'TypeScriptを学ぶ' },\n  ];\n\n  return (\n    <ul>\n      {/* TODO: todos を map し、それぞれ <li> タグとして描画してください。\n          <li> には必ず key に todo.id を指定し、中身に todo.title を表示してください。 \n      */}\n      \n    </ul>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `export function TodoList() {\n  const todos = [\n    { id: 1, title: 'Reactを学ぶ' },\n    { id: 2, title: 'TypeScriptを学ぶ' },\n  ];\n\n  return (\n    <ul>\n      ____0\n    </ul>\n  );\n}`,
            blanks: [
              {
                id: 'map',
                label: 'リスト描画',
                correctTokens: ['{', 'todos.map', '(', '(', 'todo', ')', '=>', '<li', 'key', '=', '{', 'todo.id', '}', '>', '{', 'todo.title', '}', '</li>', ')', '}'],
                distractorTokens: ['forEach', 'filter', 'index', 'todo.name', 'reduce'],
              },
            ],
          },
        },
        {
          id: 'lists-filter',
          prompt: 'isCompletedがtrueのタスクのみを描画してください。',
          requirements: ['filterとmapを組み合わせて使う', 'keyを指定する'],
          hints: ['todos.filter(t => t.isCompleted).map(...)'],
          expectedKeywords: ['filter', 'map', 'key='],
          starterCode: `export function CompletedTasks() {\n  const todos = [\n    { id: 1, title: '掃除', isCompleted: true },\n    { id: 2, title: '洗濯', isCompleted: false },\n    { id: 3, title: '買い物', isCompleted: true },\n  ];\n\n  return (\n    <ul>\n      {/* TODO: todosから isCompleted が true なものだけを filter で抽出し、\n          その後 map で <li> として描画してください。key の指定も忘れずに！ */}\n      \n    </ul>\n  );\n}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `export function CompletedTasks() {\n  const todos = [\n    { id: 1, title: '掃除', isCompleted: true },\n    { id: 2, title: '洗濯', isCompleted: false },\n    { id: 3, title: '買い物', isCompleted: true },\n  ];\n\n  return (\n    <ul>\n      {todos\n        ____0\n        ____1}\n    </ul>\n  );\n}`,
            blanks: [
              {
                id: 'filter',
                label: 'フィルタリング',
                correctTokens: ['.filter', '(', '(', 't', ')', '=>', 't.isCompleted', ')'],
                distractorTokens: ['find', 'some', 'forEach', 't.isDone', 'includes'],
              },
              {
                id: 'map',
                label: 'リスト描画',
                correctTokens: ['.map', '(', '(', 't', ')', '=>', '<li', 'key', '=', '{', 't.id', '}', '>', '{', 't.title', '}', '</li>', ')'],
                distractorTokens: ['index', 't.name', 'forEach', 'reduce'],
              },
            ],
          },
        }
      ]
    },
  },
])

export function getFundamentalsStep(stepId: string) {
  return fundamentalsSteps.find((step) => step.id === stepId)
}

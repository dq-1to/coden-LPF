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
  expectedKeywords: string[]
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
    title: 'useStateの基礎',
    summary: 'コンポーネントに「記憶」を持たせる useState フックの基本を学ぶ。',
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
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '通常のローカル変数（例: let count = 0）を更新したとき、Reactの画面は再描画されますか？',
        answer: 'いいえ',
        hint: '通常の変数の変更はReactに検知されません。',
      },
      {
        id: 'q2',
        prompt: 'useState が返す配列の1つ目の要素は何を表しますか？',
        answer: '現在の状態',
        hint: '`const [count, setCount] = useState(0)` でいうと `count` です。',
      },
      {
        id: 'q3',
        prompt: 'useState が返す配列の2つ目の要素は何を表しますか？',
        answer: '更新関数',
        hint: '状態を更新し、再レンダリングをトリガーするための関数です。（setterとも呼ばれます）',
      },
      {
        id: 'q4',
        prompt: '状態を更新する関数（例: setCount）を呼び出すと、Reactはコンポーネントに対して何をトリガーしますか？',
        answer: '再レンダリング',
        hint: '画面を新しい状態で描き直す一連の処理のことです。',
      },
      {
        id: 'q5',
        prompt: 'Reactにおいて、if文の中など、コンポーネントのトップレベル以外でHookを呼び出すことは可能ですか？',
        answer: 'いいえ',
        hint: 'Hookは常にコンポーネントのトップレベルで呼び出すルールがあります。',
      },
    ],
    testTask: {
      instruction: 'ユーザーがボタンを押すと、カウントが 1 "減る" ように空欄を埋めてください。',
      starterCode: `const [count, setCount] = useState(10)
return <button onClick={() => ____}>-1 ({count})</button>`,
      expectedKeywords: ['setCount', 'count - 1'],
    },
    challengeTask: {
      prompt: 'いいねボタンを実装し、クリックで数値が増えるコンポーネントを作ってください。',
      requirements: ['初期値0から開始する', 'クリックで+1される', '現在値を表示する'],
      hints: ['まず state を 1 つ定義する', 'イベントハンドラで setter を呼ぶ'],
      expectedKeywords: ['useState', 'setCount', 'onClick'],
    },
  },
  {
    id: 'events',
    order: 2,
    title: 'イベントへの応答',
    summary: 'onClick や onChange などのイベントハンドラを設定し、ユーザー操作を処理する。',
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
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'ボタンクリック時に実行する関数を渡すためのプロパティ名の綴りは？',
        answer: 'onClick',
        hint: 'Reactのイベント名はキャメルケースになります。',
      },
      {
        id: 'q2',
        prompt: '入力フィールド(input)の値が変更された時に発火するイベントのプロパティ名は何でしょう？',
        answer: 'onChange',
        hint: '値が「変わった(Change)」ときに呼ばれます。',
      },
      {
        id: 'q3',
        prompt: 'onClick={handleClick()} のように関数本体に括弧をつけて渡すと、その関数はいつ実行されてしまいますか？',
        answer: 'レンダリング時',
        hint: 'クリックを待たず、描画されるタイミングで即座に実行されてしまいます。',
      },
      {
        id: 'q4',
        prompt: '入力イベント（onChange）で入力された文字列を取得するには、e.____.value にアクセスします。空欄は？',
        answer: 'target',
        hint: 'イベントを発生させた要素（ターゲット）の値を参照します。',
      },
      {
        id: 'q5',
        prompt: 'フォームの送信などで、ブラウザのデフォルトの動作（ページリロードなど）を防ぐために呼ぶメソッドは何ですか？（e.〇〇〇〇）',
        answer: 'preventDefault',
        hint: 'デフォルト(default)の動作を、防ぐ(prevent)関数です。',
      },
    ],
    testTask: {
      instruction: 'input要素に文字が入力されたときに実行されるイベントプロパティを空欄に埋めてください。',
      starterCode: `<input value={name} ____={(e) => setName(e.target.value)} />`,
      expectedKeywords: ['onChange'],
    },
    challengeTask: {
      prompt: '入力値をリアルタイム表示するフォームを作成してください。',
      requirements: ['入力欄を1つ置く', '入力値を下に表示する', '表示は即時反映される'],
      hints: ['onChange で値を受け取る', 'useStateで保持する'],
      expectedKeywords: ['onChange', 'event.target.value', 'useState'],
    },
  },
  {
    id: 'conditional',
    order: 3,
    title: '条件付きレンダリング',
    summary: '条件によって表示するコンポーネントや要素を分岐させる。',
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
※注意: \`&&\` の左側に置く値は真偽値（boolean）にしてください。\`0 && <p>...\</p>\` のような形だと、画面に \`0\` がそのまま表示されてしまう落とし穴があります（JavaScriptで \`0\` がそのまま評価値として残るため）。
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '条件によって「UIのA」か「UIのB」を切り替える場合、JSX内でコンパクトに書ける JavaScript の演算子は何ですか？',
        answer: '三項演算子',
        hint: '`?` と `:` を使う記法です。',
      },
      {
        id: 'q2',
        prompt: '「条件が真の時だけ描画し、偽なら何も描画しない」という場合に最もよく使われる演算子は何ですか？',
        answer: '&&',
        hint: '論理積（AND）を表す記号です。',
      },
      {
        id: 'q3',
        prompt: 'ある条件のとき画面に何も描画したくない場合、コンポーネントから何を return すればよいですか？',
        answer: 'null',
        hint: '「何もないこと」を表すJSのプリミティブ値です。',
      },
      {
        id: 'q4',
        prompt: 'ReactでJSXの内部（タグとタグの間など）に JavaScript の変数や式を埋め込むときに使う括弧の記号は何ですか？',
        answer: '{}',
        hint: '波括弧（ブレース）を使用します。',
      },
      {
        id: 'q5',
        prompt: '`unreadCount > 0 && <p>New Message</p>` というコードにおいて、短絡評価と呼ばれる性質により、左辺が false の場合、右辺はどう評価されますか？（実行される/無視される）',
        answer: '無視される',
        hint: '左辺がfalseであれば、全体もfalseになることが確定するため、右辺の評価はスキップされます。',
      },
    ],
    testTask: {
      instruction: 'isLoggedIn が true の時だけ「Welcome」というパラグラフを表示したいです。最適な演算子を埋めてください。',
      starterCode: `{isLoggedIn ____ <p>Welcome</p>}`,
      expectedKeywords: ['&&'],
    },
    challengeTask: {
      prompt: '切替ボタンで「表示中/非表示」を切り替えるUIを作ってください。',
      requirements: ['表示状態をstateで持つ', 'ボタンで反転する', '文言を条件分岐で表示する'],
      hints: ['booleanのstateを使う', 'setState(prev => !prev) を使う'],
      expectedKeywords: ['useState', '?', ':'],
    },
  },
  {
    id: 'lists',
    order: 4,
    title: 'リストのレンダリング',
    summary: '配列のデータを map() メソッドで JSX に変換し、リストを描画する。',
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
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: '配列のデータを元に、同じ構造のJSX要素を繰り返し生成するのによく使うJavaScriptの配列メソッドは何ですか？',
        answer: 'map',
        hint: '各要素を変換し、新しい配列を返すメソッドです。',
      },
      {
        id: 'q2',
        prompt: 'リスト内の各要素に必ず指定すべき、Reactが差分を効率的に特定するための属性（prop）は何ですか？',
        answer: 'key',
        hint: '鍵、という意味の英単語です。',
      },
      {
        id: 'q3',
        prompt: 'リストの要素の順番が変化する可能性がある場合、key に配列のインデックス（index）を使用することは推奨されますか？（はい/いいえ）',
        answer: 'いいえ',
        hint: '順番が変わると、データとインデックスの紐付けがずれてしまい、バグの原因になります。',
      },
      {
        id: 'q4',
        prompt: 'key はアプリケーション全体で重複してはいけませんか、それとも同じリスト（兄弟要素間）で一意であればよいですか？',
        answer: '兄弟要素間',
        hint: 'Reactは親要素の中での並び順だけを気にします。',
      },
      {
        id: 'q5',
        prompt: 'リストのデータから、特定の条件に合致する要素だけを描画したい場合、map の前によく使われる配列メソッドは何ですか？',
        answer: 'filter',
        hint: '「フィルターをかける」という言葉が由来です。',
      },
    ],
    testTask: {
      instruction: 'ユーザーのリスト (users) を描画するため、map() の要素の li タグに最適な属性を書いてください。',
      starterCode: `{users.map(user => <li ____>{user.name}</li>)}`,
      expectedKeywords: ['key={user.id}'],
    },
    challengeTask: {
      prompt: 'Todo配列を受け取り、未完了件数を表示するリストを実装してください。',
      requirements: ['mapで一覧描画する', 'keyを設定する', '未完了件数を表示する'],
      hints: ['filter で未完了を抽出', 'lengthで件数を算出'],
      expectedKeywords: ['map', 'key=', 'filter'],
    },
  },
]

export function getFundamentalsStep(stepId: string) {
  return fundamentalsSteps.find((step) => step.id === stepId)
}

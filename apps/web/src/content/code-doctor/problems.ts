import type { CodeDoctorProblem } from './types'

export const CODE_DOCTOR_PROBLEMS: CodeDoctorProblem[] = [
  // ─── 初級: JSX構文ミス・Props型ミス ──────────────────────────

  {
    id: 'cd-beginner-001',
    category: 'react',
    difficulty: 'beginner',
    title: 'リストに key がない',
    description: 'todoリストをレンダリングするが、コンソールに "Each child in a list should have a unique key prop" 警告が出ている。修正してください。',
    buggyCode: `function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li>{todo.text}</li>
      ))}
    </ul>
  )
}`,
    hint: 'map で生成する要素には一意な key prop が必要です。',
    requiredKeywords: ['key='],
    ngKeywords: [],
    explanation: 'Reactはリストの要素を効率よく更新するために key prop を使います。key には要素を一意に識別できる値（IDなど）を設定します。index を key に使うのは順序変更がない場合のみ許容されます。',
  },

  {
    id: 'cd-beginner-002',
    category: 'react',
    difficulty: 'beginner',
    title: 'クリックハンドラーが即実行される',
    description: 'ボタンをクリックした時だけ handleClick を呼びたいが、レンダリング時に即実行されてしまう。',
    buggyCode: `function App() {
  function handleClick() {
    alert('クリックされました')
  }

  return <button onClick={handleClick()}>クリック</button>
}`,
    hint: 'onClick には関数の参照を渡す必要があります。呼び出しと参照の違いを確認しましょう。',
    requiredKeywords: ['onClick={handleClick}'],
    ngKeywords: ['onClick={handleClick()}'],
    explanation: 'onClick={handleClick()} と書くと、レンダリング時に handleClick() が実行されその戻り値が onClick に渡されます。関数を後で呼ぶには onClick={handleClick} のように参照を渡します。',
  },

  {
    id: 'cd-beginner-003',
    category: 'react',
    difficulty: 'beginner',
    title: 'class 属性の誤用',
    description: 'スタイルを当てようとしているが、警告が出てスタイルが適用されない。',
    buggyCode: `function Card({ title }) {
  return (
    <div class="card">
      <h2>{title}</h2>
    </div>
  )
}`,
    hint: 'JSX では HTML の class 属性は別名になります。',
    requiredKeywords: ['className='],
    ngKeywords: ['class='],
    explanation: 'JSX では HTML の class 属性を className と書きます。class は JavaScript の予約語のため、React はこの変換を採用しています。',
  },

  {
    id: 'cd-beginner-004',
    category: 'react',
    difficulty: 'beginner',
    title: 'JSX の return で括弧なし',
    description: 'コンポーネントが何も表示されない。return 文の後に改行があるため、暗黙のセミコロン挿入で undefined が返っている。',
    buggyCode: `function Header() {
  return
    <header>
      <h1>Coden</h1>
    </header>
}`,
    hint: 'return の直後に改行がある場合は括弧で囲む必要があります。',
    requiredKeywords: ['return ('],
    ngKeywords: [],
    explanation: 'JavaScript の ASI（自動セミコロン挿入）により、return の直後に改行があると return; として解釈されます。複数行の JSX を返すときは return ( ... ) のように括弧で囲みます。',
  },

  {
    id: 'cd-beginner-005',
    category: 'react',
    difficulty: 'beginner',
    title: 'イベントハンドラーに引数を渡す方法が間違い',
    description: 'itemId を渡して handleDelete を呼びたいが、レンダリング時に即実行されてしまう。',
    buggyCode: `function ItemList({ items }) {
  function handleDelete(id) {
    console.log('削除:', id)
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={handleDelete(item.id)}>削除</button>
        </li>
      ))}
    </ul>
  )
}`,
    hint: '引数付きで関数を渡すにはアロー関数でラップします。',
    requiredKeywords: ['() => handleDelete(item.id)'],
    ngKeywords: ['onClick={handleDelete(item.id)}'],
    explanation: 'イベントハンドラーで引数を渡したい場合は onClick={() => handleDelete(item.id)} のようにアロー関数でラップします。こうするとクリック時にのみ実行されます。',
  },

  {
    id: 'cd-beginner-006',
    category: 'react',
    difficulty: 'beginner',
    title: 'Fragment の欠落',
    description: 'コンポーネントが複数の要素を返そうとして JSX のルール違反エラーになっている。',
    buggyCode: `function UserInfo({ name, email }) {
  return (
    <h2>{name}</h2>
    <p>{email}</p>
  )
}`,
    hint: 'JSX は単一のルート要素を返す必要があります。余分なDOMを増やさない方法があります。',
    requiredKeywords: ['<>'],
    ngKeywords: [],
    explanation: 'JSX では常に単一のルート要素を返す必要があります。<div> で囲む方法もありますが、不要なDOM要素を避けるために React.Fragment（<>...</>）を使うのが推奨です。',
  },

  {
    id: 'cd-beginner-007',
    category: 'react',
    difficulty: 'beginner',
    title: 'JSX 内で if 文を直接使用',
    description: 'ログイン済みの場合だけメッセージを表示したいが、構文エラーになっている。',
    buggyCode: `function Greeting({ isLoggedIn }) {
  return (
    <div>
      if (isLoggedIn) {
        <p>ようこそ！</p>
      }
    </div>
  )
}`,
    hint: 'JSX の中では if 文は使えません。三項演算子か && 演算子を使いましょう。',
    requiredKeywords: ['&&'],
    ngKeywords: ['if ('],
    explanation: 'JSX の {} 内では式のみ使えます。if 文は使えません。条件レンダリングには {isLoggedIn && <p>ようこそ！</p>} のような && 演算子か三項演算子を使います。',
  },

  {
    id: 'cd-beginner-008',
    category: 'react',
    difficulty: 'beginner',
    title: 'Props の型違い（数値を文字列で渡している）',
    description: 'コンポーネントが計算を行うが、result が NaN になる。age は数値型を期待しているのに文字列で渡している。',
    buggyCode: `function AgeCalc({ age }) {
  const birthYear = 2025 - age
  return <p>生まれ年: {birthYear}</p>
}

function App() {
  return <AgeCalc age="25" />
}`,
    hint: 'JSX で数値を Props として渡すには {} が必要です。',
    requiredKeywords: ['age={25}'],
    ngKeywords: ['age="25"'],
    explanation: 'JSX で "25" と書くと文字列になります。数値を渡すには age={25} のように {} を使います。文字列 + 数値の計算は文字列連結になり、NaN ではなく "252025" のような結果になります。',
  },

  {
    id: 'cd-beginner-009',
    category: 'react',
    difficulty: 'beginner',
    title: '自己閉じタグの構文ミス',
    description: 'Input コンポーネントを使おうとしているが構文エラーになっている。',
    buggyCode: `function Form() {
  return (
    <form>
      <input type="text" placeholder="名前">
      <button type="submit">送信</button>
    </form>
  )
}`,
    hint: 'JSX では子要素を持たない要素は自己閉じ形式にする必要があります。',
    requiredKeywords: ['<input', '/>'],
    ngKeywords: ['<input type="text" placeholder="名前">'],
    explanation: 'JSX では HTML と異なり、すべての要素は閉じる必要があります。<input> のように子要素を持たないタグは <input /> のように自己閉じ形式で書きます。',
  },

  {
    id: 'cd-beginner-010',
    category: 'react',
    difficulty: 'beginner',
    title: 'useState の初期値が undefined',
    description: 'カウンターを表示しているが、初回レンダリングで count が undefined になりエラーが出る。',
    buggyCode: `import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState()

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}`,
    hint: 'useState の引数で初期値を指定できます。',
    requiredKeywords: ['useState(0)'],
    ngKeywords: ['useState()'],
    explanation: 'useState() の引数を省略すると初期値が undefined になります。+1 すると NaN になります。useState(0) のように初期値を明示しましょう。',
  },

  // ─── 中級: useEffect依存配列・状態更新 ──────────────────────

  {
    id: 'cd-intermediate-001',
    category: 'react',
    difficulty: 'intermediate',
    title: 'useEffect の依存配列が空で stale closure',
    description: 'count が変化しても useEffect 内のログが常に 0 を表示する。',
    buggyCode: `import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('現在のカウント:', count)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}`,
    hint: 'useEffect のコールバック内で参照している変数は依存配列に含める必要があります。',
    requiredKeywords: ['[count]'],
    ngKeywords: [', []'],
    explanation: '空の依存配列 [] を指定すると、useEffect はマウント時の count の値（0）をクロージャとしてキャプチャします。count が変化しても古い値を参照し続けます。依存配列に count を追加すると、count が変わるたびにエフェクトが再実行されます。',
  },

  {
    id: 'cd-intermediate-002',
    category: 'react',
    difficulty: 'intermediate',
    title: '状態の直接変更（イミュータブル違反）',
    description: 'リストにアイテムを追加しようとしているが、画面が更新されない。',
    buggyCode: `import { useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState(['タスク1', 'タスク2'])

  function addTodo() {
    todos.push('新しいタスク')
    setTodos(todos)
  }

  return (
    <div>
      <ul>{todos.map((t, i) => <li key={i}>{t}</li>)}</ul>
      <button onClick={addTodo}>追加</button>
    </div>
  )
}`,
    hint: 'React の状態は直接変更してはいけません。新しい配列を作成して渡しましょう。',
    requiredKeywords: ['setTodos([...todos,'],
    ngKeywords: ['todos.push('],
    explanation: 'todos.push() は既存の配列を直接変更します（ミュータブル操作）。React は参照が変わったかどうかで再レンダリングを判断するため、同じ参照では変化を検知できません。setTodos([...todos, "新しいタスク"]) のように新しい配列を作成して渡す必要があります。',
  },

  {
    id: 'cd-intermediate-003',
    category: 'react',
    difficulty: 'intermediate',
    title: 'useEffect に async を直接渡している',
    description: 'データを取得しようとしているが、警告が出ている。useEffect のコールバックに async を直接渡している。',
    buggyCode: `import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(async () => {
    const res = await fetch(\`/api/users/\${userId}\`)
    const data = await res.json()
    setUser(data)
  }, [userId])

  return <div>{user?.name}</div>
}`,
    hint: 'useEffect のコールバックは async にできません。内部で async 関数を定義して呼び出します。',
    requiredKeywords: ['async function', 'void '],
    ngKeywords: ['useEffect(async'],
    explanation: 'useEffect のコールバックは副作用のクリーンアップ関数か undefined を返す必要があります。async 関数は Promise を返すため直接渡せません。内部で async 関数を定義し呼び出す形にします。',
  },

  {
    id: 'cd-intermediate-004',
    category: 'react',
    difficulty: 'intermediate',
    title: 'イベントリスナーのクリーンアップ漏れ',
    description: 'ウィンドウのリサイズを監視しているが、コンポーネントがアンマウントされてもリスナーが残り続けメモリリークが発生する。',
    buggyCode: `import { useState, useEffect } from 'react'

function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
  }, [])

  return <p>幅: {width}px</p>
}`,
    hint: 'useEffect でイベントリスナーを追加したらクリーンアップ関数で削除する必要があります。',
    requiredKeywords: ['return () =>', 'removeEventListener'],
    ngKeywords: [],
    explanation: 'useEffect でイベントリスナーを追加したら、return でクリーンアップ関数を返してリスナーを削除します。これを怠るとコンポーネントのアンマウント後もリスナーが残り続け、メモリリークや stale なコールバックが動作する問題が起きます。',
  },

  {
    id: 'cd-intermediate-005',
    category: 'react',
    difficulty: 'intermediate',
    title: '古い state を使った更新（関数型更新が必要）',
    description: '1秒ごとに count を +1 するタイマーを実装したが、count がうまく増えない（常に 1 になる）。',
    buggyCode: `import { useState, useEffect } from 'react'

function AutoCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <p>{count}</p>
}`,
    hint: 'setCount に前の値を参照するコールバック形式を使いましょう。',
    requiredKeywords: ['setCount((prev) =>'],
    ngKeywords: ['setCount(count +'],
    explanation: '空の依存配列 [] のため useEffect はマウント時の count（0）をキャプチャします。setCount(count + 1) は常に 0 + 1 = 1 になります。setCount(prev => prev + 1) のように関数型更新を使うと、常に最新の値を参照して更新できます。',
  },

  {
    id: 'cd-intermediate-006',
    category: 'react',
    difficulty: 'intermediate',
    title: 'useEffect の依存配列にオブジェクトを入れて無限ループ',
    description: 'データ取得の useEffect が無限ループしている。',
    buggyCode: `import { useState, useEffect } from 'react'

function Search({ filters }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(\`/api/search?q=\${filters.query}\`)
      .then((r) => r.json())
      .then((data) => setResults(data))
  }, [filters])

  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>
}

function App() {
  return <Search filters={{ query: 'React' }} />
}`,
    hint: '毎レンダリングで新しいオブジェクトが生成されています。プリミティブ値を依存配列に入れましょう。',
    requiredKeywords: ['filters.query'],
    ngKeywords: ['], [filters]'],
    buggyLineNumbers: [10, 16],
    explanation: 'App が毎レンダリングで { query: "React" } という新しいオブジェクトを生成するため、依存配列の filters は毎回「変化した」と判断され無限ループになります。依存配列には filters.query のようなプリミティブ値を入れます。',
  },

  {
    id: 'cd-intermediate-007',
    category: 'react',
    difficulty: 'intermediate',
    title: 'オブジェクト状態の部分更新でプロパティが消える',
    description: 'フォームの name を更新したら email が消えてしまった。',
    buggyCode: `import { useState } from 'react'

function ProfileForm() {
  const [form, setForm] = useState({ name: '', email: '' })

  return (
    <div>
      <input
        value={form.name}
        onChange={(e) => setForm({ name: e.target.value })}
      />
      <input
        value={form.email}
        onChange={(e) => setForm({ email: e.target.value })}
      />
    </div>
  )
}`,
    hint: '状態オブジェクトを更新する際は既存のプロパティを保持する必要があります。',
    requiredKeywords: ['...form,'],
    ngKeywords: ['setForm({ name:', 'setForm({ email:'],
    explanation: 'setForm({ name: value }) と書くと form の既存プロパティ（email など）が失われます。オブジェクト状態を部分更新するには setForm({ ...form, name: value }) のようにスプレッド演算子で既存プロパティを展開します。',
  },

  {
    id: 'cd-intermediate-008',
    category: 'react',
    difficulty: 'intermediate',
    title: 'useEffect の依存配列に関数を含めて無限ループ',
    description: 'データを取得する useEffect が無限ループしている。',
    buggyCode: `import { useState, useEffect } from 'react'

function DataLoader({ userId }) {
  const [data, setData] = useState(null)

  function fetchData() {
    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then((d) => setData(d))
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return <div>{data?.name}</div>
}`,
    hint: '毎レンダリングで関数が再生成されています。useCallback か依存配列を見直しましょう。',
    requiredKeywords: ['useCallback'],
    ngKeywords: [],
    explanation: 'fetchData はレンダリングのたびに新しい関数として生成されます。依存配列に fetchData を入れると、毎レンダリングで「変化した」と判断され無限ループになります。useCallback で fetchData をメモ化するか、useEffect 内に直接処理を書きます。',
  },

  {
    id: 'cd-intermediate-009',
    category: 'react',
    difficulty: 'intermediate',
    title: 'アンマウント後に setState を呼んでいる',
    description: 'コンポーネントがアンマウントされた後でも setState が呼ばれ、警告が出ている。',
    buggyCode: `import { useState, useEffect } from 'react'

function Timer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const id = setTimeout(() => {
      setRemaining(0)
    }, seconds * 1000)
  }, [seconds])

  return <p>残り: {remaining}秒</p>
}`,
    hint: 'useEffect のクリーンアップ関数でタイマーをキャンセルしましょう。',
    requiredKeywords: ['return () =>', 'clearTimeout'],
    ngKeywords: [],
    explanation: 'コンポーネントがアンマウントされた後でもタイムアウトコールバックが実行されると setState が呼ばれ、メモリリークの警告が出ます。クリーンアップ関数で clearTimeout(id) を呼び、タイマーをキャンセルします。',
  },

  {
    id: 'cd-intermediate-010',
    category: 'react',
    difficulty: 'intermediate',
    title: '条件付きで Hook を呼んでいる',
    description: 'ログイン済みの場合だけデータを取得しようとしているが、Hooks のルール違反でエラーになっている。',
    buggyCode: `import { useState, useEffect } from 'react'

function Dashboard({ isLoggedIn }) {
  if (!isLoggedIn) {
    return <p>ログインしてください</p>
  }

  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setData)
  }, [])

  return <div>{data?.summary}</div>
}`,
    hint: 'Hooks はコンポーネントのトップレベルでのみ呼び出せます。早期 return の前に移動しましょう。',
    requiredKeywords: ['useState(null)', 'useEffect('],
    ngKeywords: [],
    explanation: 'Hooks のルール（Rules of Hooks）により、条件文や早期 return の後に Hook を呼ぶことはできません。useState と useEffect をコンポーネントのトップレベル（早期 return より前）に移動します。',
  },

  // ─── 上級: メモ化漏れ・レースコンディション ──────────────────

  {
    id: 'cd-advanced-001',
    category: 'react',
    difficulty: 'advanced',
    title: 'useMemo の依存配列漏れ',
    description: 'items が変化しても filteredItems が更新されない。',
    buggyCode: `import { useState, useMemo } from 'react'

function FilteredList({ items }) {
  const [filter, setFilter] = useState('')

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.includes(filter))
  }, [filter])

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>{filteredItems.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  )
}`,
    hint: 'useMemo のコールバック内で参照しているすべての値を依存配列に含める必要があります。',
    requiredKeywords: ['[filter, items]'],
    ngKeywords: ['[filter]'],
    explanation: 'useMemo の依存配列に items が含まれていないため、items が変化しても再計算されません。コールバック内で参照しているすべての変数（items と filter）を依存配列に含めます。',
  },

  {
    id: 'cd-advanced-002',
    category: 'react',
    difficulty: 'advanced',
    title: 'useCallback の stale closure',
    description: 'handleSubmit を useCallback でメモ化したが、name が更新されても古い値でサブミットされる。',
    buggyCode: `import { useState, useCallback } from 'react'

function Form() {
  const [name, setName] = useState('')

  const handleSubmit = useCallback(() => {
    console.log('送信:', name)
  }, [])

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSubmit}>送信</button>
    </div>
  )
}`,
    hint: 'useCallback のコールバック内で参照している変数は依存配列に含める必要があります。',
    requiredKeywords: ['[name]'],
    ngKeywords: ['useCallback(() => {', '], [])'],
    buggyLineNumbers: [6, 8],
    explanation: '空の依存配列 [] のため handleSubmit は初回レンダリング時の name（空文字）をキャプチャします。name が変化しても handleSubmit は再生成されないため、常に古い値で動作します。依存配列に name を追加します。',
  },

  {
    id: 'cd-advanced-003',
    category: 'react',
    difficulty: 'advanced',
    title: 'React.memo が効かない（オブジェクトが毎回新規生成）',
    description: 'React.memo で最適化したはずの Child コンポーネントが毎回再レンダリングされる。',
    buggyCode: `import { memo } from 'react'

const Child = memo(function Child({ style }) {
  console.log('Child レンダリング')
  return <div style={style}>子要素</div>
})

function Parent() {
  return <Child style={{ color: 'red' }} />
}`,
    hint: 'Props のオブジェクトが毎レンダリングで新規生成されています。useMemo で固定しましょう。',
    requiredKeywords: ['useMemo'],
    ngKeywords: ['style={{ color:'],
    explanation: 'React.memo は Props の浅い比較を行います。style={{ color: "red" }} はレンダリングのたびに新しいオブジェクトを生成するため、参照が変わり React.memo の最適化が無効になります。useMemo で style をメモ化するか、定数として外に出します。',
  },

  {
    id: 'cd-advanced-004',
    category: 'react',
    difficulty: 'advanced',
    title: 'フェッチのレースコンディション',
    description: 'userId が素早く切り替わると古いリクエストの結果が後から届き、誤ったユーザーデータが表示される。',
    buggyCode: `import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((r) => r.json())
      .then((data) => setUser(data))
  }, [userId])

  return <div>{user?.name}</div>
}`,
    hint: 'クリーンアップ関数でフラグを立て、古いリクエストの結果を無視しましょう。',
    requiredKeywords: ['let cancelled', 'if (!cancelled)', 'return () =>'],
    ngKeywords: [],
    explanation: 'userId が変わると新しいリクエストが始まりますが、古いリクエストがキャンセルされないため後から届いた結果が表示されます。let cancelled = false フラグを使い、クリーンアップで cancelled = true にして古い結果の setState を無視します。AbortController を使う方法も有効です。',
  },

  {
    id: 'cd-advanced-005',
    category: 'react',
    difficulty: 'advanced',
    title: 'useReducer の state ミューテーション',
    description: 'reducer 内で state を直接変更しているため、React が変化を検知できず再レンダリングされない。',
    buggyCode: `import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      state.items.push(action.payload)
      return state
    case 'CLEAR':
      state.items = []
      return state
    default:
      return state
  }
}

function List() {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  return (
    <div>
      <button onClick={() => dispatch({ type: 'ADD', payload: 'item' })}>追加</button>
      <ul>{state.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  )
}`,
    hint: 'reducer は純粋関数でなければなりません。新しいオブジェクトを返しましょう。',
    requiredKeywords: ['return { ...state,', 'items: ['],
    ngKeywords: ['state.items.push', 'state.items ='],
    explanation: 'reducer は純粋関数でなければならず、引数の state を変更してはいけません。state.items.push() は既存の配列を直接変更するため React が変化を検知できません。return { ...state, items: [...state.items, action.payload] } のように新しいオブジェクトを返します。',
  },

  {
    id: 'cd-advanced-006',
    category: 'react',
    difficulty: 'advanced',
    title: 'Context で不必要な全体再レンダリング',
    description: 'CountContext を使うすべてのコンポーネントが count が変わるたびに再レンダリングされる。theme しか使わないコンポーネントも再レンダリングされている。',
    buggyCode: `import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

function App() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState('light')

  return (
    <AppContext.Provider value={{ count, setCount, theme, setTheme }}>
      <Counter />
      <ThemeToggle />
    </AppContext.Provider>
  )
}

function Counter() {
  const { count, setCount } = useContext(AppContext)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(AppContext)
  console.log('ThemeToggle re-render')
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>
}`,
    hint: 'Context を分割して、変化する値ごとに独立した Provider を使いましょう。',
    requiredKeywords: ['CountContext', 'ThemeContext'],
    ngKeywords: [],
    explanation: '単一の Context に count と theme を入れると、count が変化するだけで theme しか使わない ThemeToggle も再レンダリングされます。CountContext と ThemeContext に分割することで、それぞれの変化時に関係するコンポーネントだけが再レンダリングされます。',
  },

  {
    id: 'cd-advanced-007',
    category: 'react',
    difficulty: 'advanced',
    title: 'key prop でコンポーネントが意図せず再マウントされる',
    description: 'Form コンポーネントが毎レンダリングで再マウントされ、入力内容がリセットされる。',
    buggyCode: `import { useState } from 'react'

function Form() {
  const [value, setValue] = useState('')
  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>カウント: {count}</button>
      <Form key={Math.random()} />
    </div>
  )
}`,
    hint: 'key に毎回変わる値を使うとコンポーネントが再マウントされます。',
    requiredKeywords: ['<Form />'],
    ngKeywords: ['key={Math.random()}'],
    explanation: 'key={Math.random()} は毎レンダリングで異なる値になるため、React は毎回 Form をアンマウントして再マウントします。これにより内部状態がリセットされます。意図しない再マウントを防ぐには key を安定した値にするか、key を取り除きます。',
  },

  {
    id: 'cd-advanced-008',
    category: 'react',
    difficulty: 'advanced',
    title: 'AbortController なしの fetch でメモリリーク',
    description: 'コンポーネントが素早くアンマウントされると fetch の完了後に setState が呼ばれ警告が出る。',
    buggyCode: `import { useState, useEffect } from 'react'

function ArticleDetail({ articleId }) {
  const [article, setArticle] = useState(null)

  useEffect(() => {
    fetch(\`/api/articles/\${articleId}\`)
      .then((r) => r.json())
      .then((data) => setArticle(data))
  }, [articleId])

  return <div>{article?.title}</div>
}`,
    hint: 'AbortController を使ってアンマウント時にリクエストをキャンセルしましょう。',
    requiredKeywords: ['AbortController', 'abort()', 'signal'],
    ngKeywords: [],
    explanation: 'コンポーネントのアンマウント後に fetch が完了すると setState が呼ばれます。AbortController を使い、クリーンアップで controller.abort() を呼ぶことでリクエストをキャンセルできます。fetch の第2引数に { signal: controller.signal } を渡します。',
  },

  {
    id: 'cd-advanced-009',
    category: 'react',
    difficulty: 'advanced',
    title: 'forwardRef の実装ミス',
    description: 'Input コンポーネントの ref が親から参照できない。',
    buggyCode: `import { useRef } from 'react'

function Input({ placeholder }) {
  return <input placeholder={placeholder} />
}

function Form() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current?.focus()
  }

  return (
    <div>
      <Input ref={inputRef} placeholder="名前" />
      <button onClick={focusInput}>フォーカス</button>
    </div>
  )
}`,
    hint: 'カスタムコンポーネントで ref を受け取るには forwardRef でラップする必要があります。',
    requiredKeywords: ['forwardRef', 'ref={ref}'],
    ngKeywords: [],
    explanation: '通常のコンポーネントは ref を props として受け取れません。forwardRef でラップし、第2引数の ref を内部の DOM 要素に渡す必要があります: const Input = forwardRef((props, ref) => <input ref={ref} {...props} />)',
  },

  {
    id: 'cd-advanced-010',
    category: 'react',
    difficulty: 'advanced',
    title: 'useRef の値変更で再レンダリングが起きない',
    description: 'クリック回数をカウントして表示したいが、表示が更新されない。',
    buggyCode: `import { useRef } from 'react'

function ClickCounter() {
  const countRef = useRef(0)

  function handleClick() {
    countRef.current += 1
    console.log('クリック数:', countRef.current)
  }

  return (
    <div>
      <p>クリック数: {countRef.current}</p>
      <button onClick={handleClick}>クリック</button>
    </div>
  )
}`,
    hint: 'useRef の変更は再レンダリングをトリガーしません。表示に使う値は useState を使いましょう。',
    requiredKeywords: ['useState'],
    ngKeywords: ['useRef(0)'],
    explanation: 'useRef は再レンダリングをトリガーしません。レンダリングに反映させたい値は useState を使います。useRef はタイマーIDやDOM要素の参照など、レンダリングに直接影響しない値の保持に適しています。',
  },
]

import type { LearningStepContent } from '../fundamentals/steps'

export const advancedSteps: LearningStepContent[] = [
  {
    id: 'custom-hooks',
    order: 9,
    title: 'カスタムHooks',
    summary: '再利用可能なロジックをカスタムHookとして切り出し、コンポーネントをシンプルに保つ方法を学ぶ。',
    readMarkdown: `# カスタムHooks：ロジックの再利用

## カスタムHookとは？

Reactでは、コンポーネントが複雑になるにつれてロジックが肥大化しやすくなります。カスタムHookは、**コンポーネントから「ロジック」だけを関数として切り出す**仕組みです。

\`\`\`tsx
// ❌ Before: ロジックとUIが混在したコンポーネント
export function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(0);
  return <div>{count} <button onClick={increment}>+</button></div>;
}

// ✅ After: ロジックをカスタムHookに分離
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

export function Counter() {
  const { count, increment } = useCounter(0);
  return <div>{count} <button onClick={increment}>+</button></div>;
}
\`\`\`

## 必須ルール：命名は \`use\` で始める

カスタムHookは必ず **\`use\` で始まる名前**にします。この規則は単なる慣習ではなく、Reactのリントツールがフック違反（例：条件分岐の中でHookを呼び出す）を検出するために利用しています。

\`\`\`ts
// ✅ 正しい命名
function useCounter() { ... }
function useInput(initialValue: string) { ... }
function useLocalStorage<T>(key: string) { ... }

// ❌ 間違い（useで始まっていない）
function getCounter() { ... }
function inputHelper() { ... }
\`\`\`

## カスタムHookが「共有」するのはロジックであり、Stateではない

重要な点として、カスタムHookをコンポーネントで使うと、**それぞれ独立したStateが生成**されます。Stateそのものが共有されるわけではありません。

\`\`\`tsx
function useCounter() {
  const [count, setCount] = useState(0); // 各コンポーネントで独立したcount
  return { count, increment: () => setCount(c => c + 1) };
}

export function App() {
  const counterA = useCounter(); // counterA.count は独立した State
  const counterB = useCounter(); // counterB.count も独立した State
  // counterA と counterB は別物
}
\`\`\`

## 実践例：useInput（フォーム入力管理）

\`\`\`tsx
function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const reset = () => setValue(initialValue);
  return { value, onChange, reset };
}

export function SearchForm() {
  const nameInput = useInput('');
  const emailInput = useInput('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(nameInput.value, emailInput.value);
    nameInput.reset();
    emailInput.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={nameInput.value} onChange={nameInput.onChange} placeholder="名前" />
      <input value={emailInput.value} onChange={emailInput.onChange} placeholder="メール" />
      <button type="submit">送信</button>
    </form>
  );
}
\`\`\`

## カスタムHookの利点まとめ

| 利点 | 説明 |
|------|------|
| **再利用性** | 同じロジックを複数のコンポーネントで使える |
| **コンポーネントの簡素化** | UIだけに集中できる |
| **テストの容易さ** | ロジック単独でテストできる |
| **関心の分離** | 何をするか（ロジック）と何を表示するか（UI）を分ける |

## Hooksのルール（再確認）

カスタムHookの中でも **Hooksのルール** は守る必要があります：

1. **ループ・条件分岐・ネストした関数の中でHookを呼ばない**
2. **Reactの関数コンポーネントかカスタムHookの中でのみ呼び出す**

\`\`\`tsx
// ❌ NG: 条件分岐の中でHookを呼ぶ
function useBad(condition: boolean) {
  if (condition) {
    const [value, setValue] = useState(0); // エラー！
  }
}

// ✅ OK: 条件はHookの中の処理で制御する
function useGood() {
  const [value, setValue] = useState(0);
  // 条件は state を使う側（return値や内部ロジック）で制御する
}
\`\`\`
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'カスタムHookを定義する際、関数名は必ず何で始めなければなりませんか？',
        answer: 'use',
        hint: '「use」＋名詞または動詞の形が一般的です（例: useCounter, useInput）。',
      },
      {
        id: 'q2',
        prompt: 'カスタムHookがコンポーネント間で「共有」するのは、StateそのものではなくなんですA？',
        answer: 'ロジック',
        hint: '各コンポーネントでHookを呼ぶたびに、独立したStateが生成されます。',
      },
      {
        id: 'q3',
        prompt: 'カスタムHookの中では、useStateやuseEffectなどのReactの何を呼び出すことができますか？',
        answer: 'Hook',
        hint: 'カスタムHookも「Hook」の一種です。他のHookを組み合わせて新しいHookを作れます。',
      },
      {
        id: 'q4',
        prompt: 'Hooksのルールとして、「ループ・条件分岐・ネストした関数の中でHookを呼ばない」のはなぜですか？それを一言で表すと？',
        answer: '実行順序',
        hint: 'ReactはHookの呼び出し順序を追跡して状態を管理します。順序が変わると正しく動作しません。',
      },
      {
        id: 'q5',
        prompt: 'カスタムHookから値を返す方法として、一般的に使われる2つのデータ構造は何ですか？',
        answer: '配列とオブジェクト',
        hint: 'useState は配列 [value, setter] を、カスタムHookはオブジェクト { value, setValue } を返すことが多いです。',
      },
    ],
    testTask: {
      instruction: `\`useToggle\` カスタムHookを実装してください。

このHookは以下の仕様を満たす必要があります：
- 引数に初期値（boolean）を受け取る（省略時は \`false\`）
- 現在の値 \`value\` と、値を反転させる \`toggle\` 関数を返す
- 呼び出し例: \`const { value, toggle } = useToggle()\`

実装後、\`useToggle\` を使って表示/非表示を切り替えるコンポーネントを作成してください。`,
      starterCode: `import { useState } from 'react';

// TODO: useToggle カスタムHookを実装してください
// - 引数: initial (boolean, デフォルト false)
// - 戻り値: { value: boolean, toggle: () => void }
function useToggle(initial = false) {
  // TODO: ここに実装を追加してください

}

export function TogglePanel() {
  // TODO: useToggle を使って isVisible と toggle を受け取ってください

  return (
    <div>
      <button onClick={/* TODO: toggle を渡す */}>
        切り替え
      </button>
      {/* TODO: isVisible が true のときだけ <p>表示中！</p> を表示してください */}
    </div>
  );
}`,
      expectedKeywords: ['useToggle', 'useState', 'toggle', 'return'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'custom-hooks-1',
          prompt: '`useLocalStorage` カスタムHookを実装してください。',
          requirements: [
            'useLocalStorage<T>(key: string, initialValue: T) というシグネチャにする',
            'localStorageから初期値を読み込み、存在しない場合は initialValue を使う',
            '値を更新したらlocalStorageにも保存する（JSON.stringify/JSON.parse を使用）',
            '{ value, setValue } を返す',
          ],
          hints: [
            'useState の初期値に関数を渡すと、初回レンダリングのみ実行される（遅延初期化）',
            'localStorage.getItem(key) が null のとき initialValue を使う',
            'setValue を呼んだとき localStorage.setItem(key, JSON.stringify(newValue)) を実行する',
          ],
          expectedKeywords: ['useLocalStorage', 'useState', 'localStorage', 'JSON.parse', 'JSON.stringify'],
          starterCode: `import { useState } from 'react';

// TODO: useLocalStorage カスタムHookを実装してください
function useLocalStorage<T>(key: string, initialValue: T) {
  // TODO: localStorageから初期値を読み込んで useState を初期化する（遅延初期化を使用）
  // ヒント: useState(() => { ... }) の形で関数を渡すと初回のみ実行される

  // TODO: 値を更新すると localStorage にも保存する setValue を実装する

  // TODO: { value, setValue } を返す
}

// 動作確認用コンポーネント
export function PersistentCounter() {
  const { value: count, setValue: setCount } = useLocalStorage('count', 0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(0)}>リセット</button>
      <p>（ページをリロードしても値が保持されます）</p>
    </div>
  );
}`,
        },
      ],
    },
  },
  {
    id: 'api-fetch',
    order: 10,
    title: 'API連携',
    summary: 'useEffect と fetch を組み合わせてデータを取得し、ローディング・エラー状態を適切に管理する方法を学ぶ。',
    readMarkdown: `# API連携：useEffect + fetch によるデータ取得

## データ取得の基本パターン

Reactでは、外部APIからデータを取得するために **\`useEffect\` の中で \`fetch\` を呼ぶ** のが基本パターンです。

取得したデータを画面に表示するには、3つの状態を管理する必要があります：

| State | 役割 | 初期値 |
|-------|------|--------|
| \`data\` | 取得したデータを保持 | \`null\` |
| \`isLoading\` | 取得中かどうか | \`true\` |
| \`error\` | エラーメッセージを保持 | \`null\` |

\`\`\`tsx
import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
}

export function PostDetail() {
  const [data, setData] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(res => {
        if (!res.ok) throw new Error('取得に失敗しました');
        return res.json();
      })
      .then(json => {
        setData(json as Post);
        setIsLoading(false);
      })
      .catch(err => {
        setError((err as Error).message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  if (!data) return null;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
    </article>
  );
}
\`\`\`

## try-catch を使ったより安全な書き方

Promise チェーン（\`.then().catch()\`）の代わりに、\`async/await\` と \`try-catch\` を使うとより読みやすく書けます。

\`\`\`tsx
useEffect(() => {
  // ※ useEffect のコールバック自体を async にしてはいけない！
  // 代わりに、内部で async 関数を定義してすぐ呼び出す
  async function fetchPost() {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);
      const json = await res.json() as Post;
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false); // 成功・失敗どちらでも必ず実行
    }
  }

  void fetchPost();
}, []);
\`\`\`

> **注意**: \`useEffect\` のコールバック関数そのものを \`async\` にしてはいけません。\`async\` 関数は \`Promise\` を返しますが、\`useEffect\` が期待するのは「クリーンアップ関数または undefined」です。内部に \`async\` 関数を定義してすぐ呼び出す書き方を使いましょう。

## クリーンアップ：AbortController でfetchをキャンセル

コンポーネントがアンマウントされた後（例：ページ遷移）に \`fetch\` が完了すると、存在しないコンポーネントの State を更新しようとして**メモリリークの警告**が発生します。

**AbortController** を使うと、コンポーネントのアンマウント時に \`fetch\` を中断できます：

\`\`\`tsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchPost() {
    try {
      const res = await fetch(
        'https://jsonplaceholder.typicode.com/posts/1',
        { signal: controller.signal } // fetchにシグナルを渡す
      );
      if (!res.ok) throw new Error('取得に失敗しました');
      const json = await res.json() as Post;
      setData(json);
    } catch (err) {
      // AbortErrorは正常な中断なので無視する
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  void fetchPost();

  // クリーンアップ: コンポーネントがアンマウントされるときにfetchをキャンセル
  return () => {
    controller.abort();
  };
}, []);
\`\`\`

## 表示ロジックの整理

3状態（isLoading / error / data）に応じた表示の分岐は、**早期リターン**で整理するとすっきりします：

\`\`\`tsx
// ローディング中
if (isLoading) return <p>読み込み中...</p>;

// エラー発生
if (error) return <p className="text-red-600">エラー: {error}</p>;

// データなし（正常取得だが結果が空）
if (!data) return <p>データがありません</p>;

// データあり
return <article><h1>{data.title}</h1></article>;
\`\`\`

## データ取得のベストプラクティス

1. **\`isLoading\` の初期値は \`true\`** にする（初回は必ず取得が必要）
2. **\`finally\` で \`setIsLoading(false)\`** を確実に実行する（エラー時も忘れずに）
3. **AbortController でクリーンアップ**を実装する（メモリリーク防止）
4. **\`res.ok\` を確認**する（4xx/5xx レスポンスは \`fetch\` ではエラーにならないため）
`,
    practiceQuestions: [
      {
        id: 'q1',
        prompt: 'Reactコンポーネントでマウント時に一度だけAPIデータを取得したい場合、どのHookを使いますか？',
        answer: 'useEffect',
        hint: '第二引数に空配列 [] を渡すと、初回マウント時のみ実行されます。',
      },
      {
        id: 'q2',
        prompt: 'データ取得中の「ローディング状態」を表す isLoading の適切な初期値はどちらですか？（true / false）',
        answer: 'true',
        hint: 'コンポーネントがマウントされたら即座にデータ取得が始まります。最初から取得中と考えましょう。',
      },
      {
        id: 'q3',
        prompt: 'async/await を使ったfetchでエラーを適切に処理するために使うブロック構文は何ですか？',
        answer: 'try-catch',
        hint: 'try の中で fetch を実行し、catch でエラー状態を更新します。',
      },
      {
        id: 'q4',
        prompt: 'アンマウント後に fetch が完了して setState が呼ばれると何の原因になりますか？',
        answer: 'メモリリーク',
        hint: '存在しないコンポーネントの State を更新しようとすることで警告が発生します。AbortController で対策できます。',
      },
      {
        id: 'q5',
        prompt: 'fetchをキャンセルするために使うWeb APIの名称は何ですか？',
        answer: 'AbortController',
        hint: 'controller.abort() を呼ぶと、関連付けられた fetch リクエストが中断されます。',
      },
    ],
    testTask: {
      instruction: `JSONPlaceholderのAPIを使って記事を取得するコンポーネントを実装してください。

- URL: \`https://jsonplaceholder.typicode.com/posts/1\`
- \`isLoading\`（初期値 true）、\`error\`、\`data\` の3つの state を管理する
- ローディング中は「読み込み中...」を表示する
- エラー時は「エラー: {メッセージ}」を表示する
- 取得成功時は記事のタイトル（\`data.title\`）を \`<h1>\` で表示する
- \`useEffect\` の依存配列は空配列 \`[]\` にする`,
      starterCode: `import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
}

export function PostViewer() {
  // TODO: data, isLoading, error の3つのstateを定義してください
  // isLoading の初期値は true にしてください

  useEffect(() => {
    // TODO: async関数 fetchData を定義してください
    // - fetch で https://jsonplaceholder.typicode.com/posts/1 を取得
    // - try-catch-finally を使ってエラーハンドリングを実装
    // - finally で setIsLoading(false) を呼ぶ

    // TODO: fetchData() を呼び出してください
  }, []);

  // TODO: isLoading が true なら「読み込み中...」を表示

  // TODO: error があれば「エラー: {error}」を表示

  // TODO: data があれば <h1>{data.title}</h1> を表示
  return <div>{/* ここに条件分岐した表示を実装 */}</div>;
}`,
      expectedKeywords: ['useEffect', 'fetch', 'useState', 'isLoading'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'api-fetch-1',
          prompt: '`useFetch` カスタムHookを実装してください。',
          requirements: [
            'useFetch<T>(url: string) というシグネチャにする',
            'data: T | null, isLoading: boolean, error: string | null を返す',
            '内部で useEffect を使い、url が変わるたびに再取得する',
            'AbortController を使ってクリーンアップを実装する',
            'AbortError は無視し、その他のエラーのみ error に設定する',
          ],
          hints: [
            'useEffect の依存配列に [url] を入れると url 変更時に再実行される',
            'controller.abort() をクリーンアップ関数で呼ぶ',
            "(err as Error).name !== 'AbortError' でAbortErrorを除外する",
          ],
          expectedKeywords: ['useFetch', 'useEffect', 'AbortController', 'controller.abort', 'isLoading'],
          starterCode: `import { useState, useEffect } from 'react';

// TODO: useFetch カスタムHookを実装してください
function useFetch<T>(url: string) {
  // TODO: data, isLoading, error の state を定義する

  useEffect(() => {
    // TODO: AbortController を作成する

    // TODO: async関数 fetchData を定義する
    // - try で fetch(url, { signal: controller.signal }) を実行
    // - catch で AbortError は無視、それ以外はエラーを設定
    // - finally で isLoading を false に

    // TODO: fetchData() を呼ぶ

    // TODO: クリーンアップで controller.abort() を呼ぶ
  }, [url]);

  // TODO: { data, isLoading, error } を返す
}

// 動作確認用コンポーネント
interface Post {
  id: number;
  title: string;
}

export function PostList() {
  const [postId, setPostId] = useState(1);
  const { data, isLoading, error } = useFetch<Post>(
    \`https://jsonplaceholder.typicode.com/posts/\${postId}\`
  );

  return (
    <div>
      <div>
        <button onClick={() => setPostId(id => Math.max(1, id - 1))}>前の記事</button>
        <span> 記事 #{postId} </span>
        <button onClick={() => setPostId(id => id + 1)}>次の記事</button>
      </div>
      {isLoading && <p>読み込み中...</p>}
      {error && <p>エラー: {error}</p>}
      {data && <h2>{data.title}</h2>}
    </div>
  );
}`,
        },
      ],
    },
  },
  {
    id: 'performance',
    order: 11,
    title: 'パフォーマンス最適化',
    summary: 'useMemo と useCallback を使い、不要な再レンダリングを防いでアプリを高速化する方法を学ぶ。',
    readMarkdown: `# パフォーマンス最適化：useMemo と useCallback

## なぜ最適化が必要か

Reactはステートが変わるたびにコンポーネントを再レンダリングします。ほとんどの場合これは問題ありませんが、**重い計算**や**子コンポーネントへの関数渡し**が絡む場合、不要な処理が繰り返されてパフォーマンスが低下します。

## useMemo — 計算結果をキャッシュする

\`useMemo\` は「前回と同じ依存値なら再計算しない」ためのフックです。

\`\`\`tsx
import { useState, useMemo } from 'react';

function FilteredList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);

  // queryが変わったときだけ再計算される
  const filtered = useMemo(
    () => items.filter(item => item.includes(query)),
    [items, query]
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => setCount(c => c + 1)}>カウント: {count}</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
\`\`\`

ポイント: \`count\` が変わっても \`query\` が変わっていなければ \`filtered\` は再計算されません。

## useCallback — 関数をキャッシュする

\`useCallback\` は「前回と同じ依存値なら同一の関数参照を返す」フックです。主に**子コンポーネントへの関数プロップ**と組み合わせます。

\`\`\`tsx
import { useState, useCallback, memo } from 'react';

// memo でラップすると、プロップが変わらない限り再レンダリングしない
const Button = memo(({ onClick, label }: { onClick: () => void; label: string }) => {
  console.log(\`\${label} ボタンを描画\`);
  return <button onClick={onClick}>{label}</button>;
});

function Counter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  // useCallbackなしだと再レンダリングのたびに新しい関数が生成される
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 依存なし → 常に同じ関数参照

  return (
    <div>
      <p>カウント: {count}</p>
      <Button onClick={handleIncrement} label="増やす" />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        テーマ: {theme}
      </button>
    </div>
  );
}
\`\`\`

\`theme\` が変わっても \`handleIncrement\` の参照が変わらないため、\`Button\` は再レンダリングされません。

## いつ使うべきか

| 状況 | 推奨 |
|------|------|
| 重い計算（フィルタ・ソート・集計） | useMemo |
| memo でラップした子コンポーネントへの関数渡し | useCallback |
| useEffect の依存配列に関数を入れる | useCallback |
| 単純な値や軽い計算 | 不要（過剰最適化になる） |

## 注意点

- **早期最適化は避ける**: まず動かし、プロファイラで問題を確認してから適用する
- **依存配列を正確に書く**: 抜けがあると古い値を参照するバグになる
- \`memo\` なしで \`useCallback\` を使っても効果は薄い（セットで使う）
`,
    practiceQuestions: [
      {
        id: 'performance-q1',
        prompt: 'useMemo はどのような処理に使うフックですか？',
        answer: '重い計算結果をキャッシュする',
        hint: '「依存値が変わらなければ再計算しない」が useMemo の基本動作です。',
      },
      {
        id: 'performance-q2',
        prompt: 'useCallback を使うと何がキャッシュされますか？',
        answer: '関数の参照（インスタンス）',
        hint: '同じ関数参照を返すことで、memo でラップした子コンポーネントへの不要な再レンダリングを防げます。',
      },
      {
        id: 'performance-q3',
        prompt: 'memo(Button) でラップした Button が再レンダリングされる条件は何ですか？',
        answer: 'プロップが前回と異なる参照・値になったとき',
        hint: '`memo` は「プロップが変わらない限り再レンダリングしない」最適化です。',
      },
      {
        id: 'performance-q4',
        prompt: 'useMemo の依存配列を空配列にした場合、計算はいつ実行されますか？',
        answer: '初回レンダリング時のみ',
        hint: '依存する値がないため変化が発生せず、初回のみ実行されます。',
      },
      {
        id: 'performance-q5',
        prompt: 'useCallback と memo をセットで使わないと効果が薄い理由は何ですか？',
        answer: '子コンポーネントが memo されていないと関数参照が安定しても再レンダリングが起きるから',
        hint: 'useCallback は関数参照を安定させますが、受け取る子が memo されていないと効果がありません。',
      },
    ],
    testTask: {
      instruction: `\`FilteredList\` コンポーネントを完成させてください。

仕様:
- props として \`items: string[]\` を受け取る
- テキスト入力で一覧をフィルタリングできる
- フィルタ結果の計算には useMemo を使う
- 「カウント」ボタンをクリックするとカウントが増える（フィルタとは無関係のステート）
- カウントが増えてもフィルタ計算は再実行されない（useMemo の恩恵）`,
      starterCode: `import { useState, useMemo } from 'react';

interface FilteredListProps {
  items: string[];
}

export function FilteredList({ items }: FilteredListProps) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);

  // TODO: useMemo でフィルタ計算をキャッシュする
  const filtered = items; // ここを修正

  return (
    <div>
      <input
        placeholder="絞り込み..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={() => setCount(c => c + 1)}>カウント: {count}</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}`,
      expectedKeywords: ['useMemo', 'filter', 'query', 'items'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'performance-1',
          prompt: 'useCallback と memo を使って子コンポーネントの不要な再レンダリングを防ぐ OptimizedCounter を実装してください。',
          requirements: [
            'memo でラップした ActionButton コンポーネントを作る（props は onClick: () => void, label: string）',
            '親の OptimizedCounter では useCallback で increment/decrement 関数を作る',
            'カウントの表示・増減・テーマ切り替え（light/dark）の機能を持つ',
            'テーマを切り替えても ActionButton は再レンダリングされない',
          ],
          hints: [
            'console.log を ActionButton 内に入れると再レンダリングを確認できる',
            'useCallback の依存配列を正しく設定しないと古い値を参照するバグになる',
            '関数内で setCount(c => c + 1) のように関数形式を使うと依存配列が空でも安全',
          ],
          expectedKeywords: ['useCallback', 'memo', 'setCount', 'setTheme'],
          starterCode: `import { useState, useCallback, memo } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
}

// TODO: memo でラップした ActionButton を実装する
const ActionButton = ({ onClick, label }: ActionButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

export function OptimizedCounter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // TODO: useCallback で increment / decrement を実装する
  const handleIncrement = () => setCount(c => c + 1);
  const handleDecrement = () => setCount(c => c - 1);

  return (
    <div>
      <p>カウント: {count}</p>
      <ActionButton onClick={handleIncrement} label="増やす" />
      <ActionButton onClick={handleDecrement} label="減らす" />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        テーマ切り替え（{theme}）
      </button>
    </div>
  );
}`,
        },
      ],
    },
  },
  {
    id: 'testing',
    order: 12,
    title: 'テスト入門',
    summary: 'React Testing Library を使ってコンポーネントの動作をテストし、安心してリファクタリングできる基盤を作る方法を学ぶ。',
    readMarkdown: `# テスト入門：React Testing Library

## なぜテストを書くのか

テストを書く最大の目的は「**安心してコードを変えられる状態にする**」ことです。テストがあれば、リファクタリングや機能追加の際に意図しない壊れが即座に検知できます。

## React Testing Library の基本方針

React Testing Library（RTL）は「**ユーザーが操作する視点**でコンポーネントをテストする」ライブラリです。

- ❌ 実装の詳細（state・class名）をテストしない
- ✅ ユーザーが見える文字・ボタン・入力欄を通じてテストする

## 基本的なテストの書き方

\`\`\`tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('初期値0が表示される', () => {
    render(<Counter />);
    expect(screen.getByText('カウント: 0')).toBeInTheDocument();
  });

  it('+ボタンをクリックするとカウントが増える', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('カウント: 1')).toBeInTheDocument();
  });
});
\`\`\`

## 重要な概念

### render と screen

\`render\` はコンポーネントをJSDomに描画し、\`screen\` はそこから要素を検索します。

\`\`\`tsx
render(<MyComponent />);  // DOMに描画
screen.getByText('テキスト');          // テキストで検索（見つからなければエラー）
screen.queryByText('テキスト');        // 存在確認用（見つからなければnull）
screen.getByRole('button', { name: '送信' }); // role + アクセシブルな名前で検索
\`\`\`

### userEvent — ユーザー操作のシミュレーション

\`\`\`tsx
const user = userEvent.setup();
await user.click(button);           // クリック
await user.type(input, 'Hello');    // 文字入力
await user.clear(input);            // 入力クリア
await user.selectOptions(select, 'option-value'); // セレクト
\`\`\`

### アサーション（jest-dom）

\`\`\`tsx
expect(element).toBeInTheDocument();   // DOMに存在する
expect(element).toBeVisible();          // 表示されている
expect(element).toBeDisabled();         // 無効化されている
expect(element).toHaveValue('text');    // 値が一致する
expect(element).toHaveTextContent('text'); // テキストが含まれる
\`\`\`

## モックの活用

外部APIやサービスはモックで置き換えてテストします。

\`\`\`tsx
import { vi } from 'vitest';

// 関数のモック
const mockOnSave = vi.fn();
render(<Form onSave={mockOnSave} />);
// フォーム送信後
expect(mockOnSave).toHaveBeenCalledWith({ name: 'テスト太郎' });
\`\`\`

## テストの構造（AAA パターン）

\`\`\`tsx
it('テストの説明', async () => {
  // Arrange（準備）
  const user = userEvent.setup();
  render(<LoginForm />);

  // Act（操作）
  await user.type(screen.getByLabelText('メール'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: 'ログイン' }));

  // Assert（検証）
  expect(screen.getByText('ログイン成功')).toBeInTheDocument();
});
\`\`\`

## よくあるミス

| ミス | 修正 |
|------|------|
| \`getByText\` で部分一致が通らない | \`{ exact: false }\` オプションを使う |
| \`user.click\` の前に \`await\` を忘れる | 必ず \`await\` を付ける |
| 実装詳細（class名、state値）をテスト | ユーザー視点の要素（テキスト・role）でテスト |
| 非同期更新を待たずにアサートする | \`waitFor\` や \`findBy*\` を使う |
`,
    practiceQuestions: [
      {
        id: 'testing-q1',
        prompt: 'React Testing Library はどのような視点でテストを書くライブラリですか？',
        answer: 'ユーザーが操作する視点',
        hint: 'RTL は「ユーザーが見る・操作できる要素」を通じてテストします。実装詳細は避けます。',
      },
      {
        id: 'testing-q2',
        prompt: '要素が存在しないことを確認したいとき使うべきメソッドは queryByText と getByText のどちらですか？',
        answer: 'queryByText',
        hint: 'getByText は見つからないとエラーをthrow します。存在確認（null チェック）には queryByText を使います。',
      },
      {
        id: 'testing-q3',
        prompt: 'userEvent でクリックするとき await が必要な理由は何ですか？',
        answer: 'userEvent の操作は非同期（Promise）で、await なしだと処理完了前にアサーションが実行されるから',
        hint: 'await を付けないとクリック処理が終わる前に expect() が実行され、テストが不安定になります。',
      },
      {
        id: 'testing-q4',
        prompt: 'テストの AAA パターンとは何の略ですか？',
        answer: 'Arrange（準備）・Act（操作）・Assert（検証）',
        hint: 'テストを3段階に整理するパターンです。準備→操作→検証の順で書くと読みやすくなります。',
      },
      {
        id: 'testing-q5',
        prompt: 'vi.fn() で作成したモック関数が特定の引数で呼ばれたことを検証するアサーションは何ですか？',
        answer: 'toHaveBeenCalledWith(args)',
        hint: 'expect(mockFn).toHaveBeenCalledWith(引数) で呼び出し時の引数を検証できます。',
      },
    ],
    testTask: {
      instruction: `\`Counter\` コンポーネントに対するテストを完成させてください。

テスト対象コンポーネント（Counter.tsx）の仕様:
- カウント: {count} を表示する <p> タグ
- クリックで +1 する "+" ボタン
- クリックで -1 する "-" ボタン

実装すべきテストケース:
1. 初期値「カウント: 0」が表示されること
2. +ボタンをクリックすると「カウント: 1」になること
3. -ボタンをクリックすると「カウント: -1」になること`,
      starterCode: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('初期値0が表示される', () => {
    render(<Counter />);
    // TODO: 「カウント: 0」というテキストがDOMにあることを検証する
  });

  it('+ボタンをクリックするとカウントが増える', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    // TODO: +ボタンをクリックして「カウント: 1」になることを検証する
  });

  it('-ボタンをクリックするとカウントが減る', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    // TODO: -ボタンをクリックして「カウント: -1」になることを検証する
  });
});`,
      expectedKeywords: ['getByText', 'getByRole', 'toBeInTheDocument', 'user.click'],
    },
    challengeTask: {
      patterns: [
        {
          id: 'testing-1',
          prompt: 'バリデーション付きのログインフォームのテストを実装してください。',
          requirements: [
            '初期状態でエラーメッセージが表示されていないことを検証する',
            '空欄のまま送信するとエラーメッセージが表示されることを検証する',
            'メールを入力して送信すると onLogin がそのメールアドレスで呼ばれることを検証する',
          ],
          hints: [
            'queryByText はテキストが存在しない場合に null を返す（否定検証に便利）',
            'vi.fn() でモック関数を作り、toHaveBeenCalledWith で呼び出し引数を検証する',
            'screen.getByLabelText でラベルに関連付けられた入力欄を取得できる',
          ],
          expectedKeywords: ['queryByText', 'vi.fn', 'toHaveBeenCalledWith', 'getByLabelText'],
          starterCode: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LoginForm } from './LoginForm';

// LoginForm の仕様:
// - メール入力欄（label: "メールアドレス"）と送信ボタン
// - メール未入力で送信すると「メールアドレスを入力してください」が表示される
// - メール入力済みで送信すると onLogin(email) が呼ばれる

describe('LoginForm', () => {
  it('初期状態でエラーメッセージは表示されない', () => {
    render(<LoginForm onLogin={vi.fn()} />);
    // TODO: エラーメッセージが存在しないことを検証する
  });

  it('空欄のまま送信するとエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);
    // TODO: 送信ボタンをクリックしてエラーが出ることを検証する
  });

  it('メールを入力して送信するとonLoginが呼ばれる', async () => {
    const user = userEvent.setup();
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);
    // TODO: メールを入力して送信し、onLogin が正しく呼ばれることを検証する
  });
});`,
        },
      ],
    },
  },
]

export function getAdvancedStep(stepId: string) {
  return advancedSteps.find((step) => step.id === stepId)
}

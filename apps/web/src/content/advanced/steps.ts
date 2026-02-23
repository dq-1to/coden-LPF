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
]

export function getAdvancedStep(stepId: string) {
  return advancedSteps.find((step) => step.id === stepId)
}

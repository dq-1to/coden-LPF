import type { LearningStepContent } from '@/content/fundamentals/steps'

export const apiFetchStep: LearningStepContent = {
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
        explanation: 'useEffectの中でfetchを呼ぶのがReactのデータ取得の基本です。依存配列[]を渡すことでマウント時に1回だけ実行されます。',
      },
      {
        id: 'q2',
        prompt: 'データ取得中の「ローディング状態」を表す isLoading の適切な初期値はどちらですか？',
        answer: 'true',
        hint: 'コンポーネントがマウントされたら即座にデータ取得が始まります。最初から取得中と考えましょう。',
        explanation: 'isLoadingの初期値をtrueにすることで、データ取得前に「読み込み中」UIが表示され、未取得のデータをそのまま表示するのを防げます。',
        choices: ['true', 'false'],
      },
      {
        id: 'q3',
        prompt: 'async/await を使ったfetchでエラーを適切に処理するために使うブロック構文は何ですか？',
        answer: 'try-catch',
        hint: 'try の中で fetch を実行し、catch でエラー状態を更新します。',
        explanation: 'try-catchを使うと非同期処理のエラーを安全に捕捉できます。finallyでisLoadingをfalseにすることで成否どちらでもUI更新されます。',
      },
      {
        id: 'q4',
        prompt: 'アンマウント後に fetch が完了して setState が呼ばれると何の原因になりますか？',
        answer: 'メモリリーク',
        hint: '存在しないコンポーネントの State を更新しようとすることで警告が発生します。AbortController で対策できます。',
        explanation: 'コンポーネントがアンマウントされた後にstateを更新しようとするとメモリリークが発生します。クリーンアップ関数で対処します。',
        choices: ['メモリリーク', '型エラー', '無限ループ', 'セキュリティ違反'],
      },
      {
        id: 'q5',
        prompt: 'fetchをキャンセルするために使うWeb APIの名称は何ですか？',
        answer: 'AbortController',
        hint: 'controller.abort() を呼ぶと、関連付けられた fetch リクエストが中断されます。',
        explanation: 'AbortControllerのsignalをfetchに渡し、クリーンアップ関数でabort()を呼ぶことでアンマウント後のfetchをキャンセルできます。',
      },
    ],
    testTask: {
      instruction: 'useEffect 内で API を取得する処理の空欄を埋めてください。finally ブロックでローディングを解除します。',
      starterCode: `useEffect(() => {
  async function fetchData() {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } ____ {
      setIsLoading(false);
    }
  }
  void fetchData();
}, []);`,
      expectedKeywords: ['finally'],
      explanation: 'try-catch-finallyのfinallyブロックは成功・失敗に関わらず必ず実行されます。ローディング解除はここに書くのが定石です。',
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
}

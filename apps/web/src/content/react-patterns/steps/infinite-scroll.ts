import type { LearningStepContent } from '@/content/fundamentals/steps'

export const infiniteScrollStep: LearningStepContent = {
  id: 'infinite-scroll',
  order: 39,
  title: '無限スクロール',
  summary: 'Intersection Observer API を使った無限スクロールの実装・useRef によるセンチネル要素の参照・追加データロードパターンを学ぶ。',
  readMarkdown: `# 無限スクロール

## Intersection Observer API とは

Intersection Observer は、要素がビューポート（画面の表示領域）に入ったかどうかを非同期で監視するブラウザ API です。スクロール検知・遅延読み込み・無限スクロールに活用されます。

\`\`\`javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 要素がビューポートに入った！
      console.log('要素が見えました')
    }
  })
})

// 監視する要素を指定
observer.observe(targetElement)

// 監視を解除
observer.unobserve(targetElement)
observer.disconnect() // 全て解除
\`\`\`

## センチネル要素パターン

リストの末尾に「センチネル（見張り）要素」を置き、それが見えたら追加データを読み込みます。

\`\`\`
[item 1] [item 2] ... [item 20] [センチネル] ← これが見えたら追加ロード
\`\`\`

## React での基本実装

\`\`\`tsx
function InfiniteList() {
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    // クリーンアップ
    return () => observer.disconnect()
  }, [hasMore])

  const loadMore = async () => {
    const newItems = await fetchMoreItems()
    if (newItems.length === 0) {
      setHasMore(false)
      return
    }
    setItems((prev) => [...prev, ...newItems])
  }

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      {hasMore && <div ref={sentinelRef}>読み込み中...</div>}
    </div>
  )
}
\`\`\`

## ローディング状態の追加

\`\`\`tsx
function InfiniteList() {
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setIsLoading(true)
        const newItems = await fetchMoreItems()
        setItems((prev) => [...prev, ...newItems])
        setHasMore(newItems.length > 0)
        setIsLoading(false)
      }
    })

    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)
    return () => { if (sentinel) observer.unobserve(sentinel) }
  }, [hasMore, isLoading])

  return (
    <div>
      {items.map((item) => <div key={item.id}>{item.name}</div>)}
      {isLoading && <p>読み込み中...</p>}
      {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
      {!hasMore && <p>すべて読み込みました</p>}
    </div>
  )
}
\`\`\`

## threshold オプション

threshold は要素が何割見えたときにコールバックを呼ぶかを設定します。

\`\`\`javascript
const observer = new IntersectionObserver(callback, {
  threshold: 0,    // 1px でも見えたら（デフォルト）
  threshold: 0.5,  // 50% 見えたら
  threshold: 1,    // 全体が見えたら
  rootMargin: '0px 0px 200px 0px',  // 200px 手前でトリガー
})
\`\`\`

## useEffect の依存配列の注意点

\`\`\`tsx
useEffect(() => {
  const observer = new IntersectionObserver(...)
  // ...
  return () => observer.disconnect()
}, [hasMore, isLoading])
// hasMore や isLoading が変わるたびにオブザーバーを再設定する
\`\`\`

コールバック内で state を参照する場合、クロージャの問題を避けるため、
依存配列に含めるか、useRef で最新値を保持します。
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '要素がビューポートに入ったかを検知するブラウザ API は？',
      answer: 'Intersection Observer',
      hint: '「交差を観察する」という意味の API です。',
      explanation: 'Intersection Observer API は、要素がビューポートや別の要素に交差（表示）したかを非同期で監視します。スクロールイベントより効率的です。',
      choices: ['Intersection Observer', 'Scroll Observer', 'MutationObserver', 'ResizeObserver'],
    },
    {
      id: 'q2',
      prompt: 'センチネル要素への参照を保持するために使う React Hook は？',
      answer: 'useRef',
      hint: 'DOMノードへの参照を保持するために使います。',
      explanation: 'useRef<HTMLDivElement>(null) でセンチネル要素への参照を作成し、ref={sentinelRef} で要素に接続します。これで observer.observe(sentinelRef.current) が使えます。',
      choices: ['useRef', 'useState', 'useCallback', 'useMemo'],
    },
    {
      id: 'q3',
      prompt: 'IntersectionObserver のコールバックで「要素が見えた」を判定するプロパティは？',
      answer: 'isIntersecting',
      hint: '「交差しているか？」を表す真偽値プロパティです。',
      explanation: 'entry.isIntersecting が true のとき、要素がビューポートに入っています。コールバックには entries 配列が渡され、通常は entries[0].isIntersecting で確認します。',
      choices: ['isIntersecting', 'isVisible', 'isInView', 'intersecting'],
    },
    {
      id: 'q4',
      prompt: '「まだ追加データがある」状態を管理するのに使う state 変数の慣用名は？',
      answer: 'hasMore',
      hint: '「まだある」を表す慣用的な名前です。',
      explanation: 'hasMore フラグが true の間はセンチネル要素を表示し続け、データが尽きたら false にしてスクロール検知を停止します。',
      choices: ['hasMore', 'hasData', 'hasNext', 'canLoad'],
    },
    {
      id: 'q5',
      prompt: 'useEffect でオブザーバーを設定したとき、クリーンアップで呼ぶべきメソッドは？',
      answer: 'observer.disconnect()',
      hint: '「接続を切る」メソッドです。',
      explanation: 'useEffect のクリーンアップ関数で observer.disconnect() を呼ぶことで、コンポーネントのアンマウント時や effect の再実行前にオブザーバーを解除してメモリリークを防ぎます。',
      choices: ['observer.disconnect()', 'observer.stop()', 'observer.remove()', 'observer.unobserve()'],
    },
  ],
  testTask: {
    instruction: 'センチネル要素が見えたときに loadMore を呼ぶ IntersectionObserver を実装してください。',
    starterCode: `const observer = new IntersectionObserver((entries) => {
  if (entries[0].____) {
    loadMore()
  }
})`,
    expectedKeywords: ['isIntersecting'],
    explanation: 'entries[0].isIntersecting が true のとき、センチネル要素がビューポートに入ったことを意味します。このタイミングで loadMore() を呼び出します。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'infinite-scroll-1',
        prompt: 'Intersection Observer を使った無限スクロールリストを実装してください。',
        requirements: [
          'sentinelRef で最下部のセンチネル要素を参照する',
          'useEffect で IntersectionObserver を作成し、センチネル要素を observe する',
          'isIntersecting かつ hasMore のとき新しいデータを追加ロードする',
          'データが0件になったら hasMore を false にして追加ロードを停止する',
          'useEffect のクリーンアップで observer.disconnect() を呼ぶ',
        ],
        hints: [
          'sentinelRef.current が null でないことを確認してから observe します',
          'setItems((prev) => [...prev, ...newItems]) で既存データに追記します',
          'クリーンアップ: return () => observer.disconnect()',
        ],
        expectedKeywords: ['IntersectionObserver', 'isIntersecting', 'sentinelRef', 'hasMore', 'disconnect'],
        starterCode: `function InfiniteList() {
  const [items, setItems] = useState(generateItems(1, 10))
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const sentinelRef = useRef(null)

  // アイテム生成（実際はAPIで取得）
  function generateItems(start, count) {
    return Array.from({ length: count }, (_, i) => ({
      id: start + i,
      name: \`アイテム \${start + i}\`,
    }))
  }

  useEffect(() => {
    // TODO: IntersectionObserver を作成
    // - entries[0].isIntersecting && hasMore のとき新データを追加
    // - sentinelRef.current を observe
    // - クリーンアップで disconnect
  }, [hasMore, page])

  const loadMore = () => {
    const newItems = generateItems(page * 10 + 1, 10)
    setItems((prev) => [...prev, ...newItems])
    setPage((p) => p + 1)
    if (page >= 4) setHasMore(false)  // 50件で終了
  }

  return (
    <div style={{ height: '400px', overflowY: 'auto' }}>
      {items.map((item) => (
        <div key={item.id} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
          {item.name}
        </div>
      ))}
      {/* TODO: センチネル要素と hasMore/!hasMore の表示 */}
    </div>
  )
}`,
      },
      {
        id: 'infinite-scroll-2',
        prompt: 'ローディング状態と「すべて読み込みました」メッセージ付きの無限スクロールを実装してください。',
        requirements: [
          'isLoading ステートで追加ロード中の状態を管理する',
          'ローディング中は重複ロードを防ぐ（isLoading チェック）',
          'データロード中は「読み込み中...」スピナーを表示する',
          'hasMore が false になったら「すべて読み込みました」を表示する',
          'rootMargin を使って画面に入る200px前に先読みする',
        ],
        hints: [
          'observer のオプションに rootMargin: "0px 0px 200px 0px" を設定します',
          'if (entries[0].isIntersecting && hasMore && !isLoading) でガード条件を追加します',
          'ロード開始時に setIsLoading(true)、完了時に setIsLoading(false) を呼びます',
        ],
        expectedKeywords: ['isLoading', 'rootMargin', 'isIntersecting', 'disconnect'],
        starterCode: `function InfiniteListWithLoading() {
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef(null)

  // 初回ロード
  useEffect(() => {
    loadMore()
  }, [])

  const loadMore = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    // 非同期データ取得をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newItems = Array.from({ length: 10 }, (_, i) => ({
      id: items.length + i + 1,
      name: \`アイテム \${items.length + i + 1}\`,
    }))
    setItems((prev) => {
      const updated = [...prev, ...newItems]
      if (updated.length >= 50) setHasMore(false)
      return updated
    })
    setIsLoading(false)
  }

  useEffect(() => {
    // TODO: rootMargin: '0px 0px 200px 0px' のオプション付きで
    // IntersectionObserver を設定
  }, [hasMore, isLoading])

  return (
    <div style={{ height: '500px', overflowY: 'auto' }}>
      {items.map((item) => (
        <div key={item.id} style={{ padding: '12px' }}>{item.name}</div>
      ))}
      {/* TODO: isLoading のスピナーと !hasMore のメッセージ */}
      <div ref={sentinelRef} />
    </div>
  )
}`,
      },
    ],
  },
}

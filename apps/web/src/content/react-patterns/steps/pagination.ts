import type { LearningStepContent } from '@/content/fundamentals/steps'

export const paginationStep: LearningStepContent = {
  id: 'pagination',
  order: 38,
  title: 'ページネーション',
  summary: 'URL連動ページネーションの実装パターン・ページ計算ロジック・useSearchParams による状態管理を学ぶ。',
  readMarkdown: `# ページネーション

## ページネーションの基本概念

ページネーションは大量のデータを複数ページに分割して表示するUIパターンです。

\`\`\`
全100件、1ページ10件の場合:
- 総ページ数: Math.ceil(100 / 10) = 10
- ページ1: items[0..9]  → items.slice(0, 10)
- ページ2: items[10..19] → items.slice(10, 20)
- ページN: items[(N-1)*10 .. N*10]
\`\`\`

## ページ計算ロジック

\`\`\`typescript
const ITEMS_PER_PAGE = 10

// 総ページ数の計算
const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

// ページ N の開始インデックス（1-indexed）
const startIndex = (page - 1) * ITEMS_PER_PAGE

// ページ N の表示データ
const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE)
\`\`\`

## シンプルなページネーションコンポーネント

\`\`\`tsx
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        前へ
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? 'font-bold underline' : ''}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </button>
    </div>
  )
}
\`\`\`

## useState によるページ管理

\`\`\`tsx
function ProductList() {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = products.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div>
      <ul>
        {currentItems.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
\`\`\`

## URL 連動ページネーション（useSearchParams）

URL にページ番号を保持することで、ブラウザバック・リロード・共有に対応できます。

\`\`\`tsx
import { useSearchParams } from 'react-router-dom'

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page') ?? '1')
  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = products.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) })
  }

  return (
    <div>
      <ul>
        {currentItems.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
\`\`\`

## API を使ったサーバーサイドページネーション

\`\`\`tsx
function ProductList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetch(\`/api/products?page=\${currentPage}&limit=\${ITEMS_PER_PAGE}\`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.items)
        setTotalCount(data.total)
      })
  }, [currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div>
      {/* リスト表示 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
\`\`\`
`,
  practiceQuestions: [
    {
      id: 'q1',
      prompt: '全85件、1ページ10件のとき総ページ数を求める計算式は？',
      answer: 'Math.ceil(85 / 10)',
      hint: '小数点以下を切り上げる関数を使います。',
      explanation: 'Math.ceil(85 / 10) = Math.ceil(8.5) = 9 ページになります。端数が出ても正しいページ数を求めるには Math.ceil を使います。',
      choices: ['Math.ceil(85 / 10)', 'Math.floor(85 / 10)', 'Math.round(85 / 10)', '85 / 10'],
    },
    {
      id: 'q2',
      prompt: '1ページ10件のとき、ページ3の開始インデックス（0始まり）は？',
      answer: '20',
      hint: '(ページ番号 - 1) × 件数 で計算します。',
      explanation: '(3 - 1) × 10 = 20 です。items.slice(20, 30) でページ3のデータを取得できます。',
      choices: ['20', '30', '10', '25'],
    },
    {
      id: 'q3',
      prompt: 'URLにページ番号を保持するために使う React Router v6 の Hook は？',
      answer: 'useSearchParams',
      hint: 'URLの「?page=2」のような部分を管理します。',
      explanation: 'useSearchParams は URLのクエリパラメータ（?key=value）を読み書きできます。searchParams.get("page") でページ番号を取得、setSearchParams({ page: "2" }) で更新します。',
      choices: ['useSearchParams', 'useLocation', 'useQuery', 'useParams'],
    },
    {
      id: 'q4',
      prompt: '現在が1ページ目のとき、「前へ」ボタンをどう扱うべきか？',
      answer: 'disabled にする',
      hint: '1ページ目より前には戻れません。',
      explanation: 'currentPage === 1 のとき、前へボタンに disabled 属性を付けて非活性にします。同様に currentPage === totalPages のとき、次へボタンも disabled にします。',
      choices: ['disabled にする', '非表示にする', 'エラーを表示する', 'ページ0に移動する'],
    },
    {
      id: 'q5',
      prompt: 'items.slice(startIndex, startIndex + itemsPerPage) で取得できるのは？',
      answer: '現在のページの表示データ',
      hint: 'slice は配列の一部を切り出します。',
      explanation: 'items.slice(startIndex, startIndex + itemsPerPage) で、startIndex から itemsPerPage 件分のデータを取得できます。これが現在ページの表示データになります。',
      choices: ['現在のページの表示データ', '全件データ', '最初のページのデータ', '最後のページのデータ'],
    },
  ],
  testTask: {
    instruction: '商品リストの総ページ数を計算してください。totalCount は全件数、ITEMS_PER_PAGE は1ページの件数です。',
    starterCode: `const ITEMS_PER_PAGE = 10

const totalPages = Math.ceil(____ / ITEMS_PER_PAGE)`,
    expectedKeywords: ['totalCount'],
    explanation: 'Math.ceil(totalCount / ITEMS_PER_PAGE) で端数を切り上げて総ページ数を計算します。',
  },
  challengeTask: {
    patterns: [
      {
        id: 'pagination-1',
        prompt: 'useState を使ったシンプルなページネーション付きリストを実装してください。',
        requirements: [
          '1ページ5件で items 配列をページ分割して表示する',
          'currentPage ステートで現在ページを管理する',
          'Math.ceil で totalPages を計算する',
          'slice で現在ページのデータを切り出す',
          '前へ・次へボタンと、1ページ目・最終ページでの disabled 制御を実装する',
        ],
        hints: [
          'startIndex = (currentPage - 1) * ITEMS_PER_PAGE で開始位置を計算します',
          'currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE) でデータを取得します',
          'ボタンの disabled 条件: 前へは currentPage === 1、次へは currentPage === totalPages',
        ],
        expectedKeywords: ['Math.ceil', 'slice', 'useState', 'disabled'],
        starterCode: `const items = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: \`アイテム \${i + 1}\` }))
const ITEMS_PER_PAGE = 5

function PaginatedList() {
  const [currentPage, setCurrentPage] = useState(1)

  // TODO: totalPages と currentItems を計算する

  return (
    <div>
      <ul>
        {/* TODO: currentItems を表示 */}
      </ul>
      <div>
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          // TODO: disabled 条件を追加
        >
          前へ
        </button>
        <span>{currentPage} / {/* totalPages */}</span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          // TODO: disabled 条件を追加
        >
          次へ
        </button>
      </div>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `const items = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: "アイテム " + (i + 1) }))\nconst ITEMS_PER_PAGE = 5\n\nfunction PaginatedList() {\n  const [currentPage, setCurrentPage] = useState(1)\n\n  ____0\n\n  return (\n    <div>\n      <ul>\n        {currentItems.map((item) => (\n          <li key={item.id}>{item.name}</li>\n        ))}\n      </ul>\n      <button onClick={() => setCurrentPage((p) => p - 1)} ____1>前へ</button>\n      <span>{currentPage} / {totalPages}</span>\n      <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage >= totalPages}>次へ</button>\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'page-calc',
                label: 'ページ計算',
                correctTokens: ['const totalPages', '=', 'Math.ceil', '(', 'items.length / ITEMS_PER_PAGE', ')', 'const startIndex', '=', '(currentPage - 1) * ITEMS_PER_PAGE', 'const currentItems', '=', 'items.slice(startIndex, startIndex + ITEMS_PER_PAGE)'],
                distractorTokens: ['Math.floor', 'Math.round', 'splice', 'filter', 'forEach'],
              },
              {
                id: 'prev-disabled',
                label: '前へdisabled',
                correctTokens: ['disabled={currentPage <= 1}'],
                distractorTokens: ['disabled={!currentPage}', 'hidden', 'readOnly', 'disabled'],
              },
            ],
          },
      },
      {
        id: 'pagination-2',
        prompt: 'useSearchParams を使ってURL連動ページネーションを実装してください。',
        requirements: [
          'useSearchParams でURLの ?page=N を読み書きする',
          'searchParams.get("page") がない場合はデフォルト 1 を使う',
          'setSearchParams でページ変更をURLに反映する',
          '1ページ8件でデータをスライスして表示する',
          'ページ番号ボタン（1〜totalPages）を並べて表示する',
        ],
        hints: [
          'Number(searchParams.get("page") ?? "1") でページ番号を取得します',
          'setSearchParams({ page: String(page) }) でURL更新します',
          'Array.from({ length: totalPages }, (_, i) => i + 1) でページ番号配列を生成します',
        ],
        expectedKeywords: ['useSearchParams', 'searchParams', 'setSearchParams'],
        starterCode: `import { useSearchParams } from 'react-router-dom'

const items = Array.from({ length: 30 }, (_, i) => \`アイテム \${i + 1}\`)
const ITEMS_PER_PAGE = 8

function PaginatedList() {
  const [searchParams, setSearchParams] = useSearchParams()
  // TODO: currentPage を searchParams から取得（デフォルト1）

  // TODO: totalPages と currentItems を計算

  return (
    <div>
      <ul>
        {/* TODO: currentItems を表示 */}
      </ul>
      <div>
        {/* TODO: ページ番号ボタンを表示 */}
      </div>
    </div>
  )
}`,
          mobilePuzzle: {
            type: 'multi',
            codeContext: `import { useSearchParams } from 'react-router-dom'\n\nconst items = Array.from({ length: 30 }, (_, i) => "アイテム " + (i + 1))\nconst ITEMS_PER_PAGE = 8\n\nfunction PaginatedList() {\n  ____0\n\n  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)\n  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE\n  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE)\n\n  return (\n    <div>\n      <ul>\n        {currentItems.map((item, i) => (<li key={i}>{item}</li>))}\n      </ul>\n      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (\n        <button key={page} ____1>{page}</button>\n      ))}\n    </div>\n  )\n}`,
            blanks: [
              {
                id: 'use-search-params',
                label: 'useSearchParams',
                correctTokens: ['const', '[searchParams, setSearchParams]', '=', 'useSearchParams()', 'const currentPage', '=', "Number(searchParams.get('page') ?? '1')"],
                distractorTokens: ['useParams', 'useNavigate', 'useLocation', 'window.location'],
              },
              {
                id: 'page-change',
                label: 'ページ変更',
                correctTokens: ['onClick={() => setSearchParams({ page: String(page) })}'],
                distractorTokens: ['useNavigate', 'history.push', 'window.location', 'onChange'],
              },
            ],
          },
      },
    ],
  },
}

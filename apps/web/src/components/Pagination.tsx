import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number // 1-based
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * 共通ページネーション。totalPages <= 1 のとき非表示。
 * 5ページ以下: 全番号表示 / 6ページ以上: 省略記号付き
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="ページネーション">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
        aria-label="前のページ"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="flex min-h-[44px] min-w-[36px] items-center justify-center text-sm text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={[
              'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
        aria-label="次のページ"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  )
}

/** ページ番号配列を生成。5ページ以下なら全表示、6以上なら省略記号付き */
function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (current > 3) {
    pages.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  pages.push(total)
  return pages
}

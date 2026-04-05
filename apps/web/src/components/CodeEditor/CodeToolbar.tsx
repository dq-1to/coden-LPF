import { useMemo } from 'react'
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible'

const SYMBOL_PAIRS: Array<{ label: string; insert: string; cursorOffset?: number }> = [
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '=>', insert: '=> ' },
  { label: ';', insert: ';' },
  { label: ':', insert: ': ' },
  { label: '=', insert: '= ' },
  { label: '" "', insert: '""', cursorOffset: 1 },
  { label: "' '", insert: "''", cursorOffset: 1 },
  { label: '` `', insert: '``', cursorOffset: 1 },
  { label: '//', insert: '// ' },
]

const REACT_COMMON_KEYWORDS = [
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'return', 'export', 'import', 'function', 'const',
]

const MAX_SUGGESTIONS = 8

interface CodeToolbarProps {
  keywords?: string[]
  onInsert: (text: string, cursorOffset?: number) => void
}

export function CodeToolbar({ keywords, onInsert }: CodeToolbarProps) {
  const keyboardVisible = useKeyboardVisible()

  const suggestions = useMemo(
    () => [...new Set([...(keywords ?? []), ...REACT_COMMON_KEYWORDS])].slice(0, MAX_SUGGESTIONS),
    [keywords],
  )

  if (!keyboardVisible) return null

  return (
    <div className="sticky bottom-0 border-t border-slate-600 bg-slate-800 px-2 py-1.5">
      {/* 記号バー */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5">
        {SYMBOL_PAIRS.map((pair) => (
          <button
            key={pair.label}
            type="button"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-500 bg-slate-700 px-2 font-mono text-sm text-slate-200 active:bg-slate-600"
            onPointerDown={(e) => {
              e.preventDefault()
              onInsert(pair.insert, pair.cursorOffset)
            }}
          >
            {pair.label}
          </button>
        ))}
      </div>

      {/* キーワードサジェスト */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {suggestions.map((kw) => (
            <button
              key={kw}
              type="button"
              className="rounded-lg bg-slate-700 px-3 py-2 font-mono text-sm text-slate-200 active:bg-slate-600"
              onPointerDown={(e) => {
                e.preventDefault()
                onInsert(kw)
              }}
            >
              {kw}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

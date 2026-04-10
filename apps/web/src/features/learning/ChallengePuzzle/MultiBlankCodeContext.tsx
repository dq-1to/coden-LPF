import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'

interface BlankInfo {
  label: string
  tokens: string[]
}

interface MultiBlankCodeContextProps {
  code: string
  blanks: BlankInfo[]
  activeIndex: number
  onBlankTap: (index: number) => void
}

export function MultiBlankCodeContext({ code, blanks, activeIndex, onBlankTap }: MultiBlankCodeContextProps) {
  const lang = Prism.languages['tsx'] ?? Prism.languages['javascript']
  const langName = Prism.languages['tsx'] ? 'tsx' : 'javascript'

  // Split by ____0, ____1, ____2, etc.
  const parts = code.split(/____(\d+)/)

  return (
    <pre className="overflow-x-auto font-mono text-sm bg-slate-900 rounded-lg p-3">
      {parts.map((part, i) => {
        // Even indices are code, odd indices are blank numbers
        if (i % 2 === 0) {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{
                __html: lang ? Prism.highlight(part, lang, langName) : part,
              }}
            />
          )
        }
        const blankIndex = Number(part)
        const blank = blanks[blankIndex]
        if (!blank) return null
        const isActive = blankIndex === activeIndex
        const hasTokens = blank.tokens.length > 0

        return (
          <button
            key={i}
            type="button"
            onClick={() => onBlankTap(blankIndex)}
            className={`inline-block px-2 py-0.5 rounded text-sm font-medium cursor-pointer transition-colors ${
              isActive
                ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-400'
                : hasTokens
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-amber-500/20 text-amber-400'
            }`}
            aria-label={blank.label}
            aria-pressed={isActive}
          >
            {hasTokens ? blank.tokens.join(' ') : `${blank.label}`}
          </button>
        )
      })}
    </pre>
  )
}

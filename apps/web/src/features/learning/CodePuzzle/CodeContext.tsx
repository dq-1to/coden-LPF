import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'

interface CodeContextProps {
  code: string
  blankLabel?: string
}

export function CodeContext({ code, blankLabel = '▼ ここを組み立て' }: CodeContextProps) {
  const parts = code.split('____')
  const lang = Prism.languages['tsx'] ?? Prism.languages['javascript']
  const langName = Prism.languages['tsx'] ? 'tsx' : 'javascript'

  return (
    <pre className="overflow-x-auto font-mono text-sm bg-slate-900 rounded-lg p-3">
      {parts.map((part, index) => (
        <span key={index}>
          <span
            dangerouslySetInnerHTML={{
              __html: lang ? Prism.highlight(part, lang, langName) : part,
            }}
          />
          {index < parts.length - 1 && (
            <span className="inline-block bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm font-medium">
              {blankLabel}
            </span>
          )}
        </span>
      ))}
    </pre>
  )
}

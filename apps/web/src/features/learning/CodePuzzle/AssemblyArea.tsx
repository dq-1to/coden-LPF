import { Token } from './Token'

interface AssemblyAreaProps {
  tokens: string[]
  onTokenTap: (index: number) => void
}

export function AssemblyArea({ tokens, onTokenTap }: AssemblyAreaProps) {
  if (tokens.length === 0) {
    return (
      <div
        role="region"
        aria-label="組み立てエリア"
        className="min-h-[60px] rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center"
      >
        <span className="text-sm text-slate-500">パーツをタップして組み立てよう</span>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label="組み立てエリア"
      className="flex flex-wrap gap-1.5 p-3 min-h-[60px] bg-slate-900/50 rounded-lg border border-slate-600"
    >
      {tokens.map((token, index) => (
        <Token
          key={index}
          text={token}
          onClick={() => onTokenTap(index)}
          variant="assembled"
        />
      ))}
    </div>
  )
}

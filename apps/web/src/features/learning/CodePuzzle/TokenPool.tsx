import { Token } from './Token'

interface TokenPoolProps {
  tokens: string[]
  usedTokens: Set<number>
  onTokenTap: (index: number) => void
}

export function TokenPool({ tokens, usedTokens, onTokenTap }: TokenPoolProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-1.5">使えるパーツ</p>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg">
        {tokens.map((token, index) => {
          const isUsed = usedTokens.has(index)
          return (
            <Token
              key={index}
              text={token}
              onClick={() => onTokenTap(index)}
              variant="pool"
              disabled={isUsed}
            />
          )
        })}
      </div>
    </div>
  )
}

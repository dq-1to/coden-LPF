import { useCallback, useEffect, useState } from 'react'
import type { ChallengeMobilePuzzleSimple } from '../../../content/fundamentals/steps'
import { seededShuffle } from '../CodePuzzle/useTokenGenerator'
import { CodeContext } from '../CodePuzzle/CodeContext'
import { AssemblyArea } from '../CodePuzzle/AssemblyArea'
import { TokenPool } from '../CodePuzzle/TokenPool'
import { Button } from '../../../components/Button'

interface ChallengePuzzleSimpleProps {
  puzzle: ChallengeMobilePuzzleSimple
  onCodeChange: (code: string) => void
}

export function ChallengePuzzleSimple({ puzzle, onCodeChange }: ChallengePuzzleSimpleProps) {
  const allTokens = seededShuffle(
    [...puzzle.correctTokens, ...puzzle.distractorTokens],
    puzzle.correctTokens.join('').length + puzzle.distractorTokens.join('').length,
  )

  const [assembled, setAssembled] = useState<string[]>([])
  const [usedTokens, setUsedTokens] = useState<Set<number>>(new Set())

  useEffect(() => {
    const mergedCode = puzzle.codeContext.replace('____', assembled.join(' '))
    onCodeChange(mergedCode)
  }, [assembled, onCodeChange, puzzle.codeContext])

  const handlePoolTap = useCallback(
    (index: number) => {
      const token = allTokens[index]
      if (token === undefined) return
      setAssembled((prev) => [...prev, token])
      setUsedTokens((prev) => new Set(prev).add(index))
    },
    [allTokens],
  )

  const handleAssembledTap = useCallback(
    (assembledIndex: number) => {
      const removedToken = assembled[assembledIndex]
      if (removedToken === undefined) return
      setAssembled((prev) => prev.filter((_, i) => i !== assembledIndex))
      // Find the pool index to un-use
      for (const idx of usedTokens) {
        if (allTokens[idx] === removedToken) {
          // Check this pool index hasn't been re-used by another assembled token
          const stillUsedByOther = assembled.some(
            (t, i) => i !== assembledIndex && t === removedToken && [...usedTokens].indexOf(idx) !== -1,
          )
          if (!stillUsedByOther) {
            setUsedTokens((prev) => {
              const next = new Set(prev)
              next.delete(idx)
              return next
            })
            break
          }
        }
      }
    },
    [allTokens, assembled, usedTokens],
  )

  const handleClear = useCallback(() => {
    setAssembled([])
    setUsedTokens(new Set())
  }, [])

  return (
    <div className="space-y-3">
      <CodeContext code={puzzle.codeContext} />
      <AssemblyArea tokens={assembled} onTokenTap={handleAssembledTap} />
      <TokenPool tokens={allTokens} usedTokens={usedTokens} onTokenTap={handlePoolTap} />
      <Button size="sm" variant="secondary" onClick={handleClear}>
        クリア
      </Button>
    </div>
  )
}

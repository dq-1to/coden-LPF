import { useCallback, useState } from 'react'
import { Button } from '../../../components/Button'
import type { TestTask } from '../../../content/fundamentals/steps'
import { AssemblyArea } from './AssemblyArea'
import { CodeContext } from './CodeContext'
import { TokenPool } from './TokenPool'
import { useTokenGenerator } from './useTokenGenerator'

interface CodePuzzleProps {
  task: TestTask
  onSubmit: (mergedCode: string) => void
}

export function CodePuzzle({ task, onSubmit }: CodePuzzleProps) {
  const [assembledTokens, setAssembledTokens] = useState<string[]>([])
  const [usedPoolIndices, setUsedPoolIndices] = useState<Set<number>>(new Set())

  const { allTokens } = useTokenGenerator({
    starterCode: task.starterCode,
    expectedKeywords: task.expectedKeywords,
  })

  const handleAddToken = useCallback(
    (poolIndex: number) => {
      const token = allTokens[poolIndex]
      if (token === undefined || usedPoolIndices.has(poolIndex)) return
      setAssembledTokens((prev) => [...prev, token])
      setUsedPoolIndices((prev) => {
        const next = new Set(prev)
        next.add(poolIndex)
        return next
      })
    },
    [allTokens, usedPoolIndices],
  )

  const handleRemoveToken = useCallback(
    (assembledIndex: number) => {
      const tokenText = assembledTokens[assembledIndex]
      if (tokenText === undefined) return

      // Find the corresponding pool index for this token
      const poolIndex = allTokens.findIndex(
        (t, idx) => t === tokenText && usedPoolIndices.has(idx),
      )

      setAssembledTokens((prev) => prev.filter((_, i) => i !== assembledIndex))
      if (poolIndex !== -1) {
        setUsedPoolIndices((prev) => {
          const next = new Set(prev)
          next.delete(poolIndex)
          return next
        })
      }
    },
    [assembledTokens, allTokens, usedPoolIndices],
  )

  const handleClear = useCallback(() => {
    setAssembledTokens([])
    setUsedPoolIndices(new Set())
  }, [])

  const handleSubmit = useCallback(() => {
    const answer = assembledTokens.join(' ')
    const mergedCode = task.starterCode.replace('____', answer)
    onSubmit(mergedCode)
  }, [assembledTokens, task.starterCode, onSubmit])

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-slate-700">{task.instruction}</p>
      <CodeContext code={task.starterCode} />
      <AssemblyArea tokens={assembledTokens} onTokenTap={handleRemoveToken} />
      <TokenPool tokens={allTokens} usedTokens={usedPoolIndices} onTokenTap={handleAddToken} />
      <div className="flex gap-2">
        <Button size="lg" onClick={handleSubmit} disabled={assembledTokens.length === 0}>
          判定する
        </Button>
        {assembledTokens.length > 0 && (
          <Button size="lg" variant="secondary" onClick={handleClear}>
            クリア
          </Button>
        )}
      </div>
    </div>
  )
}

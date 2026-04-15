import { useCallback, useEffect, useState } from 'react'
import type { ChallengeMobilePuzzle } from '../../../content/fundamentals/steps'
import { seededShuffle } from '../CodePuzzle/useTokenGenerator'
import { MultiBlankCodeContext } from './MultiBlankCodeContext'
import { AssemblyArea } from '../CodePuzzle/AssemblyArea'
import { TokenPool } from '../CodePuzzle/TokenPool'
import { Button } from '../../../components/Button'

interface ChallengePuzzleMultiProps {
  puzzle: ChallengeMobilePuzzle
  onCodeChange: (code: string) => void
}

interface BlankState {
  assembled: string[]
  usedTokens: Set<number>
}

function buildAllTokens(correct: string[], distractor: string[]): string[] {
  const seed = correct.join('').length + distractor.join('').length
  return seededShuffle([...correct, ...distractor], seed)
}

export function ChallengePuzzleMulti({ puzzle, onCodeChange }: ChallengePuzzleMultiProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [blankStates, setBlankStates] = useState<BlankState[]>(() =>
    puzzle.blanks.map(() => ({ assembled: [], usedTokens: new Set<number>() })),
  )

  // Precompute all tokens per blank
  const allTokensPerBlank = puzzle.blanks.map((blank) =>
    buildAllTokens(blank.correctTokens, blank.distractorTokens),
  )

  // Merge assembled tokens into code context and notify parent
  useEffect(() => {
    let merged = puzzle.codeContext
    for (let i = 0; i < puzzle.blanks.length; i++) {
      const state = blankStates[i]
      merged = merged.replace(`____${i}`, state ? state.assembled.join(' ') : '')
    }
    onCodeChange(merged)
  }, [blankStates, onCodeChange, puzzle.blanks.length, puzzle.codeContext])

  const activeBlank = puzzle.blanks[activeIndex]
  const activeState = blankStates[activeIndex]
  const activeAllTokens = allTokensPerBlank[activeIndex]

  const handlePoolTap = useCallback(
    (index: number) => {
      if (!activeAllTokens) return
      const token = activeAllTokens[index]
      if (token === undefined) return
      setBlankStates((prev) =>
        prev.map((state, i) =>
          i === activeIndex
            ? { assembled: [...state.assembled, token], usedTokens: new Set(state.usedTokens).add(index) }
            : state,
        ),
      )
    },
    [activeIndex, activeAllTokens],
  )

  const handleAssembledTap = useCallback(
    (assembledIndex: number) => {
      if (!activeState || !activeAllTokens) return
      const removedToken = activeState.assembled[assembledIndex]
      if (removedToken === undefined) return

      setBlankStates((prev) =>
        prev.map((state, i) => {
          if (i !== activeIndex) return state
          const newAssembled = state.assembled.filter((_, idx) => idx !== assembledIndex)
          const newUsed = new Set(state.usedTokens)
          // Release the pool index
          for (const idx of state.usedTokens) {
            if (activeAllTokens[idx] === removedToken) {
              newUsed.delete(idx)
              break
            }
          }
          return { assembled: newAssembled, usedTokens: newUsed }
        }),
      )
    },
    [activeIndex, activeState, activeAllTokens],
  )

  const handleClearActive = useCallback(() => {
    setBlankStates((prev) =>
      prev.map((state, i) =>
        i === activeIndex ? { assembled: [], usedTokens: new Set<number>() } : state,
      ),
    )
  }, [activeIndex])

  if (!activeBlank || !activeState || !activeAllTokens) return null

  // Build blank info for code context display
  const blankInfos = puzzle.blanks.map((blank, i) => ({
    label: blank.label,
    tokens: blankStates[i]?.assembled ?? [],
  }))

  return (
    <div className="space-y-3">
      <MultiBlankCodeContext
        code={puzzle.codeContext}
        blanks={blankInfos}
        activeIndex={activeIndex}
        onBlankTap={setActiveIndex}
      />

      <p className="text-xs font-medium text-slate-500">
        {activeBlank.label}:
      </p>

      <AssemblyArea tokens={activeState.assembled} onTokenTap={handleAssembledTap} />
      <TokenPool tokens={activeAllTokens} usedTokens={activeState.usedTokens} onTokenTap={handlePoolTap} />
      <Button size="sm" variant="secondary" onClick={handleClearActive}>
        クリア
      </Button>
    </div>
  )
}

import { describe, expect, it } from 'vitest'
import { judgeKeywords } from '../../lib/judge'
import {
  fundamentalsSteps,
  resolvePrimaryPattern,
  type ChallengePattern,
  type LearningStepContent,
} from '../fundamentals/steps'
import { intermediateSteps } from '../intermediate/steps'
import { advancedSteps } from '../advanced/steps'
import { apiPracticeSteps } from '../api-practice/steps'
import { typescriptSteps } from '../typescript/steps'
import { typescriptReactSteps } from '../typescript-react/steps'
import { reactModernSteps } from '../react-modern/steps'
import { reactPatternsSteps } from '../react-patterns/steps'

// 全コンテンツを結合（stepWalkthrough.test.ts と同じ集合）
const allContentSteps: LearningStepContent[] = [
  ...fundamentalsSteps,
  ...intermediateSteps,
  ...advancedSteps,
  ...apiPracticeSteps,
  ...typescriptSteps,
  ...typescriptReactSteps,
  ...reactModernSteps,
  ...reactPatternsSteps,
]

/**
 * ChallengePuzzleMulti.tsx の組み立てロジック（correctTokens.join(' ') を
 * ____i に差し込む）と同一手順で、モバイルパズルの正解組み立て結果を再現する。
 */
function assembleMobilePuzzleCode(pattern: ChallengePattern): string {
  const puzzle = pattern.mobilePuzzle
  if (!puzzle) throw new Error(`${pattern.id}: mobilePuzzle が未設定`)

  let code = puzzle.codeContext
  puzzle.blanks.forEach((blank, i) => {
    code = code.replace(`____${i}`, blank.correctTokens.join(' '))
  })
  return code
}

describe('モバイル Challenge パズルの judge 整合性', () => {
  const patternsWithPuzzle: { stepId: string; pattern: ChallengePattern }[] = []
  for (const step of allContentSteps) {
    for (const pattern of step.challengeTask.patterns) {
      if (pattern.mobilePuzzle) {
        patternsWithPuzzle.push({ stepId: step.id, pattern })
      }
    }
  }

  it('mobilePuzzle を持つパターンが存在する', () => {
    expect(patternsWithPuzzle.length).toBeGreaterThan(0)
  })

  it.each(patternsWithPuzzle)(
    '$stepId / $pattern.id: correctTokens を組み立てたコードが judgeKeywords で passed になる',
    ({ pattern }) => {
      const assembled = assembleMobilePuzzleCode(pattern)
      const result = judgeKeywords(assembled, {
        requiredKeywords: pattern.expectedKeywords,
        ngKeywords: pattern.ngKeywords,
        anyOf: pattern.anyOf,
        passThreshold: pattern.passThreshold,
      })
      expect(result.passed, `missing: ${result.missing.join(', ')} / violations: ${result.violations.join(', ')}`).toBe(true)
    },
  )

  it('代表（primary）パターンが mobilePuzzle を持つ', () => {
    const missingPrimary = allContentSteps
      .map((step) => ({ stepId: step.id, primary: resolvePrimaryPattern(step.challengeTask) }))
      .filter(({ primary }) => !primary.mobilePuzzle)

    expect(missingPrimary.map((m) => m.stepId)).toEqual([])
  })
})

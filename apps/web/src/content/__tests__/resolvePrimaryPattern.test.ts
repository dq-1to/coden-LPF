import { describe, expect, it } from 'vitest'
import { resolvePrimaryPattern, type ChallengeTask } from '../fundamentals/steps'

function makeTask(overrides: Partial<ChallengeTask> = {}): ChallengeTask {
  return {
    patterns: [
      { id: 'pattern-a', prompt: 'A', requirements: [], hints: [], expectedKeywords: [], starterCode: 'A' },
      { id: 'pattern-b', prompt: 'B', requirements: [], hints: [], expectedKeywords: [], starterCode: 'B' },
    ],
    ...overrides,
  }
}

describe('resolvePrimaryPattern', () => {
  it('primaryPatternId が一致するパターンを返す', () => {
    const task = makeTask({ primaryPatternId: 'pattern-b' })
    expect(resolvePrimaryPattern(task).id).toBe('pattern-b')
  })

  it('primaryPatternId 未指定なら先頭パターンへ fallback する', () => {
    const task = makeTask()
    expect(resolvePrimaryPattern(task).id).toBe('pattern-a')
  })

  it('primaryPatternId が一致しない場合も先頭パターンへ fallback する', () => {
    const task = makeTask({ primaryPatternId: 'does-not-exist' })
    expect(resolvePrimaryPattern(task).id).toBe('pattern-a')
  })

  it('複数回呼んでも同じパターンを返す（決定論的）', () => {
    const task = makeTask({ primaryPatternId: 'pattern-b' })
    const first = resolvePrimaryPattern(task)
    const second = resolvePrimaryPattern(task)
    expect(first.id).toBe(second.id)
  })

  it('パターンが空の場合はエラーを投げる', () => {
    expect(() => resolvePrimaryPattern({ patterns: [] })).toThrow()
  })
})

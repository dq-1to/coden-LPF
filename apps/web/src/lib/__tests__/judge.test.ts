import { describe, it, expect } from 'vitest'
import { judgeKeywords } from '../judge'

describe('judgeKeywords', () => {
  it('必須キーワードをすべて含めば passed: true / score 100', () => {
    const result = judgeKeywords('const [c, setC] = useState(0)', {
      requiredKeywords: ['useState', 'setC'],
    })
    expect(result.passed).toBe(true)
    expect(result.score).toBe(100)
    expect(result.matched).toEqual(['useState', 'setC'])
    expect(result.missing).toHaveLength(0)
    expect(result.violations).toHaveLength(0)
  })

  it('一部のみ満たす場合は部分点 score と missing を返す（passed は false）', () => {
    const result = judgeKeywords('const x = useState(0)', {
      requiredKeywords: ['useState', 'onClick', 'return', 'props'],
    })
    expect(result.passed).toBe(false)
    expect(result.score).toBe(25)
    expect(result.matched).toEqual(['useState'])
    expect(result.missing).toEqual(['onClick', 'return', 'props'])
  })

  it('ngKeywords を含むと violations に入り passed: false（必須は満たしていても）', () => {
    const result = judgeKeywords('var x = 1; useState()', {
      requiredKeywords: ['useState'],
      ngKeywords: ['var '],
    })
    expect(result.matched).toEqual(['useState'])
    expect(result.violations).toEqual(['var '])
    expect(result.passed).toBe(false)
    // 必須は満たすため score は満点だが passed は違反で false
    expect(result.score).toBe(100)
  })

  it('大文字小文字を区別しない', () => {
    const result = judgeKeywords('USESTATE()', { requiredKeywords: ['useState'] })
    expect(result.passed).toBe(true)
  })

  it('requiredKeywords が空なら score 100 / passed: true', () => {
    const result = judgeKeywords('anything', { requiredKeywords: [] })
    expect(result.passed).toBe(true)
    expect(result.score).toBe(100)
  })

  it('ngKeywords 未指定でも違反なしとして扱う', () => {
    const result = judgeKeywords('useState', { requiredKeywords: ['useState'] })
    expect(result.violations).toEqual([])
    expect(result.passed).toBe(true)
  })
})

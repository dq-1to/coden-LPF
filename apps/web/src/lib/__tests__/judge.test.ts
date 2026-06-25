import { describe, it, expect } from 'vitest'
import { judgeKeywordConditions, judgeKeywords } from '../judge'

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

  describe('anyOf（複数正解パターン）', () => {
    it('いずれかの候補を満たせば passed: true', () => {
      const input = { anyOf: [['count + 1'], ['c => c + 1']] }
      expect(judgeKeywords('setCount(count + 1)', input).passed).toBe(true)
      expect(judgeKeywords('setCount(c => c + 1)', input).passed).toBe(true)
    })

    it('どの候補も満たさなければ passed: false で最も近い候補の missing を返す', () => {
      const result = judgeKeywords('setCount(0)', {
        anyOf: [
          ['count', '+ 1'],
          ['prev', '=> prev'],
        ],
      })
      expect(result.passed).toBe(false)
      // 'count' のみ一致する最初の候補が採用される
      expect(result.matched).toEqual(['count'])
      expect(result.missing).toEqual(['+ 1'])
    })

    it('requiredKeywords と anyOf は AND される', () => {
      const input = { requiredKeywords: ['setCount'], anyOf: [['count + 1'], ['c => c + 1']] }
      expect(judgeKeywords('setCount(count + 1)', input).passed).toBe(true)
      // anyOf は満たすが必須が無い
      expect(judgeKeywords('setX(count + 1)', input).passed).toBe(false)
    })

    it('完全充足した短い候補を一致数の多い未充足候補より優先する', () => {
      // ['a','b','c'] は一致2だが未充足、['x'] は一致1だが完全充足
      const result = judgeKeywords('a b x', { anyOf: [['a', 'b', 'c'], ['x']] })
      expect(result.passed).toBe(true)
      expect(result.matched).toEqual(['x'])
      expect(result.missing).toEqual([])
    })
  })

  describe('passThreshold（部分点での合格）', () => {
    it('閾値以上の score で passed: true（一部不足でも合格）', () => {
      const result = judgeKeywords('useState onClick', {
        requiredKeywords: ['useState', 'onClick', 'return', 'props'],
        passThreshold: 50,
      })
      expect(result.score).toBe(50)
      expect(result.passed).toBe(true)
      expect(result.missing).toEqual(['return', 'props'])
    })

    it('閾値未満なら passed: false', () => {
      const result = judgeKeywords('useState', {
        requiredKeywords: ['useState', 'onClick', 'return', 'props'],
        passThreshold: 50,
      })
      expect(result.score).toBe(25)
      expect(result.passed).toBe(false)
    })

    it('閾値を満たしても violations があれば passed: false', () => {
      const result = judgeKeywords('useState onClick var x', {
        requiredKeywords: ['useState', 'onClick'],
        ngKeywords: ['var '],
        passThreshold: 50,
      })
      expect(result.score).toBe(100)
      expect(result.passed).toBe(false)
    })
  })
})

describe('judgeKeywordConditions', () => {
  it('全条件を満たすと passed: true / score 100 を返す', () => {
    const result = judgeKeywordConditions('setCount(count - 1); onClick={handleClick}', [
      {
        id: 'state-update',
        label: 'state更新',
        requiredKeywords: ['setCount', 'count - 1'],
        explanation: 'setCount で count を更新できているか確認しましょう。',
      },
      {
        id: 'event-handler',
        label: 'イベント接続',
        requiredKeywords: ['onClick'],
        explanation: 'ボタンのクリック処理に接続できているか確認しましょう。',
      },
    ])

    expect(result.passed).toBe(true)
    expect(result.score).toBe(100)
    expect(result.conditions).toHaveLength(2)
    expect(result.satisfiedConditions.map((condition) => condition.id)).toEqual(['state-update', 'event-handler'])
    expect(result.unsatisfiedConditions).toHaveLength(0)
  })

  it('不足条件をラベルと説明つきで返す', () => {
    const result = judgeKeywordConditions('setCount(count - 1)', [
      {
        id: 'state-update',
        label: 'state更新',
        requiredKeywords: ['setCount', 'count - 1'],
        explanation: 'setCount で count を更新できているか確認しましょう。',
      },
      {
        id: 'event-handler',
        label: 'イベント接続',
        requiredKeywords: ['onClick'],
        explanation: 'ボタンのクリック処理に接続できているか確認しましょう。',
      },
    ])

    expect(result.passed).toBe(false)
    expect(result.score).toBe(50)
    expect(result.satisfiedConditions.map((condition) => condition.id)).toEqual(['state-update'])
    expect(result.unsatisfiedConditions).toHaveLength(1)
    expect(result.unsatisfiedConditions[0]).toMatchObject({
      id: 'event-handler',
      label: 'イベント接続',
      explanation: 'ボタンのクリック処理に接続できているか確認しましょう。',
      missing: ['onClick'],
    })
  })

  it('条件ごとの anyOf と passThreshold を既存判定と同じように扱う', () => {
    const result = judgeKeywordConditions('setCount(prev => prev + 1)', [
      {
        id: 'increment',
        label: '増加処理',
        requiredKeywords: ['setCount'],
        anyOf: [['count + 1'], ['prev => prev + 1']],
        explanation: '現在値をもとに1増やせているか確認しましょう。',
      },
      {
        id: 'partial',
        label: '部分条件',
        requiredKeywords: ['setCount', 'onClick'],
        passThreshold: 50,
        explanation: '必要な要素を組み合わせられているか確認しましょう。',
      },
    ])

    expect(result.passed).toBe(true)
    expect(result.score).toBe(100)
    expect(result.satisfiedConditions).toHaveLength(2)
  })

  it('条件内の ngKeywords 違反を不足条件として扱う', () => {
    const result = judgeKeywordConditions('var count = 0; setCount(count + 1)', [
      {
        id: 'safe-update',
        label: '安全な更新',
        requiredKeywords: ['setCount'],
        ngKeywords: ['var '],
        explanation: '避けたい書き方を含めずに実装できているか確認しましょう。',
      },
    ])

    expect(result.passed).toBe(false)
    expect(result.score).toBe(0)
    expect(result.unsatisfiedConditions[0]?.violations).toEqual(['var '])
  })

  it('条件が空なら互換的に passed: true / score 100 を返す', () => {
    const result = judgeKeywordConditions('anything', [])

    expect(result.passed).toBe(true)
    expect(result.score).toBe(100)
    expect(result.conditions).toEqual([])
    expect(result.satisfiedConditions).toEqual([])
    expect(result.unsatisfiedConditions).toEqual([])
  })
})

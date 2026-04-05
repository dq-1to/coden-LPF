import { describe, it, expect } from 'vitest'
import { estimateBuggyLines } from '../estimateBuggyLines'
import type { CodeDoctorProblem } from '../types'

const baseProblem: CodeDoctorProblem = {
  id: 'test-1',
  category: 'react',
  difficulty: 'beginner',
  title: 'Test Problem',
  description: 'Test description',
  buggyCode: '',
  hint: 'Test hint',
  requiredKeywords: [],
  ngKeywords: [],
  explanation: 'Test explanation',
}

describe('estimateBuggyLines', () => {
  it('ngKeywords にマッチする行を正しく返す', () => {
    const problem: CodeDoctorProblem = {
      ...baseProblem,
      buggyCode: 'const x = 1\nsetState(x)\nconst y = 2',
      ngKeywords: ['setState'],
    }
    expect(estimateBuggyLines(problem)).toEqual([2])
  })

  it('大文字小文字を無視する', () => {
    const problem: CodeDoctorProblem = {
      ...baseProblem,
      buggyCode: 'const a = 0\nSetState(a)\nreturn a',
      ngKeywords: ['setState'],
    }
    expect(estimateBuggyLines(problem)).toEqual([2])
  })

  it('重複行を除去する', () => {
    const problem: CodeDoctorProblem = {
      ...baseProblem,
      buggyCode: 'foo bar\nbaz\nqux',
      ngKeywords: ['foo', 'bar'],
    }
    // line 1 に foo と bar が両方含まれるが、結果は [1] のみ
    expect(estimateBuggyLines(problem)).toEqual([1])
  })

  it('buggyLineNumbers が指定されていればそちらを返す', () => {
    const problem: CodeDoctorProblem = {
      ...baseProblem,
      buggyCode: 'const x = 1\nsetState(x)\nconst y = 2',
      ngKeywords: ['setState'],
      buggyLineNumbers: [3, 5],
    }
    expect(estimateBuggyLines(problem)).toEqual([3, 5])
  })

  it('ngKeywords がマッチしない場合は空配列', () => {
    const problem: CodeDoctorProblem = {
      ...baseProblem,
      buggyCode: 'const x = 1\nconst y = 2',
      ngKeywords: ['setState'],
    }
    expect(estimateBuggyLines(problem)).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import { DAILY_QUESTIONS } from '../daily/questions'

describe('DAILY_QUESTIONS ガード', () => {
  it('全問題の answer が空文字・空白のみでない', () => {
    const blank = DAILY_QUESTIONS.filter((q) => !q.answer.trim())
    expect(blank.map((q) => q.id)).toEqual([])
  })

  it('answer が DailyChallengeCard の送信可否条件（trim 後に非空）と矛盾しない', () => {
    for (const question of DAILY_QUESTIONS) {
      expect(question.answer.trim().length).toBeGreaterThan(0)
    }
  })

  it('prompt / explanation のコード表記に二重括弧 {{ }} が含まれない', () => {
    const broken = DAILY_QUESTIONS.filter(
      (q) => /\{\{|\}\}/.test(q.prompt) || /\{\{|\}\}/.test(q.explanation),
    )
    expect(broken.map((q) => q.id)).toEqual([])
  })

  it('prompt のコード行に全角括弧（）が混入していない', () => {
    // prompt は「説明文\nコード」の形式。\n 以降（コード部分）のみを対象とし、
    // 説明文中の日本語括弧（誤検知の元）を除外する。
    const broken = DAILY_QUESTIONS.filter((q) => {
      const newlineIndex = q.prompt.indexOf('\n')
      if (newlineIndex === -1) return false
      const codePart = q.prompt.slice(newlineIndex + 1)
      return /[（）]/.test(codePart)
    })
    expect(broken.map((q) => q.id)).toEqual([])
  })
})

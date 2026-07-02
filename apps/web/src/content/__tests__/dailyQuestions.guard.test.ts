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
})

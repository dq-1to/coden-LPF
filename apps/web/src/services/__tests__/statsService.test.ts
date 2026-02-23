import { describe, it, expect } from 'vitest'
import { applyStudyActivity } from '../statsService'
import type { LearningStats } from '../statsService'

const baseStats: LearningStats = {
  user_id: 'test-user',
  total_points: 0,
  current_streak: 0,
  max_streak: 0,
  last_study_date: null,
}

describe('applyStudyActivity', () => {
  it('同日に再度呼ばれた場合はストリーク・日付を変更しない', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = {
      ...baseStats,
      current_streak: 3,
      last_study_date: '2026-02-23',
    }

    const result = applyStudyActivity(stats, today)

    expect(result.current_streak).toBe(3)
    expect(result.last_study_date).toBe('2026-02-23')
  })

  it('前日が last_study_date の場合はストリークを 1 増加させる', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = {
      ...baseStats,
      current_streak: 2,
      last_study_date: '2026-02-22',
    }

    const result = applyStudyActivity(stats, today)

    expect(result.current_streak).toBe(3)
    expect(result.last_study_date).toBe('2026-02-23')
  })

  it('2日以上空いた場合はストリークを 1 にリセットする', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = {
      ...baseStats,
      current_streak: 5,
      last_study_date: '2026-02-20',
    }

    const result = applyStudyActivity(stats, today)

    expect(result.current_streak).toBe(1)
    expect(result.last_study_date).toBe('2026-02-23')
  })

  it('last_study_date が null の場合はストリーク 1 で開始する', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = { ...baseStats, last_study_date: null }

    const result = applyStudyActivity(stats, today)

    expect(result.current_streak).toBe(1)
    expect(result.last_study_date).toBe('2026-02-23')
  })

  it('ストリークが max_streak を超えたら max_streak を更新する', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = {
      ...baseStats,
      current_streak: 4,
      max_streak: 4,
      last_study_date: '2026-02-22',
    }

    const result = applyStudyActivity(stats, today)

    expect(result.current_streak).toBe(5)
    expect(result.max_streak).toBe(5)
  })

  it('元の stats オブジェクトを変更しない（immutable）', () => {
    const today = new Date('2026-02-23T10:00:00Z')
    const stats: LearningStats = {
      ...baseStats,
      current_streak: 2,
      last_study_date: '2026-02-22',
    }

    applyStudyActivity(stats, today)

    expect(stats.current_streak).toBe(2)
    expect(stats.last_study_date).toBe('2026-02-22')
  })
})

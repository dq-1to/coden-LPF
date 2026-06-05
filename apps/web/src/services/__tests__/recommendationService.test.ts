import { describe, expect, it } from 'vitest'
import { getRecommendedAction } from '../recommendationService'
import type { StepProgressRow } from '../progressService'
import type { StepMeta } from '../../content/courseData'

const steps: StepMeta[] = [
  {
    id: 'usestate-basic',
    order: 1,
    title: 'useState基礎',
    description: '状態管理の基本',
    isImplemented: true,
  },
  {
    id: 'events',
    order: 2,
    title: 'イベント処理',
    description: 'イベントの基本',
    isImplemented: true,
  },
]

function makeProgress(stepId: string, done: Partial<StepProgressRow>): StepProgressRow {
  return {
    user_id: 'user-1',
    step_id: stepId,
    read_done: false,
    practice_done: false,
    test_done: false,
    challenge_done: false,
    updated_at: '2026-06-03T00:00:00Z',
    completed_at: null,
    ...done,
  }
}

describe('getRecommendedAction', () => {
  it('復習キューが有効で復習待ちがある場合は復習を最優先する', () => {
    const action = getRecommendedAction({
      progress: [],
      reviewCount: 2,
      enableReviewQueue: true,
      steps,
    })

    expect(action.type).toBe('review')
    expect(action.title).toContain('復習')
    expect(action.to).toBe('/daily')
  })

  it('復習キューが無効な場合は復習待ちがあっても最初のステップを返す', () => {
    const action = getRecommendedAction({
      progress: [],
      reviewCount: 2,
      enableReviewQueue: false,
      steps,
    })

    expect(action.type).toBe('start')
    expect(action.stepId).toBe('usestate-basic')
  })

  it('未着手の場合は最初の実装済みステップを返す', () => {
    const action = getRecommendedAction({ progress: [], steps })

    expect(action.type).toBe('start')
    expect(action.title).toContain('useState基礎')
    expect(action.to).toBe('/step/usestate-basic')
  })

  it('進行中ステップの最初の未完了モードを返す', () => {
    const action = getRecommendedAction({
      progress: [
        makeProgress('usestate-basic', {
          read_done: true,
          practice_done: true,
        }),
      ],
      steps,
    })

    expect(action.type).toBe('resume')
    expect(action.stepId).toBe('usestate-basic')
    expect(action.mode).toBe('test')
    expect(action.title).toContain('Test')
  })

  it('完了済みステップの次にある未着手ステップを返す', () => {
    const action = getRecommendedAction({
      progress: [
        makeProgress('usestate-basic', {
          read_done: true,
          practice_done: true,
          test_done: true,
          challenge_done: true,
        }),
      ],
      steps,
    })

    expect(action.type).toBe('next')
    expect(action.stepId).toBe('events')
    expect(action.to).toBe('/step/events')
  })

  it('全ステップ完了済みの場合はスキルアップ導線を返す', () => {
    const action = getRecommendedAction({
      progress: [
        makeProgress('usestate-basic', {
          read_done: true,
          practice_done: true,
          test_done: true,
          challenge_done: true,
        }),
        makeProgress('events', {
          read_done: true,
          practice_done: true,
          test_done: true,
          challenge_done: true,
        }),
      ],
      steps,
    })

    expect(action.type).toBe('complete')
    expect(action.to).toBe('/practice/mini-projects')
  })
})

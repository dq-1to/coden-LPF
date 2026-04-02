import { describe, expect, it } from 'vitest'
import { getCourseLockStatus, isCourseCompleted } from '../courseLock'
import { findCourseById } from '../../content/courseData'
import type { CourseMeta } from '../../content/courseData'

// react-fundamentals のステップ ID（前提なし）
const FUNDAMENTALS_STEP_IDS = ['usestate-basic', 'events', 'conditional', 'lists']

// react-hooks は react-fundamentals が必須前提
const hooksCourse = findCourseById('react-hooks')!

// react-fundamentals は前提なし
const fundamentalsCourse = findCourseById('react-fundamentals')!

describe('getCourseLockStatus', () => {
  it('前提なしのコースは常に unlocked', () => {
    const result = getCourseLockStatus(fundamentalsCourse, new Set())
    expect(result.locked).toBe(false)
    expect(result).toEqual({ locked: false, warning: null })
  })

  it('必須前提が未完了ならロック', () => {
    const result = getCourseLockStatus(hooksCourse, new Set())
    expect(result.locked).toBe(true)
    if (result.locked) {
      expect(result.reason).toContain('React基礎')
    }
  })

  it('必須前提が完了済みなら unlocked', () => {
    const completed = new Set(FUNDAMENTALS_STEP_IDS)
    const result = getCourseLockStatus(hooksCourse, completed)
    expect(result.locked).toBe(false)
  })

  it('推奨前提が未完了なら warning 付きで unlocked', () => {
    const course: CourseMeta = {
      id: 'test-course',
      title: 'テスト',
      level: 'beginner',
      steps: [],
      requiredPrerequisites: [],
      recommendedPrerequisites: ['react-fundamentals'],
    }

    const result = getCourseLockStatus(course, new Set())
    expect(result.locked).toBe(false)
    if (!result.locked) {
      expect(result.warning).toContain('React基礎')
    }
  })

  it('推奨前提が完了済みなら warning なし', () => {
    const course: CourseMeta = {
      id: 'test-course',
      title: 'テスト',
      level: 'beginner',
      steps: [],
      requiredPrerequisites: [],
      recommendedPrerequisites: ['react-fundamentals'],
    }

    const completed = new Set(FUNDAMENTALS_STEP_IDS)
    const result = getCourseLockStatus(course, completed)
    expect(result).toEqual({ locked: false, warning: null })
  })

  it('必須前提が未完了なら推奨より優先してロック', () => {
    const course: CourseMeta = {
      id: 'test-course',
      title: 'テスト',
      level: 'advanced',
      steps: [],
      requiredPrerequisites: ['react-hooks'],
      recommendedPrerequisites: ['react-fundamentals'],
    }

    const result = getCourseLockStatus(course, new Set())
    expect(result.locked).toBe(true)
  })
})

describe('isCourseCompleted', () => {
  it('全ステップ完了で true', () => {
    const completed = new Set(FUNDAMENTALS_STEP_IDS)
    expect(isCourseCompleted('react-fundamentals', completed)).toBe(true)
  })

  it('一部未完了で false', () => {
    const completed = new Set(['usestate-basic', 'events'])
    expect(isCourseCompleted('react-fundamentals', completed)).toBe(false)
  })

  it('空セットで false', () => {
    expect(isCourseCompleted('react-fundamentals', new Set())).toBe(false)
  })

  it('存在しないコース ID で false', () => {
    expect(isCourseCompleted('nonexistent', new Set())).toBe(false)
  })
})

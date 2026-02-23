/**
 * 全20ステップ完走フロー通しテスト
 *
 * 検証項目:
 * 1. courseData の全ステップが isImplemented: true
 * 2. 全ステップに LearningStepContent 実装が存在する
 * 3. 各ステップの4モードコンテンツが仕様を満たす
 *    - readMarkdown: 空でない
 *    - practiceQuestions: 1問以上、各問が prompt/answer/hint を持つ
 *    - testTask: instruction/starterCode/expectedKeywords を持つ
 *    - challengeTask: 1パターン以上、各パターンが必須フィールドを持つ
 * 4. order の連続性（1〜20 が重複なく揃っている）
 * 5. courseData の順序と content の order が一致する
 * 6. getNextStep ナビゲーションが全ステップで正しく動作する
 * 7. course-4-complete / all-complete の実績判定が正しい
 */

import { describe, it, expect } from 'vitest'
import { COURSES, TOTAL_STEP_COUNT, IMPLEMENTED_STEP_COUNT, getNextStep, findStepMeta } from '../courseData'
import { fundamentalsSteps, getFundamentalsStep } from '../fundamentals/steps'
import { intermediateSteps, getIntermediateStep } from '../intermediate/steps'
import { advancedSteps, getAdvancedStep } from '../advanced/steps'
import { apiPracticeSteps, getApiPracticeStep } from '../api-practice/steps'
import type { LearningStepContent } from '../fundamentals/steps'

// 全コンテンツを order 順に結合
const allContentSteps: LearningStepContent[] = [
  ...fundamentalsSteps,
  ...intermediateSteps,
  ...advancedSteps,
  ...apiPracticeSteps,
].sort((a, b) => a.order - b.order)

// courseData の全ステップ（フラット）
const allCourseSteps = COURSES.flatMap((c) => c.steps)

// ─────────────────────────────────────────
// 1. courseData 整合性
// ─────────────────────────────────────────
describe('courseData 整合性', () => {
  it('全ステップ数が 20', () => {
    expect(TOTAL_STEP_COUNT).toBe(20)
  })

  it('実装済みステップ数が 20（全ステップ isImplemented: true）', () => {
    expect(IMPLEMENTED_STEP_COUNT).toBe(20)
  })

  it('全ステップが isImplemented: true', () => {
    const unimplemented = allCourseSteps.filter((s) => !s.isImplemented)
    expect(unimplemented).toHaveLength(0)
  })

  it('order が 1〜20 の連番で重複なし', () => {
    const orders = allCourseSteps.map((s) => s.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it('stepId が全ステップで一意', () => {
    const ids = allCourseSteps.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

// ─────────────────────────────────────────
// 2. コンテンツ実装の存在確認
// ─────────────────────────────────────────
describe('コンテンツ実装の存在確認', () => {
  it('全20ステップのコンテンツが実装されている', () => {
    expect(allContentSteps).toHaveLength(20)
  })

  it('courseData の全 stepId に対応するコンテンツが存在する', () => {
    const contentIds = new Set(allContentSteps.map((s) => s.id))
    const missing = allCourseSteps.filter((s) => !contentIds.has(s.id))
    expect(missing).toHaveLength(0)
  })

  it('getFundamentalsStep / getIntermediateStep / getAdvancedStep / getApiPracticeStep が全ステップを解決できる', () => {
    for (const step of allCourseSteps) {
      const content =
        getFundamentalsStep(step.id) ??
        getIntermediateStep(step.id) ??
        getAdvancedStep(step.id) ??
        getApiPracticeStep(step.id)
      expect(content, `${step.id} のコンテンツが見つからない`).toBeDefined()
    }
  })
})

// ─────────────────────────────────────────
// 3. 各ステップの4モードコンテンツ検証
// ─────────────────────────────────────────
describe('4モードコンテンツ品質検証', () => {
  for (const step of allContentSteps) {
    describe(`Step ${step.order}: ${step.id}`, () => {
      it('id / order / title / summary が空でない', () => {
        expect(step.id).toBeTruthy()
        expect(step.order).toBeGreaterThan(0)
        expect(step.title).toBeTruthy()
        expect(step.summary).toBeTruthy()
      })

      it('readMarkdown が 100 文字以上', () => {
        expect(step.readMarkdown.length).toBeGreaterThan(100)
      })

      it('practiceQuestions が 1 問以上で各問が prompt / answer / hint を持つ', () => {
        expect(step.practiceQuestions.length).toBeGreaterThan(0)
        for (const q of step.practiceQuestions) {
          expect(q.id, `${step.id}: question.id が空`).toBeTruthy()
          expect(q.prompt, `${step.id}: question.prompt が空`).toBeTruthy()
          expect(q.answer, `${step.id}: question.answer が空`).toBeTruthy()
          expect(q.hint, `${step.id}: question.hint が空`).toBeTruthy()
        }
      })

      it('testTask が instruction / starterCode / expectedKeywords を持つ', () => {
        expect(step.testTask.instruction).toBeTruthy()
        expect(step.testTask.starterCode).toBeTruthy()
        expect(step.testTask.expectedKeywords.length).toBeGreaterThan(0)
      })

      it('challengeTask が 1 パターン以上で各パターンが必須フィールドを持つ', () => {
        expect(step.challengeTask.patterns.length).toBeGreaterThan(0)
        for (const p of step.challengeTask.patterns) {
          expect(p.id, `${step.id}: pattern.id が空`).toBeTruthy()
          expect(p.prompt, `${step.id}: pattern.prompt が空`).toBeTruthy()
          expect(p.requirements.length, `${step.id}: requirements が空`).toBeGreaterThan(0)
          expect(p.hints.length, `${step.id}: hints が空`).toBeGreaterThan(0)
          expect(p.expectedKeywords.length, `${step.id}: expectedKeywords が空`).toBeGreaterThan(0)
          expect(p.starterCode, `${step.id}: starterCode が空`).toBeTruthy()
        }
      })
    })
  }
})

// ─────────────────────────────────────────
// 4. order と courseData の整合性
// ─────────────────────────────────────────
describe('order と courseData の整合性', () => {
  it('content の order が courseData の order と一致する', () => {
    const courseOrderMap = new Map(allCourseSteps.map((s) => [s.id, s.order]))
    for (const step of allContentSteps) {
      expect(step.order, `${step.id}: content.order が courseData.order と不一致`).toBe(courseOrderMap.get(step.id))
    }
  })

  it('course-1: order 1-4 が fundamentalsSteps に含まれる', () => {
    const course1 = COURSES.find((c) => c.id === 'course-1')!
    for (const meta of course1.steps) {
      expect(getFundamentalsStep(meta.id), `${meta.id} が fundamentalsSteps にない`).toBeDefined()
    }
  })

  it('course-2: order 5-8 が intermediateSteps に含まれる', () => {
    const course2 = COURSES.find((c) => c.id === 'course-2')!
    for (const meta of course2.steps) {
      expect(getIntermediateStep(meta.id), `${meta.id} が intermediateSteps にない`).toBeDefined()
    }
  })

  it('course-3: order 9-12 が advancedSteps に含まれる', () => {
    const course3 = COURSES.find((c) => c.id === 'course-3')!
    for (const meta of course3.steps) {
      expect(getAdvancedStep(meta.id), `${meta.id} が advancedSteps にない`).toBeDefined()
    }
  })

  it('course-4: order 13-20 が apiPracticeSteps に含まれる', () => {
    const course4 = COURSES.find((c) => c.id === 'course-4')!
    for (const meta of course4.steps) {
      expect(getApiPracticeStep(meta.id), `${meta.id} が apiPracticeSteps にない`).toBeDefined()
    }
  })
})

// ─────────────────────────────────────────
// 5. ナビゲーション（getNextStep / findStepMeta）
// ─────────────────────────────────────────
describe('ナビゲーション整合性', () => {
  it('findStepMeta が全20 stepId を解決できる', () => {
    for (const step of allCourseSteps) {
      const meta = findStepMeta(step.id)
      expect(meta, `${step.id} の stepMeta が見つからない`).toBeDefined()
      expect(meta?.id).toBe(step.id)
    }
  })

  it('getNextStep が order 1〜19 のステップに対して次ステップを返す', () => {
    for (const step of allCourseSteps.slice(0, 19)) {
      const next = getNextStep(step.id)
      expect(next, `${step.id} の次ステップが undefined`).toBeDefined()
      expect(next!.order).toBe(step.order + 1)
    }
  })

  it('getNextStep が最終ステップ（order 20）に対して undefined を返す', () => {
    const lastStep = allCourseSteps.find((s) => s.order === 20)!
    const next = getNextStep(lastStep.id)
    expect(next).toBeUndefined()
  })
})

// ─────────────────────────────────────────
// 6. course-4 / all-complete バッジ判定ロジック検証
// ─────────────────────────────────────────
describe('実績バッジ判定のデータ整合性', () => {
  it('course-4 の全8ステップが isImplemented: true', () => {
    const course4 = COURSES.find((c) => c.id === 'course-4')!
    expect(course4.steps).toHaveLength(8)
    expect(course4.steps.every((s) => s.isImplemented)).toBe(true)
  })

  it('course-4 の全ステップに apiPracticeSteps コンテンツが存在する', () => {
    const course4 = COURSES.find((c) => c.id === 'course-4')!
    for (const step of course4.steps) {
      expect(getApiPracticeStep(step.id), `${step.id} のコンテンツがない`).toBeDefined()
    }
  })

  it('全20ステップの stepId が all-complete 判定に必要な配列に含まれる', () => {
    // achievementService の ALL_STEP_IDS と同等の計算
    const allStepIds = new Set(COURSES.flatMap((c) => c.steps.map((s) => s.id)))
    expect(allStepIds.size).toBe(20)

    for (const step of allContentSteps) {
      expect(allStepIds.has(step.id), `${step.id} が ALL_STEP_IDS に含まれない`).toBe(true)
    }
  })
})

// ─────────────────────────────────────────
// 7. コース間境界 / API連携コースの API 文法検証
// ─────────────────────────────────────────
describe('API連携コース（course-4）コンテンツ固有検証', () => {
  const course4Steps = apiPracticeSteps.sort((a, b) => a.order - b.order)

  it('api-tasks-update: PATCH が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-tasks-update')!
    expect(step.testTask.expectedKeywords).toContain('PATCH')
  })

  it('api-tasks-delete: DELETE が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-tasks-delete')!
    expect(step.testTask.expectedKeywords).toContain('DELETE')
  })

  it('api-custom-hook: useCallback が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-custom-hook')!
    expect(step.challengeTask.patterns[0].expectedKeywords).toContain('useCallback')
  })

  it('api-error-loading: useReducer / dispatch が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-error-loading')!
    expect(step.testTask.expectedKeywords).toContain('useReducer')
    expect(step.testTask.expectedKeywords).toContain('dispatch')
  })

  it('course-4 の各ステップの starterCode に TODO コメントが含まれる', () => {
    for (const step of course4Steps) {
      expect(step.testTask.starterCode, `${step.id}: starterCode に TODO がない`).toContain('TODO')
    }
  })
})

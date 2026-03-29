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
 * 7. コース完了 / all-complete の実績判定が正しい
 * 8. CATEGORIES 3層構造の整合性
 */

import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  getAllCourses,
  getAllSteps,
  TOTAL_STEP_COUNT,
  IMPLEMENTED_STEP_COUNT,
  getNextStep,
  findStepById,
  findCourseById,
  findCategoryById,
  findCourseByStepId,
  findCategoryByStepId,
} from '../courseData'
import { fundamentalsSteps, getFundamentalsStep } from '../fundamentals/steps'
import { intermediateSteps, getIntermediateStep } from '../intermediate/steps'
import { advancedSteps, getAdvancedStep } from '../advanced/steps'
import { apiPracticeSteps, getApiPracticeStep } from '../api-practice/steps'
import { typescriptSteps, getTypescriptStep } from '../typescript/steps'
import { typescriptReactSteps, getTypescriptReactStep } from '../typescript-react/steps'
import type { LearningStepContent } from '../fundamentals/steps'

// 全コンテンツを order 順に結合
const allContentSteps: LearningStepContent[] = [
  ...fundamentalsSteps,
  ...intermediateSteps,
  ...advancedSteps,
  ...apiPracticeSteps,
  ...typescriptSteps,
  ...typescriptReactSteps,
].sort((a, b) => a.order - b.order)

// courseData の全ステップ（フラット）
const allCourseSteps = getAllSteps()

// ─────────────────────────────────────────
// 1. courseData 整合性
// ─────────────────────────────────────────
describe('courseData 整合性', () => {
  it('全ステップ数が 30', () => {
    expect(TOTAL_STEP_COUNT).toBe(30)
  })

  it('実装済みステップ数が 30（全ステップ isImplemented: true）', () => {
    expect(IMPLEMENTED_STEP_COUNT).toBe(30)
  })

  it('全ステップが isImplemented: true', () => {
    const unimplemented = allCourseSteps.filter((s) => !s.isImplemented)
    expect(unimplemented).toHaveLength(0)
  })

  it('order が 1〜30 の連番で重複なし', () => {
    const orders = allCourseSteps.map((s) => s.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
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
  it('全30ステップのコンテンツが実装されている', () => {
    expect(allContentSteps).toHaveLength(30)
  })

  it('courseData の全 stepId に対応するコンテンツが存在する', () => {
    const contentIds = new Set(allContentSteps.map((s) => s.id))
    const missing = allCourseSteps.filter((s) => !contentIds.has(s.id))
    expect(missing).toHaveLength(0)
  })

  it('getFundamentalsStep / getIntermediateStep / getAdvancedStep / getApiPracticeStep / getTypescriptStep / getTypescriptReactStep が全ステップを解決できる', () => {
    for (const step of allCourseSteps) {
      const content =
        getFundamentalsStep(step.id) ??
        getIntermediateStep(step.id) ??
        getAdvancedStep(step.id) ??
        getApiPracticeStep(step.id) ??
        getTypescriptStep(step.id) ??
        getTypescriptReactStep(step.id)
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

      it('choices がある問題では answer が choices に含まれる', () => {
        for (const q of step.practiceQuestions) {
          if (q.choices) {
            expect(q.choices.length, `${step.id}/${q.id}: choices が空`).toBeGreaterThanOrEqual(2)
            expect(
              q.choices.includes(q.answer),
              `${step.id}/${q.id}: answer "${q.answer}" が choices に含まれない`,
            ).toBe(true)
          }
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

  it('react-fundamentals: order 1-4 が fundamentalsSteps に含まれる', () => {
    const course = findCourseById('react-fundamentals')!
    for (const meta of course.steps) {
      expect(getFundamentalsStep(meta.id), `${meta.id} が fundamentalsSteps にない`).toBeDefined()
    }
  })

  it('react-hooks: order 5-8 が intermediateSteps に含まれる', () => {
    const course = findCourseById('react-hooks')!
    for (const meta of course.steps) {
      expect(getIntermediateStep(meta.id), `${meta.id} が intermediateSteps にない`).toBeDefined()
    }
  })

  it('react-advanced: order 9-12 が advancedSteps に含まれる', () => {
    const course = findCourseById('react-advanced')!
    for (const meta of course.steps) {
      expect(getAdvancedStep(meta.id), `${meta.id} が advancedSteps にない`).toBeDefined()
    }
  })

  it('react-api: order 13-20 が apiPracticeSteps に含まれる', () => {
    const course = findCourseById('react-api')!
    for (const meta of course.steps) {
      expect(getApiPracticeStep(meta.id), `${meta.id} が apiPracticeSteps にない`).toBeDefined()
    }
  })

  it('ts-basics: order 21-26 が typescriptSteps に含まれる', () => {
    const course = findCourseById('ts-basics')!
    for (const meta of course.steps) {
      expect(getTypescriptStep(meta.id), `${meta.id} が typescriptSteps にない`).toBeDefined()
    }
  })
})

// ─────────────────────────────────────────
// 5. ナビゲーション（getNextStep / findStepById）
// ─────────────────────────────────────────
describe('ナビゲーション整合性', () => {
  it('findStepById が全30 stepId を解決できる', () => {
    for (const step of allCourseSteps) {
      const meta = findStepById(step.id)
      expect(meta, `${step.id} の stepMeta が見つからない`).toBeDefined()
      expect(meta?.id).toBe(step.id)
    }
  })

  it('getNextStep が order 1〜29 のステップに対して次ステップを返す', () => {
    for (const step of allCourseSteps.slice(0, 29)) {
      const next = getNextStep(step.id)
      expect(next, `${step.id} の次ステップが undefined`).toBeDefined()
      expect(next!.order).toBe(step.order + 1)
    }
  })

  it('getNextStep が最終ステップ（order 30）に対して undefined を返す', () => {
    const lastStep = allCourseSteps.find((s) => s.order === 30)!
    const next = getNextStep(lastStep.id)
    expect(next).toBeUndefined()
  })
})

// ─────────────────────────────────────────
// 6. コース完了 / all-complete バッジ判定ロジック検証
// ─────────────────────────────────────────
describe('実績バッジ判定のデータ整合性', () => {
  it('react-api の全8ステップが isImplemented: true', () => {
    const course = findCourseById('react-api')!
    expect(course.steps).toHaveLength(8)
    expect(course.steps.every((s) => s.isImplemented)).toBe(true)
  })

  it('react-api の全ステップに apiPracticeSteps コンテンツが存在する', () => {
    const course = findCourseById('react-api')!
    for (const step of course.steps) {
      expect(getApiPracticeStep(step.id), `${step.id} のコンテンツがない`).toBeDefined()
    }
  })

  it('全30ステップの stepId が all-complete 判定に必要な配列に含まれる', () => {
    const allStepIds = new Set(getAllSteps().map((s) => s.id))
    expect(allStepIds.size).toBe(30)

    for (const step of allContentSteps) {
      expect(allStepIds.has(step.id), `${step.id} が getAllSteps() に含まれない`).toBe(true)
    }
  })
})

// ─────────────────────────────────────────
// 7. コース間境界 / API連携コースの API 文法検証
// ─────────────────────────────────────────
describe('API連携コース（react-api）コンテンツ固有検証', () => {
  const course4Steps = apiPracticeSteps.sort((a, b) => a.order - b.order)

  it('api-tasks-update: PATCH が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-tasks-update')!
    expect(step.testTask.expectedKeywords).toContain('PATCH')
  })

  it('api-tasks-delete: filter が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-tasks-delete')!
    expect(step.testTask.expectedKeywords).toContain('filter')
  })

  it('api-custom-hook: useCallback が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-custom-hook')!
    expect(step.challengeTask.patterns[0].expectedKeywords).toContain('useCallback')
  })

  it('api-error-loading: dispatch が expectedKeywords に含まれる', () => {
    const step = course4Steps.find((s) => s.id === 'api-error-loading')!
    expect(step.testTask.expectedKeywords).toContain('dispatch')
  })

  it('react-api の各ステップの starterCode に ____ ブランクが含まれる', () => {
    for (const step of course4Steps) {
      expect(step.testTask.starterCode, `${step.id}: starterCode に ____ がない`).toContain('____')
    }
  })
})

// ─────────────────────────────────────────
// 8. CATEGORIES 3層構造の整合性
// ─────────────────────────────────────────
describe('CATEGORIES 3層構造', () => {
  it('react カテゴリに4コースが含まれる', () => {
    const react = findCategoryById('react')!
    expect(react.courses).toHaveLength(4)
    expect(react.courses.map((c) => c.id)).toEqual([
      'react-fundamentals',
      'react-hooks',
      'react-advanced',
      'react-api',
    ])
  })

  it('typescript カテゴリに2コースが含まれる', () => {
    const ts = findCategoryById('typescript')!
    expect(ts.courses).toHaveLength(2)
    expect(ts.courses.map((c) => c.id)).toEqual(['ts-basics', 'ts-react'])
  })

  it('getAllCourses が全6コースを返す', () => {
    expect(getAllCourses()).toHaveLength(6)
  })

  it('findCourseByStepId が正しいコースを返す', () => {
    expect(findCourseByStepId('usestate-basic')?.id).toBe('react-fundamentals')
    expect(findCourseByStepId('useeffect')?.id).toBe('react-hooks')
    expect(findCourseByStepId('custom-hooks')?.id).toBe('react-advanced')
    expect(findCourseByStepId('api-counter-get')?.id).toBe('react-api')
  })

  it('findCategoryByStepId が正しいカテゴリを返す', () => {
    expect(findCategoryByStepId('usestate-basic')?.id).toBe('react')
    expect(findCategoryByStepId('api-counter-get')?.id).toBe('react')
    expect(findCategoryByStepId('ts-types')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-utility-types')?.id).toBe('typescript')
  })

  it('各カテゴリが id / title / description / icon を持つ', () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy()
      expect(cat.title).toBeTruthy()
      expect(cat.description).toBeTruthy()
      expect(cat.icon).toBeTruthy()
    }
  })

  it('各コースが requiredPrerequisites / recommendedPrerequisites を持つ', () => {
    for (const course of getAllCourses()) {
      expect(Array.isArray(course.requiredPrerequisites)).toBe(true)
      expect(Array.isArray(course.recommendedPrerequisites)).toBe(true)
    }
  })
})

// ─────────────────────────────────────────
// 9. TypeScript カテゴリ固有検証
// ─────────────────────────────────────────
describe('TypeScript カテゴリ（typescript）コンテンツ固有検証', () => {
  it('typescript カテゴリのステップが findCategoryByStepId で解決できる', () => {
    expect(findCategoryByStepId('ts-types')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-functions')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-objects')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-union-narrowing')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-generics')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-utility-types')?.id).toBe('typescript')
  })

  it('ts-basics の全ステップに typescriptSteps コンテンツが存在する', () => {
    const course = findCourseById('ts-basics')!
    for (const meta of course.steps) {
      expect(getTypescriptStep(meta.id), `${meta.id} のコンテンツがない`).toBeDefined()
    }
  })

  it('ts-basics の requiredPrerequisites が空（前提コースなし）', () => {
    const course = findCourseById('ts-basics')!
    expect(course.requiredPrerequisites).toHaveLength(0)
  })

  it('ts-basics の全ステップが isImplemented: true', () => {
    const course = findCourseById('ts-basics')!
    expect(course.steps).toHaveLength(6)
    expect(course.steps.every((s) => s.isImplemented)).toBe(true)
  })

  it('ts-react の全ステップが isImplemented: true', () => {
    const course = findCourseById('ts-react')!
    expect(course.steps).toHaveLength(4)
    expect(course.steps.every((s) => s.isImplemented)).toBe(true)
  })
})

// ─────────────────────────────────────────
// 10. TypeScript × React カテゴリ固有検証
// ─────────────────────────────────────────
describe('TypeScript × React（ts-react）コンテンツ固有検証', () => {
  it('ts-react ステップが findCategoryByStepId で typescript カテゴリに解決できる', () => {
    expect(findCategoryByStepId('ts-react-props')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-react-state')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-react-hooks')?.id).toBe('typescript')
    expect(findCategoryByStepId('ts-react-events')?.id).toBe('typescript')
  })

  it('ts-react の全ステップに typescriptReactSteps コンテンツが存在する', () => {
    const course = findCourseById('ts-react')!
    for (const meta of course.steps) {
      expect(getTypescriptReactStep(meta.id), `${meta.id} のコンテンツがない`).toBeDefined()
    }
  })

  it('ts-react の requiredPrerequisites に ts-basics が含まれる', () => {
    const course = findCourseById('ts-react')!
    expect(course.requiredPrerequisites).toContain('ts-basics')
  })

  it('ts-react-props の starterCode に ____ が含まれる', () => {
    const step = getTypescriptReactStep('ts-react-props')!
    expect(step.testTask.starterCode).toContain('____')
  })

  it('ts-react-events の expectedKeywords に HTMLInputElement が含まれる', () => {
    const step = getTypescriptReactStep('ts-react-events')!
    expect(step.testTask.expectedKeywords).toContain('HTMLInputElement')
  })
})

import { findCourseById, type CourseMeta } from '../content/courseData'

export type CourseLockStatus =
  | { locked: false; warning: string | null }
  | { locked: true; reason: string }

/**
 * コースのロック状態を判定する（D1-3 準拠）
 *
 * - 必須前提コースが未完了 → locked: true
 * - 推奨前提コースが未完了 → locked: false, warning あり
 * - 前提なし or 全完了 → locked: false, warning なし
 */
export function getCourseLockStatus(
  course: CourseMeta,
  completedStepIds: ReadonlySet<string>,
): CourseLockStatus {
  // 必須前提チェック
  for (const prereqId of course.requiredPrerequisites) {
    if (!isCourseCompleted(prereqId, completedStepIds)) {
      const prereq = findCourseById(prereqId)
      return {
        locked: true,
        reason: `「${prereq?.title ?? prereqId}」を完了すると解放されます`,
      }
    }
  }

  // 推奨前提チェック
  const warnings: string[] = []
  for (const prereqId of course.recommendedPrerequisites) {
    if (!isCourseCompleted(prereqId, completedStepIds)) {
      const prereq = findCourseById(prereqId)
      warnings.push(prereq?.title ?? prereqId)
    }
  }

  if (warnings.length > 0) {
    return {
      locked: false,
      warning: `「${warnings.join('」「')}」を先に学習することを推奨します`,
    }
  }

  return { locked: false, warning: null }
}

/**
 * コースが完了しているか判定する
 * isImplemented: true のステップがすべて completedStepIds に含まれていれば完了
 */
export function isCourseCompleted(
  courseId: string,
  completedStepIds: ReadonlySet<string>,
): boolean {
  const course = findCourseById(courseId)
  if (!course) return false

  const implementedSteps = course.steps.filter((s) => s.isImplemented)
  if (implementedSteps.length === 0) return false

  return implementedSteps.every((step) => completedStepIds.has(step.id))
}

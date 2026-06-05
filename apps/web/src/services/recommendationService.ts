import { getAllSteps, getFirstImplementedStep, type StepMeta } from '../content/courseData'
import type { StepProgressRow } from './progressService'

export type RecommendationMode = 'read' | 'practice' | 'test' | 'challenge'

type ModeMeta = {
  mode: RecommendationMode
  label: string
  doneKey: keyof Pick<StepProgressRow, 'read_done' | 'practice_done' | 'test_done' | 'challenge_done'>
}

const MODE_ORDER: readonly ModeMeta[] = [
  { mode: 'read', label: 'Read', doneKey: 'read_done' },
  { mode: 'practice', label: 'Practice', doneKey: 'practice_done' },
  { mode: 'test', label: 'Test', doneKey: 'test_done' },
  { mode: 'challenge', label: 'Challenge', doneKey: 'challenge_done' },
] as const

const READ_MODE: ModeMeta = { mode: 'read', label: 'Read', doneKey: 'read_done' }

export type RecommendedActionType = 'review' | 'resume' | 'start' | 'next' | 'complete'

export interface RecommendedAction {
  type: RecommendedActionType
  title: string
  description: string
  ctaLabel: string
  to: string
  stepId?: string
  mode?: RecommendationMode
}

export interface RecommendationState {
  progress: readonly StepProgressRow[]
  reviewCount?: number
  enableReviewQueue?: boolean
  steps?: readonly StepMeta[]
}

function isAllModesDone(progress: StepProgressRow | undefined): boolean {
  return Boolean(progress?.read_done && progress.practice_done && progress.test_done && progress.challenge_done)
}

function hasAnyModeDone(progress: StepProgressRow | undefined): boolean {
  return Boolean(progress?.read_done || progress?.practice_done || progress?.test_done || progress?.challenge_done)
}

function getFirstIncompleteMode(progress: StepProgressRow): ModeMeta {
  const mode = MODE_ORDER.find((item) => !progress[item.doneKey])
  return mode ?? READ_MODE
}

function getOrderedImplementedSteps(steps?: readonly StepMeta[]): StepMeta[] {
  return [...(steps ?? getAllSteps())].filter((step) => step.isImplemented).sort((a, b) => a.order - b.order)
}

export function getRecommendedAction({
  progress,
  reviewCount = 0,
  enableReviewQueue = false,
  steps,
}: RecommendationState): RecommendedAction {
  if (enableReviewQueue && reviewCount > 0) {
    return {
      type: 'review',
      title: '昨日間違えた問題を復習',
      description: `復習待ちが ${reviewCount} 件あります。まずは弱点を軽く戻しましょう。`,
      ctaLabel: '復習へ進む',
      to: '/daily',
    }
  }

  const implementedSteps = getOrderedImplementedSteps(steps)
  const firstStep = implementedSteps[0] ?? getFirstImplementedStep()

  if (!firstStep) {
    return {
      type: 'complete',
      title: '学習コンテンツを準備中です',
      description: '次に取り組めるステップが追加されるまで少しお待ちください。',
      ctaLabel: 'カリキュラムを見る',
      to: '/curriculum',
    }
  }

  const progressByStepId = new Map(progress.map((item) => [item.step_id, item]))
  const inProgressStep = implementedSteps.find((step) => {
    const item = progressByStepId.get(step.id)
    return hasAnyModeDone(item) && !isAllModesDone(item)
  })

  if (inProgressStep) {
    const item = progressByStepId.get(inProgressStep.id)

    if (item) {
      const mode = getFirstIncompleteMode(item)

      return {
        type: 'resume',
        title: `Step ${inProgressStep.order} の ${mode.label} から再開`,
        description: `「${inProgressStep.title}」の続きから進めます。途中までの学習をそのまま活かしましょう。`,
        ctaLabel: `${mode.label} へ戻る`,
        to: `/step/${inProgressStep.id}`,
        stepId: inProgressStep.id,
        mode: mode.mode,
      }
    }
  }

  const hasStarted = implementedSteps.some((step) => hasAnyModeDone(progressByStepId.get(step.id)))

  if (!hasStarted) {
    return {
      type: 'start',
      title: `${firstStep.title} から始める`,
      description: 'Read → Practice → Test → Challenge の順に、まずは1ステップ進めましょう。',
      ctaLabel: '最初のレッスンへ',
      to: `/step/${firstStep.id}`,
      stepId: firstStep.id,
      mode: 'read',
    }
  }

  const nextStep = implementedSteps.find((step) => !isAllModesDone(progressByStepId.get(step.id)))

  if (nextStep) {
    return {
      type: 'next',
      title: `次は Step ${nextStep.order}「${nextStep.title}」`,
      description: '完了したステップの流れを保ったまま、次の概念へ進みましょう。',
      ctaLabel: '次のステップへ',
      to: `/step/${nextStep.id}`,
      stepId: nextStep.id,
      mode: 'read',
    }
  }

  return {
    type: 'complete',
    title: '全ステップ完了済みです',
    description: '復習やミニプロジェクトで、身につけた知識を実装力へつなげましょう。',
    ctaLabel: 'スキルアップを見る',
    to: '/practice/mini-projects',
  }
}

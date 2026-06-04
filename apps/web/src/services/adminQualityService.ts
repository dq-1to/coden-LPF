import { getAllSteps } from '../content/courseData'
import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Tables } from '../shared/types/database.types'

type StepProgressRow = Pick<
  Tables<'step_progress'>,
  | 'user_id'
  | 'step_id'
  | 'read_done'
  | 'practice_done'
  | 'test_done'
  | 'challenge_done'
  | 'completed_at'
>
type ChallengeSubmissionRow = Pick<
  Tables<'challenge_submissions'>,
  'step_id' | 'is_passed' | 'submitted_at'
>
type DailyChallengeHistoryRow = Pick<Tables<'daily_challenge_history'>, 'completed' | 'challenge_date'>
type MiniProjectProgressRow = Pick<
  Tables<'mini_project_progress'>,
  'project_id' | 'status' | 'completed_at'
>
type UserFeedbackRow = Pick<Tables<'user_feedback'>, 'status' | 'created_at'>
type ReviewItemRow = Pick<Tables<'review_items'>, 'status' | 'step_id'>

export type AdminQualityMetricStatus = 'formal' | 'provisional' | 'future'

export interface AdminQualityMetric {
  id: string
  label: string
  value: string
  detail: string
  status: AdminQualityMetricStatus
}

export interface AdminQualityStepPriority {
  stepId: string
  order: number
  title: string
  startedUsers: number
  completedUsers: number
  completionRate: number | null
  challengeSubmissions: number
  challengePassRate: number | null
  openReviewItems: number
  priorityScore: number
  reasons: string[]
}

export type AdminQualityStepInsightSignal = 'healthy' | 'watch' | 'attention' | 'insufficient'

export interface AdminQualityStepInsight {
  stepId: string
  order: number
  title: string
  startedUsers: number
  readDoneUsers: number
  practiceDoneUsers: number
  testDoneUsers: number
  challengeDoneUsers: number
  completedUsers: number
  completionRate: number | null
  readToPracticeRate: number | null
  practiceToTestRate: number | null
  testToChallengeRate: number | null
  challengeSubmissions: number
  challengePassRate: number | null
  openReviewItems: number
  bottleneck: string
  signal: AdminQualityStepInsightSignal
}

export interface AdminQualityMiniProjectStatus {
  total: number
  completed: number
  inProgress: number
  notStarted: number
}

export interface AdminQualityDashboard {
  totalUsers: number
  activeLearners: number
  generatedAt: string
  formalMetrics: AdminQualityMetric[]
  provisionalMetrics: AdminQualityMetric[]
  futureMetrics: AdminQualityMetric[]
  improvementSteps: AdminQualityStepPriority[]
  stepInsights: AdminQualityStepInsight[]
  miniProjectStatus: AdminQualityMiniProjectStatus
}

interface StepAggregate {
  stepId: string
  order: number
  title: string
  startedUsers: Set<string>
  readDoneUsers: Set<string>
  practiceDoneUsers: Set<string>
  testDoneUsers: Set<string>
  challengeDoneUsers: Set<string>
  completedUsers: Set<string>
  challengeSubmissions: number
  challengePassed: number
  openReviewItems: number
}

function isStepCompleted(row: StepProgressRow): boolean {
  return Boolean(
    row.completed_at ||
      (row.read_done && row.practice_done && row.test_done && row.challenge_done),
  )
}

function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return numerator / denominator
}

function formatPercent(rate: number | null): string {
  if (rate === null) return 'データ不足'
  return `${(rate * 100).toFixed(1)}%`
}

function formatCount(value: number, unit = '件'): string {
  return `${value.toLocaleString()}${unit}`
}

function isWithinLastDays(dateValue: string | null, days: number): boolean {
  if (!dateValue) return false
  const time = new Date(dateValue).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time <= days * 24 * 60 * 60 * 1000
}

function createMetric(
  id: string,
  label: string,
  value: string,
  detail: string,
  status: AdminQualityMetricStatus,
): AdminQualityMetric {
  return { id, label, value, detail, status }
}

function buildStepAggregates(
  progressRows: StepProgressRow[],
  submissions: ChallengeSubmissionRow[],
  reviewItems: ReviewItemRow[],
): StepAggregate[] {
  const implementedSteps = getAllSteps().filter((step) => step.isImplemented)
  const aggregates = new Map<string, StepAggregate>()

  for (const step of implementedSteps) {
    aggregates.set(step.id, {
      stepId: step.id,
      order: step.order,
      title: step.title,
      startedUsers: new Set<string>(),
      readDoneUsers: new Set<string>(),
      practiceDoneUsers: new Set<string>(),
      testDoneUsers: new Set<string>(),
      challengeDoneUsers: new Set<string>(),
      completedUsers: new Set<string>(),
      challengeSubmissions: 0,
      challengePassed: 0,
      openReviewItems: 0,
    })
  }

  for (const row of progressRows) {
    const aggregate = aggregates.get(row.step_id)
    if (!aggregate) continue
    aggregate.startedUsers.add(row.user_id)
    if (row.read_done) aggregate.readDoneUsers.add(row.user_id)
    if (row.practice_done) aggregate.practiceDoneUsers.add(row.user_id)
    if (row.test_done) aggregate.testDoneUsers.add(row.user_id)
    if (row.challenge_done) aggregate.challengeDoneUsers.add(row.user_id)
    if (isStepCompleted(row)) {
      aggregate.completedUsers.add(row.user_id)
    }
  }

  for (const row of submissions) {
    const aggregate = aggregates.get(row.step_id)
    if (!aggregate) continue
    aggregate.challengeSubmissions += 1
    if (row.is_passed) {
      aggregate.challengePassed += 1
    }
  }

  for (const row of reviewItems) {
    const aggregate = aggregates.get(row.step_id)
    if (!aggregate || row.status !== 'open') continue
    aggregate.openReviewItems += 1
  }

  return [...aggregates.values()]
}

function buildImprovementSteps(aggregates: StepAggregate[]): AdminQualityStepPriority[] {
  return aggregates
    .filter((row) => row.startedUsers.size > 0 || row.challengeSubmissions > 0 || row.openReviewItems > 0)
    .map((row) => {
      const startedUsers = row.startedUsers.size
      const completedUsers = row.completedUsers.size
      const completionRate = safeRate(completedUsers, startedUsers)
      const challengePassRate = safeRate(row.challengePassed, row.challengeSubmissions)
      const completionGap = completionRate === null ? 0.4 : 1 - completionRate
      const challengeGap = challengePassRate === null ? 0 : 1 - challengePassRate
      const reviewWeight = Math.min(row.openReviewItems, 10) / 10
      const priorityScore = Math.round((completionGap * 60 + challengeGap * 30 + reviewWeight * 10) * 10) / 10
      const reasons = [
        `完了率 ${formatPercent(completionRate)}`,
        row.challengeSubmissions > 0
          ? `Challenge 合格率 ${formatPercent(challengePassRate)}`
          : 'Challenge 提出なし',
      ]

      if (row.openReviewItems > 0) {
        reasons.push(`復習待ち ${row.openReviewItems.toLocaleString()}件`)
      }
      reasons.push(`着手 ${startedUsers.toLocaleString()}人`)

      return {
        stepId: row.stepId,
        order: row.order,
        title: row.title,
        startedUsers,
        completedUsers,
        completionRate,
        challengeSubmissions: row.challengeSubmissions,
        challengePassRate,
        openReviewItems: row.openReviewItems,
        priorityScore,
        reasons,
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || a.order - b.order)
    .slice(0, 5)
}

function getLowestTransition(
  transitions: readonly { label: string; rate: number | null }[],
): { label: string; rate: number | null } | null {
  const measurable = transitions.filter((item): item is { label: string; rate: number } => item.rate !== null)
  if (measurable.length === 0) return null
  const [lowest] = measurable.sort((a, b) => a.rate - b.rate)
  return lowest ?? null
}

function buildStepInsights(aggregates: StepAggregate[]): AdminQualityStepInsight[] {
  return aggregates.map((row) => {
    const startedUsers = row.startedUsers.size
    const readDoneUsers = row.readDoneUsers.size
    const practiceDoneUsers = row.practiceDoneUsers.size
    const testDoneUsers = row.testDoneUsers.size
    const challengeDoneUsers = row.challengeDoneUsers.size
    const completedUsers = row.completedUsers.size
    const completionRate = safeRate(completedUsers, startedUsers)
    const readToPracticeRate = safeRate(practiceDoneUsers, readDoneUsers)
    const practiceToTestRate = safeRate(testDoneUsers, practiceDoneUsers)
    const testToChallengeRate = safeRate(challengeDoneUsers, testDoneUsers)
    const challengePassRate = safeRate(row.challengePassed, row.challengeSubmissions)
    const lowestTransition = getLowestTransition([
      { label: 'Read → Practice', rate: readToPracticeRate },
      { label: 'Practice → Test', rate: practiceToTestRate },
      { label: 'Test → Challenge', rate: testToChallengeRate },
    ])
    const hasSevereDrop =
      completionRate !== null && completionRate < 0.4 ||
      lowestTransition?.rate != null && lowestTransition.rate < 0.45 ||
      challengePassRate !== null && challengePassRate < 0.4 ||
      row.openReviewItems >= 3
    const hasWatchSignal =
      completionRate !== null && completionRate < 0.7 ||
      lowestTransition?.rate != null && lowestTransition.rate < 0.7 ||
      challengePassRate !== null && challengePassRate < 0.7 ||
      row.openReviewItems > 0
    const signal: AdminQualityStepInsightSignal =
      startedUsers === 0 && row.challengeSubmissions === 0 && row.openReviewItems === 0
        ? 'insufficient'
        : hasSevereDrop
          ? 'attention'
          : hasWatchSignal
            ? 'watch'
            : 'healthy'
    const bottleneck =
      startedUsers === 0
        ? '着手データなし'
        : lowestTransition
          ? `${lowestTransition.label} ${formatPercent(lowestTransition.rate)}`
          : '遷移データ不足'

    return {
      stepId: row.stepId,
      order: row.order,
      title: row.title,
      startedUsers,
      readDoneUsers,
      practiceDoneUsers,
      testDoneUsers,
      challengeDoneUsers,
      completedUsers,
      completionRate,
      readToPracticeRate,
      practiceToTestRate,
      testToChallengeRate,
      challengeSubmissions: row.challengeSubmissions,
      challengePassRate,
      openReviewItems: row.openReviewItems,
      bottleneck,
      signal,
    }
  }).sort((a, b) => a.order - b.order)
}

export async function getAdminQualityDashboard(): Promise<AdminQualityDashboard> {
  const [
    usersRes,
    progressRes,
    submissionsRes,
    dailyRes,
    miniProjectRes,
    feedbackRes,
    reviewItemsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('step_progress')
      .select('user_id, step_id, read_done, practice_done, test_done, challenge_done, completed_at'),
    supabase.from('challenge_submissions').select('step_id, is_passed, submitted_at'),
    supabase.from('daily_challenge_history').select('completed, challenge_date'),
    supabase.from('mini_project_progress').select('project_id, status, completed_at'),
    supabase.from('user_feedback').select('status, created_at'),
    supabase.from('review_items').select('status, step_id'),
  ])

  if (usersRes.error) throw fromSupabaseError(usersRes.error, '品質KPIのユーザー数取得に失敗しました')
  if (progressRes.error)
    throw fromSupabaseError(progressRes.error, '品質KPIのステップ進捗取得に失敗しました')
  if (submissionsRes.error)
    throw fromSupabaseError(submissionsRes.error, '品質KPIのChallenge提出取得に失敗しました')
  if (dailyRes.error) throw fromSupabaseError(dailyRes.error, '品質KPIのDaily履歴取得に失敗しました')
  if (miniProjectRes.error)
    throw fromSupabaseError(miniProjectRes.error, '品質KPIのMini Project進捗取得に失敗しました')
  if (feedbackRes.error)
    throw fromSupabaseError(feedbackRes.error, '品質KPIのフィードバック取得に失敗しました')
  if (reviewItemsRes.error)
    throw fromSupabaseError(reviewItemsRes.error, '品質KPIの復習キュー取得に失敗しました')

  const progressRows = (progressRes.data ?? []) as StepProgressRow[]
  const submissions = (submissionsRes.data ?? []) as ChallengeSubmissionRow[]
  const dailyRows = (dailyRes.data ?? []) as DailyChallengeHistoryRow[]
  const miniProjectRows = (miniProjectRes.data ?? []) as MiniProjectProgressRow[]
  const feedbackRows = (feedbackRes.data ?? []) as UserFeedbackRow[]
  const reviewItems = (reviewItemsRes.data ?? []) as ReviewItemRow[]

  const totalUsers = usersRes.count ?? 0
  const activeLearners = new Set(progressRows.map((row) => row.user_id)).size
  const completedStepRows = progressRows.filter(isStepCompleted).length
  const fourModeCompletionRate = safeRate(completedStepRows, progressRows.length)
  const challengePassed = submissions.filter((row) => row.is_passed).length
  const challengePassRate = safeRate(challengePassed, submissions.length)
  const dailyCompletedCount = dailyRows.filter((row) => row.completed).length
  const miniProjectCompleted = miniProjectRows.filter((row) => row.status === 'completed').length
  const miniProjectInProgress = miniProjectRows.filter((row) => row.status === 'in_progress').length
  const miniProjectNotStarted = miniProjectRows.filter((row) => row.status === 'not_started').length
  const recentFeedbackCount = feedbackRows.filter((row) => isWithinLastDays(row.created_at, 7)).length
  const newFeedbackCount = feedbackRows.filter((row) => row.status === 'new').length
  const firstStepId = getAllSteps().find((step) => step.isImplemented)?.id
  const firstStepRows = firstStepId
    ? progressRows.filter((row) => row.step_id === firstStepId)
    : []
  const firstStepStartedRate = safeRate(new Set(firstStepRows.map((row) => row.user_id)).size, totalUsers)
  const firstStepCompletedRate = safeRate(
    new Set(firstStepRows.filter(isStepCompleted).map((row) => row.user_id)).size,
    totalUsers,
  )
  const aggregates = buildStepAggregates(progressRows, submissions, reviewItems)
  const improvementSteps = buildImprovementSteps(aggregates)
  const stepInsights = buildStepInsights(aggregates)
  const openReviewItems = reviewItems.filter((row) => row.status === 'open').length

  return {
    totalUsers,
    activeLearners,
    generatedAt: new Date().toISOString(),
    formalMetrics: [
      createMetric(
        'four-mode-completion-rate',
        '4モード完了率',
        formatPercent(fourModeCompletionRate),
        `${completedStepRows.toLocaleString()} / ${progressRows.length.toLocaleString()} 件のStep進捗が Read / Practice / Test / Challenge を完了`,
        'formal',
      ),
      createMetric(
        'challenge-pass-rate',
        'Challenge合格率',
        formatPercent(challengePassRate),
        `${challengePassed.toLocaleString()} / ${submissions.length.toLocaleString()} 件の提出が合格`,
        'formal',
      ),
      createMetric(
        'daily-completed-count',
        'Daily完了数',
        formatCount(dailyCompletedCount),
        'daily_challenge_history の completed=true 件数',
        'formal',
      ),
      createMetric(
        'mini-project-completed',
        'Mini Project完了',
        formatCount(miniProjectCompleted),
        `${miniProjectRows.length.toLocaleString()}件中 ${miniProjectCompleted.toLocaleString()}件が completed`,
        'formal',
      ),
      createMetric(
        'recent-feedback',
        '直近フィードバック',
        formatCount(recentFeedbackCount),
        `過去7日 ${recentFeedbackCount.toLocaleString()}件 / 新規 ${newFeedbackCount.toLocaleString()}件`,
        'formal',
      ),
      createMetric(
        'open-review-items',
        '復習待ち',
        formatCount(openReviewItems),
        'review_items の status=open 件数',
        'formal',
      ),
    ],
    provisionalMetrics: [
      createMetric(
        'active-learner-rate',
        '着手ユーザー率',
        formatPercent(safeRate(activeLearners, totalUsers)),
        `${activeLearners.toLocaleString()} / ${totalUsers.toLocaleString()} 人がStep進捗を保持`,
        'provisional',
      ),
      createMetric(
        'first-step-started-rate',
        '初回Step開始率',
        formatPercent(firstStepStartedRate),
        '最初の実装済みStepに進捗行があるユーザー割合',
        'provisional',
      ),
      createMetric(
        'first-step-completed-rate',
        '初回Step完了率',
        formatPercent(firstStepCompletedRate),
        '最初の実装済みStepを完了したユーザー割合',
        'provisional',
      ),
    ],
    futureMetrics: [
      createMetric(
        'read-to-practice-rate',
        'Read → Practice遷移率',
        'M2以降',
        'learning_events 導入後に正式表示',
        'future',
      ),
      createMetric(
        'test-to-challenge-rate',
        'Test → Challenge遷移率',
        'M2以降',
        'learning_events 導入後に正式表示',
        'future',
      ),
      createMetric(
        'review-resolution-time',
        '復習解消までの時間',
        'M2以降',
        'review_items の履歴強化後に正式表示',
        'future',
      ),
    ],
    improvementSteps,
    stepInsights,
    miniProjectStatus: {
      total: miniProjectRows.length,
      completed: miniProjectCompleted,
      inProgress: miniProjectInProgress,
      notStarted: miniProjectNotStarted,
    },
  }
}

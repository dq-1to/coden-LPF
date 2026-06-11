import { findCourseByStepId, getAllSteps } from '../content/courseData'
import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Json, Tables } from '../shared/types/database.types'

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
type StepFeedbackRow = Pick<Tables<'user_feedback'>, 'status' | 'created_at' | 'page_url'>
type ReviewItemRow = Pick<Tables<'review_items'>, 'status' | 'step_id'>
type LearningEventRow = Pick<
  Tables<'learning_events'>,
  'id' | 'user_id' | 'event_type' | 'step_id' | 'mode' | 'payload' | 'created_at'
>

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

export interface AdminStepInsight {
  stepId: string
  courseId: string | null
  courseTitle: string | null
  order: number
  title: string
  eventCount: number
  startedUsers: number
  readStartedUsers: number
  practiceStartedUsers: number
  testStartedUsers: number
  challengeStartedUsers: number
  readCompletedUsers: number
  practiceCompletedUsers: number
  testCompletedUsers: number
  challengeCompletedUsers: number
  completionRate: number | null
  readToPracticeRate: number | null
  practiceToTestRate: number | null
  testToChallengeRate: number | null
  dropoffRate: number | null
  practiceSubmissions: number
  practiceIncorrectRate: number | null
  testSubmissions: number
  testFailureRate: number | null
  challengeSubmissions: number
  challengePassRate: number | null
  relatedFeedbackCount: number
  newFeedbackCount: number
  bottleneck: string
  signal: AdminQualityStepInsightSignal
}

export interface AdminStepInsights {
  generatedAt: string
  totalEvents: number
  observedSteps: number
  attentionSteps: number
  rows: AdminStepInsight[]
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

type LearningMode = 'read' | 'practice' | 'test' | 'challenge'

interface StepEventAggregate {
  stepId: string
  courseId: string | null
  courseTitle: string | null
  order: number
  title: string
  eventCount: number
  startedUsers: Set<string>
  modeStartedUsers: Record<LearningMode, Set<string>>
  modeCompletedUsers: Record<LearningMode, Set<string>>
  practiceSubmissions: number
  practiceIncorrect: number
  testSubmissions: number
  testFailures: number
  challengeSubmissions: number
  challengePassed: number
  relatedFeedbackCount: number
  newFeedbackCount: number
}

const STEP_INSIGHT_MODES: readonly LearningMode[] = ['read', 'practice', 'test', 'challenge']
const LEARNING_EVENTS_PAGE_SIZE = 1000
const LEARNING_EVENTS_SELECT =
  'id, user_id, event_type, step_id, mode, payload, created_at'

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

function createModeUserSets(): Record<LearningMode, Set<string>> {
  return {
    read: new Set<string>(),
    practice: new Set<string>(),
    test: new Set<string>(),
    challenge: new Set<string>(),
  }
}

function isStepFeedback(row: StepFeedbackRow, stepId: string): boolean {
  return Boolean(row.page_url?.includes(`/step/${stepId}`))
}

function getPayloadBoolean(payload: Json | null, key: string): boolean | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const value = payload[key]
  return typeof value === 'boolean' ? value : null
}

function isLearningMode(value: string | null): value is LearningMode {
  return STEP_INSIGHT_MODES.includes(value as LearningMode)
}

function buildStepEventAggregates(
  events: LearningEventRow[],
  feedbackRows: StepFeedbackRow[],
): StepEventAggregate[] {
  const implementedSteps = getAllSteps().filter((step) => step.isImplemented)
  const aggregates = new Map<string, StepEventAggregate>()

  for (const step of implementedSteps) {
    const course = findCourseByStepId(step.id)
    aggregates.set(step.id, {
      stepId: step.id,
      courseId: course?.id ?? null,
      courseTitle: course?.title ?? null,
      order: step.order,
      title: step.title,
      eventCount: 0,
      startedUsers: new Set<string>(),
      modeStartedUsers: createModeUserSets(),
      modeCompletedUsers: createModeUserSets(),
      practiceSubmissions: 0,
      practiceIncorrect: 0,
      testSubmissions: 0,
      testFailures: 0,
      challengeSubmissions: 0,
      challengePassed: 0,
      relatedFeedbackCount: 0,
      newFeedbackCount: 0,
    })
  }

  for (const row of events) {
    if (!row.step_id) continue
    const aggregate = aggregates.get(row.step_id)
    if (!aggregate) continue

    aggregate.eventCount += 1
    aggregate.startedUsers.add(row.user_id)

    if (row.event_type === 'mode_started' && isLearningMode(row.mode)) {
      aggregate.modeStartedUsers[row.mode].add(row.user_id)
    }

    if (row.event_type === 'mode_completed' && isLearningMode(row.mode)) {
      aggregate.modeCompletedUsers[row.mode].add(row.user_id)
    }

    if (row.event_type === 'practice_answer_submitted') {
      aggregate.practiceSubmissions += 1
      if (getPayloadBoolean(row.payload, 'isCorrect') === false) {
        aggregate.practiceIncorrect += 1
      }
    }

    if (row.event_type === 'test_submitted') {
      aggregate.testSubmissions += 1
      if (getPayloadBoolean(row.payload, 'isCorrect') === false) {
        aggregate.testFailures += 1
      }
    }

    if (row.event_type === 'challenge_submitted') {
      aggregate.challengeSubmissions += 1
      if (getPayloadBoolean(row.payload, 'isCorrect') === true) {
        aggregate.challengePassed += 1
      }
    }
  }

  for (const row of feedbackRows) {
    for (const aggregate of aggregates.values()) {
      if (!isStepFeedback(row, aggregate.stepId)) continue
      aggregate.relatedFeedbackCount += 1
      if (row.status === 'new') {
        aggregate.newFeedbackCount += 1
      }
    }
  }

  return [...aggregates.values()]
}

function selectBottleneck(indicators: readonly { label: string; score: number | null }[]): string {
  const measurable = indicators.filter((item): item is { label: string; score: number } => item.score !== null)
  if (measurable.length === 0) return 'データ不足'
  const [worst] = measurable.sort((a, b) => b.score - a.score)
  return worst ? `${worst.label} ${formatPercent(worst.score)}` : 'データ不足'
}

function getStepInsightSignal(row: {
  eventCount: number
  dropoffRate: number | null
  practiceIncorrectRate: number | null
  practiceSubmissions: number
  testFailureRate: number | null
  testSubmissions: number
  challengePassRate: number | null
  challengeSubmissions: number
  relatedFeedbackCount: number
}): AdminQualityStepInsightSignal {
  if (row.eventCount === 0 && row.relatedFeedbackCount === 0) return 'insufficient'

  const hasAttentionSignal =
    (row.dropoffRate !== null && row.dropoffRate >= 0.6) ||
    (row.practiceIncorrectRate !== null && row.practiceSubmissions >= 3 && row.practiceIncorrectRate >= 0.5) ||
    (row.testFailureRate !== null && row.testSubmissions >= 3 && row.testFailureRate >= 0.5) ||
    (row.challengePassRate !== null && row.challengeSubmissions >= 3 && row.challengePassRate < 0.4) ||
    row.relatedFeedbackCount >= 3

  if (hasAttentionSignal) return 'attention'

  const hasWatchSignal =
    (row.dropoffRate !== null && row.dropoffRate >= 0.3) ||
    (row.practiceIncorrectRate !== null && row.practiceSubmissions > 0 && row.practiceIncorrectRate >= 0.3) ||
    (row.testFailureRate !== null && row.testSubmissions > 0 && row.testFailureRate >= 0.3) ||
    (row.challengePassRate !== null && row.challengeSubmissions > 0 && row.challengePassRate < 0.7) ||
    row.relatedFeedbackCount > 0

  return hasWatchSignal ? 'watch' : 'healthy'
}

function buildAdminStepInsightRows(aggregates: StepEventAggregate[]): AdminStepInsight[] {
  return aggregates
    .map((row) => {
      const startedUsers = row.startedUsers.size
      const readStartedUsers = row.modeStartedUsers.read.size
      const practiceStartedUsers = row.modeStartedUsers.practice.size
      const testStartedUsers = row.modeStartedUsers.test.size
      const challengeStartedUsers = row.modeStartedUsers.challenge.size
      const readCompletedUsers = row.modeCompletedUsers.read.size
      const practiceCompletedUsers = row.modeCompletedUsers.practice.size
      const testCompletedUsers = row.modeCompletedUsers.test.size
      const challengeCompletedUsers = row.modeCompletedUsers.challenge.size
      const completionRate = safeRate(challengeCompletedUsers, startedUsers)
      const readToPracticeRate = safeRate(practiceStartedUsers, readStartedUsers)
      const practiceToTestRate = safeRate(testStartedUsers, practiceStartedUsers)
      const testToChallengeRate = safeRate(challengeStartedUsers, testStartedUsers)
      const challengeReachRate = safeRate(challengeStartedUsers, startedUsers)
      const dropoffRate = challengeReachRate === null ? null : 1 - challengeReachRate
      const practiceIncorrectRate = safeRate(row.practiceIncorrect, row.practiceSubmissions)
      const testFailureRate = safeRate(row.testFailures, row.testSubmissions)
      const challengePassRate = safeRate(row.challengePassed, row.challengeSubmissions)
      const bottleneck = selectBottleneck([
        { label: '離脱率', score: dropoffRate },
        { label: 'Practice誤答率', score: practiceIncorrectRate },
        { label: 'Test失敗率', score: testFailureRate },
        {
          label: 'Challenge不合格率',
          score: challengePassRate === null ? null : 1 - challengePassRate,
        },
        {
          label: 'Read→Practice未遷移',
          score: readToPracticeRate === null ? null : 1 - readToPracticeRate,
        },
        {
          label: 'Practice→Test未遷移',
          score: practiceToTestRate === null ? null : 1 - practiceToTestRate,
        },
        {
          label: 'Test→Challenge未遷移',
          score: testToChallengeRate === null ? null : 1 - testToChallengeRate,
        },
      ])
      const signal = getStepInsightSignal({
        eventCount: row.eventCount,
        dropoffRate,
        practiceIncorrectRate,
        practiceSubmissions: row.practiceSubmissions,
        testFailureRate,
        testSubmissions: row.testSubmissions,
        challengePassRate,
        challengeSubmissions: row.challengeSubmissions,
        relatedFeedbackCount: row.relatedFeedbackCount,
      })

      return {
        stepId: row.stepId,
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        order: row.order,
        title: row.title,
        eventCount: row.eventCount,
        startedUsers,
        readStartedUsers,
        practiceStartedUsers,
        testStartedUsers,
        challengeStartedUsers,
        readCompletedUsers,
        practiceCompletedUsers,
        testCompletedUsers,
        challengeCompletedUsers,
        completionRate,
        readToPracticeRate,
        practiceToTestRate,
        testToChallengeRate,
        dropoffRate,
        practiceSubmissions: row.practiceSubmissions,
        practiceIncorrectRate,
        testSubmissions: row.testSubmissions,
        testFailureRate,
        challengeSubmissions: row.challengeSubmissions,
        challengePassRate,
        relatedFeedbackCount: row.relatedFeedbackCount,
        newFeedbackCount: row.newFeedbackCount,
        bottleneck,
        signal,
      }
    })
    .sort((a, b) => {
      const signalOrder: Record<AdminQualityStepInsightSignal, number> = {
        attention: 0,
        watch: 1,
        healthy: 2,
        insufficient: 3,
      }
      return signalOrder[a.signal] - signalOrder[b.signal] || a.order - b.order
    })
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

async function fetchAllLearningEvents(): Promise<LearningEventRow[]> {
  const rows: LearningEventRow[] = []

  for (let from = 0; ; from += LEARNING_EVENTS_PAGE_SIZE) {
    const to = from + LEARNING_EVENTS_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('learning_events')
      .select(LEARNING_EVENTS_SELECT)
      .order('id', { ascending: true })
      .range(from, to)

    if (error) {
      throw fromSupabaseError(error, 'Step Insightsのイベントログ取得に失敗しました')
    }

    const pageRows = (data ?? []) as LearningEventRow[]
    rows.push(...pageRows)

    if (pageRows.length < LEARNING_EVENTS_PAGE_SIZE) {
      return rows
    }
  }
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

export async function getAdminStepInsights(): Promise<AdminStepInsights> {
  const [events, feedbackRes] = await Promise.all([
    fetchAllLearningEvents(),
    supabase.from('user_feedback').select('status, created_at, page_url'),
  ])

  if (feedbackRes.error)
    throw fromSupabaseError(feedbackRes.error, 'Step Insightsのフィードバック取得に失敗しました')

  const feedbackRows = (feedbackRes.data ?? []) as StepFeedbackRow[]
  const rows = buildAdminStepInsightRows(buildStepEventAggregates(events, feedbackRows))
  const observedRows = rows.filter((row) => row.eventCount > 0 || row.relatedFeedbackCount > 0)

  return {
    generatedAt: new Date().toISOString(),
    totalEvents: events.length,
    observedSteps: observedRows.length,
    attentionSteps: rows.filter((row) => row.signal === 'attention').length,
    rows,
  }
}

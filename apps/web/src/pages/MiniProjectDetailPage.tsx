import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CodeEditor } from '../components/CodeEditor'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useIsMobile } from '../hooks/useIsMobile'
import { getProjectProgressMap, submitProject } from '../services/miniProjectService'
import { PracticeModeNav } from '../features/daily/components/PracticeModeNav'
import { PracticePageLayout } from '../components/PracticePageLayout'
import { MINI_PROJECTS } from '../content/mini-projects/projects'
import type { MilestoneJudgeResult, MiniProjectProgress, MiniProjectStatus, SubmitProjectResult } from '../content/mini-projects/types'

export function MiniProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const project = MINI_PROJECTS.find((p) => p.id === projectId)

  useDocumentTitle(project ? project.title : 'ミニプロジェクト実装')

  const [progress, setProgress] = useState<MiniProjectProgress | null>(null)
  const [code, setCode] = useState('')
  const [milestoneResults, setMilestoneResults] = useState<MilestoneJudgeResult[] | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitProjectResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const milestoneKeywords = useMemo(
    () => project?.milestones.flatMap((m) => m.requiredKeywords) ?? [],
    [project?.milestones],
  )

  useEffect(() => {
    if (!user || !project) return
    const userId = user.id
    const proj = project
    let isMounted = true

    async function load() {
      try {
        const map = await getProjectProgressMap(userId)
        if (!isMounted) return
        const prog = map.get(proj.id) ?? null
        setProgress(prog)
        setCode(prog?.code ?? proj.initialCode)
      } catch (e) {
        if (!isMounted) return
        setLoadError(e instanceof Error ? e.message : '進捗の取得に失敗しました')
        setCode(proj.initialCode)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [user, project])

  if (!project) {
    return <Navigate to="/practice/mini-projects" replace />
  }

  const currentStatus: MiniProjectStatus = submitResult?.newStatus ?? progress?.status ?? 'not_started'
  const isCompleted = currentStatus === 'completed'

  async function handleSubmit() {
    if (!user || !project) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const previousStatus: MiniProjectStatus = progress?.status ?? 'not_started'
      const result = await submitProject(user.id, project, code, previousStatus)
      setSubmitResult(result)
      setMilestoneResults(result.milestoneResults)
      setProgress((prev) => ({
        projectId: project.id,
        status: result.newStatus,
        code,
        completedAt: prev?.completedAt ?? null,
      }))
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  function getMilestoneIcon(milestoneId: string): string {
    if (!milestoneResults) return '🔒'
    const r = milestoneResults.find((r) => r.milestoneId === milestoneId)
    if (!r) return '🔒'
    return r.passed ? '✅' : '▶'
  }

  return (
    <PracticePageLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <PracticeModeNav />

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">
          {/* 左パネル */}
          <div className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-72 lg:shrink-0">
            <Link
              to="/practice/mini-projects"
              className="flex items-center gap-1 text-sm text-text-muted hover:text-text-dark"
            >
              ← 一覧に戻る
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {project.difficulty === 'beginner' ? '初級' : project.difficulty === 'intermediate' ? '中級' : '上級'}
              </p>
              <h2 className="mt-1 text-lg font-bold text-text-dark">{project.title}</h2>
              <p className="mt-1 text-sm text-text-muted">{project.description}</p>
            </div>

            {/* マイルストーン一覧 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                マイルストーン
              </p>
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-lg border border-border bg-bg-surface p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getMilestoneIcon(milestone.id)}</span>
                    <p className="text-sm font-medium text-text-dark">{milestone.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{milestone.description}</p>
                </div>
              ))}
            </div>

            {/* 送信結果 */}
            {submitResult && (
              <div
                className={`rounded-xl border p-4 text-sm ${submitResult.allPassed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
                role="status"
              >
                {submitResult.allPassed ? (
                  <>
                    <p className="font-semibold text-emerald-800">
                      ✅ 全マイルストーン達成！
                      {submitResult.pointsEarned > 0 && ` +${submitResult.pointsEarned} Pt`}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {submitResult.pointsEarned > 0
                        ? 'おめでとうございます！初回完了ボーナスを獲得しました。'
                        : 'このプロジェクトは既に完了済みです。'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-amber-800">
                      {submitResult.milestoneResults.filter((r) => r.passed).length} /{' '}
                      {submitResult.milestoneResults.length} マイルストーン達成
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      未達成のマイルストーンの条件を確認して、コードを修正してください。
                    </p>
                  </>
                )}
              </div>
            )}

            {submitError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </p>
            )}

            {loadError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {loadError}
              </div>
            )}
          </div>

          {/* 右エリア: Monaco Editor */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {isCompleted && !submitResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                ✅ このプロジェクトは完了済みです。コードを確認・編集できます。
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border">
              <CodeEditor
                value={code}
                onChange={(v) => {
                  setCode(v)
                  setMilestoneResults(null)
                  setSubmitResult(null)
                }}
                language="typescript"
                height={isMobile ? 'min(50vh, 300px)' : '520px'}
                toolbarKeywords={milestoneKeywords}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || isCompleted}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '判定中...' : isCompleted ? '✅ 完了済み' : '判定する'}
              </button>
              {isCompleted && (
                <Link
                  to="/practice/mini-projects"
                  className="text-sm font-medium text-text-muted hover:text-text-dark"
                >
                  一覧に戻る →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </PracticePageLayout>
  )
}

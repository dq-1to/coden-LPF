import { ErrorBanner } from '@/components/ErrorBanner'
import type { ChallengeSubmission } from '@/services/challengeSubmissionService'
import { formatDateTime } from '@/shared/utils/dateTime'

interface ChallengeSubmissionHistoryProps {
  submissions: ChallengeSubmission[]
  isLoading: boolean
  error: string | null
}

function getPreviewCode(code: string): string {
  const trimmed = code.trim()
  if (trimmed.length <= 160) {
    return trimmed
  }

  return `${trimmed.slice(0, 160)}...`
}

export function ChallengeSubmissionHistory({
  submissions,
  isLoading,
  error,
}: ChallengeSubmissionHistoryProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">直近の提出履歴</h3>
          <p className="text-xs text-slate-500">このステップの最新 5 件を表示します。</p>
        </div>
      </div>

      {isLoading ? <p className="mt-3 text-sm text-slate-500">提出履歴を読み込み中...</p> : null}
      {error ? <ErrorBanner className="mt-3">{error}</ErrorBanner> : null}
      {!isLoading && !error && submissions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">提出履歴はまだありません。</p>
      ) : null}

      {!isLoading && !error && submissions.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {submissions.map((submission, index) => (
            <li key={submission.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {index === 0 ? 'Latest Submission' : `Submission ${index + 1}`}
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    submission.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {submission.is_passed ? '合格' : '未達成'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(submission.submitted_at)}</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
                <code>{getPreviewCode(submission.code)}</code>
              </pre>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

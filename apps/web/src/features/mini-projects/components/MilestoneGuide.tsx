import type { MilestoneJudgeResult, MiniProjectMilestone } from '../../../content/mini-projects/types'

interface MilestoneGuideProps {
  milestones: MiniProjectMilestone[]
  currentIndex: number
  milestoneResults: MilestoneJudgeResult[] | null
}

export function MilestoneGuide({ milestones, currentIndex, milestoneResults }: MilestoneGuideProps) {
  function getStatus(index: number): 'completed' | 'current' | 'pending' {
    if (milestoneResults) {
      const r = milestoneResults[index]
      if (r?.passed) return 'completed'
    }
    if (index === currentIndex) return 'current'
    if (index < currentIndex) return 'completed'
    return 'pending'
  }

  const current = milestones[currentIndex]

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* ステッパー */}
      <div className="flex items-center justify-center gap-1" role="group" aria-label="マイルストーン進捗">
        {milestones.map((milestone, i) => {
          const status = getStatus(i)
          return (
            <div key={milestone.id} className="flex items-center">
              <div
                className={[
                  'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-sm font-bold',
                  status === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : status === 'current'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                      : 'bg-slate-200 text-slate-400',
                ].join(' ')}
                aria-label={`${milestone.title}: ${status === 'completed' ? '完了' : status === 'current' ? '現在' : '未着手'}`}
                role="status"
              >
                {status === 'completed' ? '✓' : i + 1}
              </div>
              {i < milestones.length - 1 && (
                <div
                  className={[
                    'h-0.5 w-6',
                    getStatus(i) === 'completed' ? 'bg-emerald-400' : 'bg-slate-200',
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* 現在のマイルストーン説明 */}
      {current && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-700">
            Step {currentIndex + 1}: {current.title}
          </p>
          <p className="mt-1 text-sm text-amber-800">{current.description}</p>
        </div>
      )}
    </div>
  )
}

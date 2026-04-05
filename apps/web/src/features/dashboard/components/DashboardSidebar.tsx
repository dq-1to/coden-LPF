import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/Spinner'
import { useAchievementContext } from '@/contexts/AchievementContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLearningContext } from '@/contexts/LearningContext'
import {
  calculatePointGoalProgress,
  countMonthlyStudyDays,
  getLearningHeatmap,
  type HeatmapCell,
} from '@/services/statsService'

const HEATMAP_DAYS = 30
const EMPTY_HEATMAP: HeatmapCell[] = Array.from({ length: HEATMAP_DAYS }, (_, index) => ({
  date: `empty-${index}`,
  count: 0,
  level: 0,
}))

function heatmapColor(level: number) {
  if (level === 3) return 'bg-primary-dark'
  if (level === 2) return 'bg-primary-mint'
  if (level === 1) return 'bg-emerald-200'
  return 'bg-slate-100'
}

export function DashboardSidebar() {
  const { user } = useAuth()
  const { stats } = useLearningContext()
  const { unlockedBadgeIds } = useAchievementContext()
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([])
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    if (!user?.id) {
      setHeatmap([])
      setIsLoadingHeatmap(false)
      setError(null)
      return () => {
        isMounted = false
      }
    }

    setIsLoadingHeatmap(true)
    setError(null)

    getLearningHeatmap(user.id, HEATMAP_DAYS)
      .then((data) => {
        if (isMounted) {
          setHeatmap(data)
        }
      })
      .catch((loadError) => {
        if (!isMounted) {
          return
        }
        const message = loadError instanceof Error ? loadError.message : '学習ヒートマップの取得に失敗しました。'
        setError(message)
        setHeatmap([])
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHeatmap(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const pointGoal = useMemo(() => calculatePointGoalProgress(stats?.total_points ?? 0), [stats?.total_points])
  const heatmapCells = heatmap.length > 0 ? heatmap : EMPTY_HEATMAP
  const monthlyStudyDays = useMemo(() => countMonthlyStudyDays(heatmap), [heatmap])

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="bg-mint-gradient px-5 py-4">
          <h3 className="font-bold text-white">学習ステータス</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">連続学習</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{stats?.current_streak ?? 0}日</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">合計ポイント</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{stats?.total_points ?? 0}pt</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-text-light">
              <span>次の目標まで</span>
              <span className="text-primary-mint">
                {pointGoal.current} / {pointGoal.target} pt
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pointGoal.percent} aria-valuemin={0} aria-valuemax={100} aria-label="ポイント目標進捗">
              <div
                className="h-full rounded-full bg-mint-gradient transition-all duration-300"
                style={{ width: `${pointGoal.percent}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-light">獲得バッジ</p>
            <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-primary-dark">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
                {unlockedBadgeIds.length} 個獲得 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-dark">学習ヒートマップ</h3>
          <span className="text-xs text-text-light">過去30日</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {heatmapCells.map((cell, index) => (
            <span
              key={`${cell.date}-${index}`}
              className={`h-3 w-3 rounded-sm ${heatmapColor(cell.level)}`}
              role="img"
              aria-label={`${cell.date}: ${cell.count}回学習`}
              title={`${cell.date}: ${cell.count}回学習`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-text-light">
            今月は <span className="font-bold text-text-dark">{monthlyStudyDays}日</span> 学習
          </p>
          <div className="flex items-center gap-1 text-[10px] text-text-light">
            <span>少</span>
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-100" />
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200" />
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary-mint" />
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary-dark" />
            <span>多</span>
          </div>
        </div>
        {isLoadingHeatmap ? <div className="mt-2 flex justify-center"><Spinner size="sm" /></div> : null}
        {error ? <p className="mt-2 text-center text-[11px] text-rose-600">{error}</p> : null}
      </section>

    </aside>
  )
}

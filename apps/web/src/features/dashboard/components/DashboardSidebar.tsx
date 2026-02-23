import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useLearningContext } from '../../../contexts/LearningContext'
import {
  calculatePointGoalProgress,
  countMonthlyStudyDays,
  getLearningHeatmap,
  type HeatmapCell,
} from '../../../services/statsService'

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
      <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="bg-mint-gradient px-5 py-4">
          <h3 className="font-bold text-white">学習ステータス</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600">連続学習</p>
              <p className="mt-1 text-2xl font-black text-orange-700">{stats?.current_streak ?? 0}日</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">合計ポイント</p>
              <p className="mt-1 text-2xl font-black text-indigo-700">{stats?.total_points ?? 0}pt</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-text-light">
              <span>次の目標まで</span>
              <span className="text-primary-mint">
                {pointGoal.current} / {pointGoal.target} pt
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-mint-gradient transition-all duration-300"
                style={{ width: `${pointGoal.percent}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-light">獲得バッジ</p>
            <div className="flex items-center justify-between text-xl">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-yellow-200 bg-yellow-100">✅</span>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-orange-100">🔥</span>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-blue-200 bg-blue-100">💻</span>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-slate-100 text-slate-400">
                🔒
              </span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-yellow-300/20 blur-2xl" />
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-dark">学習ヒートマップ</h3>
          <span className="text-xs text-text-light">過去30日</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {heatmapCells.map((cell, index) => (
            <span key={`${cell.date}-${index}`} className={`h-3 w-3 rounded-sm ${heatmapColor(cell.level)}`} />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-text-light">
          今月は <span className="font-bold text-text-dark">{monthlyStudyDays}日</span> 学習しました
        </p>
        {isLoadingHeatmap ? <p className="mt-2 text-center text-[11px] text-text-light">ヒートマップを更新中...</p> : null}
        {error ? <p className="mt-2 text-center text-[11px] text-rose-600">{error}</p> : null}
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 p-5 text-white shadow-sm">
        <p className="mb-2 inline-block rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Daily Challenge
        </p>
        <h3 className="font-bold">ボーナス問題を解く</h3>
        <p className="mt-1 text-sm text-indigo-100">React Hooks クイズに正解して +50pt を獲得しましょう。</p>
        <button
          className="mt-4 w-full cursor-not-allowed rounded-lg bg-white/50 py-2 text-sm font-semibold text-indigo-400"
          type="button"
          disabled
          aria-disabled="true"
        >
          準備中
        </button>
      </section>
    </aside>
  )
}

import type { WeeklyStatusEntry } from '../../../content/daily/types'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

interface WeeklyStatusProps {
  entries: WeeklyStatusEntry[]
  todayStr: string
}

export function WeeklyStatus({ entries, todayStr }: WeeklyStatusProps) {
  const completedCount = entries.filter((e) => e.completed).length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-dark">今週の達成状況</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          {completedCount} / {entries.length} 日
        </span>
      </div>
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {entries.map((entry, i) => {
          const isToday = entry.date === todayStr
          return (
            <div key={entry.date} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">{DAY_LABELS[i]}</span>
              <div
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-11 sm:w-11',
                  entry.completed
                    ? 'bg-amber-400 text-white shadow-sm shadow-amber-200'
                    : isToday
                      ? 'border-2 border-amber-400 bg-white text-amber-500'
                      : 'bg-slate-100 text-slate-300',
                ].join(' ')}
                aria-label={`${entry.date} ${entry.completed ? '達成' : '未達成'}`}
              >
                {entry.completed ? '✓' : isToday ? '●' : '○'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

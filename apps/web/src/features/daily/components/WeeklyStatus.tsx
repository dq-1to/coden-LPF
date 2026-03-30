import type { WeeklyStatusEntry } from '../../../content/daily/types'

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

interface WeeklyStatusProps {
  entries: WeeklyStatusEntry[]
  todayStr: string
}

export function WeeklyStatus({ entries, todayStr }: WeeklyStatusProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-dark">今週の達成状況</h3>
      <div className="flex items-center gap-2">
        {entries.map((entry, i) => {
          const isToday = entry.date === todayStr
          return (
            <div key={entry.date} className="flex flex-col items-center gap-1">
              <span className="text-xs text-text-muted">{DAY_LABELS[i]}</span>
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                  entry.completed
                    ? 'bg-amber-400 text-white'
                    : isToday
                      ? 'border-2 border-amber-400 bg-bg-base text-amber-500'
                      : 'bg-gray-100 text-text-muted',
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

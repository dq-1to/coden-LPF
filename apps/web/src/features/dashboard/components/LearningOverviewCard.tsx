import { Link } from 'react-router-dom'

interface LearningOverviewCardProps {
  completedCount: number
  totalSteps: number
}

const LEARNING_PATH = [
  {
    id: 'usestate-basic',
    title: 'Step 1: useState基礎',
    status: '完了',
    description: '状態管理の基本を学び、コンポーネントに記憶を持たせる方法を理解します。',
  },
  {
    id: 'events',
    title: 'Step 2: イベント処理',
    status: '学習中',
    description: 'クリックや入力イベントを扱い、ユーザー操作に反応する実装を行います。',
  },
  {
    id: 'conditional',
    title: 'Step 3: 条件付きレンダリング',
    status: 'ロック中',
    description: '条件に応じた表示切り替えで、UIの分岐を実装します。',
  },
  {
    id: 'lists',
    title: 'Step 4: リスト表示',
    status: 'ロック中',
    description: '配列データを効率的に描画し、keyの基本を理解します。',
  },
] as const

export function LearningOverviewCard({ completedCount, totalSteps }: LearningOverviewCardProps) {
  const progressPercent = Math.max(0, Math.min(100, Math.round((completedCount / totalSteps) * 100)))

  return (
    <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-dark">学習コース進捗</h2>
          <p className="mt-1 text-sm text-text-light">コース全体の進捗を確認できます</p>
        </div>
        <Link
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          to="/step/events"
        >
          続きから再開
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-primary-dark">
            完了ステップ {completedCount} / {totalSteps}
          </span>
          <span className="text-text-light">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary-mint transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <ul className="space-y-3">
        {LEARNING_PATH.map((item) => {
          const isInProgress = item.status === '学習中'
          const isDone = item.status === '完了'
          return (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${
                isInProgress
                  ? 'border-primary-mint bg-secondary-bg'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-dark">{item.title}</p>
                  <p className="mt-1 text-sm text-text-light">{item.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${
                    isInProgress
                      ? 'bg-primary-mint text-white'
                      : isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

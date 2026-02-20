const HEATMAP_LEVELS = [0, 1, 2, 1, 0, 3, 2, 0, 0, 1, 2, 3, 1, 0, 0, 0, 2, 1, 3, 2, 0, 1, 2, 3, 1, 0, 2, 1]

function heatmapColor(level: number) {
  if (level === 3) return 'bg-primary-dark'
  if (level === 2) return 'bg-primary-mint'
  if (level === 1) return 'bg-emerald-200'
  return 'bg-slate-100'
}

export function DashboardSidebar() {
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
              <p className="mt-1 text-2xl font-black text-orange-700">3日</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">合計ポイント</p>
              <p className="mt-1 text-2xl font-black text-indigo-700">450pt</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-text-light">
              <span>次のレベルまで</span>
              <span className="text-primary-mint">50 / 500 pt</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[10%] rounded-full bg-mint-gradient" />
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
          {HEATMAP_LEVELS.map((level, index) => (
            <span key={`${level}-${index}`} className={`h-3 w-3 rounded-sm ${heatmapColor(level)}`} />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-text-light">
          今月は <span className="font-bold text-text-dark">12日</span> 学習しました
        </p>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-600 p-5 text-white shadow-sm">
        <p className="mb-2 inline-block rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Daily Challenge
        </p>
        <h3 className="font-bold">ボーナス問題を解く</h3>
        <p className="mt-1 text-sm text-indigo-100">React Hooks クイズに正解して +50pt を獲得しましょう。</p>
        <button className="mt-4 w-full rounded-lg bg-white py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50" type="button">
          チャレンジ開始
        </button>
      </section>
    </aside>
  )
}

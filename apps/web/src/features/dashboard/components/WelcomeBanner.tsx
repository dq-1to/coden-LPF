interface WelcomeBannerProps {
  displayName: string
}

export function WelcomeBanner({ displayName }: WelcomeBannerProps) {
  return (
    <section className="rounded-3xl bg-mint-gradient px-6 py-8 text-white shadow-glass sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Welcome back</p>
          <h1 className="font-display text-3xl font-bold leading-tight">こんにちは、{displayName}さん</h1>
          <p className="text-sm text-emerald-50 sm:text-base">
            Reactマスターへの道を進めましょう。今日の1ステップが次の実装力につながります。
          </p>
        </div>
        <div className="grid h-20 w-20 place-items-center rounded-full border border-white/30 bg-white/20">
          <img src="/coden_logo.png" alt="Coden" className="h-12 w-12 object-contain" />
        </div>
      </div>
    </section>
  )
}

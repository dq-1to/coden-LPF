interface AuthBrandHeaderProps {
  subtitle: string
}

/** Login / SignUp ページ共通のブランドヘッダー */
export function AuthBrandHeader({ subtitle }: AuthBrandHeaderProps) {
  return (
    <header className="space-y-2">
      <div className="flex items-center gap-3">
        <img src="/coden_logo.png" alt="Coden Logo" className="h-12 w-12 object-contain" />
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary-mint">Coden</h1>
      </div>
      <p className="text-slate-600">{subtitle}</p>
    </header>
  )
}

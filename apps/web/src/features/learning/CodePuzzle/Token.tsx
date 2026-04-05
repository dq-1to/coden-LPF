interface TokenProps {
  text: string
  onClick: () => void
  variant: 'pool' | 'assembled'
  disabled?: boolean
}

const VARIANT_STYLES: Record<'pool' | 'assembled', string> = {
  pool: 'bg-slate-700 text-emerald-300 border border-slate-500 rounded-lg px-3 py-2 font-mono text-sm',
  assembled:
    'bg-emerald-800/30 text-emerald-300 border border-emerald-500/50 rounded-lg px-3 py-2 font-mono text-sm',
}

const BASE_STYLES = 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center'

const DISABLED_STYLES = 'opacity-50 cursor-not-allowed'

export function Token({ text, onClick, variant, disabled = false }: TokenProps) {
  return (
    <button
      type="button"
      className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${disabled ? DISABLED_STYLES : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  )
}

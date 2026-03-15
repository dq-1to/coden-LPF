import { X } from 'lucide-react'

const VARIANT_STYLES = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
} as const

interface ErrorBannerProps {
  variant?: keyof typeof VARIANT_STYLES
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function ErrorBanner({ variant = 'error', children, onDismiss, className = '' }: ErrorBannerProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${VARIANT_STYLES[variant]} ${className}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">{children}</div>
        {onDismiss ? (
          <button
            type="button"
            className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            onClick={onDismiss}
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

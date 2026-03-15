import { Loader2 } from 'lucide-react'

const SIZE_MAP = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
} as const

interface SpinnerProps {
  size?: keyof typeof SIZE_MAP
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-label={label ?? '読み込み中'}>
      <Loader2 className={`${SIZE_MAP[size]} animate-spin text-primary-mint`} />
      {label ? <span className="text-sm text-text-light">{label}</span> : null}
    </div>
  )
}

export function PageSpinner({ label = '読み込み中...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  )
}

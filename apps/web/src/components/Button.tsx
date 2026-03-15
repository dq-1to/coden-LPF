import type { ButtonHTMLAttributes, ReactNode } from 'react'

const VARIANT_STYLES = {
  primary:
    'bg-primary-mint text-white hover:bg-primary-dark active:bg-emerald-700 shadow-sm',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
} as const

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
} as const

const BASE_STYLES =
  'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-mint/30'

const DISABLED_STYLES =
  'disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-slate-200'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_STYLES
  size?: keyof typeof SIZE_STYLES
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${DISABLED_STYLES} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

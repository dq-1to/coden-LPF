import { CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const ONBOARDING_DISMISSED_KEY = 'coden_onboarding_dismissed'

interface OnboardingCardProps {
  startTo: string
}

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

function persistDismissed() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
  } catch {
    // localStorage が使えない環境でも画面内では閉じられるようにする
  }
}

export function OnboardingCard({ startTo }: OnboardingCardProps) {
  const [isDismissed, setIsDismissed] = useState(readDismissed)

  function dismiss() {
    persistDismissed()
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="onboarding-title">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary-dark">はじめての方へ</p>
          <h2 id="onboarding-title" className="mt-1 text-lg font-black text-slate-950">
            4つの流れで1ステップずつ進めます
          </h2>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
          aria-label="オンボーディングを閉じる"
          onClick={dismiss}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-mint" aria-hidden="true" />
          Readで概念を読み、Practiceで手を動かします。
        </p>
        <p className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-mint" aria-hidden="true" />
          Testで理解を確認し、Challengeで自分のコードにします。
        </p>
        <p className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-mint" aria-hidden="true" />
          迷ったら「今日のおすすめ」から次の行動へ戻れます。
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          to={startTo}
          className="inline-flex items-center justify-center rounded-xl bg-primary-mint px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
          onClick={dismiss}
        >
          始める
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
          onClick={dismiss}
        >
          閉じる
        </button>
      </div>
    </section>
  )
}

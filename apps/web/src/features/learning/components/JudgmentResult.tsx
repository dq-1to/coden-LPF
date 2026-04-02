interface JudgmentResultProps {
  isPassed: boolean
  passedMessage: string
  failedMessage: string
  failedHint?: string
}

export function JudgmentResult({ isPassed, passedMessage, failedMessage, failedHint }: JudgmentResultProps) {
  return (
    <div
      className={`animate-fadeIn rounded-xl border px-4 py-3 ${isPassed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}
      role="status"
      aria-live="polite"
    >
      <p className={`text-sm font-semibold ${isPassed ? 'text-emerald-800' : 'text-rose-800'}`}>
        {isPassed ? passedMessage : failedMessage}
      </p>
      {!isPassed && failedHint && (
        <p className="mt-1 text-xs text-rose-700">{failedHint}</p>
      )}
    </div>
  )
}

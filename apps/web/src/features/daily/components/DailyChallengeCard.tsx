import { useState } from 'react'
import type { DailyQuestion, SubmitResult } from '../../../content/daily/types'

interface DailyChallengeCardProps {
  question: DailyQuestion
  dateStr: string
  onSubmit: (answer: string) => Promise<SubmitResult>
}

export function DailyChallengeCard({ question, dateStr, onSubmit }: DailyChallengeCardProps) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await onSubmit(answer)
      setResult(res)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = dateStr.replace(/-/g, '/')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{formattedDate}</span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700">
          {question.type === 'blank' ? '穴埋め' : '選択式'}
        </span>
      </div>

      <p className="mb-5 whitespace-pre-wrap text-base font-medium leading-relaxed text-text-dark">
        {question.prompt}
      </p>

      {!result && (
        <>
          {question.type === 'blank' ? (
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSubmit()
              }}
              placeholder="答えを入力..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoCapitalize="off"
              className="mb-4 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-text-dark placeholder-slate-400 transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          ) : (
            <div className="mb-4 space-y-2">
              {question.choices?.map((choice) => (
                <label
                  key={choice}
                  className={[
                    'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
                    answer === choice
                      ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-slate-200 bg-white text-text-dark hover:border-amber-200 hover:bg-amber-50/30',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={choice}
                    checked={answer === choice}
                    onChange={() => setAnswer(choice)}
                    className="accent-amber-500"
                  />
                  {choice}
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleSubmit()}
              disabled={!answer.trim() || isSubmitting}
              className="min-h-[44px] rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '判定中...' : '判定する'}
            </button>
            <button
              onClick={() => setShowHint((v) => !v)}
              className="min-h-[44px] px-2 text-sm text-slate-500 transition-colors hover:text-amber-600"
            >
              {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
            </button>
          </div>

          {showHint && (
            <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              💡 {question.hint}
            </p>
          )}
        </>
      )}

      {result && (
        <div
          className={[
            'rounded-2xl border p-5',
            result.isCorrect
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
              : 'border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50',
          ].join(' ')}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{result.isCorrect ? '🎉' : '😢'}</span>
            <span
              className={[
                'text-base font-bold',
                result.isCorrect ? 'text-emerald-700' : 'text-rose-700',
              ].join(' ')}
            >
              {result.isCorrect ? '正解！' : '不正解'}
            </span>
            {result.isCorrect && (
              <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-sm font-semibold text-amber-700">
                +{result.pointsEarned} Pt
              </span>
            )}
          </div>
          {!result.isCorrect && (
            <p className="mb-2 text-sm text-text-dark">
              正解: <span className="font-mono font-semibold text-rose-700">{result.correctAnswer}</span>
            </p>
          )}
          <p className="text-sm leading-relaxed text-text-dark">{result.explanation}</p>
        </div>
      )}
    </div>
  )
}

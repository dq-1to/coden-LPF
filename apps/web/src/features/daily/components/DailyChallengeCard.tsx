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
    <div className="rounded-xl border border-border bg-bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-text-muted">📅 {formattedDate}</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
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
              className="mb-4 w-full rounded-lg border border-border bg-bg-base px-4 py-2 text-sm text-text-dark placeholder-text-muted focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          ) : (
            <div className="mb-4 space-y-2">
              {question.choices?.map((choice) => (
                <label
                  key={choice}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                    answer === choice
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-border bg-bg-base text-text-dark hover:border-amber-200 hover:bg-amber-50/50',
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
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '判定中...' : '判定する'}
            </button>
            <button
              onClick={() => setShowHint((v) => !v)}
              className="text-sm text-text-muted underline hover:text-text-dark"
            >
              {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
            </button>
          </div>

          {showHint && (
            <p className="mt-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
              💡 {question.hint}
            </p>
          )}
        </>
      )}

      {result && (
        <div
          className={[
            'rounded-xl border p-5',
            result.isCorrect
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50',
          ].join(' ')}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{result.isCorrect ? '🎉' : '😢'}</span>
            <span
              className={[
                'text-base font-bold',
                result.isCorrect ? 'text-green-700' : 'text-red-700',
              ].join(' ')}
            >
              {result.isCorrect ? '正解！' : '不正解'}
            </span>
            {result.isCorrect && (
              <span className="ml-auto text-sm font-semibold text-amber-600">
                +{result.pointsEarned} Pt
              </span>
            )}
          </div>
          {!result.isCorrect && (
            <p className="mb-2 text-sm text-text-dark">
              正解: <span className="font-mono font-semibold text-red-700">{result.correctAnswer}</span>
            </p>
          )}
          <p className="text-sm leading-relaxed text-text-dark">{result.explanation}</p>
        </div>
      )}
    </div>
  )
}

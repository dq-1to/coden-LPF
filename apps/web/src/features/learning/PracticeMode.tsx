import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import type { PracticeQuestion } from '../../content/fundamentals/steps'
import { addToReviewList, removeFromReviewList } from '../../services/reviewListService'

interface PracticeModeProps {
  stepId: string
  questions: PracticeQuestion[]
  onComplete: () => void
}

function normalize(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

export function PracticeMode({ stepId, questions, onComplete }: PracticeModeProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [hints, setHints] = useState<Record<string, boolean>>({})
  const [isJudged, setIsJudged] = useState(false)
  const [reported, setReported] = useState(false)

  // ステップ切り替え時に状態リセット
  useEffect(() => {
    setAnswers({})
    setHints({})
    setIsJudged(false)
    setReported(false)
  }, [stepId])

  const isAllCorrect = useMemo(
    () =>
      questions.every((question) => {
        const answer = answers[question.id] ?? ''
        return normalize(answer) === normalize(question.answer)
      }),
    [answers, questions],
  )

  function handleJudge() {
    setIsJudged(true)
    if (isAllCorrect) {
      removeFromReviewList(stepId)
      if (!reported) {
        onComplete()
        setReported(true)
      }
    } else {
      addToReviewList(stepId)
    }
  }

  function handleAnswerChange(questionId: string, value: string) {
    setIsJudged(false)
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Practice</h2>
      {questions.map((question, index) => {
        const answer = answers[question.id] ?? ''
        const isCorrect = answer.length > 0 && normalize(answer) === normalize(question.answer)
        const showExplanation = isJudged && !isCorrect && question.explanation

        return (
          <article key={question.id} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-700">
              Q{index + 1}. {question.prompt}
            </p>
            {question.choices ? (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Q${index + 1} 選択肢`}>
                {question.choices.map((choice) => {
                  const isSelected = answer === choice
                  const isChoiceCorrect = normalize(choice) === normalize(question.answer)
                  let btnClass = 'rounded-md border px-3 py-2 text-sm text-left transition-colors'
                  if (isJudged) {
                    if (isChoiceCorrect) {
                      btnClass += ' border-emerald-500 bg-emerald-100 text-emerald-800 font-semibold'
                    } else if (isSelected && !isChoiceCorrect) {
                      btnClass += ' border-rose-500 bg-rose-100 text-rose-800'
                    } else {
                      btnClass += ' border-slate-200 bg-slate-50 text-slate-400'
                    }
                  } else if (isSelected) {
                    btnClass += ' border-primary-mint bg-primary-mint/10 text-primary-dark font-medium'
                  } else {
                    btnClass += ' border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }
                  return (
                    <button
                      key={choice}
                      type="button"
                      role="radio"
                      className={btnClass}
                      aria-checked={isSelected}
                      onClick={() => handleAnswerChange(question.id, choice)}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
            ) : (
              <input
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-mint/30 focus:border-primary-mint ${isJudged
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-rose-500 bg-rose-50/50'
                  : 'border-slate-300'
                  }`}
                placeholder="回答を入力"
                value={answer}
                aria-label={`Q${index + 1} 回答欄`}
                onChange={(event) => handleAnswerChange(question.id, event.target.value)}
              />
            )}
            {isJudged ? (
              <p className={`rounded-md px-3 py-1.5 text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isCorrect ? '正解です。' : '不正解です。もう一度試してください。'}
              </p>
            ) : null}
            {showExplanation ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold text-amber-700">解説</p>
                <p className="mt-0.5 text-sm text-amber-900">{question.explanation}</p>
              </div>
            ) : null}
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              type="button"
              aria-expanded={hints[question.id] ?? false}
              onClick={() =>
                setHints((prev) => ({
                  ...prev,
                  [question.id]: !prev[question.id],
                }))
              }
            >
              ヒントを{hints[question.id] ? '隠す' : '表示'}
            </button>
            {hints[question.id] ? <p className="text-sm text-primary-dark">{question.hint}</p> : null}
          </article>
        )
      })}

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
        <Button size="lg" onClick={handleJudge}>
          判定する
        </Button>

        {isJudged && (
          <div
            className={`animate-fadeIn rounded-xl border px-4 py-3 ${isAllCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
            role="status"
            aria-live="polite"
          >
            <p className={`text-sm font-semibold ${isAllCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isAllCorrect ? 'すべて正解！ Practiceを完了しました。' : 'まだ不正解の問題があります。'}
            </p>
            {!isAllCorrect && (
              <p className="mt-1 text-xs text-amber-700">すべての問題に正解すると完了です。ヒントを活用してみましょう。</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

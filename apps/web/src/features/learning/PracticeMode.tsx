import { useMemo, useState } from 'react'
import type { PracticeQuestion } from '../../content/fundamentals/steps'

interface PracticeModeProps {
  questions: PracticeQuestion[]
  onComplete: () => void
}

function normalize(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

export function PracticeMode({ questions, onComplete }: PracticeModeProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [hints, setHints] = useState<Record<string, boolean>>({})
  const [isJudged, setIsJudged] = useState(false)
  const [reported, setReported] = useState(false)

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
    if (isAllCorrect && !reported) {
      onComplete()
      setReported(true)
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

        return (
          <article key={question.id} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Q{index + 1}. {question.prompt}
            </p>
            <input
              className={`w-full rounded-md border px-3 py-2 text-sm ${isJudged
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-rose-500 bg-rose-50/50'
                : 'border-slate-300'
                }`}
              placeholder="回答を入力"
              value={answer}
              onChange={(event) => handleAnswerChange(question.id, event.target.value)}
            />
            {isJudged ? (
              <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCorrect ? '✅ 正解です。' : '❌ 不正解です。もう一度試してください。'}
              </p>
            ) : null}
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              type="button"
              onClick={() =>
                setHints((prev) => ({
                  ...prev,
                  [question.id]: !prev[question.id],
                }))
              }
            >
              ヒントを{hints[question.id] ? '隠す' : '表示'}
            </button>
            {hints[question.id] ? <p className="text-sm text-blue-700">{question.hint}</p> : null}
          </article>
        )
      })}

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
        <button
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 active:bg-blue-700"
          type="button"
          onClick={handleJudge}
        >
          判定する
        </button>

        {isJudged && (
          <p className={`text-sm font-medium ${isAllCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isAllCorrect ? '🎉 すべて正解！Practiceを完了しました。' : '⚠️ すべての問題に正解すると完了です。'}
          </p>
        )}
      </div>
    </section>
  )
}

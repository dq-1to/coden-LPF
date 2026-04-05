import { useState } from 'react'
import { CheckCircle, ClipboardCheck, XCircle, RotateCcw, PartyPopper } from 'lucide-react'
import type { BaseNookQuestion } from '../../../content/base-nook/types'

interface QuizViewProps {
  questions: BaseNookQuestion[]
  solvedIds: ReadonlySet<string>
  onAnswer: (questionId: string, isCorrect: boolean) => Promise<void>
  onRefresh: () => void
  allCleared: boolean
}

interface AnswerState {
  selectedIndex: number | null
  submitted: boolean
  isCorrect: boolean
}

export function QuizView({ questions, solvedIds, onAnswer, onRefresh, allCleared }: QuizViewProps) {
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map())
  const [submitting, setSubmitting] = useState<string | null>(null)

  const answeredCount = [...answers.values()].filter((a) => a.submitted).length

  const handleSelect = (questionId: string, index: number) => {
    const current = answers.get(questionId)
    if (current?.submitted) return // 回答済みは変更不可
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, { selectedIndex: index, submitted: false, isCorrect: false })
      return next
    })
  }

  const handleSubmit = async (question: BaseNookQuestion) => {
    const state = answers.get(question.id)
    if (!state || state.selectedIndex === null || state.submitted) return

    setSubmitting(question.id)
    const isCorrect = state.selectedIndex === question.correctIndex

    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(question.id, { ...state, submitted: true, isCorrect })
      return next
    })

    await onAnswer(question.id, isCorrect)
    setSubmitting(null)
  }

  const handleRefresh = () => {
    setAnswers(new Map())
    onRefresh()
  }

  return (
    <div className="space-y-6">
      {/* セクション見出し */}
      <div className="rounded-xl bg-sky-50 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={20} className="text-sky-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text-dark">理解度チェック</h2>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={14} aria-hidden="true" />
            別の3問に挑戦
          </button>
        </div>
        {/* 進捗インジケーター */}
        <p className="mt-2 text-sm text-slate-500">
          {answeredCount}/{questions.length} 回答済み
        </p>
      </div>

      {allCleared && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <PartyPopper size={18} aria-hidden="true" />
          全問クリア！おめでとうございます！
        </div>
      )}

      {questions.map((q, qi) => {
        const state = answers.get(q.id)
        const isSolved = solvedIds.has(q.id)

        return (
          <div
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* 問題ヘッダー */}
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
                {qi + 1}
              </span>
              {isSolved && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  済
                </span>
              )}
            </div>

            {/* 問題文 */}
            <p id={`question-${q.id}`} className="mb-4 whitespace-pre-wrap font-medium text-text-dark">
              {q.text}
            </p>

            {/* 選択肢 */}
            <div className="space-y-2.5" role="radiogroup" aria-labelledby={`question-${q.id}`}>
              {q.choices.map((choice, ci) => {
                const isSelected = state?.selectedIndex === ci
                const isSubmitted = state?.submitted ?? false
                const isCorrectChoice = ci === q.correctIndex

                let choiceClass = 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                if (isSubmitted && isCorrectChoice) {
                  choiceClass = 'border-emerald-300 bg-emerald-50'
                } else if (isSubmitted && isSelected && !state?.isCorrect) {
                  choiceClass = 'border-red-300 bg-red-50'
                } else if (isSelected) {
                  choiceClass = 'border-sky-400 bg-sky-50'
                }

                return (
                  <button
                    key={ci}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelect(q.id, ci)}
                    disabled={isSubmitted}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${choiceClass}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                      {String.fromCharCode(65 + ci)}
                    </span>
                    <span>{choice.label}</span>
                    {isSubmitted && isCorrectChoice && (
                      <CheckCircle size={16} className="ml-auto shrink-0 text-emerald-500" aria-label="正解" />
                    )}
                    {isSubmitted && isSelected && !state?.isCorrect && !isCorrectChoice && (
                      <XCircle size={16} className="ml-auto shrink-0 text-red-400" aria-label="不正解" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 判定ボタン or 結果 */}
            <div className="mt-4">
              {!state?.submitted ? (
                <button
                  type="button"
                  onClick={() => void handleSubmit(q)}
                  disabled={state?.selectedIndex == null || submitting === q.id}
                  className="min-h-[44px] rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting === q.id ? '判定中...' : '回答する'}
                </button>
              ) : (
                <div role="alert" className={`rounded-lg px-4 py-3.5 text-sm ${state.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="mb-1.5 text-base font-bold">
                    {state.isCorrect ? '✅ 正解！' : '❌ 不正解'}
                  </p>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

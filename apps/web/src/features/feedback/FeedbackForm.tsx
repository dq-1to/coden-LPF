import type { RefObject } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  FEEDBACK_CATEGORY_LABELS,
  MAX_FEEDBACK_MESSAGE_LENGTH,
  type FeedbackCategory,
} from '../../services/feedbackService'
import { FeedbackImagePicker } from './FeedbackImagePicker'

const CATEGORY_ORDER: FeedbackCategory[] = ['bug', 'review', 'request', 'other']

interface FeedbackFormProps {
  category: FeedbackCategory
  setCategory: (category: FeedbackCategory) => void
  message: string
  setMessage: (message: string) => void
  isSubmitting: boolean
  error: string | null
  setError: (message: string | null) => void
  files: File[]
  setFiles: (files: File[]) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  handleClose: () => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  remaining: number
  isOverLimit: boolean
}

export function FeedbackForm({
  category,
  setCategory,
  message,
  setMessage,
  isSubmitting,
  error,
  setError,
  files,
  setFiles,
  textareaRef,
  handleClose,
  handleSubmit,
  remaining,
  isOverLimit,
}: FeedbackFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feedback-category" className="block text-xs font-semibold text-slate-700">
          カテゴリ
        </label>
        <select
          id="feedback-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          disabled={isSubmitting}
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {FEEDBACK_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="feedback-message" className="block text-xs font-semibold text-slate-700">
          本文
        </label>
        <textarea
          ref={textareaRef}
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          placeholder="気づいた点・ご要望など自由に記入してください"
          disabled={isSubmitting}
          maxLength={MAX_FEEDBACK_MESSAGE_LENGTH + 100}
          aria-describedby="feedback-message-help"
        />
        <div
          id="feedback-message-help"
          className={`mt-1 text-xs ${isOverLimit ? 'text-rose-600' : 'text-slate-500'}`}
        >
          残り {remaining} 文字
        </div>
      </div>

      <FeedbackImagePicker
        files={files}
        onFilesChange={(next) => { setFiles(next); setError(null) }}
        disabled={isSubmitting}
        onError={setError}
      />

      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-primary-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || isOverLimit || message.trim().length === 0}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          送信
        </button>
      </div>
    </form>
  )
}

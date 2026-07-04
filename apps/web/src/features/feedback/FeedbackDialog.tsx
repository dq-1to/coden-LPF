import { useRef } from 'react'
import { X } from 'lucide-react'
import { FeedbackForm } from './FeedbackForm'
import { FeedbackSubmittedView } from './FeedbackSubmittedView'
import { useFeedbackForm } from './useFeedbackForm'

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const {
    category,
    setCategory,
    message,
    setMessage,
    isSubmitting,
    error,
    setError,
    isSubmitted,
    files,
    setFiles,
    textareaRef,
    handleClose,
    handleSubmit,
    remaining,
    isOverLimit,
  } = useFeedbackForm({ open, onClose })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景クリックで閉じる（キーボード操作は ESC / 閉じるボタンに委譲） */}
      <button
        type="button"
        aria-label="背景をクリックして閉じる"
        tabIndex={-1}
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="feedback-dialog-title" className="text-lg font-bold text-slate-900">
              フィードバックを送る
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              不具合報告・要望・レビューなど、運営宛てに送信できます。
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="閉じる"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isSubmitted ? (
          <FeedbackSubmittedView onClose={handleClose} />
        ) : (
          <FeedbackForm
            category={category}
            setCategory={setCategory}
            message={message}
            setMessage={setMessage}
            isSubmitting={isSubmitting}
            error={error}
            setError={setError}
            files={files}
            setFiles={setFiles}
            textareaRef={textareaRef}
            handleClose={handleClose}
            handleSubmit={handleSubmit}
            remaining={remaining}
            isOverLimit={isOverLimit}
          />
        )}
      </div>
    </div>
  )
}

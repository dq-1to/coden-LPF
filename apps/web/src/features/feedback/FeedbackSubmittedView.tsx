interface FeedbackSubmittedViewProps {
  onClose: () => void
}

export function FeedbackSubmittedView({ onClose }: FeedbackSubmittedViewProps) {
  return (
    <div role="status" aria-live="polite" className="py-6 text-center">
      <p className="text-sm font-semibold text-slate-900">送信しました。ありがとうございます！</p>
      <p className="mt-1 text-xs text-slate-500">いただいた内容は運営が確認いたします。</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-lg bg-primary-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        閉じる
      </button>
    </div>
  )
}

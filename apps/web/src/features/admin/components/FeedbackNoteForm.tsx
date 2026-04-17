import { useState } from 'react'
import { AlertCircle, Loader2, Save } from 'lucide-react'
import {
  MAX_ADMIN_NOTE_LENGTH,
  updateFeedbackNote,
} from '../../../services/feedbackService'
import type { UserFeedback } from '../../../services/feedbackService'

interface FeedbackNoteFormProps {
  feedback: UserFeedback
  adminUserId: string
  onUpdate: (updated: UserFeedback) => void
}

export function FeedbackNoteForm({ feedback, adminUserId, onUpdate }: FeedbackNoteFormProps) {
  const initialNote = feedback.admin_note ?? ''
  const [noteText, setNoteText] = useState(initialNote)
  const [savedNote, setSavedNote] = useState(initialNote)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isUnchanged = noteText === savedNote
  const isOverLimit = noteText.length > MAX_ADMIN_NOTE_LENGTH

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    const trimmed = noteText.trim()
    const valueToSave = trimmed.length === 0 ? null : trimmed

    try {
      const updated = await updateFeedbackNote(feedback.id, valueToSave, adminUserId)
      onUpdate(updated)
      const savedValue = updated.admin_note ?? ''
      setNoteText(savedValue)
      setSavedNote(savedValue)
      setSaveSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メモの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">管理者メモ</h2>

      {error && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {saveSuccess && (
        <p role="status" className="mb-3 text-xs text-emerald-600">メモを保存しました</p>
      )}

      <textarea
        rows={5}
        value={noteText}
        onChange={(e) => {
          setNoteText(e.target.value)
          setSaveSuccess(false)
        }}
        maxLength={MAX_ADMIN_NOTE_LENGTH}
        placeholder="管理者メモを入力..."
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
        aria-label="管理者メモ"
      />

      <div className="mt-1.5 flex items-center justify-between">
        <p
          className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-slate-400'}`}
          aria-live="polite"
        >
          {noteText.length} / {MAX_ADMIN_NOTE_LENGTH}
        </p>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isUnchanged || isSaving || isOverLimit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="管理者メモを保存"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </section>
  )
}

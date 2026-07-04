import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  captureClientMeta,
  MAX_FEEDBACK_MESSAGE_LENGTH,
  submitFeedback,
  type FeedbackCategory,
} from '../../services/feedbackService'

interface UseFeedbackFormOptions {
  open: boolean
  onClose: () => void
}

export function useFeedbackForm({ open, onClose }: UseFeedbackFormOptions) {
  const { user } = useAuth()
  const [category, setCategory] = useState<FeedbackCategory>('bug')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ダイアログを閉じたらフォーム状態をリセット
  const reset = useCallback(() => {
    setCategory('bug')
    setMessage('')
    setError(null)
    setIsSubmitted(false)
    setIsSubmitting(false)
    setFiles([])
  }, [])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  // ESC キーで閉じる
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, handleClose])

  // 開いたら textarea にフォーカス
  useEffect(() => {
    if (!open) return
    textareaRef.current?.focus()
  }, [open])

  // body スクロール抑制
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)

    if (!user) {
      setError('送信にはログインが必要です')
      return
    }

    const trimmed = message.trim()
    if (trimmed.length === 0) {
      setError('本文を入力してください')
      return
    }
    if (trimmed.length > MAX_FEEDBACK_MESSAGE_LENGTH) {
      setError(`本文は ${MAX_FEEDBACK_MESSAGE_LENGTH} 文字以内で入力してください`)
      return
    }

    setIsSubmitting(true)
    try {
      const meta = captureClientMeta()
      await submitFeedback({
        userId: user.id,
        category,
        message: trimmed,
        pageUrl: meta.pageUrl,
        userAgent: meta.userAgent,
        ...(files.length > 0 ? { files } : {}),
      })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const remaining = MAX_FEEDBACK_MESSAGE_LENGTH - message.trim().length
  const isOverLimit = remaining < 0

  return {
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
  }
}

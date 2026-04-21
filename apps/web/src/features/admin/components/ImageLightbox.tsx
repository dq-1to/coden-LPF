import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { FeedbackImageUrl } from '../../../services/feedbackService'

interface ImageLightboxProps {
  images: FeedbackImageUrl[]
  currentIndex: number
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export function ImageLightbox({ images, currentIndex, onClose, onChangeIndex }: ImageLightboxProps) {
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onChangeIndex(currentIndex - 1)
  }, [hasPrev, currentIndex, onChangeIndex])

  const goNext = useCallback(() => {
    if (hasNext) onChangeIndex(currentIndex + 1)
  }, [hasNext, currentIndex, onChangeIndex])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goPrev()
          break
        case 'ArrowRight':
          goNext()
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goPrev, goNext])

  const current = images[currentIndex]
  if (!current) return null

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- keyboard handled via document keydown listener, dialog overlay click-to-close is standard UX
    <div
      role="dialog"
      aria-label="画像プレビュー"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="閉じる"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
        {currentIndex + 1} / {images.length}
      </span>

      {/* Prev button */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="前の画像"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image — wrapper div prevents click-to-close when clicking on the image */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url}
          alt={`添付画像 ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        />
      </div>

      {/* Next button */}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="次の画像"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

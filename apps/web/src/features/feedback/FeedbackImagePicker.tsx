import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { MAX_IMAGE_COUNT, validateImageFiles } from '../../services/feedbackService'

interface FeedbackImagePickerProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled: boolean
  onError: (message: string) => void
}

export function FeedbackImagePicker({ files, onFilesChange, disabled, onError }: FeedbackImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="block text-xs font-semibold text-slate-700">
          スクリーンショット（任意）
        </span>
        <span className="text-xs text-slate-400">{files.length}/{MAX_IMAGE_COUNT}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || files.length >= MAX_IMAGE_COUNT}
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? [])
          if (selected.length === 0) return
          const merged = [...files, ...selected].slice(0, MAX_IMAGE_COUNT)
          try {
            validateImageFiles(merged)
            onFilesChange(merged)
          } catch (err) {
            onError(err instanceof Error ? err.message : 'ファイルの追加に失敗しました')
          }
          e.target.value = ''
        }}
      />

      {files.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-10 w-10 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="max-w-[120px] truncate text-xs font-medium text-slate-700">{file.name}</p>
                <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== idx))}
                disabled={disabled}
                className="ml-1 rounded p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-rose-600"
                aria-label={`${file.name} を削除`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {files.length < MAX_IMAGE_COUNT ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-primary-mint hover:text-primary-mint"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          画像を追加
        </button>
      ) : null}

      <p className="mt-1 text-[10px] text-slate-400">
        PNG / JPG / GIF など、各 5MB 以下
      </p>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

import { useCallback, useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { Button } from '../../components/Button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/themes/prism-okaidia.css'
import { COPY_FEEDBACK_DURATION_MS } from '../../shared/constants'

interface ReadModeProps {
  markdown: string
  onComplete: () => void
  isCompleted: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timerId = window.setTimeout(() => {
      setCopied(false)
    }, COPY_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [copied])

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard API 未対応環境やセキュリティ制約による失敗は無視（補助機能のため）
    }
  }, [text])

  return (
    <button
      className="min-h-[44px] rounded bg-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600"
      type="button"
      onClick={() => void handleCopy()}
    >
      {copied ? 'コピーしました ✓' : 'コードをコピー'}
    </button>
  )
}

export function ReadMode({ markdown, onComplete, isCompleted }: ReadModeProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [markdown])

  const completeButton = (
    <Button onClick={onComplete} disabled={isCompleted}>
      {isCompleted ? 'Read完了済み' : 'Readを完了'}
    </Button>
  )

  return (
    <section className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Read</h2>
        {completeButton}
      </div>

      <article className="prose prose-slate prose-sm max-w-none overflow-x-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:prose-base sm:p-5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const codeText = String(children).replace(/\n$/, '')
              const language = className?.replace('language-', '') ?? 'tsx'
              const isInline = className == null

              if (isInline) {
                return (
                  <code className="rounded-md bg-primary-mint/10 px-1.5 py-0.5 font-mono text-sm font-semibold text-primary-dark" {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <div className="not-prose overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-xs text-slate-200">
                    <span>{language}</span>
                    <CopyButton text={codeText} />
                  </div>
                  <pre className="m-0 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed sm:p-4 sm:text-sm">
                    <code className={`language-${language}`} {...props}>
                      {codeText}
                    </code>
                  </pre>
                </div>
              )
            },
            blockquote({ children }) {
              return (
                <div className="not-prose my-4 flex gap-3 rounded-lg border-l-4 border-primary-mint bg-secondary-bg px-4 py-3">
                  <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary-mint" aria-hidden="true" />
                  <div className="text-sm leading-relaxed text-text-dark [&>p]:m-0">{children}</div>
                </div>
              )
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>

      <div className="flex justify-end">
        {completeButton}
      </div>
    </section>
  )
}

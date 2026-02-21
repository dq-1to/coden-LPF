import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/themes/prism.css'

interface ReadModeProps {
  markdown: string
  onComplete: () => void
  isCompleted: boolean
}

export function ReadMode({ markdown, onComplete, isCompleted }: ReadModeProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  useEffect(() => {
    Prism.highlightAll()
  }, [markdown])

  return (
    <section className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Read</h2>
        <button
          className={`rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition ${isCompleted ? 'cursor-not-allowed bg-slate-300' : 'bg-primary-mint hover:bg-primary-dark'
            }`}
          type="button"
          onClick={onComplete}
          disabled={isCompleted}
        >
          {isCompleted ? 'Read完了済み' : 'Readを完了'}
        </button>
      </div>

      <article className="prose prose-slate prose-lg max-w-none rounded-2xl border border-slate-200 bg-white p-6 leading-relaxed shadow-sm md:prose-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const codeText = String(children).replace(/\n$/, '')
              const language = className?.replace('language-', '') ?? 'tsx'
              const isInline = className == null

              if (isInline) {
                return (
                  <code className="rounded bg-slate-200 px-1 py-0.5 text-sm text-slate-800" {...props}>
                    {children}
                  </code>
                )
              }

              async function handleCopy() {
                if (!navigator.clipboard) {
                  setCopyMessage('この環境ではコピー機能を利用できません。')
                  return
                }

                try {
                  await navigator.clipboard.writeText(codeText)
                  setCopyMessage('コードをコピーしました。')
                } catch {
                  setCopyMessage('コードのコピーに失敗しました。')
                }
              }

              return (
                <div className="not-prose overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-xs text-slate-200">
                    <span>{language}</span>
                    <button
                      className="rounded bg-slate-700 px-2 py-1 text-slate-100 hover:bg-slate-600"
                      type="button"
                      onClick={() => void handleCopy()}
                    >
                      コードをコピー
                    </button>
                  </div>
                  <pre className="m-0 overflow-x-auto p-4 text-sm">
                    <code className={`language-${language}`} {...props}>
                      {codeText}
                    </code>
                  </pre>
                </div>
              )
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
      {copyMessage ? <p className="text-sm text-slate-600">{copyMessage}</p> : null}
    </section>
  )
}

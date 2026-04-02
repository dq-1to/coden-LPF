import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import { useEffect } from 'react'

interface ArticleViewProps {
  markdown: string
}

export function ArticleView({ markdown }: ArticleViewProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [markdown])

  return (
    <article className="prose prose-slate prose-sm max-w-none sm:prose-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}

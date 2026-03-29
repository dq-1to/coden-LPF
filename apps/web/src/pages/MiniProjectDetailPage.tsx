import { useParams } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function MiniProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  useDocumentTitle('ミニプロジェクト実装')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-text-dark">ミニプロジェクト実装</h1>
      <p className="mt-2 text-text-light">準備中です（ID: {projectId}）</p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGreetingName } from '../hooks/useGreetingName'
import { useSignOut } from '../hooks/useSignOut'
import { getAllProgress } from '../services/baseNookService'
import { BASE_NOOK_TOPICS } from '../content/base-nook/topics'
import { TopicCard } from '../features/base-nook/components/TopicCard'
import { BaseNookSidebar } from '../features/base-nook/components/BaseNookSidebar'
import { Pagination } from '../components/Pagination'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import type { TopicProgressSummary } from '../content/base-nook/types'

const ITEMS_PER_PAGE = 9

export function BaseNookPage() {
  useDocumentTitle('Base Nook')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { greetingName } = useGreetingName()
  const handleSignOut = useSignOut()

  const [progressList, setProgressList] = useState<TopicProgressSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    let isMounted = true

    async function load() {
      try {
        const list = await getAllProgress(userId)
        if (!isMounted) return
        setProgressList(list)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : '進捗の取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [user])

  // topicId → progress のルックアップ
  const progressMap = new Map(progressList.map((p) => [p.topicId, p]))

  const totalPages = Math.ceil(BASE_NOOK_TOPICS.length / ITEMS_PER_PAGE)
  const paginatedTopics = BASE_NOOK_TOPICS.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 sm:h-12 sm:w-12">
            <BookOpen size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-dark">ベースヌック</h1>
            <p className="text-sm text-slate-500">
              基礎がわかると、コードが読める
            </p>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 2カラム: サイドバー + メイン */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <BaseNookSidebar topics={BASE_NOOK_TOPICS} progressMap={progressMap} />

          {/* メインコンテンツ */}
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="flex justify-center py-20" role="status" aria-label="読み込み中">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedTopics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      progress={progressMap.get(topic.id)}
                      onClick={() => navigate(`/base-nook/${topic.id}`)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

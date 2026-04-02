import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getAllProgress } from '../services/baseNookService'
import { getProfile } from '../services/profileService'
import { BASE_NOOK_TOPICS } from '../content/base-nook/topics'
import { TopicCard } from '../features/base-nook/components/TopicCard'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { getDisplayName } from '../shared/utils/getDisplayName'
import type { TopicProgressSummary } from '../content/base-nook/types'

export function BaseNookPage() {
  useDocumentTitle('Base Nook')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string | null>(null)

  const [progressList, setProgressList] = useState<TopicProgressSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!user) return
    try {
      const [list, profile] = await Promise.all([
        getAllProgress(user.id),
        getProfile(user.id),
      ])
      setProgressList(list)
      if (profile) setDisplayName(profile.display_name)
    } catch (e) {
      setError(e instanceof Error ? e.message : '進捗の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  const greetingName = useMemo(
    () =>
      getDisplayName(
        user
          ? { ...user, user_metadata: { ...user.user_metadata, display_name: displayName ?? user.user_metadata?.display_name } }
          : null,
      ),
    [user, displayName],
  )

  const handleSignOut = useCallback(async () => {
    const err = await signOut()
    if (!err) navigate('/login', { replace: true })
  }, [signOut, navigate])

  // topicId → progress のルックアップ
  const progressMap = new Map(progressList.map((p) => [p.topicId, p]))

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <BookOpen size={24} />
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
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* トピックグリッド */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BASE_NOOK_TOPICS.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={progressMap.get(topic.id)}
                onClick={() => navigate(`/base-nook/${topic.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

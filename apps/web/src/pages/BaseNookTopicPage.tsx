import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  getTopicProgress,
  submitAnswer,
  selectQuestions,
} from '../services/baseNookService'
import { getProfile } from '../services/profileService'
import { BASE_NOOK_TOPICS } from '../content/base-nook/topics'
import { ArticleView } from '../features/base-nook/components/ArticleView'
import { QuizView } from '../features/base-nook/components/QuizView'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { getDisplayName } from '../shared/utils/getDisplayName'
import type { BaseNookQuestion } from '../content/base-nook/types'

const QUIZ_COUNT = 3

export function BaseNookTopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const topic = BASE_NOOK_TOPICS.find((t) => t.id === topicId)
  useDocumentTitle(topic ? topic.title : 'Base Nook')

  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set())
  const [quizQuestions, setQuizQuestions] = useState<BaseNookQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user || !topic) return
    try {
      const [solved, profile] = await Promise.all([
        getTopicProgress(user.id, topic.id),
        getProfile(user.id),
      ])
      setSolvedIds(solved)
      if (profile) setDisplayName(profile.display_name)
      setQuizQuestions(selectQuestions(solved, topic.questions, QUIZ_COUNT))
    } catch {
      // エラーは握りつぶし（進捗0で続行）
    } finally {
      setIsLoading(false)
    }
  }, [user, topic])

  useEffect(() => {
    void loadData()
  }, [loadData])

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

  const handleAnswer = useCallback(
    async (questionId: string, isCorrect: boolean) => {
      if (!user || !topic) return
      await submitAnswer(user.id, topic.id, questionId, isCorrect)
      if (isCorrect) {
        setSolvedIds((prev) => new Set([...prev, questionId]))
      }
    },
    [user, topic],
  )

  const handleRefresh = useCallback(() => {
    if (!topic) return
    setQuizQuestions(selectQuestions(solvedIds, topic.questions, QUIZ_COUNT))
  }, [solvedIds, topic])

  const allCleared = topic ? solvedIds.size >= topic.questions.length : false

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-slate-500">トピックが見つかりません</p>
          <Link to="/base-nook" className="text-sky-600 hover:underline">
            Base Nook に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* 戻るリンク */}
        <Link
          to="/base-nook"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          <ArrowLeft size={16} />
          Base Nook に戻る
        </Link>

        {/* トピックタイトル */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <BookOpen size={20} />
          </div>
          <h1 className="text-2xl font-bold text-text-dark">{topic.title}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          </div>
        ) : (
          <>
            {/* 解説パート */}
            <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <ArticleView markdown={topic.article} />
            </section>

            {/* クイズパート */}
            <section>
              <QuizView
                questions={quizQuestions}
                solvedIds={solvedIds}
                onAnswer={handleAnswer}
                onRefresh={handleRefresh}
                allCleared={allCleared}
              />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

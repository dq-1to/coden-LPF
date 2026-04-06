import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGreetingName } from '../hooks/useGreetingName'
import { useSignOut } from '../hooks/useSignOut'
import {
  getTopicProgress,
  submitAnswer,
  selectQuestions,
} from '../services/baseNookService'
import { BASE_NOOK_TOPICS } from '../content/base-nook/topics'
import { ArticleView } from '../features/base-nook/components/ArticleView'
import { QuizView } from '../features/base-nook/components/QuizView'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import type { BaseNookQuestion } from '../content/base-nook/types'

const QUIZ_COUNT = 3

export function BaseNookTopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { user } = useAuth()

  const topic = BASE_NOOK_TOPICS.find((t) => t.id === topicId)
  useDocumentTitle(topic ? topic.title : 'Base Nook')

  const { greetingName } = useGreetingName()
  const handleSignOut = useSignOut()

  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set())
  const [quizQuestions, setQuizQuestions] = useState<BaseNookQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !topic) return
    const userId = user.id
    const topicData = topic
    let isMounted = true

    async function load() {
      try {
        const solved = await getTopicProgress(userId, topicData.id)
        if (!isMounted) return
        setSolvedIds(solved)
        setQuizQuestions(selectQuestions(solved, topicData.questions, QUIZ_COUNT))
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : '進捗の取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [user, topic])

  const handleAnswer = useCallback(
    async (questionId: string, isCorrect: boolean) => {
      if (!user || !topic) return
      try {
        await submitAnswer(user.id, topic.id, questionId, isCorrect)
      } catch {
        // submitAnswer の失敗はクイズ体験をブロックしない
        console.error('クイズ回答の保存に失敗しました')
      }
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

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* 戻るリンク */}
        <Link
          to="/base-nook"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Base Nook に戻る
        </Link>

        {/* トピックタイトル */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-dark">{topic.title}</h1>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20" role="status" aria-label="読み込み中">
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

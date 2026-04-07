import { useCallback, useEffect, useState } from 'react'
import { Lock, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGreetingName } from '../hooks/useGreetingName'
import { useSignOut } from '../hooks/useSignOut'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { useAchievementContext } from '../contexts/AchievementContext'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { supabaseConfigError } from '../lib/supabaseClient'
import { BADGE_DEFINITIONS } from '../services/achievementService'
import { getPointHistory, upsertDisplayName, type PointHistoryRecord } from '../services/profileService'
import { Spinner } from '../components/Spinner'
import { formatDateTime, formatStudyDate } from '../shared/utils/dateTime'

export function ProfilePage() {
  useDocumentTitle('プロフィール')
  const { user } = useAuth()
  const { stats, completedStepsCount } = useLearningContext()
  const { unlockedBadgeIds, isLoadingAchievements } = useAchievementContext()
  const userId = user?.id ?? null
  const { greetingName: headerDisplayName, displayName, setDisplayName } = useGreetingName()

  const [displayNameInput, setDisplayNameInput] = useState('')
  const [pointHistory, setPointHistory] = useState<PointHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // displayName が取得されたら入力フィールドを同期
  useEffect(() => {
    setDisplayNameInput(displayName ?? '')
  }, [displayName])

  // ポイント履歴の取得
  useEffect(() => {
    if (!userId || supabaseConfigError) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError(null)

    getPointHistory(userId, 30)
      .then((history) => {
        if (!isMounted) {
          return
        }

        setPointHistory(history)
      })
      .catch((loadError) => {
        if (!isMounted) {
          return
        }

        const message = loadError instanceof Error ? loadError.message : 'ポイント履歴の取得に失敗しました。'
        setError(message)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [userId])

  const onSignOutError = useCallback((msg: string) => setError(msg), [])
  const handleSignOut = useSignOut(onSignOutError)

  async function handleDisplayNameSave() {
    if (!userId) {
      return
    }

    setIsSavingDisplayName(true)
    setError(null)
    setNotice(null)

    try {
      const normalizedName = displayNameInput.trim()
      await upsertDisplayName(userId, normalizedName.length > 0 ? normalizedName : null)
      setDisplayName(normalizedName.length > 0 ? normalizedName : null)
      setDisplayNameInput(normalizedName)
      setNotice('プロフィール名を更新しました。')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'プロフィール名の更新に失敗しました。'
      setError(message)
    } finally {
      setIsSavingDisplayName(false)
    }
  }

  // notice/error の自動消去（5秒後）
  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(id)
  }, [notice])

  useEffect(() => {
    if (!error) return
    const id = window.setTimeout(() => setError(null), 5000)
    return () => window.clearTimeout(id)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={headerDisplayName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        {notice ? <ErrorBanner variant="success">{notice}</ErrorBanner> : null}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-mint">Profile</p>
              <h1 className="mt-1 text-2xl font-bold text-text-dark">プロフィール</h1>
            </div>
            <Link className="text-sm font-semibold text-primary-dark underline" to="/">
              ダッシュボードへ戻る
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-light">表示名</span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-text-dark focus:border-primary-mint focus:outline-none focus:ring-2 focus:ring-primary-mint/20"
                type="text"
                placeholder="表示名を入力"
                value={displayNameInput}
                onChange={(event) => setDisplayNameInput(event.target.value)}
              />
            </label>
            <button
              className="h-fit rounded-lg bg-primary-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void handleDisplayNameSave()}
              disabled={isSavingDisplayName || isLoading}
            >
              {isSavingDisplayName ? '保存中...' : '表示名を保存'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">総ポイント</p>
            <p className="mt-2 text-2xl font-black text-amber-600">{stats?.total_points ?? 0} Pt</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">連続学習</p>
            <p className="mt-2 text-2xl font-black text-rose-600">{stats?.current_streak ?? 0} 日</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">最大ストリーク</p>
            <p className="mt-2 text-2xl font-black text-indigo-600">{stats?.max_streak ?? 0} 日</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-light">完了ステップ</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{completedStepsCount}</p>
            <p className="mt-1 text-xs text-text-light">最終学習日: {formatStudyDate(stats?.last_study_date ?? null)}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-dark">実績バッジ</h2>
            <span className="text-xs text-text-light">
              {unlockedBadgeIds.length} / {BADGE_DEFINITIONS.length} 獲得
            </span>
          </div>
          {isLoadingAchievements ? <p className="mb-3 text-xs text-text-light" role="status" aria-live="polite">バッジ状態を更新中...</p> : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const unlocked = unlockedBadgeIds.includes(badge.id)
              return (
                <article
                  key={badge.id}
                  className={`rounded-xl border p-4 ${unlocked ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-70'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold ${unlocked ? 'text-amber-900' : 'text-slate-600'}`}>{badge.name}</h3>
                    <span className="text-lg">{unlocked ? <Trophy className="h-5 w-5 text-amber-600" aria-hidden="true" /> : <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />}</span>
                  </div>
                  <p className={`mt-1 text-xs ${unlocked ? 'text-amber-700' : 'text-slate-500'}`}>{badge.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-text-dark">ポイント履歴</h2>
          {isLoading ? <Spinner size="sm" label="履歴を読み込み中..." /> : null}
          {!isLoading && pointHistory.length === 0 ? <p className="text-sm text-text-light">ポイント履歴はまだありません。</p> : null}
          {pointHistory.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {pointHistory.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-dark">{entry.reason}</p>
                    <p className="text-xs text-text-light">{formatDateTime(entry.created_at)}</p>
                  </div>
                  <p className="text-sm font-bold text-primary-dark">+{entry.amount} Pt</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  )
}

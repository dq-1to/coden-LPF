import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getProjectProgressMap } from '../services/miniProjectService'
import { PracticeModeNav } from '../features/daily/components/PracticeModeNav'
import { ProjectCard } from '../features/mini-projects/components/ProjectCard'
import { PracticePageLayout } from '../components/PracticePageLayout'
import { Spinner } from '../components/Spinner'
import { MINI_PROJECTS } from '../content/mini-projects/projects'
import type { MiniProjectDifficulty, MiniProjectProgress } from '../content/mini-projects/types'

type FilterValue = 'all' | MiniProjectDifficulty

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
]

export function MiniProjectsPage() {
  useDocumentTitle('ミニプロジェクト')

  const { user } = useAuth()
  const navigate = useNavigate()

  const [progressMap, setProgressMap] = useState<Map<string, MiniProjectProgress>>(new Map())
  const [filter, setFilter] = useState<FilterValue>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const map = await getProjectProgressMap(user.id)
      setProgressMap(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  const filteredProjects =
    filter === 'all' ? MINI_PROJECTS : MINI_PROJECTS.filter((p) => p.difficulty === filter)

  return (
    <PracticePageLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <PracticeModeNav />

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-text-dark">ミニプロジェクト</h1>
              <p className="mt-1 text-sm text-text-muted">
                仕様からゼロ実装する体験で、総合的な実装力を鍛えましょう
              </p>
            </div>

            {/* フィルター */}
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    filter === value
                      ? 'bg-amber-500 text-white'
                      : 'border border-border text-text-muted hover:border-amber-400 hover:text-amber-600',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    progress={progressMap.get(project.id)}
                    onClick={() => void navigate(`/practice/mini-projects/${project.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PracticePageLayout>
  )
}

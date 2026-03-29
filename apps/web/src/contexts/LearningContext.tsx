import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getLearningStats, type LearningStats } from '../services/statsService'
import { getAllStepProgress, isStepCompleted } from '../services/progressService'

interface LearningContextType {
    stats: LearningStats | null
    completedStepIds: ReadonlySet<string>
    completedStepsCount: number
    isLoadingStats: boolean
    refreshStats: () => Promise<void>
}

const EMPTY_SET: ReadonlySet<string> = new Set()

const LearningContext = createContext<LearningContextType>({
    stats: null,
    completedStepIds: EMPTY_SET,
    completedStepsCount: 0,
    isLoadingStats: true,
    refreshStats: async () => { },
})

export function LearningProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [stats, setStats] = useState<LearningStats | null>(null)
    const [completedStepIds, setCompletedStepIds] = useState<ReadonlySet<string>>(EMPTY_SET)
    const [isLoadingStats, setIsLoadingStats] = useState(true)

    const completedStepsCount = completedStepIds.size

    const refreshStats = useCallback(async () => {
        if (!user) {
            setStats(null)
            setCompletedStepIds(EMPTY_SET)
            setIsLoadingStats(false)
            return
        }

        try {
            const [currentStats, progresses] = await Promise.all([
                getLearningStats(user.id),
                getAllStepProgress(user.id),
            ])
            setStats(currentStats)
            const ids = new Set(
                progresses.filter(isStepCompleted).map((p) => p.step_id),
            )
            setCompletedStepIds(ids)
        } catch (err) {
            console.error('Failed to load learning stats:', err)
        } finally {
            setIsLoadingStats(false)
        }
    }, [user])

    useEffect(() => {
        let isMounted = true

        setIsLoadingStats(true)
        refreshStats().finally(() => {
            if (isMounted) setIsLoadingStats(false)
        })

        return () => {
            isMounted = false
        }
    }, [refreshStats])

    const value = useMemo(
        () => ({ stats, completedStepIds, completedStepsCount, isLoadingStats, refreshStats }),
        [stats, completedStepIds, completedStepsCount, isLoadingStats, refreshStats],
    )

    return (
        <LearningContext.Provider value={value}>
            {children}
        </LearningContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLearningContext() {
    const context = useContext(LearningContext)
    if (!context) {
        throw new Error('useLearningContext must be used within a LearningProvider')
    }
    return context
}

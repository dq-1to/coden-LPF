import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getLearningStats, type LearningStats } from '../services/statsService'
import { getCompletedStepCount } from '../services/progressService'

interface LearningContextType {
    stats: LearningStats | null
    completedStepsCount: number
    isLoadingStats: boolean
    refreshStats: () => Promise<void>
}

const LearningContext = createContext<LearningContextType>({
    stats: null,
    completedStepsCount: 0,
    isLoadingStats: true,
    refreshStats: async () => { },
})

export function LearningProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [stats, setStats] = useState<LearningStats | null>(null)
    const [completedStepsCount, setCompletedStepsCount] = useState(0)
    const [isLoadingStats, setIsLoadingStats] = useState(true)

    const refreshStats = async () => {
        if (!user) {
            setStats(null)
            setCompletedStepsCount(0)
            setIsLoadingStats(false)
            return
        }

        try {
            const [currentStats, count] = await Promise.all([
                getLearningStats(user.id),
                getCompletedStepCount(user.id)
            ])
            setStats(currentStats)
            setCompletedStepsCount(count)
        } catch (err) {
            console.error('Failed to load learning stats:', err)
        } finally {
            setIsLoadingStats(false)
        }
    }

    useEffect(() => {
        let isMounted = true

        setIsLoadingStats(true)
        refreshStats().finally(() => {
            if (isMounted) setIsLoadingStats(false)
        })

        return () => {
            isMounted = false
        }
    }, [user])

    return (
        <LearningContext.Provider value={{ stats, completedStepsCount, isLoadingStats, refreshStats }}>
            {children}
        </LearningContext.Provider>
    )
}

export function useLearningContext() {
    const context = useContext(LearningContext)
    if (!context) {
        throw new Error('useLearningContext must be used within a LearningProvider')
    }
    return context
}

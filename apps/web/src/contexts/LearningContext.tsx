import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getLearningStats, type LearningStats } from '../services/pointService'

interface LearningContextType {
    stats: LearningStats | null
    isLoadingStats: boolean
    refreshStats: () => Promise<void>
}

const LearningContext = createContext<LearningContextType>({
    stats: null,
    isLoadingStats: true,
    refreshStats: async () => { },
})

export function LearningProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [stats, setStats] = useState<LearningStats | null>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(true)

    const refreshStats = async () => {
        if (!user) {
            setStats(null)
            setIsLoadingStats(false)
            return
        }

        try {
            const currentStats = await getLearningStats(user.id)
            setStats(currentStats)
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
        <LearningContext.Provider value={{ stats, isLoadingStats, refreshStats }}>
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

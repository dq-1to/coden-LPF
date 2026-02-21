import { supabase } from '../lib/supabaseClient'

export interface LearningStats {
    user_id: string
    total_points: number
    current_streak: number
    max_streak: number
    last_study_date: string | null
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
    const { data, error } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        throw error
    }

    return (
        data ?? {
            user_id: userId,
            total_points: 0,
            current_streak: 0,
            max_streak: 0,
            last_study_date: null,
        }
    )
}

function calculateStreak(stats: LearningStats, todayDateStr: string, yesterdayDateStr: string): LearningStats {
    const newStats = { ...stats }

    if (stats.last_study_date === todayDateStr) {
        // Already studied today
        return newStats
    }

    if (stats.last_study_date === yesterdayDateStr) {
        // Studied yesterday, increment
        newStats.current_streak += 1
    } else {
        // Broken streak or first time
        newStats.current_streak = 1
    }

    newStats.last_study_date = todayDateStr
    if (newStats.current_streak > newStats.max_streak) {
        newStats.max_streak = newStats.current_streak
    }

    return newStats
}

export async function awardPoints(userId: string, amount: number, reason: string): Promise<void> {
    // 1. Get current stats
    const stats = await getLearningStats(userId)

    // 2. Calculate new points and streak
    const now = new Date()
    const todayDateStr = now.toISOString().split('T')[0]

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const yesterdayDateStr = yesterday.toISOString().split('T')[0]

    const newStats = calculateStreak(stats, todayDateStr, yesterdayDateStr)
    newStats.total_points += amount

    // 3. Upsert stats
    const { error: statsError } = await supabase.from('learning_stats').upsert(
        {
            user_id: userId,
            total_points: newStats.total_points,
            current_streak: newStats.current_streak,
            max_streak: newStats.max_streak,
            last_study_date: newStats.last_study_date,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
    )

    if (statsError) {
        throw statsError
    }

    // 4. Insert history
    const { error: historyError } = await supabase.from('point_history').insert({
        user_id: userId,
        amount,
        reason,
    })

    if (historyError) {
        throw historyError
    }
}

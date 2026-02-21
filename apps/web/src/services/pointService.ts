import { supabase } from '../lib/supabaseClient'
import { applyStudyActivity, getLearningStats } from './statsService'

export type { LearningStats } from './statsService'

export async function awardPoints(userId: string, amount: number, reason: string): Promise<void> {
    // 1. Get current stats
    const stats = await getLearningStats(userId)

    // 2. Calculate new points and streak
    const newStats = applyStudyActivity(stats)
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

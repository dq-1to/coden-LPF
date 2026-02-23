import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'

export async function awardPoints(userId: string, amount: number, reason: string): Promise<void> {
    const { error } = await supabase.rpc('award_points_tx', {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
    })

    if (error) {
        throw fromSupabaseError(error, 'ポイントの付与に失敗しました')
    }
}

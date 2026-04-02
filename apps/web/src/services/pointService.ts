import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertPositiveInteger } from '../shared/validation'

export async function awardPoints(amount: number, reason: string): Promise<void> {
    assertPositiveInteger(amount, 'amount')
    const { error } = await supabase.rpc('award_points_tx', {
        p_amount: amount,
        p_reason: reason,
    })

    if (error) {
        throw fromSupabaseError(error, 'ポイントの付与に失敗しました')
    }
}

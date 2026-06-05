import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Json, TablesInsert } from '../shared/types/database.types'

export type LearningEventType =
  | 'step_started'
  | 'mode_started'
  | 'mode_completed'
  | 'practice_answer_submitted'
  | 'test_submitted'
  | 'challenge_submitted'
  | 'daily_completed'
  | 'review_item_created'
  | 'review_item_resolved'
  | 'mini_project_started'
  | 'mini_project_completed'
  | 'feedback_created'
  | 'base_nook_opened'

export type LearningEventMode = 'read' | 'practice' | 'test' | 'challenge' | 'daily' | 'base_nook' | 'mini_project'

export interface TrackLearningEventInput {
  userId: string
  eventType: LearningEventType
  stepId?: string | null
  mode?: LearningEventMode | null
  courseId?: string | null
  payload?: Json | null
}

export async function insertLearningEvent(input: TrackLearningEventInput): Promise<void> {
  const row: TablesInsert<'learning_events'> = {
    user_id: input.userId,
    event_type: input.eventType,
    step_id: input.stepId ?? null,
    mode: input.mode ?? null,
    course_id: input.courseId ?? null,
    payload: input.payload ?? null,
  }

  const { error } = await supabase.from('learning_events').insert(row)

  if (error) {
    throw fromSupabaseError(error, '学習イベントの記録に失敗しました')
  }
}

export function trackLearningEvent(input: TrackLearningEventInput): void {
  void insertLearningEvent(input).catch((error) => {
    console.error('Learning event tracking failed:', error)
  })
}

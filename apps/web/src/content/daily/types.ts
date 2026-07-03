export interface DailyQuestion {
  id: string
  stepId: string
  type: 'blank' | 'choice'
  prompt: string
  answer: string
  hint: string
  explanation: string
  choices?: string[]
}

export interface DailyReviewTarget {
  stepId: string
  mode: 'practice' | 'test' | 'challenge' | 'daily'
  questionId?: string | null
}

export interface TodayChallengeResult {
  question: DailyQuestion | null
  alreadyCompleted: boolean
  completedAt: string | null
  pointsEarned: number
  dateStr: string
  reviewReason?: string | null
  reviewTarget?: DailyReviewTarget | null
  /** alreadyCompleted 時のみ意味を持つ。正解したか（既存データ互換で NULL は true 扱い） */
  isCorrect: boolean
  /** alreadyCompleted かつ不正解時に学び直し導線として表示する正解 */
  correctAnswer: string | null
  /** alreadyCompleted かつ不正解時に学び直し導線として表示する解説 */
  explanation: string | null
}

export interface SubmitResult {
  isCorrect: boolean
  pointsEarned: number
  correctAnswer: string
  explanation: string
}

export interface WeeklyStatusEntry {
  date: string
  completed: boolean
}

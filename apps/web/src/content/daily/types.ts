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

export interface TodayChallengeResult {
  question: DailyQuestion | null
  alreadyCompleted: boolean
  completedAt: string | null
  pointsEarned: number
  dateStr: string
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

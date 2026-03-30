export type CodeReadingDifficulty = 'basic' | 'intermediate' | 'advanced'

export interface CodeReadingQuestion {
  id: string
  text: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface CodeReadingProblem {
  id: string
  difficulty: CodeReadingDifficulty
  title: string
  description: string
  codeSnippet: string
  language: string
  questions: CodeReadingQuestion[]
}

export interface CodeReadingProgress {
  problemId: string
  correctCount: number
  totalCount: number
  completed: boolean
  completedAt: string | null
}

export interface QuestionJudgeResult {
  questionId: string
  isCorrect: boolean
  selectedIndex: number
  correctIndex: number
  explanation: string
}

export interface SubmitReadingResult {
  questionResults: QuestionJudgeResult[]
  allCorrect: boolean
  correctCount: number
  pointsEarned: number
}

export type MiniProjectDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type MiniProjectStatus = 'not_started' | 'in_progress' | 'completed'

export interface MiniProjectMilestone {
  id: string
  title: string
  description: string
  requiredKeywords: string[]
}

export interface MiniProject {
  id: string
  difficulty: MiniProjectDifficulty
  title: string
  description: string
  keyElements: string[]
  milestones: MiniProjectMilestone[]
  initialCode: string
}

export interface MiniProjectProgress {
  projectId: string
  status: MiniProjectStatus
  code: string | null
  completedAt: string | null
}

export interface MilestoneJudgeResult {
  milestoneId: string
  passed: boolean
}

export interface SubmitProjectResult {
  milestoneResults: MilestoneJudgeResult[]
  allPassed: boolean
  pointsEarned: number
  newStatus: MiniProjectStatus
}

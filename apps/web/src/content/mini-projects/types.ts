export type MiniProjectDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type MiniProjectStatus = 'not_started' | 'in_progress' | 'completed'

export interface MiniProjectMilestone {
  id: string
  title: string
  description: string
  requiredKeywords: string[]
  /** マイルストーン開始時のスキャフォールドコード（省略時は initialCode を使用） */
  scaffoldCode?: string
  /** モバイルガイドモード: 編集可能行範囲（1-indexed） */
  editableRange?: { startLine: number; endLine: number }
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

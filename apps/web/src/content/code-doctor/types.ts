export type CodeDoctorDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface CodeDoctorProblem {
  /** e.g. 'cd-beginner-001' */
  id: string
  category: 'react'
  difficulty: CodeDoctorDifficulty
  title: string
  /** 期待される動作の説明 */
  description: string
  /** バグが仕込まれたコード */
  buggyCode: string
  hint: string
  /** 修正後のコードに含まれるべきキーワード */
  requiredKeywords: string[]
  /** 修正後のコードに含まれてはいけないパターン（バグの残骸） */
  ngKeywords: string[]
  /** 正解後に表示する解説 */
  explanation: string
}

export interface CodeDoctorProgress {
  problemId: string
  solved: boolean
  attempts: number
  solvedAt: string | null
}

export interface SubmitDoctorResult {
  passed: boolean
  pointsEarned: number
  missingKeywords: string[]
  foundNgKeywords: string[]
  explanation: string
}

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChallengeSubmissionHistory } from '../ChallengeSubmissionHistory'
import type { ChallengeSubmission } from '@/services/challengeSubmissionService'

const submissions: ChallengeSubmission[] = [
  {
    id: 'submission-1',
    user_id: 'user-1',
    step_id: 'usestate-basic',
    code: 'const [count, setCount] = useState(0);',
    is_passed: true,
    matched_keywords: ['useState'],
    submitted_at: '2026-03-09T10:30:00.000Z',
  },
]

describe('ChallengeSubmissionHistory', () => {
  it('最新提出のコード・提出日時・合否を表示する', () => {
    render(<ChallengeSubmissionHistory submissions={submissions} isLoading={false} error={null} />)

    expect(screen.getByText('直近の提出履歴')).toBeTruthy()
    expect(screen.getByText('Latest Submission')).toBeTruthy()
    expect(screen.getByText('合格')).toBeTruthy()
    expect(screen.getByText('const [count, setCount] = useState(0);')).toBeTruthy()
    expect(screen.getByText(/2026\/03\/09/)).toBeTruthy()
  })

  it('履歴がない場合は空状態を表示する', () => {
    render(<ChallengeSubmissionHistory submissions={[]} isLoading={false} error={null} />)

    expect(screen.getByText('提出履歴はまだありません。')).toBeTruthy()
  })
})

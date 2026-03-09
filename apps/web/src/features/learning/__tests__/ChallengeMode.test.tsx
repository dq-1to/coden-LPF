import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChallengeMode } from '../ChallengeMode'
import type { ChallengeTask } from '../../../content/fundamentals/steps'

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value?: string; onChange?: (nextValue: string) => void }) => (
    <textarea
      aria-label="challenge-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}))

const firstTask: ChallengeTask = {
  patterns: [
    {
      id: 'pattern-1',
      prompt: '最初の課題',
      requirements: ['要件1'],
      hints: ['ヒント1'],
      expectedKeywords: ['useState', 'onClick'],
      starterCode: '',
    },
  ],
}

const secondTask: ChallengeTask = {
  patterns: [
    {
      id: 'pattern-2',
      prompt: '次の課題',
      requirements: ['要件2'],
      hints: ['ヒント2'],
      expectedKeywords: ['return'],
      starterCode: 'const nextStep = true;',
    },
  ],
}

describe('ChallengeMode', () => {
  afterEach(() => {
    cleanup()
  })

  it('初回の正解判定で onComplete を呼ぶ', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const onSubmitResult = vi.fn()

    render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={onComplete} onSubmitResult={onSubmitResult} />)

    const editor = await screen.findByLabelText('challenge-editor')
    fireEvent.change(editor, {
      target: { value: 'const [count, setCount] = useState(0); <button onClick={() => setCount(count + 1)} />' },
    })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onSubmitResult).toHaveBeenCalledWith({
      code: 'const [count, setCount] = useState(0); <button onClick={() => setCount(count + 1)} />',
      isPassed: true,
      matchedKeywords: ['useState', 'onClick'],
    })
    expect(screen.getByRole('status').textContent).toContain('Challengeを完了しました')
  })

  it('stepId が変わると入力内容と判定状態をリセットする', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { rerender } = render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={onComplete} />)

    const editor = await screen.findByLabelText('challenge-editor')
    fireEvent.change(editor, { target: { value: 'useState onClick' } })
    await user.click(screen.getByRole('button', { name: '判定する' }))
    expect(onComplete).toHaveBeenCalledTimes(1)

    rerender(<ChallengeMode stepId="step-b" task={secondTask} onComplete={onComplete} />)

    expect(screen.queryByRole('status')).toBeNull()
    expect((screen.getByLabelText('challenge-editor') as HTMLTextAreaElement).value).toBe('const nextStep = true;')
    expect(screen.getByText('次の課題')).toBeTruthy()
  })
})

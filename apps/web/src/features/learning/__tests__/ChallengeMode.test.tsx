import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChallengeMode } from '../ChallengeMode'
import type { ChallengeTask } from '../../../content/fundamentals/steps'

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value?: string; onChange?: (nextValue: string) => void }) => (
    <textarea
      aria-label="challenge-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}))

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
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
    expect(screen.getByRole('status').className).toContain('animate-fadeIn')
  })

  it('初期レンダリング: パターンのプロンプトと要件が表示されること', () => {
    // Arrange
    render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={vi.fn()} />)

    // Assert
    expect(screen.getByText('最初の課題')).toBeTruthy()
    expect(screen.getByText('要件1')).toBeTruthy()
  })

  it('判定（失敗）: キーワード不足で「要件を満たしていません。」と不足キーワードが表示されること', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={vi.fn()} />)

    const editor = await screen.findByLabelText('challenge-editor')

    // Act: キーワードを含まないコードで判定
    fireEvent.change(editor, { target: { value: 'const x = 1' } })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    // Assert
    expect(screen.getByRole('status').textContent).toContain('要件を満たしていません。')
    expect(screen.getByText('useState')).toBeTruthy()
    expect(screen.getByText('onClick')).toBeTruthy()
  })

  it('ヒント表示: 判定失敗時にヒントが表示されること', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={vi.fn()} />)

    const editor = await screen.findByLabelText('challenge-editor')

    // Act: キーワードを含まないコードで判定
    fireEvent.change(editor, { target: { value: 'const x = 1' } })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    // Assert: hints[0] が表示されること
    expect(screen.getByText(/ヒント1/)).toBeTruthy()
  })

  it('submissionError: onSubmitResult が throw した場合にエラーメッセージが表示されること', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmitResult = vi.fn().mockRejectedValue(new Error('保存エラーが発生しました'))

    render(
      <ChallengeMode
        stepId="step-a"
        task={firstTask}
        onComplete={vi.fn()}
        onSubmitResult={onSubmitResult}
      />,
    )

    const editor = await screen.findByLabelText('challenge-editor')

    // Act: 正解コードで判定するが onSubmitResult が throw する
    fireEvent.change(editor, {
      target: { value: 'const [count, setCount] = useState(0); <button onClick={() => {}} />' },
    })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    // Assert: ErrorBanner に throw したエラーメッセージが表示されること
    expect(screen.getByRole('alert').textContent).toContain('保存エラーが発生しました')
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

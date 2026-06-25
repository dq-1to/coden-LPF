import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChallengeMode } from '../ChallengeMode'
import type { ChallengeTask } from '../../../content/fundamentals/steps'

const recordWrongAnswer = vi.fn()
const resolveReviewItem = vi.fn()
const trackLearningEvent = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '00000000-0000-0000-0000-000000000001' },
  }),
}))

vi.mock('@/services/reviewService', () => ({
  recordWrongAnswer: (...args: unknown[]) => recordWrongAnswer(...args),
  resolveReviewItem: (...args: unknown[]) => resolveReviewItem(...args),
}))

vi.mock('@/services/eventService', () => ({
  trackLearningEvent: (...args: unknown[]) => trackLearningEvent(...args),
}))

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
  useIsMobile: vi.fn(() => false),
}))

vi.mock('../ChallengePuzzle/ChallengePuzzleMulti', () => ({
  ChallengePuzzleMulti: ({ puzzle, onCodeChange }: { puzzle: { codeContext: string; blanks: Array<{ label: string }> }; onCodeChange: (code: string) => void }) => (
    <div data-testid="puzzle-multi">
      <div role="region" aria-label="組み立てエリア" />
      <div role="region" aria-label="使えるパーツ" />
      <p>{puzzle.blanks[0]?.label}:</p>
      <button type="button" onClick={() => onCodeChange(puzzle.codeContext)}>mock-assemble</button>
    </div>
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

  beforeEach(() => {
    recordWrongAnswer.mockReset()
    resolveReviewItem.mockReset()
    trackLearningEvent.mockReset()
    recordWrongAnswer.mockResolvedValue(undefined)
    resolveReviewItem.mockResolvedValue(undefined)
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
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'challenge_submitted',
      stepId: 'step-a',
      mode: 'challenge',
      courseId: null,
      payload: {
        isCorrect: true,
        itemCount: 1,
        questionIds: ['pattern-1'],
      },
    })
    expect(onSubmitResult).toHaveBeenCalledWith({
      code: 'const [count, setCount] = useState(0); <button onClick={() => setCount(count + 1)} />',
      isPassed: true,
      matchedKeywords: ['useState', 'onClick'],
      patternId: 'pattern-1',
    })
    expect(resolveReviewItem).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      stepId: 'step-a',
      mode: 'challenge',
      questionId: 'pattern-1',
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
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'challenge_submitted',
      stepId: 'step-a',
      mode: 'challenge',
      courseId: null,
      payload: {
        isCorrect: false,
        itemCount: 1,
        questionIds: ['pattern-1'],
      },
    })
    expect(recordWrongAnswer).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      stepId: 'step-a',
      mode: 'challenge',
      questionId: 'pattern-1',
      expected: 'useState, onClick',
      userInput: 'const x = 1',
    })
    expect(screen.getByText('useState')).toBeTruthy()
    expect(screen.getByText('onClick')).toBeTruthy()
  })

  it('violations 表示: ngKeywords を含むと「避けたい書き方」と違反語が表示され不合格になること', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const ngTask: ChallengeTask = {
      patterns: [
        {
          id: 'ng-pattern',
          prompt: 'index を key にしない',
          requirements: ['mapを使う'],
          hints: ['key={item.id}'],
          expectedKeywords: ['map', 'key='],
          ngKeywords: ['key={index}'],
          starterCode: '',
        },
      ],
    }

    render(<ChallengeMode stepId="step-ng" task={ngTask} onComplete={onComplete} />)

    const editor = await screen.findByLabelText('challenge-editor')
    // 必須は満たすが ngKeyword を含む
    fireEvent.change(editor, { target: { value: 'items.map((item, index) => <li key={index}>{item}</li>)' } })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByText('避けたい書き方が含まれています:')).toBeTruthy()
    expect(screen.getByText('key={index}')).toBeTruthy()
  })

  it('anyOf: いずれかの正解パターンを満たせば合格すること', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const anyOfTask: ChallengeTask = {
      patterns: [
        {
          id: 'anyof-pattern',
          prompt: 'カウントを増やす',
          requirements: ['setCountを使う'],
          hints: ['count + 1 でも prev => prev + 1 でも可'],
          expectedKeywords: ['setCount'],
          anyOf: [['count + 1'], ['prev => prev + 1']],
          starterCode: '',
        },
      ],
    }

    render(<ChallengeMode stepId="step-anyof" task={anyOfTask} onComplete={onComplete} />)

    const editor = await screen.findByLabelText('challenge-editor')
    // 2つ目の正解パターンを使用
    fireEvent.change(editor, { target: { value: 'setCount(prev => prev + 1)' } })
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain('Challengeを完了しました')
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

describe('ChallengeMode モバイルパズル', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('mobilePuzzle 未定義のパターンではデスクトップ・モバイル問わず従来エディタが表示される', () => {
    render(<ChallengeMode stepId="step-a" task={firstTask} onComplete={vi.fn()} />)
    expect(screen.getByLabelText('challenge-editor')).toBeTruthy()
  })

  it('モバイル + multi: 複数ブランクのパズルUIが表示される', async () => {
    const { useIsMobile } = await import('@/hooks/useIsMobile')
    vi.mocked(useIsMobile).mockReturnValue(true)

    const puzzleTask: ChallengeTask = {
      patterns: [
        {
          id: 'multi-test',
          prompt: '複数ブランクテスト',
          requirements: ['要件B'],
          hints: ['ヒントB'],
          expectedKeywords: ['onChange', 'useState'],
          starterCode: '',
          mobilePuzzle: {
            type: 'multi',
            codeContext: 'function App() {\n  ____0\n  return <input ____1 />\n}',
            blanks: [
              {
                id: 'state',
                label: 'state定義',
                correctTokens: ['const', 'x', '=', 'useState', '(', "''", ')'],
                distractorTokens: ['let'],
              },
              {
                id: 'handler',
                label: 'onChange設定',
                correctTokens: ['onChange', '=', '{', 'handleChange', '}'],
                distractorTokens: ['onClick'],
              },
            ],
          },
        },
      ],
    }

    render(<ChallengeMode stepId="step-multi" task={puzzleTask} onComplete={vi.fn()} />)

    // パズルUIが表示される
    expect(screen.getByRole('region', { name: '組み立てエリア' })).toBeTruthy()
    expect(screen.getByRole('region', { name: '使えるパーツ' })).toBeTruthy()
    // ブランクラベルが表示される
    expect(screen.getByText('state定義:')).toBeTruthy()
    // 従来エディタは表示されない
    expect(screen.queryByLabelText('challenge-editor')).toBeNull()
  })

})

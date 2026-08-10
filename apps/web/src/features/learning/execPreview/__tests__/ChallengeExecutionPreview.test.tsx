import { StrictMode } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChallengeExecutionPreview from '../ChallengeExecutionPreview'

const sandpackMock = vi.hoisted(() => ({
  status: 'idle',
  runSandpack: vi.fn<() => Promise<void>>(),
  listen: vi.fn(),
  unsubscribe: vi.fn(),
  listener: null as null | ((message: Record<string, unknown>) => void),
  options: null as null | Record<string, unknown>,
  events: [] as string[],
}))

vi.mock('@codesandbox/sandpack-react', () => ({
  SandpackProvider: ({
    children,
    options,
  }: {
    children: React.ReactNode
    options: Record<string, unknown>
  }) => {
    sandpackMock.options = options
    return children
  },
  SandpackPreview: () => <div data-testid="sandpack-preview" />,
  useSandpack: () => ({
    sandpack: {
      runSandpack: sandpackMock.runSandpack,
      status: sandpackMock.status,
    },
    listen: sandpackMock.listen,
  }),
}))

describe('ChallengeExecutionPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sandpackMock.status = 'idle'
    sandpackMock.runSandpack.mockReset()
    sandpackMock.runSandpack.mockImplementation(() => {
      sandpackMock.events.push('run')
      return Promise.resolve()
    })
    sandpackMock.unsubscribe.mockReset()
    sandpackMock.listen.mockReset()
    sandpackMock.listen.mockImplementation((listener) => {
      sandpackMock.events.push('listen')
      sandpackMock.listener = listener
      return sandpackMock.unsubscribe
    })
    sandpackMock.listener = null
    sandpackMock.options = null
    sandpackMock.events = []
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('StrictModeでも手動実行を1回だけ開始する', async () => {
    const onReady = vi.fn()
    const onError = vi.fn()

    render(
      <StrictMode>
        <ChallengeExecutionPreview
          code="export function App() { return null }"
          isVisible={false}
          runId={1}
          onReady={onReady}
          onError={onError}
        />
      </StrictMode>,
    )

    expect(sandpackMock.runSandpack).not.toHaveBeenCalled()

    await act(async () => {
      vi.runAllTimers()
      await Promise.resolve()
    })

    expect(sandpackMock.runSandpack).toHaveBeenCalledTimes(1)
    expect(sandpackMock.events.lastIndexOf('listen')).toBeLessThan(
      sandpackMock.events.indexOf('run'),
    )
    expect(sandpackMock.options).toMatchObject({
      autorun: false,
      autoReload: false,
      initMode: 'immediate',
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('実行完了を親へ通知する', async () => {
    const onReady = vi.fn()
    const onError = vi.fn()
    const props = {
      code: 'export function App() { return null }',
      isVisible: false,
      runId: 7,
      onReady,
      onError,
    }
    render(<ChallengeExecutionPreview {...props} />)

    await act(async () => {
      vi.runAllTimers()
      await Promise.resolve()
    })

    act(() => {
      sandpackMock.listener?.({
        type: 'done',
        compilatonError: false,
      })
      sandpackMock.listener?.({
        type: 'done',
        compilatonError: false,
      })
    })

    expect(onReady).toHaveBeenCalledOnce()
    expect(onReady).toHaveBeenCalledWith(7)
    expect(onError).not.toHaveBeenCalled()
  })

  it('done の compilatonError をコンパイルエラーとして親へ通知する', () => {
    const onReady = vi.fn()
    const onError = vi.fn()

    render(
      <ChallengeExecutionPreview
        code="export function App() { return null }"
        isVisible={false}
        runId={11}
        onReady={onReady}
        onError={onError}
      />,
    )

    act(() => {
      sandpackMock.listener?.({
        type: 'done',
        compilatonError: true,
      })
    })

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(
      11,
      'プレビューを準備できませんでした。コードの構文を確認してください。',
    )
    expect(onReady).not.toHaveBeenCalled()
  })

  it('show-error は一般エラーとして通知し、重複通知しない', () => {
    const onReady = vi.fn()
    const onError = vi.fn()

    render(
      <ChallengeExecutionPreview
        code="export function App() { return null }"
        isVisible={false}
        runId={13}
        onReady={onReady}
        onError={onError}
      />,
    )

    act(() => {
      sandpackMock.listener?.({
        type: 'done',
        compilatonError: false,
      })
      sandpackMock.listener?.({
        type: 'action',
        action: 'show-error',
      })
      sandpackMock.listener?.({
        type: 'action',
        action: 'show-error',
      })
    })

    expect(onReady).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(
      13,
      'プレビューでエラーが発生しました。コードを確認してください。',
    )
  })

  it('notification error は実行時エラーとして親へ通知する', () => {
    const onReady = vi.fn()
    const onError = vi.fn()

    render(
      <ChallengeExecutionPreview
        code="export function App() { return null }"
        isVisible={false}
        runId={17}
        onReady={onReady}
        onError={onError}
      />,
    )

    act(() => {
      sandpackMock.listener?.({
        type: 'action',
        action: 'notification',
        notificationType: 'error',
      })
    })

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(17, 'プレビューの実行中にエラーが発生しました。')
    expect(onReady).not.toHaveBeenCalled()
  })
})

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FeedbackProvider, useFeedbackContext } from '../FeedbackContext'

afterEach(() => {
  cleanup()
})

function TestConsumer() {
  const { isOpen, openFeedback, closeFeedback } = useFeedbackContext()
  return (
    <div>
      <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
      <button type="button" onClick={openFeedback}>open</button>
      <button type="button" onClick={closeFeedback}>close</button>
    </div>
  )
}

describe('FeedbackContext', () => {
  it('初期状態で isOpen が false', () => {
    render(
      <FeedbackProvider>
        <TestConsumer />
      </FeedbackProvider>,
    )
    expect(screen.getByTestId('status').textContent).toBe('closed')
  })

  it('openFeedback で isOpen が true になる', () => {
    render(
      <FeedbackProvider>
        <TestConsumer />
      </FeedbackProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'open' }).click()
    })
    expect(screen.getByTestId('status').textContent).toBe('open')
  })

  it('closeFeedback で isOpen が false に戻る', () => {
    render(
      <FeedbackProvider>
        <TestConsumer />
      </FeedbackProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'open' }).click()
    })
    expect(screen.getByTestId('status').textContent).toBe('open')

    act(() => {
      screen.getByRole('button', { name: 'close' }).click()
    })
    expect(screen.getByTestId('status').textContent).toBe('closed')
  })

  it('Provider 外で useFeedbackContext を呼ぶとエラーになる', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useFeedbackContext must be used inside FeedbackProvider',
    )
  })
})

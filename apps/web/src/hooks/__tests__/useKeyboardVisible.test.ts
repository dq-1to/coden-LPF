import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useKeyboardVisible } from '../useKeyboardVisible'

describe('useKeyboardVisible', () => {
  const originalVisualViewport = window.visualViewport

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      value: originalVisualViewport,
      writable: true,
      configurable: true,
    })
  })

  it('visualViewport が undefined の場合（デスクトップ）、常に false を返す', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(false)
  })

  it('キーボードが非表示（height差 < 150）の場合、false を返す', () => {
    let capturedHandler: (() => void) | null = null

    const mockViewport = {
      height: 800,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'resize') capturedHandler = handler
      }),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'visualViewport', {
      value: mockViewport,
      writable: true,
      configurable: true,
    })

    window.innerHeight = 800

    const { result } = renderHook(() => useKeyboardVisible())

    act(() => {
      mockViewport.height = 700  // 差 = 100、閾値 150 未満
      capturedHandler?.()
    })

    expect(result.current).toBe(false)
  })

  it('キーボードが表示（height差 > 150）の場合、resize イベントで true になる', () => {
    let capturedHandler: (() => void) | null = null

    const mockViewport = {
      height: 800,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'resize') capturedHandler = handler
      }),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'visualViewport', {
      value: mockViewport,
      writable: true,
      configurable: true,
    })

    window.innerHeight = 800

    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(false)

    act(() => {
      mockViewport.height = 400  // 差 = 400、閾値 150 超過
      capturedHandler?.()
    })

    expect(result.current).toBe(true)
  })

  it('アンマウント時にイベントリスナーが解除される', () => {
    const mockViewport = {
      height: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'visualViewport', {
      value: mockViewport,
      writable: true,
      configurable: true,
    })

    const { unmount } = renderHook(() => useKeyboardVisible())

    expect(mockViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(mockViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))

    unmount()

    expect(mockViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(mockViewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

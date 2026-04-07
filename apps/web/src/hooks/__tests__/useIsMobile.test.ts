import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useIsMobile } from '../useIsMobile'

type ChangeHandler = (e: MediaQueryListEvent) => void

function createMatchMediaMock(matches: boolean) {
  const listeners: ChangeHandler[] = []

  const mql = {
    matches,
    media: '(max-width: 767px)',
    addEventListener: vi.fn((_type: string, handler: ChangeHandler) => {
      listeners.push(handler)
    }),
    removeEventListener: vi.fn((_type: string, handler: ChangeHandler) => {
      const index = listeners.indexOf(handler)
      if (index !== -1) listeners.splice(index, 1)
    }),
    dispatchChange(newMatches: boolean) {
      listeners.forEach((fn) => fn({ matches: newMatches } as MediaQueryListEvent))
    },
    // MediaQueryList に必要な追加プロパティ
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }

  return mql
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('matchMedia が true の場合、初期値 true を返す', () => {
    const mql = createMatchMediaMock(true)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('matchMedia が false の場合、初期値 false を返す', () => {
    const mql = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('change イベントで値が切り替わる', () => {
    const mql = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      mql.dispatchChange(true)
    })

    expect(result.current).toBe(true)

    act(() => {
      mql.dispatchChange(false)
    })

    expect(result.current).toBe(false)
  })

  it('アンマウント時にイベントリスナーが解除される', () => {
    const mql = createMatchMediaMock(false)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

    const { unmount } = renderHook(() => useIsMobile())

    expect(mql.addEventListener).toHaveBeenCalledOnce()

    unmount()

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})

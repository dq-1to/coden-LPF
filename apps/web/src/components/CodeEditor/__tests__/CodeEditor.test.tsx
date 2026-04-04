import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const MockCodeMirror = vi.hoisted(() =>
  vi.fn(() => <div data-testid="codemirror-mock" />),
)

vi.mock('@uiw/react-codemirror', () => ({
  __esModule: true,
  default: MockCodeMirror,
}))

vi.mock('@codemirror/lang-javascript', () => ({
  javascript: vi.fn(() => []),
}))

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: [],
}))

vi.mock('@codemirror/view', () => ({
  EditorView: {
    theme: vi.fn(() => []),
  },
}))

import { CodeEditor } from '../CodeEditor'

/** モックの最新呼び出しから props を取得 */
function getLastProps(): Record<string, unknown> {
  const calls = MockCodeMirror.mock.calls as unknown[][]
  return (calls[calls.length - 1]?.[0] ?? {}) as Record<string, unknown>
}

describe('CodeEditor', () => {
  beforeEach(() => {
    MockCodeMirror.mockClear()
  })

  it('基本レンダリング: value が CodeMirror に渡される', () => {
    render(<CodeEditor value="const x = 1" />)

    expect(MockCodeMirror).toHaveBeenCalled()
    expect(getLastProps().value).toBe('const x = 1')
  })

  it('readOnly が CodeMirror に渡される', () => {
    render(<CodeEditor value="" readOnly />)

    expect(getLastProps().readOnly).toBe(true)
    expect(getLastProps().editable).toBe(false)
  })

  it('readOnly 未指定時は false / editable が true', () => {
    render(<CodeEditor value="" />)

    expect(getLastProps().readOnly).toBe(false)
    expect(getLastProps().editable).toBe(true)
  })

  it('height が CodeMirror に渡される', () => {
    render(<CodeEditor value="" height="500px" />)

    expect(getLastProps().height).toBe('500px')
  })

  it('height 未指定時はデフォルト 400px', () => {
    render(<CodeEditor value="" />)

    expect(getLastProps().height).toBe('400px')
  })

  it('onChange コールバックが CodeMirror に渡される', () => {
    const handleChange = vi.fn()

    render(<CodeEditor value="" onChange={handleChange} />)

    expect(getLastProps().onChange).toBe(handleChange)
  })
})

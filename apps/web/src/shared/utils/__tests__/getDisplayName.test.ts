import { describe, expect, it } from 'vitest'
import { getDisplayName } from '../getDisplayName'

describe('getDisplayName', () => {
  it('user_metadata.display_name を優先する', () => {
    expect(
      getDisplayName({
        email: 'coder@example.com',
        user_metadata: { display_name: 'Coden User' },
      } as never),
    ).toBe('Coden User')
  })

  it('display_name が空白のみなら email のローカル部へフォールバックする', () => {
    expect(
      getDisplayName({
        email: 'coder@example.com',
        user_metadata: { display_name: '   ' },
      } as never),
    ).toBe('coder')
  })

  it('display_name が無ければ email のローカル部へフォールバックする', () => {
    expect(
      getDisplayName({
        email: 'coder@example.com',
        user_metadata: {},
      } as never),
    ).toBe('coder')
  })

  it('user と email が無ければ ゲスト を返す', () => {
    expect(getDisplayName(null)).toBe('ゲスト')
    expect(
      getDisplayName({
        email: null,
        user_metadata: {},
      } as never),
    ).toBe('ゲスト')
  })
})

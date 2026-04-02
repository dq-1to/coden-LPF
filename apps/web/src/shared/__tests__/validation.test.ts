import { describe, expect, it } from 'vitest'
import { assertMaxLength, assertPositiveInteger, assertUuid } from '../validation'

describe('assertPositiveInteger', () => {
  it('正の整数は例外を投げない', () => {
    expect(() => assertPositiveInteger(1, 'amount')).not.toThrow()
    expect(() => assertPositiveInteger(100, 'amount')).not.toThrow()
  })

  it('0 は例外を投げる', () => {
    expect(() => assertPositiveInteger(0, 'amount')).toThrow('amount must be a positive integer')
  })

  it('負の整数は例外を投げる', () => {
    expect(() => assertPositiveInteger(-1, 'amount')).toThrow('amount must be a positive integer')
  })

  it('小数は例外を投げる', () => {
    expect(() => assertPositiveInteger(1.5, 'amount')).toThrow('amount must be a positive integer')
  })

  it('Infinity は例外を投げる', () => {
    expect(() => assertPositiveInteger(Infinity, 'amount')).toThrow(
      'amount must be a positive integer',
    )
  })

  it('NaN は例外を投げる', () => {
    expect(() => assertPositiveInteger(NaN, 'amount')).toThrow('amount must be a positive integer')
  })

  it('エラーメッセージに引数名が含まれる', () => {
    expect(() => assertPositiveInteger(-5, 'score')).toThrow('score must be a positive integer')
  })
})

describe('assertUuid', () => {
  it('有効な UUID は例外を投げない', () => {
    expect(() =>
      assertUuid('550e8400-e29b-41d4-a716-446655440000', 'userId'),
    ).not.toThrow()
  })

  it('大文字の UUID も有効として通す', () => {
    expect(() =>
      assertUuid('550E8400-E29B-41D4-A716-446655440000', 'userId'),
    ).not.toThrow()
  })

  it('空文字は例外を投げる', () => {
    expect(() => assertUuid('', 'userId')).toThrow('userId must be a valid UUID')
  })

  it('ハイフンなしの UUID 形式は例外を投げる', () => {
    expect(() => assertUuid('550e8400e29b41d4a716446655440000', 'userId')).toThrow(
      'userId must be a valid UUID',
    )
  })

  it('短い文字列は例外を投げる', () => {
    expect(() => assertUuid('not-a-uuid', 'userId')).toThrow('userId must be a valid UUID')
  })

  it('エラーメッセージに引数名が含まれる', () => {
    expect(() => assertUuid('invalid', 'profileId')).toThrow('profileId must be a valid UUID')
  })
})

describe('assertMaxLength', () => {
  it('max と同じ長さの文字列は例外を投げない', () => {
    expect(() => assertMaxLength('a'.repeat(50), 50, 'displayName')).not.toThrow()
  })

  it('max より短い文字列は例外を投げない', () => {
    expect(() => assertMaxLength('hello', 50, 'displayName')).not.toThrow()
  })

  it('空文字は例外を投げない', () => {
    expect(() => assertMaxLength('', 50, 'displayName')).not.toThrow()
  })

  it('max を超える長さの文字列は例外を投げる', () => {
    expect(() => assertMaxLength('a'.repeat(51), 50, 'displayName')).toThrow(
      'displayName must be at most 50 characters',
    )
  })

  it('エラーメッセージに引数名と max が含まれる', () => {
    expect(() => assertMaxLength('a'.repeat(11), 10, 'bio')).toThrow(
      'bio must be at most 10 characters',
    )
  })
})

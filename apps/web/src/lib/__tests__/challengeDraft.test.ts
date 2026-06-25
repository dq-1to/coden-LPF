import { afterEach, describe, expect, it } from 'vitest'
import {
  buildChallengeDraftKey,
  clearChallengeDraft,
  readChallengeDraft,
  writeChallengeDraft,
} from '../challengeDraft'

const USER = 'user-1'
const STEP = 'usestate-basic'
const PATTERN = 'usestate-like'

describe('challengeDraft', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('buildChallengeDraftKey は user/step/pattern を含むキーを生成する', () => {
    expect(buildChallengeDraftKey(USER, STEP, PATTERN)).toBe(
      'coden:challengeDraft:user-1:usestate-basic:usestate-like',
    )
  })

  it('保存した draft を復元できる', () => {
    writeChallengeDraft(USER, STEP, PATTERN, 'const x = 1')
    expect(readChallengeDraft(USER, STEP, PATTERN)).toBe('const x = 1')
  })

  it('未保存の場合は null を返す', () => {
    expect(readChallengeDraft(USER, STEP, PATTERN)).toBeNull()
  })

  it('clearChallengeDraft で削除できる', () => {
    writeChallengeDraft(USER, STEP, PATTERN, 'draft code')
    clearChallengeDraft(USER, STEP, PATTERN)
    expect(readChallengeDraft(USER, STEP, PATTERN)).toBeNull()
  })

  it('user / step / pattern が異なるとキーが衝突しない', () => {
    writeChallengeDraft(USER, STEP, PATTERN, 'A')
    writeChallengeDraft('user-2', STEP, PATTERN, 'B')
    writeChallengeDraft(USER, 'other-step', PATTERN, 'C')
    writeChallengeDraft(USER, STEP, 'other-pattern', 'D')

    expect(readChallengeDraft(USER, STEP, PATTERN)).toBe('A')
    expect(readChallengeDraft('user-2', STEP, PATTERN)).toBe('B')
    expect(readChallengeDraft(USER, 'other-step', PATTERN)).toBe('C')
    expect(readChallengeDraft(USER, STEP, 'other-pattern')).toBe('D')
  })

  it('localStorage が例外を投げても read/write/clear は throw しない', () => {
    const original = window.localStorage
    const throwingStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    Object.defineProperty(window, 'localStorage', { value: throwingStorage, configurable: true })

    try {
      expect(() => writeChallengeDraft(USER, STEP, PATTERN, 'x')).not.toThrow()
      expect(readChallengeDraft(USER, STEP, PATTERN)).toBeNull()
      expect(() => clearChallengeDraft(USER, STEP, PATTERN)).not.toThrow()
    } finally {
      Object.defineProperty(window, 'localStorage', { value: original, configurable: true })
    }
  })
})

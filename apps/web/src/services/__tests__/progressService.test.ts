import { describe, it, expect } from 'vitest'
import { isStepCompleted } from '../progressService'

describe('isStepCompleted', () => {
  it('4 モードすべて完了していれば true を返す', () => {
    const result = isStepCompleted({
      read_done: true,
      practice_done: true,
      test_done: true,
      challenge_done: true,
    })

    expect(result).toBe(true)
  })

  it('read_done が false の場合は false を返す', () => {
    const result = isStepCompleted({
      read_done: false,
      practice_done: true,
      test_done: true,
      challenge_done: true,
    })

    expect(result).toBe(false)
  })

  it('practice_done が false の場合は false を返す', () => {
    const result = isStepCompleted({
      read_done: true,
      practice_done: false,
      test_done: true,
      challenge_done: true,
    })

    expect(result).toBe(false)
  })

  it('test_done が false の場合は false を返す', () => {
    const result = isStepCompleted({
      read_done: true,
      practice_done: true,
      test_done: false,
      challenge_done: true,
    })

    expect(result).toBe(false)
  })

  it('challenge_done が false の場合は false を返す', () => {
    const result = isStepCompleted({
      read_done: true,
      practice_done: true,
      test_done: true,
      challenge_done: false,
    })

    expect(result).toBe(false)
  })

  it('全モードが false の場合は false を返す', () => {
    const result = isStepCompleted({
      read_done: false,
      practice_done: false,
      test_done: false,
      challenge_done: false,
    })

    expect(result).toBe(false)
  })
})

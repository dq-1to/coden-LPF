import { describe, expect, it } from 'vitest'
import { generateDistractors, seededShuffle, tokenize } from '../useTokenGenerator'

describe('tokenize', () => {
  it('識別子と記号を分割する', () => {
    expect(tokenize('setCount(count - 1)')).toEqual([
      'setCount', '(', 'count', '-', '1', ')',
    ])
  })

  it('複合演算子を1トークンとして扱う', () => {
    expect(tokenize('a === b && c !== d')).toEqual([
      'a', '===', 'b', '&&', 'c', '!==', 'd',
    ])
  })

  it('アロー関数を分割する', () => {
    expect(tokenize('() => value')).toEqual(['(', ')', '=>', 'value'])
  })

  it('ドット記法を1トークンとして扱う', () => {
    expect(tokenize('todo.id')).toEqual(['todo.id'])
  })

  it('空白を除去する', () => {
    expect(tokenize('  a   b  ')).toEqual(['a', 'b'])
  })

  it('文字列リテラルを1トークンとして扱う', () => {
    expect(tokenize('"hello"')).toEqual(['"hello"'])
  })

  it('数値リテラルを扱う', () => {
    expect(tokenize('count + 10')).toEqual(['count', '+', '10'])
  })

  it('isLoggedIn && を分割する', () => {
    expect(tokenize('isLoggedIn&&')).toEqual(['isLoggedIn', '&&'])
  })

  it('key={user.id} を分割する', () => {
    expect(tokenize('key={user.id}')).toEqual(['key', '=', '{', 'user.id', '}'])
  })
})

describe('generateDistractors', () => {
  it('最低3個のダミーを生成する', () => {
    const correct = ['setCount', '(', 'count', '-', '1', ')']
    const result = generateDistractors(correct, 'const [count, setCount] = useState(10)')
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it('正解トークンと重複しない', () => {
    const correct = ['setCount', '(', 'count', '-', '1', ')']
    const result = generateDistractors(correct, 'const [count, setCount] = useState(10)')
    const correctSet = new Set(correct)
    for (const d of result) {
      expect(correctSet.has(d)).toBe(false)
    }
  })

  it('演算子の反転を含む', () => {
    const correct = ['-']
    const result = generateDistractors(correct, 'a ____')
    expect(result).toContain('+')
  })

  it('数値の隣接値を含む', () => {
    const correct = ['1']
    const result = generateDistractors(correct, 'a ____')
    expect(result).toContain('0')
    expect(result).toContain('2')
  })

  it('ダミー数が正解数を超えない', () => {
    const correct = ['setCount', '(', 'count', '-', '1', ')']
    const result = generateDistractors(correct, 'const [count, setCount] = useState(10)')
    expect(result.length).toBeLessThanOrEqual(correct.length)
  })
})

describe('seededShuffle', () => {
  it('同じシードで同じ結果を返す', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    const result1 = seededShuffle(arr, 42)
    const result2 = seededShuffle(arr, 42)
    expect(result1).toEqual(result2)
  })

  it('異なるシードで異なる結果を返す', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    const result1 = seededShuffle(arr, 42)
    const result2 = seededShuffle(arr, 99)
    // Very unlikely to be the same
    expect(result1.join('')).not.toEqual(result2.join(''))
  })

  it('元の配列を変更しない', () => {
    const arr = ['a', 'b', 'c']
    const copy = [...arr]
    seededShuffle(arr, 42)
    expect(arr).toEqual(copy)
  })

  it('全要素を保持する', () => {
    const arr = ['a', 'b', 'c', 'd']
    const result = seededShuffle(arr, 42)
    expect(result.sort()).toEqual([...arr].sort())
  })
})

import { useMemo } from 'react'

interface TokenGeneratorInput {
  starterCode: string
  expectedKeywords: string[]
  mobilePuzzle?: {
    correctTokens: string[]
    distractorTokens: string[]
  }
}

interface TokenGeneratorOutput {
  correctTokens: string[]
  distractorTokens: string[]
  allTokens: string[]
}

/** ディストラクター（ダミートークン）の生成比率（正答トークン数に対する割合） */
const DISTRACTOR_RATIO = 0.75
/** ディストラクターの最小数 */
const MIN_DISTRACTOR_COUNT = 3

/** Multi-char operators that must be matched before single-char fallback */
const MULTI_CHAR_OPS = ['===', '!==', '=>', '&&', '||', '<=', '>=', '...', '?.', '++', '--']

/**
 * Tokenize a code string into identifier / operator / literal tokens.
 * Whitespace and newlines are stripped.
 */
export function tokenize(code: string): string[] {
  const tokens: string[] = []
  let i = 0

  while (i < code.length) {
    const ch = code.charAt(i)

    // skip whitespace
    if (/\s/.test(ch)) {
      i++
      continue
    }

    // multi-char operators
    let matched = false
    for (const op of MULTI_CHAR_OPS) {
      if (code.startsWith(op, i)) {
        tokens.push(op)
        i += op.length
        matched = true
        break
      }
    }
    if (matched) continue

    // string literals (single/double/backtick)
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1
      while (j < code.length && code.charAt(j) !== ch) {
        if (code.charAt(j) === '\\') j++ // skip escaped char
        j++
      }
      tokens.push(code.slice(i, j + 1))
      i = j + 1
      continue
    }

    // identifiers (letters, digits, underscore, dollar, dots for property access)
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code.charAt(j))) j++
      // include dot notation (e.g. todo.id)
      while (j < code.length && code.charAt(j) === '.' && j + 1 < code.length && /[a-zA-Z_$]/.test(code.charAt(j + 1))) {
        j++ // skip dot
        while (j < code.length && /[a-zA-Z0-9_$]/.test(code.charAt(j))) j++
      }
      tokens.push(code.slice(i, j))
      i = j
      continue
    }

    // numeric literals
    if (/[0-9]/.test(ch)) {
      let j = i + 1
      while (j < code.length && /[0-9.]/.test(code.charAt(j))) j++
      tokens.push(code.slice(i, j))
      i = j
      continue
    }

    // single-char operator / punctuation
    tokens.push(ch)
    i++
  }

  return tokens
}

/** Operator opposites for distractor generation */
const OPERATOR_OPPOSITES: Record<string, string[]> = {
  '+': ['-'],
  '-': ['+'],
  '*': ['/'],
  '/': ['*'],
  '===': ['!=='],
  '!==': ['==='],
  '&&': ['||'],
  '||': ['&&'],
  '<': ['>'],
  '>': ['<'],
  '<=': ['>='],
  '>=': ['<='],
}

/** Common confusable identifier fragments */
const CONFUSABLE_PREFIXES: Record<string, string[]> = {
  set: ['get', 'reset'],
  get: ['set'],
  is: ['has', 'can'],
  has: ['is'],
  handle: ['on'],
  on: ['handle'],
  use: ['get'],
}

/** Numeric neighbour distractors */
function numericDistractors(token: string): string[] {
  const n = Number(token)
  if (Number.isNaN(n) || !Number.isInteger(n)) return []
  const result: string[] = []
  if (n > 0) result.push(String(n - 1))
  result.push(String(n + 1))
  return result
}

/** Generate confusable identifier variants */
function identifierDistractors(token: string): string[] {
  const results: string[] = []
  for (const [prefix, alts] of Object.entries(CONFUSABLE_PREFIXES)) {
    if (token.startsWith(prefix) && token.length > prefix.length) {
      for (const alt of alts) {
        results.push(alt + token.slice(prefix.length))
      }
    }
  }
  // CamelCase split: e.g. "setCount" → "Count"
  const camelParts = token.split(/(?=[A-Z])/)
  if (camelParts.length > 1) {
    results.push(camelParts.slice(1).join(''))
  }
  return results
}

/**
 * Generate distractor tokens that are plausible but incorrect.
 * Count: 50-100% of correct tokens, min 3, max correct count.
 */
export function generateDistractors(correctTokens: string[], starterCode: string): string[] {
  const correctSet = new Set(correctTokens)
  const candidates = new Set<string>()

  for (const token of correctTokens) {
    // operator opposites
    const opposites = OPERATOR_OPPOSITES[token]
    if (opposites) {
      for (const opp of opposites) {
        if (!correctSet.has(opp)) candidates.add(opp)
      }
    }
    // numeric neighbours
    for (const nd of numericDistractors(token)) {
      if (!correctSet.has(nd)) candidates.add(nd)
    }
    // identifier confusables
    for (const id of identifierDistractors(token)) {
      if (!correctSet.has(id)) candidates.add(id)
    }
  }

  // extract identifiers from starterCode as context distractors
  const contextTokens = tokenize(starterCode.replace('____', ''))
  for (const ct of contextTokens) {
    if (/^[a-zA-Z_$]/.test(ct) && !correctSet.has(ct)) {
      candidates.add(ct)
    }
  }

  const targetCount = Math.max(
    MIN_DISTRACTOR_COUNT,
    Math.min(correctTokens.length, Math.ceil(correctTokens.length * DISTRACTOR_RATIO)),
  )
  const arr = [...candidates]

  // deterministic shuffle using simple seed from correct tokens
  const seed = correctTokens.join('').length
  for (let idx = arr.length - 1; idx > 0; idx--) {
    const j = (seed * (idx + 1) * 31) % (idx + 1)
    const valIdx = arr[idx]
    const valJ = arr[j]
    if (valIdx !== undefined && valJ !== undefined) {
      arr[idx] = valJ
      arr[j] = valIdx
    }
  }

  return arr.slice(0, targetCount)
}

/**
 * Fisher-Yates shuffle with a deterministic seed so results are stable per-render
 * but shuffled across different inputs.
 */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let idx = result.length - 1; idx > 0; idx--) {
    s = (s * 16807 + 0) % 2147483647 // LCG
    const j = s % (idx + 1)
    const valIdx = result[idx]
    const valJ = result[j]
    if (valIdx !== undefined && valJ !== undefined) {
      result[idx] = valJ
      result[j] = valIdx
    }
  }
  return result
}

export function useTokenGenerator(input: TokenGeneratorInput): TokenGeneratorOutput {
  return useMemo(() => {
    // If mobilePuzzle is provided by content author, use it directly
    if (input.mobilePuzzle) {
      const { correctTokens, distractorTokens } = input.mobilePuzzle
      const seed = correctTokens.join('').length + distractorTokens.join('').length
      return {
        correctTokens,
        distractorTokens,
        allTokens: seededShuffle([...correctTokens, ...distractorTokens], seed),
      }
    }

    // Auto-generate from expectedKeywords
    const expectedAnswer = input.expectedKeywords.join('')
    const correctTokens = tokenize(expectedAnswer)
    const distractorTokens = generateDistractors(correctTokens, input.starterCode)
    const seed = correctTokens.join('').length + distractorTokens.join('').length
    const allTokens = seededShuffle([...correctTokens, ...distractorTokens], seed)

    return { correctTokens, distractorTokens, allTokens }
  }, [input.starterCode, input.expectedKeywords, input.mobilePuzzle])
}

import type { CodeDoctorProblem } from './types'

/**
 * ngKeywords を含む行番号を返す（1-indexed）。
 * problem.buggyLineNumbers が指定されていればそちらを優先する。
 */
export function estimateBuggyLines(problem: CodeDoctorProblem): number[] {
  if (problem.buggyLineNumbers) return problem.buggyLineNumbers

  const lines = problem.buggyCode.split('\n')
  const buggyLines: number[] = []

  for (const kw of problem.ngKeywords) {
    const kwLower = kw.toLowerCase()
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(kwLower)) {
        buggyLines.push(i + 1)
      }
    })
  }

  return [...new Set(buggyLines)].sort((a, b) => a - b)
}

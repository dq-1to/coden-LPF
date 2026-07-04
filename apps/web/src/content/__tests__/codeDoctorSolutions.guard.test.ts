/**
 * コードドクター 全問題 模範解答 × 判定整合ガードテスト（Issue #334 / M11-1）
 *
 * cd-intermediate-003（useEffect に async を直接渡す）が、アロー関数版・void 無しの
 * 自然な正答で不合格になる false negative を解消したことを担保するとともに、
 * 全30問について以下を機械検証する。
 *
 * (a) solutionCode が judgeCode（judgeKeywords 委譲）で合格する
 * (b) buggyCode がそのままでは不合格になる（バグ未修正コードの誤合格防止）
 * (c) cd-intermediate-003 固有の回帰ケース
 *     - アロー関数版・void 無しの正答例が合格
 *     - async function 版も合格
 *     - buggyCode（useEffect(async）が不合格
 */

import { describe, it, expect } from 'vitest'
import { CODE_DOCTOR_PROBLEMS } from '../code-doctor/problems'
import { judgeCode } from '../../services/codeDoctorService'

describe('CODE_DOCTOR_PROBLEMS ガード', () => {
  it('全30問が定義されている', () => {
    expect(CODE_DOCTOR_PROBLEMS).toHaveLength(30)
  })

  it('全問題に solutionCode が空でなく定義されている', () => {
    for (const problem of CODE_DOCTOR_PROBLEMS) {
      expect(problem.solutionCode, `${problem.id}: solutionCode が空`).toBeTruthy()
    }
  })

  describe('各問題の solutionCode / buggyCode 判定整合', () => {
    for (const problem of CODE_DOCTOR_PROBLEMS) {
      it(`${problem.id}: solutionCode は判定に合格する`, () => {
        const result = judgeCode(problem.solutionCode, problem)
        expect(
          result.passed,
          `${problem.id}: solutionCode が不合格 (missing=${JSON.stringify(result.missingKeywords)}, foundNg=${JSON.stringify(result.foundNgKeywords)})`,
        ).toBe(true)
      })

      it(`${problem.id}: buggyCode は判定に不合格のままである`, () => {
        const result = judgeCode(problem.buggyCode, problem)
        expect(
          result.passed,
          `${problem.id}: buggyCode が誤って合格している（判定が緩すぎる）`,
        ).toBe(false)
      })
    }
  })

  describe('cd-intermediate-003 回帰ケース（Issue #334）', () => {
    const problem = CODE_DOCTOR_PROBLEMS.find((p) => p.id === 'cd-intermediate-003')!

    it('問題が存在する', () => {
      expect(problem).toBeDefined()
    })

    it('アロー関数版・void 無しの自然な正答が合格する', () => {
      const code = `import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch(\`/api/users/\${userId}\`)
      const data = await res.json()
      setUser(data)
    }
    load()
  }, [userId])

  return <div>{user?.name}</div>
}`
      const result = judgeCode(code, problem)
      expect(result.passed, `missing=${JSON.stringify(result.missingKeywords)}, foundNg=${JSON.stringify(result.foundNgKeywords)}`).toBe(true)
    })

    it('async function 版（内部関数宣言）も合格する', () => {
      const code = `import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const res = await fetch(\`/api/users/\${userId}\`)
      const data = await res.json()
      setUser(data)
    }
    loadUser()
  }, [userId])

  return <div>{user?.name}</div>
}`
      const result = judgeCode(code, problem)
      expect(result.passed).toBe(true)
    })

    it('buggyCode（useEffect(async）は不合格のまま', () => {
      const result = judgeCode(problem.buggyCode, problem)
      expect(result.passed).toBe(false)
      expect(result.foundNgKeywords).toContain('useEffect(async')
    })

    it('solutionCode（function 宣言版）も合格する', () => {
      const result = judgeCode(problem.solutionCode, problem)
      expect(result.passed).toBe(true)
    })
  })
})

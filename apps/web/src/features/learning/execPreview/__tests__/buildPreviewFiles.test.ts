import { describe, expect, it } from 'vitest'
import { buildPreviewFiles } from '../buildPreviewFiles'

describe('buildPreviewFiles', () => {
  it('学習者コードを /Challenge.tsx に格納する', () => {
    const files = buildPreviewFiles('export function LikeButton() { return null }')

    expect(files['/Challenge.tsx']?.code).toContain('LikeButton')
    expect(files['/App.tsx']?.hidden).toBe(true)
  })

  it('exportされた関数コンポーネントを検出して描画するエントリを生成する', () => {
    const files = buildPreviewFiles('export function TodoList() { return null }')

    expect(files['/App.tsx']?.code).toContain("import * as Mod from './Challenge'")
    expect(files['/App.tsx']?.code).toContain('typeof value === \'function\'')
    expect(files['/App.tsx']?.code).toContain('return <Comp />')
  })
})

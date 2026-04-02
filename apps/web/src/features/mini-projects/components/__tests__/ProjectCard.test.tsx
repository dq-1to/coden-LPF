import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectCard } from '../ProjectCard'

afterEach(() => {
  cleanup()
})
import type { MiniProject, MiniProjectProgress } from '../../../../content/mini-projects/types'

const project: MiniProject = {
  id: 'proj-counter',
  difficulty: 'beginner',
  title: 'カウンターアプリ',
  description: 'useState を使ったカウンターを実装する',
  keyElements: ['useState', 'イベント'],
  milestones: [
    { id: 'ms-1', title: '表示', description: 'カウント表示', requiredKeywords: ['count'] },
  ],
  initialCode: 'function Counter() {}',
}

describe('ProjectCard', () => {
  it('タイトルと説明が表示される', () => {
    render(<ProjectCard project={project} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText(project.title)).toBeTruthy()
    expect(screen.getByText(project.description)).toBeTruthy()
  })

  it('難易度ラベルが表示される', () => {
    render(<ProjectCard project={project} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('初級')).toBeTruthy()
  })

  it('キーエレメントがタグ表示される', () => {
    render(<ProjectCard project={project} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('イベント')).toBeTruthy()
  })

  it('完了済みの場合にバッジが表示される', () => {
    const progress: MiniProjectProgress = {
      projectId: 'proj-counter',
      status: 'completed',
      code: null,
      completedAt: '2026-04-01T10:00:00Z',
    }
    render(<ProjectCard project={project} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('✅ 完了')).toBeTruthy()
  })

  it('進行中の場合にバッジが表示される', () => {
    const progress: MiniProjectProgress = {
      projectId: 'proj-counter',
      status: 'in_progress',
      code: 'function Counter() { return <div>0</div> }',
      completedAt: null,
    }
    render(<ProjectCard project={project} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('🔄 進行中')).toBeTruthy()
  })

  it('クリックでコールバックが呼ばれる', () => {
    const onClick = vi.fn()
    render(<ProjectCard project={project} progress={undefined} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AccountTypeBadge } from '../AccountTypeBadge'

afterEach(cleanup)

describe('AccountTypeBadge', () => {
  it('一般ユーザー（両方 false）は何も表示しない', () => {
    const { container } = render(<AccountTypeBadge isAdmin={false} isTestUser={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('管理者は ADMIN バッジのみ表示する', () => {
    render(<AccountTypeBadge isAdmin={true} isTestUser={false} />)
    expect(screen.getByTitle('管理者').textContent).toContain('ADMIN')
    expect(screen.queryByTitle('テストアカウント（集計から除外）')).toBeNull()
  })

  it('テストユーザーは TEST バッジのみ表示する', () => {
    render(<AccountTypeBadge isAdmin={false} isTestUser={true} />)
    expect(screen.getByTitle('テストアカウント（集計から除外）').textContent).toContain('TEST')
    expect(screen.queryByTitle('管理者')).toBeNull()
  })

  it('管理者かつテストユーザーは ADMIN と TEST を複合表示する', () => {
    render(<AccountTypeBadge isAdmin={true} isTestUser={true} />)
    expect(screen.getByTitle('管理者').textContent).toContain('ADMIN')
    expect(screen.getByTitle('テストアカウント（集計から除外）').textContent).toContain('TEST')
  })
})

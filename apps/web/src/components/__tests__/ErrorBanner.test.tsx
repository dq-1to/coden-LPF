import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBanner } from '../ErrorBanner'

afterEach(() => {
  cleanup()
})

describe('ErrorBanner', () => {
  it('children をレンダリングする', () => {
    render(<ErrorBanner>エラーが発生しました</ErrorBanner>)
    expect(screen.getByText('エラーが発生しました')).toBeTruthy()
  })

  it('デフォルトで error バリアント（role="alert"）が適用される', () => {
    render(<ErrorBanner>エラー</ErrorBanner>)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByRole('alert').className).toContain('border-rose-200')
  })

  it('success バリアントが適用される（role="status"）', () => {
    render(<ErrorBanner variant="success">成功</ErrorBanner>)
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByRole('status').className).toContain('border-emerald-200')
  })

  it('warning バリアントが適用される', () => {
    render(<ErrorBanner variant="warning">警告</ErrorBanner>)
    expect(screen.getByRole('status').className).toContain('border-amber-200')
  })

  it('info バリアントが適用される', () => {
    render(<ErrorBanner variant="info">情報</ErrorBanner>)
    expect(screen.getByRole('status').className).toContain('border-indigo-200')
  })

  it('onDismiss が渡されると閉じるボタンが表示される', () => {
    const handleDismiss = vi.fn()
    render(<ErrorBanner onDismiss={handleDismiss}>エラー</ErrorBanner>)
    const closeButton = screen.getByRole('button', { name: '閉じる' })
    expect(closeButton).toBeTruthy()
    fireEvent.click(closeButton)
    expect(handleDismiss).toHaveBeenCalledOnce()
  })

  it('onDismiss がない場合は閉じるボタンが表示されない', () => {
    render(<ErrorBanner>エラー</ErrorBanner>)
    expect(screen.queryByRole('button', { name: '閉じる' })).toBeNull()
  })

  it('className を追加できる', () => {
    render(<ErrorBanner className="mb-4">エラー</ErrorBanner>)
    expect(screen.getByRole('alert').className).toContain('mb-4')
  })
})

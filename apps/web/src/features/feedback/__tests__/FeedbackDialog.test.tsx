import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FeedbackDialog } from '../FeedbackDialog'

const mockAuth = vi.hoisted(() => ({
  value: { user: { id: '11111111-1111-1111-1111-111111111111' } as { id: string } | null },
}))

const submitFeedbackMock = vi.hoisted(() => vi.fn())

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('../../../services/feedbackService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/feedbackService')>(
    '../../../services/feedbackService',
  )
  return {
    ...actual,
    submitFeedback: (...args: unknown[]) => submitFeedbackMock(...args),
  }
})

describe('FeedbackDialog', () => {
  beforeEach(() => {
    submitFeedbackMock.mockReset()
    mockAuth.value = { user: { id: '11111111-1111-1111-1111-111111111111' } }
  })

  afterEach(() => {
    cleanup()
  })

  it('open=false のとき何もレンダリングしない', () => {
    const { container } = render(<FeedbackDialog open={false} onClose={() => undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('open=true のときダイアログが表示されフォームが見える', () => {
    render(<FeedbackDialog open={true} onClose={() => undefined} />)
    expect(screen.getByRole('dialog', { name: 'フィードバックを送る' })).toBeTruthy()
    expect(screen.getByLabelText('カテゴリ')).toBeTruthy()
    expect(screen.getByLabelText('本文')).toBeTruthy()
  })

  it('本文が空のとき送信ボタンが非活性になっている', () => {
    render(<FeedbackDialog open={true} onClose={() => undefined} />)
    const submitBtn = screen.getByRole('button', { name: '送信' }) as HTMLButtonElement
    expect(submitBtn.disabled).toBe(true)
  })

  it('フォーム送信で submitFeedback を呼び出し成功メッセージを表示する', async () => {
    submitFeedbackMock.mockResolvedValue({ id: 'fid' })
    const onClose = vi.fn()
    render(<FeedbackDialog open={true} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('カテゴリ'), { target: { value: 'request' } })
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'テストメッセージ' } })
    fireEvent.submit(screen.getByLabelText('本文').closest('form')!)

    await waitFor(() => {
      expect(submitFeedbackMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '11111111-1111-1111-1111-111111111111',
          category: 'request',
          message: 'テストメッセージ',
        }),
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/送信しました/)).toBeTruthy()
    })
  })

  it('submitFeedback が失敗したらエラーを表示し onClose を呼ばない', async () => {
    submitFeedbackMock.mockRejectedValue(new Error('permission denied'))
    const onClose = vi.fn()
    render(<FeedbackDialog open={true} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'hi' } })
    fireEvent.submit(screen.getByLabelText('本文').closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('permission denied')).toBeTruthy()
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ユーザー未ログインのとき送信でエラーを表示する', async () => {
    mockAuth.value = { user: null }
    render(<FeedbackDialog open={true} onClose={() => undefined} />)

    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'hi' } })
    fireEvent.submit(screen.getByLabelText('本文').closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('送信にはログインが必要です')).toBeTruthy()
    })
    expect(submitFeedbackMock).not.toHaveBeenCalled()
  })

  it('閉じるボタンで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<FeedbackDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('画像追加ボタンが表示される', () => {
    render(<FeedbackDialog open={true} onClose={() => undefined} />)
    expect(screen.getByRole('button', { name: '画像を追加' })).toBeTruthy()
    expect(screen.getByText(/0\/3/)).toBeTruthy()
  })

  it('不正なファイルを追加するとエラーが表示される', async () => {
    render(<FeedbackDialog open={true} onClose={() => undefined} />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    const pdf = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [pdf] } })

    await waitFor(() => {
      expect(screen.getByText(/画像ファイルではありません/)).toBeTruthy()
    })
  })

  it('画像を追加するとプレビューが表示され削除ボタンで除去できる', async () => {
    render(<FeedbackDialog open={true} onClose={() => undefined} />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    const img = new File(['x'], 'shot.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [img] } })

    await waitFor(() => {
      expect(screen.getByText('shot.png')).toBeTruthy()
      expect(screen.getByText(/1\/3/)).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'shot.png を削除' }))
    await waitFor(() => {
      expect(screen.queryByText('shot.png')).toBeNull()
      expect(screen.getByText(/0\/3/)).toBeTruthy()
    })
  })
})

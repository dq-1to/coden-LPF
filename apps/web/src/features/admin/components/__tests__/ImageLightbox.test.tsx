import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageLightbox } from '../ImageLightbox'
import type { FeedbackImageUrl } from '../../../../services/feedbackService'

const images: FeedbackImageUrl[] = [
  { path: 'uid/fid/a.png', url: 'https://example.com/a.png' },
  { path: 'uid/fid/b.jpg', url: 'https://example.com/b.jpg' },
  { path: 'uid/fid/c.gif', url: 'https://example.com/c.gif' },
]

afterEach(cleanup)

describe('ImageLightbox', () => {
  it('dialog ロールで表示される', () => {
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={vi.fn()} onChangeIndex={vi.fn()} />,
    )
    expect(screen.getByRole('dialog', { name: '画像プレビュー' })).toBeTruthy()
  })

  it('現在の画像が表示される', () => {
    render(
      <ImageLightbox images={images} currentIndex={1} onClose={vi.fn()} onChangeIndex={vi.fn()} />,
    )
    const img = screen.getByAltText('添付画像 2')
    expect(img.getAttribute('src')).toBe('https://example.com/b.jpg')
  })

  it('カウンタ���が表示される', () => {
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={vi.fn()} onChangeIndex={vi.fn()} />,
    )
    expect(screen.getByText('1 / 3')).toBeTruthy()
  })

  it('ESC キーで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={onClose} onChangeIndex={vi.fn()} />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('閉じるボタンで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={onClose} onChangeIndex={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ArrowRight キーで次の画像に切り替わる', () => {
    const onChangeIndex = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={vi.fn()} onChangeIndex={onChangeIndex} />,
    )
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onChangeIndex).toHaveBeenCalledWith(1)
  })

  it('ArrowLeft キーで前の画像に切り替わる', () => {
    const onChangeIndex = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={2} onClose={vi.fn()} onChangeIndex={onChangeIndex} />,
    )
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onChangeIndex).toHaveBeenCalledWith(1)
  })

  it('最初の画像で ArrowLeft を押しても onChangeIndex は呼ばれない', () => {
    const onChangeIndex = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={0} onClose={vi.fn()} onChangeIndex={onChangeIndex} />,
    )
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onChangeIndex).not.toHaveBeenCalled()
  })

  it('最後の画像で ArrowRight を押しても onChangeIndex は呼ばれない', () => {
    const onChangeIndex = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={2} onClose={vi.fn()} onChangeIndex={onChangeIndex} />,
    )
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onChangeIndex).not.toHaveBeenCalled()
  })

  it('前へ・次へボタンのクリックで onChangeIndex が呼ばれる', () => {
    const onChangeIndex = vi.fn()
    render(
      <ImageLightbox images={images} currentIndex={1} onClose={vi.fn()} onChangeIndex={onChangeIndex} />,
    )
    fireEvent.click(screen.getByRole('button', { name: '前の画像' }))
    expect(onChangeIndex).toHaveBeenCalledWith(0)
    fireEvent.click(screen.getByRole('button', { name: '次の画像' }))
    expect(onChangeIndex).toHaveBeenCalledWith(2)
  })
})

import { useState, useEffect } from 'react'

/** モバイルキーボードが表示されているかを判定する */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return  // デスクトップブラウザではスキップ

    const THRESHOLD = 150  // キーボード高さの最小閾値（px）

    const handler = () => {
      const keyboardHeight = window.innerHeight - vv.height
      setVisible(keyboardHeight > THRESHOLD)
    }

    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    return () => {
      vv.removeEventListener('resize', handler)
      vv.removeEventListener('scroll', handler)
    }
  }, [])

  return visible
}

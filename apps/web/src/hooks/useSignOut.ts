import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * サインアウト処理を共通化するフック。
 *
 * `signOut()` 成功時は `/login` へリダイレクト。
 * エラー時は `onError` コールバックが指定されていれば呼び出す。
 *
 * @param onError サインアウト失敗時のコールバック（省略時はエラーを無視）
 * @returns `handleSignOut` — `void` を返す async 関数
 */
export function useSignOut(onError?: (message: string) => void) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = useCallback(async () => {
    const errorMessage = await signOut()

    if (errorMessage) {
      onError?.(errorMessage)
      return
    }

    navigate('/login', { replace: true })
  }, [signOut, navigate, onError])

  return handleSignOut
}

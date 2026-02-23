/**
 * API 呼び出しの状態を表す型
 *
 * 各ステップのコンポーネントでローディング・エラー・成功状態を一元管理するために使う。
 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ApiState<T = unknown> {
  status: ApiStatus
  data: T | null
  error: string | null
}

export function initialApiState<T>(): ApiState<T> {
  return { status: 'idle', data: null, error: null }
}

/** Task リソースの型 */
export interface Task {
  id: string
  title: string
  completed: boolean
}

/** Counter リソースの型 */
export interface Counter {
  value: number
}

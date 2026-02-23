/**
 * API クライアントユーティリティ
 *
 * `VITE_API_BASE_URL`（json-server）に対するリクエストをラップする。
 * コース4の各ステップでこのユーティリティを使って fetch パターンを学ぶ。
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

/**
 * json-server への fetch リクエストを実行する。
 *
 * @param path  - リソースパス（例: '/tasks', '/counter'）
 * @param init  - fetch の RequestInit オプション
 * @returns レスポンスボディを JSON パースした値
 * @throws レスポンスが ok でない場合または JSON パースに失敗した場合にエラーをスロー
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`API エラー: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

/** GET /counter */
export function fetchCounter() {
  return apiFetch<{ value: number }>('/counter')
}

/** PUT /counter — カウンター値を更新する */
export function updateCounter(value: number) {
  return apiFetch<{ value: number }>('/counter', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
}

/** GET /tasks */
export function fetchTasks() {
  return apiFetch<{ id: string; title: string; completed: boolean }[]>('/tasks')
}

/** POST /tasks — タスクを新規作成する */
export function createTask(title: string) {
  return apiFetch<{ id: string; title: string; completed: boolean }>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, completed: false }),
  })
}

/** PATCH /tasks/:id — タスクを部分更新する */
export function updateTask(id: string, patch: Partial<{ title: string; completed: boolean }>) {
  return apiFetch<{ id: string; title: string; completed: boolean }>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

/** DELETE /tasks/:id — タスクを削除する */
export function deleteTask(id: string) {
  return apiFetch<Record<string, never>>(`/tasks/${id}`, { method: 'DELETE' })
}

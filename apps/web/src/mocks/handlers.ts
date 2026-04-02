import { http, HttpResponse } from 'msw'

interface Task {
  id: string
  title: string
  completed: boolean
}

let counter = { value: 0 }

const tasks: Task[] = [
  { id: '1', title: 'React を学ぶ', completed: false },
  { id: '2', title: 'TypeScript を学ぶ', completed: true },
  { id: '3', title: 'API 連携を学ぶ', completed: false },
]

let nextId = 4

export const handlers = [
  // GET /counter
  http.get('*/counter', () => {
    return HttpResponse.json(counter)
  }),

  // PUT /counter
  http.put('*/counter', async ({ request }) => {
    const body = (await request.json()) as { value: number }
    counter = { value: body.value }
    return HttpResponse.json(counter)
  }),

  // GET /tasks
  http.get('*/tasks', () => {
    return HttpResponse.json(tasks)
  }),

  // POST /tasks
  http.post('*/tasks', async ({ request }) => {
    const body = (await request.json()) as { title: string; completed: boolean }
    const newTask: Task = {
      id: String(nextId++),
      title: body.title,
      completed: body.completed ?? false,
    }
    tasks.push(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),

  // PATCH /tasks/:id
  http.patch('*/tasks/:id', async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as Partial<Task>
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const existing = tasks[index]
    if (!existing) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    tasks[index] = { ...existing, ...body }
    return HttpResponse.json(tasks[index])
  }),

  // DELETE /tasks/:id
  http.delete('*/tasks/:id', ({ params }) => {
    const { id } = params
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    tasks.splice(index, 1)
    return HttpResponse.json({})
  }),
]

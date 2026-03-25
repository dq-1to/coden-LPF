import { useReducer } from 'react'

type State = { count: number; history: string[] }
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, history: [...state.history, '+1'] }
    case 'decrement':
      return { count: state.count - 1, history: [...state.history, '-1'] }
    case 'reset':
      return { count: 0, history: [...state.history, 'reset'] }
  }
}

export default function ReducerPreview() {
  const [state, dispatch] = useReducer(reducer, { count: 0, history: [] })

  return (
    <div className="space-y-3">
      <p className="text-2xl font-bold text-slate-800">{state.count}</p>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
          onClick={() => dispatch({ type: 'increment' })}
        >
          +1
        </button>
        <button
          className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 active:scale-95"
          onClick={() => dispatch({ type: 'decrement' })}
        >
          -1
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 active:scale-95"
          onClick={() => dispatch({ type: 'reset' })}
        >
          リセット
        </button>
      </div>
      {state.history.length > 0 && (
        <p className="text-xs text-slate-500">
          履歴: {state.history.slice(-5).join(' → ')}
        </p>
      )}
    </div>
  )
}

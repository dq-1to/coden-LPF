import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<'light' | 'dark'>('light')

function ThemedCard() {
  const theme = useContext(ThemeContext)
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
    >
      現在のテーマ: <span className="font-semibold">{theme}</span>
    </div>
  )
}

function ThemedBadge() {
  const theme = useContext(ThemeContext)
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}
    >
      Badge
    </span>
  )
}

export default function ContextPreview() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <ThemeContext.Provider value={theme}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ThemedCard />
          <ThemedBadge />
        </div>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        >
          テーマ切替
        </button>
        <p className="text-xs text-slate-500">Context で複数コンポーネントにテーマを共有</p>
      </div>
    </ThemeContext.Provider>
  )
}

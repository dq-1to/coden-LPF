import { useState } from 'react'

export default function ConditionalPreview() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
        {isLoggedIn ? (
          <p className="text-sm font-medium text-emerald-700">ようこそ、ユーザーさん！</p>
        ) : (
          <p className="text-sm text-slate-500">ログインしていません。</p>
        )}
      </div>
      <button
        className={`rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium text-white active:scale-95 ${isLoggedIn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        onClick={() => setIsLoggedIn((v) => !v)}
      >
        {isLoggedIn ? 'ログアウト' : 'ログイン'}
      </button>
    </div>
  )
}

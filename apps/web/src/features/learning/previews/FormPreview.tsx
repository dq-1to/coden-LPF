import { useState } from 'react'

export default function FormPreview() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isValid = name.trim().length > 0 && email.includes('@')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isValid) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">送信完了！</p>
        <p className="text-xs text-slate-600">名前: {name} / メール: {email}</p>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => {
            setName('')
            setEmail('')
            setSubmitted(false)
          }}
        >
          リセット
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600">
          名前
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">
          メール
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        送信
      </button>
      {!isValid && (name.length > 0 || email.length > 0) && (
        <p className="text-xs text-amber-600" role="alert">名前と有効なメールアドレスを入力してください</p>
      )}
    </form>
  )
}

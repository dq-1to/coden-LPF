import { useState } from 'react'

export default function TestingPreview() {
  const [result, setResult] = useState<'idle' | 'pass' | 'fail'>('idle')
  const [running, setRunning] = useState(false)

  function runTests() {
    setRunning(true)
    setResult('idle')
    setTimeout(() => {
      setResult('pass')
      setRunning(false)
    }, 1200)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-300">
        <p>describe(&quot;Counter&quot;, () =&gt; {'{'}</p>
        <p className="ml-4">it(&quot;increments on click&quot;, () =&gt; {'{'}</p>
        <p className="ml-8">render(&lt;Counter /&gt;);</p>
        <p className="ml-8">fireEvent.click(screen.getByText(&quot;+1&quot;));</p>
        <p className="ml-8">expect(screen.getByText(&quot;1&quot;)).toBeInTheDocument();</p>
        <p className="ml-4">{'}'});</p>
        <p>{'}'});</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          onClick={runTests}
          disabled={running}
        >
          {running ? 'テスト実行中…' : 'テストを実行'}
        </button>
        {result === 'pass' && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            PASS ✓
          </span>
        )}
        {result === 'fail' && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
            FAIL ✗
          </span>
        )}
      </div>
    </div>
  )
}

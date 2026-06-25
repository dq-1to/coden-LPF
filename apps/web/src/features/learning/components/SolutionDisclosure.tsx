import { useState } from 'react'

interface SolutionDisclosureProps {
  /** 表示する解答例コード */
  solutionCode: string
  /** 開閉ボタンのラベル（既定: 解答例） */
  label?: string
}

/**
 * 解答例を任意で開閉表示する小コンポーネント。
 * 不正解時に「解答例を見る」を提示し、ユーザーが選んだときだけ中身を表示する。
 * Challenge / Test / Practice で共通利用する。
 */
export function SolutionDisclosure({ solutionCode, label = '解答例' }: SolutionDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="text-sm font-semibold text-violet-700 underline underline-offset-2 transition-colors hover:text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
      >
        {isOpen ? `${label}を隠す` : `${label}を見る`}
      </button>

      {isOpen ? (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
          <code>{solutionCode}</code>
        </pre>
      ) : null}
    </div>
  )
}

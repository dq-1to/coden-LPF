export interface PreviewFiles {
  [path: string]: { code: string; hidden?: boolean }
}

export function buildPreviewFiles(learnerCode: string): PreviewFiles {
  const entry = [
    "import type { ComponentType } from 'react'",
    "import * as Mod from './Challenge'",
    '',
    'const Comp = Object.values(Mod).find(',
    '  (value): value is ComponentType => typeof value === \'function\',',
    ')',
    '',
    'export default function App() {',
    '  if (!Comp) return <p>表示できるコンポーネントが見つかりません。</p>',
    '  return <Comp />',
    '}',
  ].join('\n')

  return {
    '/App.tsx': { code: entry, hidden: true },
    '/Challenge.tsx': { code: learnerCode },
  }
}

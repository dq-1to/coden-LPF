import { useEffect } from 'react'

const SUFFIX = ' | Coden'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title + SUFFIX
  }, [title])
}

import { useEffect, useRef } from 'react'

const SUFFIX = ' | Coden'

export function useDocumentTitle(title: string) {
  const previousTitleRef = useRef(document.title)

  useEffect(() => {
    const titleToRestore = previousTitleRef.current
    document.title = title + SUFFIX

    return () => {
      document.title = titleToRestore
    }
  }, [title])
}

import { useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useIsMobile } from '../../hooks/useIsMobile'
import { CodeToolbar } from './CodeToolbar'

export interface CodeEditorHandle {
  /** カーソル位置にテキストを挿入する（ツールバー連携用） */
  insertAtCursor: (text: string, cursorOffset?: number) => void
}

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: 'typescript' | 'javascript'
  readOnly?: boolean
  height?: string
  className?: string
  toolbarKeywords?: string[]
}

const fontSizeTheme = EditorView.theme({
  '&': { fontSize: '14px' },
  '.cm-gutters': { fontSize: '14px' },
})

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value, onChange, language = 'typescript', readOnly = false, height = '400px', className, toolbarKeywords },
  ref,
) {
  const isMobile = useIsMobile()
  const cmRef = useRef<ReactCodeMirrorRef>(null)

  const extensions = useMemo(
    () => [javascript({ typescript: language === 'typescript', jsx: true }), fontSizeTheme],
    [language],
  )

  const insertAtCursor = useCallback((text: string, cursorOffset?: number) => {
    const view = cmRef.current?.view
    if (!view) return

    const { from, to } = view.state.selection.main
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length - (cursorOffset ?? 0) },
    })
    view.focus()
  }, [])

  useImperativeHandle(ref, () => ({ insertAtCursor }), [insertAtCursor])

  return (
    <div className="flex flex-col">
      <CodeMirror
        ref={cmRef}
        value={value}
        height={height}
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        className={className}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          autocompletion: true,
          bracketMatching: true,
          closeBrackets: true,
          indentOnInput: true,
        }}
      />
      {isMobile && toolbarKeywords && (
        <CodeToolbar keywords={toolbarKeywords} onInsert={insertAtCursor} />
      )}
    </div>
  )
})

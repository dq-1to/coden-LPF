import { EditorState, StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'

/** 編集可能行範囲（1-indexed）を更新する Effect。null で制限解除 */
export const setEditableRange = StateEffect.define<{ startLine: number; endLine: number } | null>()

const readonlyLineDeco = Decoration.line({ class: 'cm-readonly-line' })

/** 編集可能範囲外の行をグレーアウト表示する StateField */
export const editableRangeField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setEditableRange)) {
        if (!e.value) return Decoration.none
        const { startLine, endLine } = e.value
        const ranges: ReturnType<typeof readonlyLineDeco.range>[] = []
        for (let i = 1; i <= tr.state.doc.lines; i++) {
          if (i < startLine || i > endLine) {
            ranges.push(readonlyLineDeco.range(tr.state.doc.line(i).from))
          }
        }
        return Decoration.set(ranges)
      }
    }
    return decos
  },
  provide: (f) => EditorView.decorations.from(f),
})

/** 現在の編集可能範囲を保持する StateField（changeFilter 参照用） */
export const editableRangeState = StateField.define<{ startLine: number; endLine: number } | null>({
  create: () => null,
  update(current, tr) {
    for (const e of tr.effects) {
      if (e.is(setEditableRange)) return e.value
    }
    return current
  },
})

/**
 * 編集可能範囲外の変更をブロックする changeFilter。
 * changeFilter が [from, to] 配列を返すと、その範囲内の変更のみ許可される。
 */
export const editableRangeFilter = EditorState.changeFilter.of((tr) => {
  const range = tr.startState.field(editableRangeState, false)
  if (!range) return true

  const doc = tr.startState.doc
  const startLine = Math.max(1, range.startLine)
  const endLine = Math.min(doc.lines, range.endLine)

  const fromPos = doc.line(startLine).from
  const toPos = doc.line(endLine).to

  return [fromPos, toPos]
})

/** 編集不可行の視覚スタイル: グレーアウト */
export const editableRangeTheme = EditorView.baseTheme({
  '.cm-readonly-line': {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    opacity: '0.6',
  },
})

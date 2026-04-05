import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, type DecorationSet, EditorView } from '@codemirror/view'

/** ハイライト対象行番号（1-indexed）を更新する Effect */
export const setHighlightLines = StateEffect.define<number[]>()

const buggyLineDeco = Decoration.line({ class: 'cm-buggy-line' })

/** バグ行ハイライトの DecorationSet を管理する StateField */
export const highlightLinesField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decos, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlightLines)) {
        const ranges = e.value
          .filter((n) => n >= 1 && n <= tr.state.doc.lines)
          .sort((a, b) => a - b)
          .map((n) => buggyLineDeco.range(tr.state.doc.line(n).from))
        return Decoration.set(ranges)
      }
    }
    return decos
  },
  provide: (f) => EditorView.decorations.from(f),
})

/** バグ行の視覚スタイル: ローズ背景 + 左ボーダー */
export const buggyLineTheme = EditorView.baseTheme({
  '.cm-buggy-line': {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderLeft: '3px solid #f43f5e',
  },
})

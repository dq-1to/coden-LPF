const ENABLED = import.meta.env.VITE_EXEC_PREVIEW === '1'

export const EXEC_PREVIEW_STEP_IDS: ReadonlySet<string> = new Set([
  'usestate-basic',
  'conditional',
  'lists',
])

export function isExecPreviewEnabled(stepId: string): boolean {
  return ENABLED && EXEC_PREVIEW_STEP_IDS.has(stepId)
}

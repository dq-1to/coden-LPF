import { lazy } from 'react'
import type { ComponentType } from 'react'
import type { ChallengeExecutionPreviewProps } from './ChallengeExecutionPreview'

/**
 * 実行プレビューの lazy コンポーネントを新規に生成する。
 *
 * React.lazy は失敗した import Promise をキャッシュするため、chunk 読み込みに
 * 一度失敗すると同じインスタンスを再マウントしても即座に同じエラーになる。
 * chunk 読み込み失敗からの再試行では、この factory を呼び直して
 * 新しい lazy インスタンス（＝新しい import 呼び出し）を作る必要がある。
 */
export function createExecutionPreviewComponent(): ComponentType<ChallengeExecutionPreviewProps> {
  return lazy(() => import('./ChallengeExecutionPreview'))
}

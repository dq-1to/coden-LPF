import { lazy } from 'react'
import type { ComponentType } from 'react'

export const previewComponentByStepId: Record<string, React.LazyExoticComponent<ComponentType>> = {
  'usestate-basic': lazy(() => import('./CounterPreview')),
  events: lazy(() => import('./EventPreview')),
  conditional: lazy(() => import('./ConditionalPreview')),
  lists: lazy(() => import('./ListPreview')),
  useeffect: lazy(() => import('./EffectPreview')),
  forms: lazy(() => import('./FormPreview')),
  usecontext: lazy(() => import('./ContextPreview')),
  usereducer: lazy(() => import('./ReducerPreview')),
  'custom-hooks': lazy(() => import('./CustomHookPreview')),
  'api-fetch': lazy(() => import('./ApiFetchPreview')),
  performance: lazy(() => import('./PerformancePreview')),
  testing: lazy(() => import('./TestingPreview')),
  'api-counter-get': lazy(() => import('./ApiCounterGetPreview')),
  'api-counter-post': lazy(() => import('./ApiCounterPostPreview')),
  'api-tasks-list': lazy(() => import('./ApiTaskListPreview')),
  'api-tasks-create': lazy(() => import('./ApiTaskCreatePreview')),
  'api-tasks-update': lazy(() => import('./ApiTaskUpdatePreview')),
  'api-tasks-delete': lazy(() => import('./ApiTaskDeletePreview')),
  'api-custom-hook': lazy(() => import('./ApiCustomHookPreview')),
  'api-error-loading': lazy(() => import('./ApiErrorLoadingPreview')),
}

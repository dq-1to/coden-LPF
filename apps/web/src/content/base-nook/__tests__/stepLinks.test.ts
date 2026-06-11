import { describe, expect, it } from 'vitest'
import { fundamentalsSteps } from '../../fundamentals/steps'
import { getRelatedBaseNookTopics, getStepsRelatedToBaseNook } from '../stepLinks'

describe('Base Nook step links', () => {
  it('Step の relatedBaseNook から topic 情報を解決する', () => {
    const step = fundamentalsSteps.find((item) => item.id === 'events')

    expect(step).toBeDefined()
    expect(getRelatedBaseNookTopics(step!)).toEqual([
      {
        id: 'jsx',
        title: 'JSXって何？',
        summary: 'ReactでHTMLのようにUIを書く構文',
      },
      {
        id: 'dom',
        title: 'DOMって何？',
        summary: 'ブラウザがHTMLを理解する仕組み',
      },
      {
        id: 'props-vs-state',
        title: 'propsとstateの違い',
        summary: 'データの流れ、それぞれの役割',
      },
    ])
  })

  it('Base Nook topic から関連Stepを order 順に逆引きする', () => {
    const steps = getStepsRelatedToBaseNook('props-vs-state')

    expect(steps.map((step) => step.id)).toEqual(['usestate-basic', 'events'])
    expect(steps[0]).toMatchObject({
      order: 1,
      title: 'useState基礎',
      courseTitle: 'React基礎',
    })
  })
})

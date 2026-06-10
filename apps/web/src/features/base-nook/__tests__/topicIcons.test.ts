import { describe, it, expect } from 'vitest'
import { HelpCircle } from 'lucide-react'
import { BASE_NOOK_TOPICS } from '../../../content/base-nook/topics'
import { getTopicIcon, hasTopicIcon } from '../topicIcons'

describe('topicIcons', () => {
  it('全トピックの icon 名が明示マップに登録されている（漏れがあるとフォールバック表示になる）', () => {
    const missing = BASE_NOOK_TOPICS.filter((topic) => !hasTopicIcon(topic.icon)).map(
      (topic) => `${topic.id}: ${topic.icon}`,
    )

    expect(missing).toEqual([])
  })

  it('未知のアイコン名は HelpCircle にフォールバックする', () => {
    expect(getTopicIcon('NoSuchIcon')).toBe(HelpCircle)
  })

  it('登録済みアイコン名はフォールバックしない', () => {
    expect(getTopicIcon('FileCode')).not.toBe(HelpCircle)
  })
})

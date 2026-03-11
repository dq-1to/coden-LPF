import { beforeEach, describe, expect, it } from 'vitest'
import {
  addToReviewList,
  clearReviewList,
  getReviewList,
  removeFromReviewList,
} from '../reviewListService'

describe('reviewListService', () => {
  beforeEach(() => {
    clearReviewList()
  })

  it('stepId を重複なく localStorage に保存する', () => {
    addToReviewList('step-a')
    addToReviewList('step-a')
    addToReviewList('step-b')

    expect(getReviewList()).toEqual(['step-a', 'step-b'])
  })

  it('指定した stepId を復習リストから削除する', () => {
    addToReviewList('step-a')
    addToReviewList('step-b')

    removeFromReviewList('step-a')

    expect(getReviewList()).toEqual(['step-b'])
  })

  it('clearReviewList で localStorage 上の復習リストを空にする', () => {
    addToReviewList('step-a')

    clearReviewList()

    expect(getReviewList()).toEqual([])
    expect(window.localStorage.getItem('coden_review_list')).toBeNull()
  })
})

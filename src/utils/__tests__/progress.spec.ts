import { describe, expect, it } from 'vitest'
import {
  CONTINUE_LIMIT,
  inProgress,
  isWatchedFraction,
  STARTED_AFTER,
  WATCHED_FROM,
  type ProgressMap,
} from '../progress'

describe('isWatchedFraction', () => {
  it.each([
    [0, false],
    [0.5, false],
    [WATCHED_FROM - 0.001, false],
    [WATCHED_FROM, true],
    [1, true],
  ])('%s watched: %s', (fraction, expected) => {
    expect(isWatchedFraction(fraction)).toBe(expected)
  })
})

describe('inProgress', () => {
  it('lists started, unfinished episodes only', () => {
    const progress: ProgressMap = {
      opened: { fraction: STARTED_AFTER, updatedAt: 5 },
      started: { fraction: STARTED_AFTER + 0.01, updatedAt: 4 },
      halfway: { fraction: 0.5, updatedAt: 3 },
      'nearly done': { fraction: WATCHED_FROM - 0.01, updatedAt: 2 },
      watched: { fraction: WATCHED_FROM, updatedAt: 1 },
    }
    expect(inProgress(progress)).toEqual(['started', 'halfway', 'nearly done'])
  })

  it('puts the most recently watched first', () => {
    const progress: ProgressMap = {
      monday: { fraction: 0.3, updatedAt: 100 },
      wednesday: { fraction: 0.3, updatedAt: 300 },
      tuesday: { fraction: 0.3, updatedAt: 200 },
    }
    expect(inProgress(progress)).toEqual(['wednesday', 'tuesday', 'monday'])
  })

  it(`keeps at most ${CONTINUE_LIMIT}, the most recent`, () => {
    const progress: ProgressMap = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [`ep-${i}`, { fraction: 0.5, updatedAt: i }]),
    )
    const ids = inProgress(progress)
    expect(ids).toHaveLength(CONTINUE_LIMIT)
    expect(ids[0]).toBe('ep-29')
    expect(ids).not.toContain('ep-9')
  })

  it('is empty for a new visitor', () => {
    expect(inProgress({})).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import type { ShowSlot } from '@/types/content'
import { nextDailyStart, nextOccurrence, startsLabel } from '../schedule'

// Dates are local time, as the site shows them. October 2026: Friday 23rd,
// Saturday 24th, Sunday 25th (the UK clocks go back), Monday 26th.
const at = (day: number, hour: number, minute = 0, month = 9) => new Date(2026, month, day, hour, minute)

const weekdaysAt1pm: ShowSlot = { days: [1, 2, 3, 4, 5], hour: 13, minute: 0, live: true }
const sundaysAt1pm: ShowSlot = { days: [0], hour: 13, minute: 0, live: false }
const tuesdaysAndThursdaysAt0930: ShowSlot = { days: [2, 4], hour: 9, minute: 30, live: true }

describe('nextOccurrence', () => {
  it.each([
    ['later the same day', weekdaysAt1pm, at(23, 10), at(23, 13)],
    ['after the show on a Friday: the Monday', weekdaysAt1pm, at(23, 14), at(26, 13)],
    ['exactly at the start: the next one', weekdaysAt1pm, at(23, 13), at(26, 13)],
    ['a weekly show on its own day, after it aired: a week on', sundaysAt1pm, at(25, 14), at(1, 13, 0, 10)],
    ['across the month end', weekdaysAt1pm, at(30, 14), at(2, 13, 0, 10)],
    ['with minutes, on the next listed day', tuesdaysAndThursdaysAt0930, at(28, 8), at(29, 9, 30)],
  ])('%s', (_, slot, from, expected) => {
    expect(nextOccurrence(slot, from)).toEqual(expected)
  })

  it('keeps the local time across the clocks going back', () => {
    const next = nextOccurrence(sundaysAt1pm, at(24, 14))
    expect(next.getDate()).toBe(25)
    expect(next.getHours()).toBe(13)
  })
})

describe('nextDailyStart', () => {
  it.each([
    ['before the start: today', at(23, 10), at(23, 13)],
    ['exactly at the start: tomorrow', at(23, 13), at(24, 13)],
    ['after the start: tomorrow', at(23, 14), at(24, 13)],
    ['on the last day of the month: the 1st', at(31, 14), at(1, 13, 0, 10)],
  ])('%s', (_, from, expected) => {
    expect(nextDailyStart(13, from)).toEqual(expected)
  })
})

describe('startsLabel', () => {
  const today = at(23, 10)

  it.each([
    [at(23, 13), 'today at 1:00 pm'],
    [at(24, 13), 'tomorrow at 1:00 pm'],
    [at(26, 9, 30), 'Monday 26th October at 9:30 am'],
  ])('%s reads "%s"', (date, expected) => {
    expect(startsLabel(date, today)).toBe(expected)
  })
})

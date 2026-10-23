import { describe, expect, it } from 'vitest'
import { formatCountdown, formatTime } from '../format'

describe('formatCountdown', () => {
  const ms = (hours: number, minutes: number, seconds = 0) => ((hours * 60 + minutes) * 60 + seconds) * 1000

  it.each([
    [ms(2, 14), '2h 14m'],
    [ms(1, 0), '1h 0m'],
    [ms(0, 14, 5), '14m 05s'],
    [ms(0, 0, 59) + 999, '0m 59s'],
    [0, '0m 00s'],
    [-5000, '0m 00s'],
  ])('%i ms reads "%s"', (input, expected) => {
    expect(formatCountdown(input)).toBe(expected)
  })
})

describe('formatTime', () => {
  it.each([
    [new Date(2026, 9, 23, 13, 0), '1:00 pm'],
    [new Date(2026, 9, 23, 8, 5), '8:05 am'],
    [new Date(2026, 9, 23, 0, 0), '12:00 am'],
  ])('%s reads "%s"', (date, expected) => {
    expect(formatTime(date)).toBe(expected)
  })
})

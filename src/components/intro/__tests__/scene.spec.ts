import { describe, expect, it } from 'vitest'
import { columns, placement } from '../scene'

// The welcome on every shape of screen: the seal stays easy to tap and in
// the middle, and the band stays tall enough for the name.

const screens = {
  'a small phone (320 × 568)': { w: 320, h: 568 },
  'a phone (375 × 812)': { w: 375, h: 812 },
  'a phone on its side (812 × 375)': { w: 812, h: 375 },
  'a laptop (1440 × 900)': { w: 1440, h: 900 },
  'a wide monitor (3440 × 1440)': { w: 3440, h: 1440 },
}

describe('placement', () => {
  it.each(Object.entries(screens))('on %s, the seal is centred and between 56 and 150 px', (_, screen) => {
    const { x, y, size } = placement(screen)
    expect(x).toBeCloseTo(screen.w / 2)
    expect(y).toBeCloseTo(screen.h / 2)
    expect(size).toBeGreaterThanOrEqual(56)
    expect(size).toBeLessThanOrEqual(150)
  })

  it.each(Object.entries(screens))('on %s, the band is 52 to 110 px, with the buttons below it', (_, screen) => {
    const { band, belowLintel } = placement(screen)
    expect(band).toBeGreaterThanOrEqual(52)
    expect(band).toBeLessThanOrEqual(110)
    expect(belowLintel).toBeGreaterThan(band)
  })
})

describe('the colonnade', () => {
  it('has the same columns on both sides, drawn far to near', () => {
    const left = columns.filter((c) => c.key.startsWith('-1'))
    const right = columns.filter((c) => !c.key.startsWith('-1'))
    expect(left.length).toBe(right.length)
    const depths = columns.map((c) => c.d)
    expect(depths).toEqual([...depths].sort((a, b) => a - b))
  })
})

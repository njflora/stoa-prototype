import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { UP_NEXT_SECONDS, useUpNext } from '../useUpNext'

// The end of an episode, with a fake clock: the countdown, "Play now",
// "Cancel", and leaving the page.

function setUp() {
  const playNext = vi.fn()
  const scope = effectScope()
  const upNext = scope.run(() => useUpNext(playNext))!
  return { playNext, scope, upNext }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useUpNext', () => {
  it('counts down and then plays the next part, once', () => {
    const { playNext, upNext } = setUp()
    upNext.end(true)
    expect(upNext.ended.value).toBe(true)
    expect(upNext.counting.value).toBe(true)

    vi.advanceTimersByTime(3000)
    expect(upNext.secondsLeft.value).toBe(UP_NEXT_SECONDS - 3)
    expect(playNext).not.toHaveBeenCalled()

    vi.advanceTimersByTime((UP_NEXT_SECONDS - 3) * 1000)
    expect(playNext).toHaveBeenCalledTimes(1)
    expect(upNext.counting.value).toBe(false)

    vi.advanceTimersByTime(10_000)
    expect(playNext).toHaveBeenCalledTimes(1)
  })

  it('shows the card without a countdown when autoplay is off or the next part is locked', () => {
    const { playNext, upNext } = setUp()
    upNext.end(false)
    vi.advanceTimersByTime(20_000)
    expect(upNext.ended.value).toBe(true)
    expect(upNext.counting.value).toBe(false)
    expect(playNext).not.toHaveBeenCalled()
  })

  it('plays at once with "Play now"', () => {
    const { playNext, upNext } = setUp()
    upNext.end(true)
    upNext.next()
    expect(playNext).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(20_000)
    expect(playNext).toHaveBeenCalledTimes(1)
  })

  it('stops for good with "Cancel"', () => {
    const { playNext, upNext } = setUp()
    upNext.end(true)
    vi.advanceTimersByTime(2000)
    upNext.dismiss()
    vi.advanceTimersByTime(20_000)
    expect(upNext.ended.value).toBe(false)
    expect(playNext).not.toHaveBeenCalled()
  })

  it('starts again from the full count when another episode ends', () => {
    const { upNext } = setUp()
    upNext.end(true)
    vi.advanceTimersByTime(5000)
    upNext.end(true)
    expect(upNext.secondsLeft.value).toBe(UP_NEXT_SECONDS)
  })

  it('stops counting when the page goes away', () => {
    const { playNext, scope, upNext } = setUp()
    upNext.end(true)
    scope.stop()
    vi.advanceTimersByTime(20_000)
    expect(playNext).not.toHaveBeenCalled()
  })
})

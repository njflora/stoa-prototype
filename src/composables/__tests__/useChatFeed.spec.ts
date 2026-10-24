import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { showLengthSeconds, type ChatMessage } from '@/data/chat'
import { releaseClock, reportClock } from '../usePlayerClock'
import { LIVE_INTERVAL_MS, LIVE_START_SECONDS, MAX_LIVE_MESSAGES, useChatReplay, useLiveFeed } from '../useChatFeed'

// The chat's live feed and replay, on a fake clock.

/** A tiny mock show: a welcome, three messages in the middle, a sign-off. */
const message = (id: string, at: number): ChatMessage => ({
  id,
  at,
  user: 'someone',
  tier: 'free',
  text: id,
  likes: 3,
  dislikes: 1,
})
const show = [
  message('welcome', 0),
  message('early', 600),
  message('half-hour', LIVE_START_SECONDS),
  message('later', 2400),
  message('sign-off', showLengthSeconds),
]

function inScope<T>(make: () => T) {
  const scope = effectScope()
  return { scope, value: scope.run(make)! }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  releaseClock()
})

describe('useLiveFeed', () => {
  it('starts with the messages up to half an hour in', () => {
    const { value } = inScope(() => useLiveFeed(() => true, show))
    expect(value.messages.value.map((m) => m.id)).toEqual(['welcome', 'early', 'half-hour'])
  })

  it('adds one new message, with no votes, every few seconds while live', () => {
    const { value } = inScope(() => useLiveFeed(() => true, show))
    vi.advanceTimersByTime(LIVE_INTERVAL_MS)
    const newest = value.messages.value.at(-1)!
    expect(newest).toMatchObject({ text: 'later', likes: 0, dislikes: 0 })
    expect(newest.id).not.toBe('later')
  })

  it('then loops without the welcome or the sign-off', () => {
    const { value } = inScope(() => useLiveFeed(() => true, show))
    vi.advanceTimersByTime(LIVE_INTERVAL_MS * 4)
    expect(value.messages.value.slice(3).map((m) => m.text)).toEqual(['later', 'early', 'half-hour', 'later'])
  })

  it('adds nothing while not live', () => {
    const { value } = inScope(() => useLiveFeed(() => false, show))
    vi.advanceTimersByTime(LIVE_INTERVAL_MS * 10)
    expect(value.messages.value).toHaveLength(3)
  })

  it(`keeps only the newest ${MAX_LIVE_MESSAGES}`, () => {
    const { value } = inScope(() => useLiveFeed(() => true, show))
    vi.advanceTimersByTime(LIVE_INTERVAL_MS * 200)
    expect(value.messages.value).toHaveLength(MAX_LIVE_MESSAGES)
  })

  it('stops when the chat goes', () => {
    const { scope, value } = inScope(() => useLiveFeed(() => true, show))
    scope.stop()
    vi.advanceTimersByTime(LIVE_INTERVAL_MS * 10)
    expect(value.messages.value).toHaveLength(3)
  })
})

describe('useChatReplay', () => {
  const replay = (overrides: { startAt?: number; autoplay?: boolean; length?: number } = {}) =>
    inScope(() =>
      useChatReplay(
        {
          active: () => true,
          length: () => overrides.length ?? showLengthSeconds,
          startAt: overrides.startAt ?? 0,
          autoplay: overrides.autoplay ?? true,
        },
        show,
      ),
    ).value

  it('shows the messages sent up to its position', () => {
    const r = replay({ startAt: 700, autoplay: false })
    expect(r.messages.value.map((m) => m.id)).toEqual(['welcome', 'early'])
  })

  it('moves one second a second, or ten when scanning', () => {
    const r = replay()
    vi.advanceTimersByTime(5000)
    expect(r.position.value).toBe(5)
    r.fast.value = true
    vi.advanceTimersByTime(2000)
    expect(r.position.value).toBe(25)
  })

  it('stops at the end of the recording', () => {
    const r = replay({ startAt: showLengthSeconds - 2 })
    vi.advanceTimersByTime(10_000)
    expect(r.position.value).toBe(showLengthSeconds)
    expect(r.playing.value).toBe(false)
  })

  it('stretches the mock chat to fit a shorter recording', () => {
    const r = replay({ length: showLengthSeconds / 2, startAt: 700, autoplay: false })
    // Half as long, so "half-hour" (30 min) lands at 15 min, and "later" (40 min) at 20 min.
    expect(r.messages.value.map((m) => m.id)).toEqual(['welcome', 'early'])
    r.position.value = 1000
    expect(r.messages.value.map((m) => m.id)).toEqual(['welcome', 'early', 'half-hour'])
  })

  it('follows the site player while synced, and its own clock when not', async () => {
    const r = replay({ autoplay: false })
    reportClock({ currentTime: 2500, paused: false, playbackRate: 1, duration: showLengthSeconds } as HTMLVideoElement)
    await nextTick()
    expect(r.following.value).toBe(true)
    expect(r.position.value).toBe(2500)
    expect(r.isPlaying.value).toBe(true)

    r.synced.value = false
    await nextTick()
    expect(r.following.value).toBe(false)
    expect(r.isPlaying.value).toBe(false)
  })

  it('plays and pauses on its own clock when no site player is showing', () => {
    const r = replay({ autoplay: false })
    r.togglePlay()
    vi.advanceTimersByTime(3000)
    expect(r.position.value).toBe(3)
    r.togglePlay()
    vi.advanceTimersByTime(3000)
    expect(r.position.value).toBe(3)
  })
})

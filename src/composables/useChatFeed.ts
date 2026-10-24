import { computed, onScopeDispose, ref, watch } from 'vue'
import { requestPlay, requestSeek, usePlayerClock } from './usePlayerClock'
import { chatMessages, showLengthSeconds, type ChatMessage } from '@/data/chat'

// The messages LiveChat shows: a live feed (mocked) or a replay beside a
// recording. Each runs on a timer that stops when its component goes.

/** Where live chat starts, and where a replay starts by default: half an hour in. */
export const LIVE_START_SECONDS = 1800
export const LIVE_INTERVAL_MS = 2800
export const MAX_LIVE_MESSAGES = 150

/**
 * Live: start part-way into the show, then add one message at a time while
 * `isLive()`. The first pass stops before the closing sign-off. After that
 * the mock feed loops, skipping the opening welcome and the sign-off so it
 * still reads like the middle of a show. The newest 150 are kept.
 */
export function useLiveFeed(isLive: () => boolean, source: ChatMessage[] = chatMessages) {
  const firstPass = source.slice(0, -1)
  const loop = source.slice(1, -1)
  const messages = ref<ChatMessage[]>(source.filter((m) => m.at <= LIVE_START_SECONDS))
  let nextIndex = messages.value.length
  let sent = 0

  function add() {
    const next =
      nextIndex < firstPass.length ? firstPass[nextIndex]! : loop[(nextIndex - firstPass.length) % loop.length]!
    nextIndex++
    sent++
    messages.value = [
      ...messages.value.slice(-MAX_LIVE_MESSAGES + 1),
      // A brand new message has no votes yet.
      { ...next, id: `${next.id}-${sent}`, likes: 0, dislikes: 0 },
    ]
  }

  const timer = setInterval(() => {
    if (isLive()) add()
  }, LIVE_INTERVAL_MS)
  onScopeDispose(() => clearInterval(timer))

  return { messages }
}

export interface ReplayOptions {
  /** True while the chat is showing the replay. */
  active: () => boolean
  /** The recording's length, in seconds. */
  length: () => number
  startAt?: number
  autoplay?: boolean
}

/**
 * Replay: the messages sent up to a position in the recording. While the
 * site's own player shows the recording, the two are synced both ways: the
 * player's time, pause and speed move the replay, and the replay's play
 * button and timeline move the player. Turning sync off leaves the replay on
 * its own clock, which can scan at 10×. With a platform's player (an iframe,
 * which cannot share its time), the replay always keeps its own clock.
 */
export function useChatReplay(options: ReplayOptions, source: ChatMessage[] = chatMessages) {
  const length = computed(options.length)
  const position = ref(options.startAt ?? LIVE_START_SECONDS)
  const playing = ref(options.autoplay ?? false)
  const fast = ref(false)

  // The mock chat was written for a 90 minute show. Stretch or squeeze its
  // timings to fit the recording being replayed.
  const scaled = computed(() => {
    const scale = length.value / showLengthSeconds
    return source.map((m) => ({ ...m, at: Math.round(m.at * scale) }))
  })
  const messages = computed(() => scaled.value.filter((m) => m.at <= position.value))

  const clock = usePlayerClock()
  const synced = ref(true)
  const following = computed(() => options.active() && clock.active && synced.value)
  /** Play state shown on the button: the player's while synced. */
  const isPlaying = computed(() => (following.value ? clock.playing : playing.value))

  watch(
    () => [following.value, clock.time] as const,
    ([on, time]) => {
      if (!on) return
      // Dragged past the end of a short recording: the player waits at its
      // end, and the replay stays where it was dragged.
      if (clock.duration && position.value > clock.duration + 0.5 && time >= clock.duration - 0.25) return
      position.value = time
    },
  )
  // Turning sync off leaves the replay paused where it is, on its own clock.
  watch(synced, (on) => {
    if (!on) playing.value = false
  })

  /** The replay's timeline: while synced, moving it moves the player too. */
  function onScrub() {
    if (following.value) requestSeek(position.value)
  }
  function togglePlay() {
    if (following.value) requestPlay(!clock.playing)
    else playing.value = !playing.value
  }

  const timer = setInterval(() => {
    if (!options.active() || !playing.value || following.value) return
    position.value = Math.min(length.value, position.value + (fast.value ? 10 : 1))
    if (position.value >= length.value) playing.value = false
  }, 1000)
  onScopeDispose(() => clearInterval(timer))

  return { length, position, playing, fast, synced, following, isPlaying, clock, messages, onScrub, togglePlay }
}

import { onMounted, onUnmounted, reactive, readonly, watch, type Ref } from 'vue'

// The site's own player shares where it is, so other parts of the page can
// follow it: the chat replay beside a recording shows the messages sent up
// to that moment, and runs at the player's speed. It works both ways: the
// chat replay can ask the player to seek, play or pause. Platform players
// (Rumble, Odysee, BitChute) are iframes and cannot share their time, so
// while one of those is showing, `active` is false and the chat keeps its
// own clock.

const clock = reactive({
  /** True while the site's own player is showing a recording. */
  active: false,
  /** Seconds into the recording. */
  time: 0,
  playing: false,
  /** Playback speed: 1 is normal. */
  rate: 1,
  /** The recording's length in seconds, once known. */
  duration: 0,
})

// Requests to the player. Each carries a counter, so asking twice for the
// same thing still counts as two requests.
const requests = reactive({
  seek: { to: 0, n: 0 },
  play: { on: false, n: 0 },
})

/** For the site's own player: report its video element's state. */
export function reportClock(video: HTMLVideoElement) {
  clock.active = true
  clock.time = video.currentTime
  clock.playing = !video.paused
  clock.rate = video.playbackRate
  clock.duration = Number.isFinite(video.duration) ? video.duration : 0
}

/** Ask the player to go to a moment (it stops at its own end). */
export function requestSeek(to: number) {
  requests.seek = { to, n: requests.seek.n + 1 }
}

/** Ask the player to play or pause. */
export function requestPlay(on: boolean) {
  requests.play = { on, n: requests.play.n + 1 }
}

/** For the site's own player: it has gone (another platform, or another page). */
export function releaseClock() {
  clock.active = false
  clock.playing = false
}

/** For anything that follows the player. */
export function usePlayerClock() {
  return readonly(clock)
}

/**
 * For the site's own player, while it is on screen: share a recording's
 * clock, follow the requests (seek, stopping at the end, and play or pause),
 * and release the clock when it goes. A live stream shares nothing. Returns
 * report(), to call when the video plays, pauses, moves or changes speed.
 */
export function useSharedClock(video: Ref<HTMLVideoElement | undefined>, live: () => boolean | undefined) {
  const report = () => {
    if (!live() && video.value) reportClock(video.value)
  }
  onMounted(report)
  watch(
    () => requests.seek.n,
    () => {
      const v = video.value
      if (!v || live()) return
      v.currentTime = Math.min(requests.seek.to, v.duration || 0)
    },
  )
  watch(
    () => requests.play.n,
    () => {
      const v = video.value
      if (!v || live()) return
      if (requests.play.on) v.play().catch(() => {})
      else v.pause()
    },
  )
  onUnmounted(() => {
    if (!live()) releaseClock()
  })
  return report
}

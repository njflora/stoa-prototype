import { reactive, readonly } from 'vue'

// The site's own player shares where it is, so other parts of the page can
// follow it: the chat replay beside a recording shows the messages sent up
// to that moment, and runs at the player's speed. Platform players
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
})

/** For the site's own player: report its video element's state. */
export function reportClock(video: HTMLVideoElement) {
  clock.active = true
  clock.time = video.currentTime
  clock.playing = !video.paused
  clock.rate = video.playbackRate
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

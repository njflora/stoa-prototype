import { onScopeDispose, ref } from 'vue'

/** How long "Up next" counts down before the next part plays. */
export const UP_NEXT_SECONDS = 8

/**
 * The end of an episode: the "Up next" card and its countdown. `end()` shows
 * the card, and when the next part may play it counts down and then calls
 * `playNext`. Leaving the page stops the countdown.
 */
export function useUpNext(playNext: () => void, seconds = UP_NEXT_SECONDS) {
  const ended = ref(false)
  const secondsLeft = ref(seconds)
  const counting = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
    counting.value = false
  }

  /** The episode has ended. With `autoplayNext`, the next part plays after the countdown. */
  function end(autoplayNext: boolean) {
    stop()
    ended.value = true
    secondsLeft.value = seconds
    if (!autoplayNext) return
    counting.value = true
    timer = setInterval(() => {
      secondsLeft.value--
      if (secondsLeft.value <= 0) next()
    }, 1000)
  }

  /** "Play now", or the countdown reaching zero. */
  function next() {
    stop()
    playNext()
  }

  /** "Cancel", "Close", or a different episode: the card goes. */
  function dismiss() {
    stop()
    ended.value = false
  }

  onScopeDispose(stop)

  return { ended, secondsLeft, counting, end, next, dismiss }
}

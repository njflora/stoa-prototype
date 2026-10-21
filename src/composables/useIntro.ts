import { ref } from 'vue'
import { readJson, writeJson } from './storage'

// The stoa intro: plays once per device, on whichever page a visitor
// arrives first. ?intro=1 in any link plays it again, and so does
// "Replay intro" in the demo panel, so it can be shown in a pitch.

const SEEN_KEY = 'stoa-intro-seen'
const forced = new URLSearchParams(window.location.search).get('intro') === '1'

const open = ref<boolean>(forced || !readJson(SEEN_KEY, false))

export function useIntro() {
  function finish() {
    open.value = false
    writeJson(SEEN_KEY, true)
  }
  function replay() {
    open.value = true
  }
  /** Forget the visit, so the next page load is a first visit again. */
  function forget() {
    writeJson(SEEN_KEY, false)
  }
  return { open, finish, replay, forget }
}

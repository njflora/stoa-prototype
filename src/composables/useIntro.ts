import { ref } from 'vue'
import { readJson, writeJson } from './storage'

// The stoa intro: plays once per device, then not again. ?intro=1 in any
// link plays it again, and so does "Replay intro" in the demo panel, so it
// can be shown in a pitch.

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
  return { open, finish, replay }
}

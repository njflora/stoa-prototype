import { ref, watch } from 'vue'
import { readJson, writeJson } from './storage'

// Playback settings shared across episode pages.
//
// The prototype has no real video, so an episode never ends by itself.
// The demo panel's "Finish episode" button raises finishSignal, and the
// episode page reacts as if the video had reached its end.

const AUTOPLAY_KEY = 'stoa-autoplay'

const autoplay = ref<boolean>(readJson(AUTOPLAY_KEY, true))
watch(autoplay, (value) => writeJson(AUTOPLAY_KEY, value))

const finishSignal = ref(0)

export function usePlayback() {
  function requestFinish() {
    finishSignal.value++
  }

  return { autoplay, finishSignal, requestFinish }
}

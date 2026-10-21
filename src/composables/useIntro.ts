import { ref } from 'vue'
import { readJson, writeJson } from './storage'

// The stoa intro: plays once per device, and only when a visitor lands on
// the homepage. A direct link to any other page goes straight there.
// ?intro=1 in any link plays it again, and so does "Replay intro" in the
// demo panel, so it can be shown in a pitch.

const SEEN_KEY = 'stoa-intro-seen'
const forced = new URLSearchParams(window.location.search).get('intro') === '1'

/** Landed on the homepage: the site's base address, with or without its trailing slash. */
const base = import.meta.env.BASE_URL
const onHomepage = window.location.pathname === base || window.location.pathname === base.replace(/\/$/, '')

const open = ref<boolean>(forced || (onHomepage && !readJson(SEEN_KEY, false)))

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

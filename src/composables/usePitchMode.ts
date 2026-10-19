import { ref, watch } from 'vue'
import { readJson, writeJson } from './storage'

// Pitch mode: small labels on each improvement, naming the finding it
// answers. Off by default. A reader can switch it on from the demo panel,
// or open any link with ?pitch=1 (and ?pitch=0 to switch it off).

const STORAGE_KEY = 'stoa-pitch'

const enabled = ref<boolean>(readJson(STORAGE_KEY, false))

watch(enabled, (value) => {
  writeJson(STORAGE_KEY, value)
  if (!value) close()
})

// Set from the address after the watch above, so the choice is saved too.
const fromAddress = new URLSearchParams(window.location.search).get('pitch')
if (fromAddress === '1') enabled.value = true
if (fromAddress === '0') enabled.value = false

/** The note open in the detail panel, and the pill to return focus to. */
const openId = ref<string | null>(null)
let returnFocusTo: HTMLElement | null = null

function open(id: string, from: HTMLElement | null) {
  openId.value = id
  returnFocusTo = from
}

function close() {
  if (openId.value === null) return
  openId.value = null
  returnFocusTo?.focus()
  returnFocusTo = null
}

export function usePitchMode() {
  return { enabled, openId, open, close }
}

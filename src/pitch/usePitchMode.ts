import { computed, shallowRef, ref, watch } from 'vue'
import { readJson, writeJson } from '@/composables/storage'
import type { PitchNote } from './types'

// Pitch mode: small labels on each improvement, naming the finding it
// answers. Off by default. A reader can switch it on from the demo panel,
// or open any link with ?pitch=1 (and ?pitch=0 to switch it off).
//
// The notes themselves (./notes) are loaded only once pitch mode is on, so
// visitors who never use it never download them.

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

/** Every note, in /pitch order, once loaded. */
const notes = shallowRef<readonly PitchNote[] | null>(null)
const byId = computed(() => new Map((notes.value ?? []).map((note) => [note.id, note])))
let loading: Promise<void> | null = null

function loadNotes(): Promise<void> {
  loading ??= import('./notes')
    .then((module) => {
      notes.value = module.pitchNotes
    })
    .catch(() => {
      // Offline, for example: the next attempt tries again.
      loading = null
    })
  return loading
}

watch(enabled, (on) => (on ? loadNotes() : undefined), { immediate: true })

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

/** A note by id, or undefined until the notes have loaded. */
const noteFor = (id: string): PitchNote | undefined => byId.value.get(id)

export function usePitchMode() {
  return { enabled, notes, noteFor, loadNotes, openId, open, close }
}

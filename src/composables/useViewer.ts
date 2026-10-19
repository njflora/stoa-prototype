import { computed, ref, watch } from 'vue'
import type { Episode } from '@/types/content'
import { readJson, writeJson } from './storage'

// Stands in for a signed-in account. There is no real login: the demo
// panel switches between a free viewer and a member, and turns the live
// show on or off, so both states can be shown in a pitch.

export type Membership = 'free' | 'member'

interface DemoState {
  membership: Membership
  live: boolean
}

const STORAGE_KEY = 'stoa-demo'
const defaults: DemoState = { membership: 'free', live: true }

// Declared outside the function, so every component shares one state.
const state = ref<DemoState>({ ...defaults, ...readJson<Partial<DemoState>>(STORAGE_KEY, {}) })

watch(state, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useViewer() {
  const isMember = computed(() => state.value.membership === 'member')
  const isLive = computed(() => state.value.live)

  /** Free viewers can watch free episodes and free previews. Members watch everything. */
  function canWatch(episode: Episode): boolean {
    return isMember.value || episode.access !== 'premium'
  }

  function setMembership(membership: Membership) {
    state.value.membership = membership
  }

  function setLive(live: boolean) {
    state.value.live = live
  }

  return { isMember, isLive, canWatch, setMembership, setLive }
}

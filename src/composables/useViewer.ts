import { computed, ref, watch } from 'vue'
import type { Episode } from '@/types/content'
import { readJson, writeJson } from './storage'

// Stands in for a signed-in account and the show's schedule. There is no
// real login: the demo panel switches between a free viewer and a member,
// and moves the live show through its phases, so every state can be shown
// in a pitch.

export type Membership = 'free' | 'member'

/**
 * The live show's phases, in order:
 * upcoming → live (free stream) → break → members (after-show) → ended.
 */
export type LivePhase = 'upcoming' | 'live' | 'break' | 'members' | 'ended'

export const livePhases: { id: LivePhase; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'break', label: 'Break' },
  { id: 'members', label: "Members'" },
  { id: 'ended', label: 'Ended' },
]

interface DemoState {
  membership: Membership
  phase: LivePhase
}

const STORAGE_KEY = 'stoa-demo'

function load(): DemoState {
  const saved = readJson<Partial<DemoState>>(STORAGE_KEY, {})
  return {
    membership: saved.membership === 'member' ? 'member' : 'free',
    phase: livePhases.some((p) => p.id === saved.phase) ? saved.phase! : 'live',
  }
}

// Declared outside the function, so every component shares one state.
const state = ref<DemoState>(load())

watch(state, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useViewer() {
  const isMember = computed(() => state.value.membership === 'member')
  const phase = computed(() => state.value.phase)
  /** On air: the free stream or the members' after-show. */
  const isLive = computed(() => phase.value === 'live' || phase.value === 'members')

  /** Free viewers can watch free episodes and free previews. Members watch everything. */
  function canWatch(episode: Episode): boolean {
    return isMember.value || episode.access !== 'premium'
  }

  function setMembership(membership: Membership) {
    state.value.membership = membership
  }

  function setPhase(next: LivePhase) {
    state.value.phase = next
  }

  return { isMember, isLive, phase, canWatch, setMembership, setPhase }
}

import { computed, ref, watch } from 'vue'
import type { ChatTier } from '@/data/chat'
import type { Episode } from '@/types/content'
import { readJson, writeJson } from './storage'
import { usePurchases } from './usePurchases'

// Stands in for a signed-in account and the show's schedule. There is no
// real login: the demo panel switches between a signed-out visitor, a free
// account and a member, and moves the live show through its phases, so
// every state can be shown in a pitch.

export type ViewerType = 'signed-out' | 'free' | 'member'

export const viewerTypes: { id: ViewerType; label: string }[] = [
  { id: 'signed-out', label: 'Signed out' },
  { id: 'free', label: 'Free account' },
  { id: 'member', label: 'Member' },
]

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

export interface DemoUser {
  name: string
  initials: string
  /** The member's tier, or null for a free account. */
  tier: Extract<ChatTier, 'bronze' | 'silver' | 'gold'> | null
}

interface DemoState {
  viewer: ViewerType
  phase: LivePhase
}

const STORAGE_KEY = 'stoa-demo'

function load(): DemoState {
  const saved = readJson<Partial<DemoState>>(STORAGE_KEY, {})
  return {
    viewer: viewerTypes.some((v) => v.id === saved.viewer) ? saved.viewer! : 'signed-out',
    phase: livePhases.some((p) => p.id === saved.phase) ? saved.phase! : 'live',
  }
}

// Declared outside the function, so every component shares one state.
const state = ref<DemoState>(load())

watch(state, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useViewer() {
  const viewer = computed(() => state.value.viewer)
  const isSignedIn = computed(() => state.value.viewer !== 'signed-out')
  const isMember = computed(() => state.value.viewer === 'member')
  const phase = computed(() => state.value.phase)
  /** On air: the free stream or the members' after-show. */
  const isLive = computed(() => phase.value === 'live' || phase.value === 'members')

  const user = computed<DemoUser | null>(() =>
    isSignedIn.value
      ? { name: 'chris_m', initials: 'CM', tier: isMember.value ? 'gold' : null }
      : null,
  )

  /**
   * Free viewers can watch free episodes, free previews and members'
   * episodes they have bought. Members watch everything.
   */
  const { isOwned } = usePurchases()
  function canWatch(episode: Episode): boolean {
    return isMember.value || episode.access !== 'premium' || (state.value.viewer !== 'signed-out' && isOwned(episode.id))
  }

  function setViewer(next: ViewerType) {
    state.value.viewer = next
  }

  function setPhase(next: LivePhase) {
    state.value.phase = next
  }

  return { viewer, isSignedIn, isMember, isLive, phase, user, canWatch, setViewer, setPhase }
}

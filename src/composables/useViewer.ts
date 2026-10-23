import { computed, ref, watch } from 'vue'
import { canWatch as canWatchRule, type AccessViewer } from '@/access/rules'
import { account, signInAs } from '@/api/account'
import { API_MODE } from '@/api/client'
import type { ChatTier } from '@/data/chat'
import type { Episode } from '@/types/content'
import { livePhases, type LivePhase } from '@/utils/live'
import { readJson, writeJson } from './storage'
import { usePurchases } from './usePurchases'

// Who is viewing, and the live show's schedule. There is no real login: the
// demo panel switches between a signed-out visitor, a free account and a
// member, and moves the live show through its phases, so every state can be
// shown in a pitch. In Laravel mode, switching signs in to a seeded demo
// account on the server, so the server's access rules apply for real. In
// the static preview it is kept on this device.

export type ViewerType = 'signed-out' | 'free' | 'member' | 'staff'

export const viewerTypes: { id: ViewerType; label: string }[] = [
  { id: 'signed-out', label: 'Signed out' },
  { id: 'free', label: 'Free account' },
  { id: 'member', label: 'Member' },
  { id: 'staff', label: 'Staff' },
]

export { livePhases, type LivePhase }

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

/** In Laravel mode: the signed-in account's viewer type. */
function accountViewer(): ViewerType {
  const user = account.value.user
  if (!user) return 'signed-out'
  if (user.staff) return 'staff'
  return user.tier ? 'member' : 'free'
}

/** True while the demo panel is signing in to a different account. */
const switching = ref(false)

export function useViewer() {
  const viewer = computed(() => (API_MODE === 'laravel' ? accountViewer() : state.value.viewer))
  const isSignedIn = computed(() => viewer.value !== 'signed-out')
  /** Staff see everything members see, and the content desk too. */
  const isMember = computed(() => viewer.value === 'member' || viewer.value === 'staff')
  const isStaff = computed(() => viewer.value === 'staff')
  const phase = computed(() => state.value.phase)
  /** On air: the free stream or the members' after-show. */
  const isLive = computed(() => phase.value === 'live' || phase.value === 'members')

  const user = computed<DemoUser | null>(() => {
    if (API_MODE === 'laravel') {
      const signedIn = account.value.user
      return signedIn && { name: signedIn.name, initials: signedIn.initials, tier: signedIn.tier }
    }
    if (isStaff.value) return { name: 'stoa_desk', initials: 'SD', tier: null }
    return isSignedIn.value ? { name: 'chris_m', initials: 'CM', tier: isMember.value ? 'gold' : null } : null
  })

  /** This viewer, as the access rules (src/access/rules.ts) see them. */
  const { isOwned } = usePurchases()
  const access = computed<AccessViewer>(() => ({
    signedIn: isSignedIn.value,
    member: isMember.value,
    owns: isOwned,
  }))
  const canWatch = (episode: Episode): boolean => canWatchRule(access.value, episode)

  async function setViewer(next: ViewerType) {
    if (API_MODE !== 'laravel') {
      state.value.viewer = next
      return
    }
    switching.value = true
    try {
      await signInAs(next === 'signed-out' ? null : next)
    } finally {
      switching.value = false
    }
  }

  function setPhase(next: LivePhase) {
    state.value.phase = next
  }

  return {
    viewer,
    isSignedIn,
    isMember,
    isStaff,
    isLive,
    phase,
    user,
    access,
    canWatch,
    setViewer,
    switching,
    setPhase,
  }
}

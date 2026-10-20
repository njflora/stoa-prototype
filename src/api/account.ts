// The signed-in account, in Laravel mode. The demo panel's "Viewing as"
// signs in as one of three seeded accounts (free, member, staff), with no
// password: the route only exists in development. Purchases and community
// memberships are saved on the account, on the server.

import { ref } from 'vue'
import { getFresh, send } from './client'

export interface Account {
  user: { name: string; initials: string; tier: 'bronze' | 'silver' | 'gold' | null; staff: boolean } | null
  /** Members' episodes bought to keep, newest first. */
  purchases: string[]
  communities: string[]
}

/** Shared by every component: who is signed in, as the server last said. */
export const account = ref<Account>({ user: null, purchases: [], communities: [] })

const keep = async (request: Promise<Account>) => (account.value = await request)

/** GET /api/me. Called once before the site opens (main.ts). */
export const loadAccount = () => keep(getFresh<Account>('me'))

/** POST /api/demo/login, or /api/logout for "Signed out". */
export const signInAs = (as: 'free' | 'member' | 'staff' | null) =>
  keep(as ? send<Account>('POST', 'demo/login', { as }) : send<Account>('POST', 'logout'))

/** POST /api/purchases. No payment is taken in the demo. */
export const buyEpisode = (episodeId: string) => keep(send<Account>('POST', 'purchases', { episodeId }))

export const joinCommunity = (id: string) => keep(send<Account>('POST', `communities/${id}`))
export const leaveCommunity = (id: string) => keep(send<Account>('DELETE', `communities/${id}`))

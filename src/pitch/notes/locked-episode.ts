// Pitch notes on a locked members' episode (/watch/chronos-116?series=roman-resurgence).

import type { PitchNote } from '../types'

const page = { name: 'A locked episode', to: '/watch/chronos-116?series=roman-resurgence' }

export const notes: PitchNote[] = [
  {
    id: 'buy-episode',
    kind: 'kept',
    source: 'Their site',
    title: 'Buy a single episode',
    today: "A members' episode can be bought on its own for £1.89.",
    here: 'The same, from the locked episode page: bought to keep, unlocked at once, and marked "Owned" on its cards. In the Laravel version the server unlocks that one episode and no other.',
    page,
    hint: 'Viewing as "Free account".',
  },
  {
    id: 'members-gate',
    kind: 'proposal',
    source: 'New idea',
    title: "The members' gate",
    today: 'Discussion and reading lists are open to everyone; nothing is gated.',
    here: "On members' shows, the discussion and the reading list are part of membership. Non-members see a blurred gate with an invitation. In the Laravel version the server sends them only a count, so nothing real sits behind the blur.",
    page,
    hint: 'Viewing as "Signed out" or "Free account".',
  },
]

// Pitch notes on the Shows page (/shows).

import type { PitchNote } from '../types'

const page = { name: 'Shows', to: '/shows' }

export const notes: PitchNote[] = [
  {
    id: 'members-shows',
    kind: 'proposal',
    source: 'New idea',
    title: 'The Shows page, for members',
    today: 'Everyone sees the same Shows page.',
    here: 'Members get Continue watching, Trending this week and Latest first, and the shows they have unlocked. Free viewers see the shows to try, each with a free preview.',
    page,
    hint: 'Viewing as "Member".',
  },
]

// Pitch notes on the account page (/account).

import type { PitchNote } from '../types'

const page = { name: 'Account', to: '/account' }

export const notes: PitchNote[] = [
  {
    id: 'account-page',
    kind: 'proposal',
    source: 'New idea',
    title: 'One account for everything',
    today:
      'The content site, the courses site and the merch store appear to be separate sites. A site login does not work in the store, so they seem to need separate accounts.',
    here: 'One account, one site and one source of truth: membership, communities joined, episodes bought, watch history, reminders and the newsletter in one place.',
    page,
    hint: 'Viewing as "Member" or "Free account".',
  },
]

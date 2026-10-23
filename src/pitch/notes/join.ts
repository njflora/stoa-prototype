// Pitch notes on the members' preview (/join).

import type { PitchNote } from '../types'

const page = { name: "Members' preview", to: '/join' }

export const notes: PitchNote[] = [
  {
    id: 'join-previews',
    kind: 'fix',
    source: 'Site history',
    title: 'Premium Preview, revived',
    today: 'A free "Premium Preview" section existed in 2022 and was removed in 2023.',
    here: "A free preview from every members' show.",
    page,
  },
  {
    id: 'join-compare',
    kind: 'fix',
    source: 'Topic 3',
    title: 'What free gets',
    today: 'No clear comparison of what free gets and what each tier adds.',
    here: 'One table across Free, Bronze, Silver and Gold.',
    page,
  },
  {
    id: 'join-trial',
    kind: 'proposal',
    source: 'Benchmark',
    title: 'A 7-day free trial',
    today: 'Not offered today. Most comparable outlets offer one.',
    here: 'Bronze and Silver start with a 7-day free trial. Gold, with its extras, does not.',
    page,
    hint: 'Viewing as "Free account" or "Signed out".',
  },
  {
    id: 'join-tiers',
    kind: 'kept',
    source: 'Premium page',
    title: 'Their real tiers',
    today: 'Bronze £5, Silver £10 and Gold £30 a month, with these perks.',
    here: 'Kept as they are. Yearly prices are still to collect.',
    page,
  },
]

// Pitch notes on the content desk, for staff (/desk).

import type { PitchNote } from '../types'

const page = { name: 'Content desk', to: '/desk' }

export const notes: PitchNote[] = [
  {
    id: 'one-source',
    kind: 'proposal',
    source: 'Consolidation',
    title: 'One source of truth',
    today: 'Each platform holds its own copy of the catalogue, kept in step by hand.',
    here: "One record per episode, in Laravel, lists every platform it is on. A sync reads each platform's feed every hour, matches each upload to its episode by show, time and title, and links it. The desk shows what is missing, still processing or failed, and can re-sync on demand.",
    page,
    hint: 'Demo panel: switch to "Staff", then open the content desk.',
  },
]

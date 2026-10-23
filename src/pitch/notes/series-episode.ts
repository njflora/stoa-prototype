// Pitch notes on an episode in a series (/watch/chronos-111?series=the-fall-of-the-republic).

import type { PitchNote } from '../types'

const page = { name: 'Episode in a series', to: '/watch/chronos-111?series=the-fall-of-the-republic' }

export const notes: PitchNote[] = [
  {
    id: 'series-autoplay',
    kind: 'fix',
    source: 'Finding 10',
    title: 'Play this series in order',
    today: 'No series view, and nothing plays the next part.',
    here: 'The series queue sits beside the player, and the next part plays after a short countdown.',
    page,
    hint: 'Demo panel: Viewing as "Member".',
  },
]

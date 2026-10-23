// Pitch notes on a contributor's profile (/contributors/helen).

import type { PitchNote } from '../types'

const page = { name: 'A contributor', to: '/contributors/helen' }

export const notes: PitchNote[] = [
  {
    id: 'contributor-profiles',
    kind: 'kept',
    source: 'Their site',
    title: 'Contributor profiles, upgraded',
    today: 'Contributors have profile pages.',
    here: 'Each profile adds the shows they appear on, their series, their articles and every episode they are in, newest first. Their names link here from across the site.',
    page,
  },
]

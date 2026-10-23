// Pitch notes on the search panel (/?search=rome).

import type { PitchNote } from '../types'

const page = { name: 'Search, over any page', to: '/?search=rome' }

export const notes: PitchNote[] = [
  {
    id: 'search',
    kind: 'fix',
    source: 'Finding 9',
    title: 'Search as you type',
    today:
      'Site-wide search exists, but results appear only after pressing enter or the search button, not as you type.',
    here: 'Results appear as you type, grouped by kind, across about 5,500 episodes, over whatever page you are on. Small typos are forgiven. Press "/" anywhere to search. In the Laravel version it runs on the server, with Laravel Scout and Meilisearch.',
    page,
  },
]

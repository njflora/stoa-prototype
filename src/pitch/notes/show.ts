// Pitch notes on a show page (/shows/chronos).

import type { PitchNote } from '../types'

const page = { name: 'A show page', to: '/shows/chronos' }

export const notes: PitchNote[] = [
  {
    id: 'show-archive',
    kind: 'fix',
    source: 'Finding 3',
    title: 'Every episode, sorted and filtered',
    today:
      'Content listing pages offer only a From/To date range filter. There is no way to filter by show, host, or topic, despite the site already maintaining that taxonomy as nav categories and tagging each piece of content with a category badge and named contributors.',
    here: 'Each show lists every episode it has made, 50 to a page: newest, oldest, or most watched this week, month, year or all time. Filter by free or members-only, and by contributor. The view is kept in the address, so it can be shared.',
    page,
  },
]

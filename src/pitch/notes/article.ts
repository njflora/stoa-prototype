// Pitch notes on an article (/articles/centre-ground).

import type { PitchNote } from '../types'

const page = { name: 'An article', to: '/articles/centre-ground' }

export const notes: PitchNote[] = [
  {
    id: 'open-spaces',
    kind: 'proposal',
    source: 'New idea',
    title: "Open spaces and members' spaces",
    today: "Commenting is a members' perk everywhere.",
    here: "Free accounts can post where discussion is casual: the free daily shows, articles and the Circle's general forum. Members' shows and topic forums stay members-only, which keeps them civil.",
    page,
    hint: 'Viewing as "Free account".',
  },
  {
    id: 'article-comments',
    kind: 'kept',
    source: 'Their site',
    title: 'Comments under articles',
    today: 'Articles have comments, open to everyone.',
    here: 'The same comments, with the votes and sorting (Newest, Top, Controversial) that episodes have. Any account can post.',
    page,
  },
  {
    id: 'article-reading-lists',
    kind: 'proposal',
    source: 'New idea',
    title: 'Reading lists on articles',
    today: 'Articles have no reading list.',
    here: "Every article ends with its sources, in the same shape as an episode's reading list.",
    page,
  },
]

// Pitch notes on the articles index (/articles).

import type { PitchNote } from '../types'

const page = { name: 'Articles', to: '/articles' }

export const notes: PitchNote[] = [
  {
    id: 'articles-index',
    kind: 'proposal',
    source: 'New idea',
    title: 'Articles: newest, popular and controversial',
    today: 'Articles are listed newest first.',
    here: 'Newest, popular (this week, this month or all time) and controversial (many votes, split close to evenly), by category, with a lead piece. Choose Popular to pick the period.',
    page,
  },
]

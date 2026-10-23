// Pitch notes on the courses pages (/courses).

import { brand } from '@/config/brand'
import type { PitchNote } from '../types'

const page = { name: 'Courses', to: '/courses' }

export const notes: PitchNote[] = [
  {
    id: 'courses-inside',
    kind: 'proposal',
    source: 'Courses site',
    title: 'Courses inside the site',
    today: 'Courses sit on a separate site, with its own design and checkout.',
    here: 'Courses live in the main site, with the same look, navigation and account, and link to related series. Same product types and price points as today.',
    page,
  },
  {
    id: 'community-forums',
    kind: 'proposal',
    source: 'Courses site',
    title: 'Forums for each community',
    today: 'A single philosophy community on the separate courses site, joined by email.',
    here: `Join with one click on your ${brand.name} account. One forum is open; more are planned, and the same model could give every show or series its own forum.`,
    page,
  },
]

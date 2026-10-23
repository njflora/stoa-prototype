// Every pitch note, one file per section of the /pitch page. The order
// here is the order of those sections: the running order for a walkthrough.

import type { PitchNote } from '../types'
import { notes as home } from './home'
import { notes as live } from './live'
import { notes as episode } from './episode'
import { notes as desk } from './desk'
import { notes as seriesEpisode } from './series-episode'
import { notes as join } from './join'
import { notes as show } from './show'
import { notes as courses } from './courses'
import { notes as shop } from './shop'
import { notes as lockedEpisode } from './locked-episode'
import { notes as article } from './article'
import { notes as contributor } from './contributor'
import { notes as shows } from './shows'
import { notes as articles } from './articles'
import { notes as account } from './account'
import { notes as search } from './search'

export const pitchNotes: PitchNote[] = [
  ...home,
  ...live,
  ...episode,
  ...desk,
  ...seriesEpisode,
  ...join,
  ...show,
  ...courses,
  ...shop,
  ...lockedEpisode,
  ...article,
  ...contributor,
  ...shows,
  ...articles,
  ...account,
  ...search,
]

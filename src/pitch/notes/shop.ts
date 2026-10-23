// Pitch notes on the shop (/shop).

import type { PitchNote } from '../types'

const page = { name: 'Shop', to: '/shop' }

export const notes: PitchNote[] = [
  {
    id: 'shop-inside',
    kind: 'proposal',
    source: 'Merch store',
    title: 'One shop inside the site',
    today: 'Merch is sold in a separate store, styled on its own and run apart from the main content site.',
    here: "The shop inside the main site, in the same design and with the same account, as part of bringing everything into one site. A region switch changes prices and currency in place, using the store's current prices.",
    page,
  },
]

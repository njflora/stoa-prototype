// Reading lists, keyed by episode, so every content type can carry the
// same structured block. Placeholder sources are invented and have no
// links; only items on Stoa itself link anywhere.

export type SourceType = 'Book' | 'Article' | 'Report' | 'Data'

export interface ReadingItem {
  id: string
  type: SourceType
  title: string
  /** Author, publisher or organisation. */
  source: string
  year: number
  /** When it came up, in seconds from the start of the show. */
  at?: number
  /** A route on this site, for sources Stoa published itself. */
  to?: string
}

export const readingLists: Record<string, ReadingItem[]> = {
  'stoa-podcast-1432': [
    {
      id: 'r1',
      type: 'Data',
      title: 'Council Spending Power, 2026 to 2027',
      source: 'Local Finance Monitor',
      year: 2026,
      at: 840,
    },
    {
      id: 'r2',
      type: 'Book',
      title: 'Britain in the 1970s: A Decade of Crisis',
      source: 'J. R. Halloran',
      year: 2018,
      at: 1120,
    },
    {
      id: 'r3',
      type: 'Report',
      title: 'Who Pays for Local Services?',
      source: 'Civic Budget Institute',
      year: 2025,
      at: 1210,
    },
    {
      id: 'r4',
      type: 'Article',
      title: 'What the Energy Crunch Means for Winter Bills',
      source: 'Rachel Ashworth, Stoa',
      year: 2026,
      at: 1810,
      to: '/articles/winter-bills',
    },
    {
      id: 'r5',
      type: 'Report',
      title: 'How the Energy Price Cap Is Set',
      source: 'Household Energy Review',
      year: 2026,
      at: 2150,
    },
    {
      id: 'r6',
      type: 'Book',
      title: 'The Housing Trap',
      source: 'M. A. Pembroke',
      year: 2021,
      at: 2600,
    },
  ],
}

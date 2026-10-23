import { describe, expect, it } from 'vitest'
import { oneOf, pageField, readView, writeQuery, type AddressFields } from '../address'

// The articles page's view, as an example: a category, a sort order, a
// period that only matters when sorting by popular, and a page.
type Sort = 'newest' | 'popular' | 'controversial'
type View = { category: string; sort: Sort; period: 'week' | 'month' | 'all'; page: number }
const fields: AddressFields<View> = {
  category: { read: (raw) => (typeof raw === 'string' ? raw : 'all'), write: (v) => (v === 'all' ? undefined : v) },
  sort: oneOf<Sort, View>(['newest', 'popular', 'controversial'], 'newest'),
  period: oneOf<View['period'], View>(['week', 'month', 'all'], 'month', (v) => v.sort === 'popular'),
  page: pageField(),
}
const defaults: View = { category: 'all', sort: 'newest', period: 'month', page: 0 }

describe('readView', () => {
  it('gives the defaults for an empty address', () => {
    expect(readView(fields, {})).toEqual(defaults)
  })

  it('reads each field, with pages counted from 1 in the address', () => {
    expect(readView(fields, { category: 'history', sort: 'popular', period: 'week', page: '3' })).toEqual({
      category: 'history',
      sort: 'popular',
      period: 'week',
      page: 2,
    })
  })

  it.each([
    ['an unknown sort', { sort: 'banana' }],
    ['a page that is not a number', { page: 'two' }],
    ['a page below 1', { page: '-4' }],
    ['a repeated parameter', { sort: ['popular', 'newest'] }],
  ])('falls back to the default for %s', (_, query) => {
    expect(readView(fields, query)).toEqual(defaults)
  })
})

describe('writeQuery', () => {
  it('leaves out every default, so the plain page has a plain address', () => {
    expect(writeQuery(fields, defaults)).toEqual({})
  })

  it('writes pages from 1, and fields in the order they are listed', () => {
    const query = writeQuery<View>(fields, { category: 'history', sort: 'popular', period: 'week', page: 1 })
    expect(Object.entries(query)).toEqual([
      ['category', 'history'],
      ['sort', 'popular'],
      ['period', 'week'],
      ['page', '2'],
    ])
  })

  it('leaves out the period unless sorting by popular', () => {
    expect(writeQuery<View>(fields, { ...defaults, sort: 'controversial', period: 'week' })).toEqual({
      sort: 'controversial',
    })
  })

  it('reads back what it wrote', () => {
    const view: View = { category: 'culture', sort: 'popular', period: 'all', page: 4 }
    expect(readView(fields, writeQuery(fields, view))).toEqual(view)
  })
})

import { describe, expect, it } from 'vitest'
import { highlight } from '../highlight'
import { normaliseTerm } from '../text'

describe('normaliseTerm', () => {
  it.each([
    ['Crécy', 'crecy'],
    ['ÉMIGRÉ', 'emigre'],
    ['Rome', 'rome'],
  ])('%s becomes %s', (term, expected) => {
    expect(normaliseTerm(term)).toBe(expected)
  })
})

describe('highlight', () => {
  const marked = (text: string, terms: string[]) =>
    highlight(text, terms)
      .filter((part) => part.match)
      .map((part) => part.text)

  it('marks words that start with a matched term', () => {
    expect(marked('Chronos #280 | Agincourt | Part 3', ['agin'])).toEqual(['Agincourt'])
  })

  it('matches across accents and case', () => {
    expect(marked('Crécy and Poitiers', ['crecy'])).toEqual(['Crécy'])
  })

  it('never marks punctuation or spaces', () => {
    expect(marked('Rome | Rome, Rome.', ['rome'])).toEqual(['Rome', 'Rome', 'Rome'])
  })

  it('keeps the text exactly as it was, part by part', () => {
    const text = "The Hundred Years' War, Part 3 (Agincourt)"
    expect(
      highlight(text, ['war'])
        .map((part) => part.text)
        .join(''),
    ).toBe(text)
  })

  it('returns the whole text unmarked with no terms', () => {
    expect(highlight('Agincourt', [])).toEqual([{ text: 'Agincourt', match: false }])
  })

  it('treats markup in a title as plain text', () => {
    expect(highlight('<b>Rome</b>', ['b']).map((part) => part.text)).toEqual(['<b>Rome</b>'])
  })
})

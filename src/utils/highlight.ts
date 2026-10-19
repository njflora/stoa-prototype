import { normalise } from '@/api/search'

export interface TextPart {
  text: string
  match: boolean
}

/**
 * Splits text into matched and unmatched parts, so a template can wrap the
 * matches in <mark>. Plain text only (no HTML), so it is safe with any title.
 * A word matches if it starts with one of the matched terms.
 */
export function highlight(text: string, terms: string[]): TextPart[] {
  if (!terms.length) return [{ text, match: false }]
  return text
    .split(/(\s+|[|,.:;!?()]+)/)
    .filter((part) => part !== '')
    .map((part) => {
      const word = normalise(part)
      const match = /\w/.test(part) && terms.some((term) => word.startsWith(term))
      return { text: part, match }
    })
}

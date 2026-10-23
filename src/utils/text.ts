/** A search term as the index stores it: lower case, accents removed, so "Crécy" and "crecy" match. */
export function normaliseTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

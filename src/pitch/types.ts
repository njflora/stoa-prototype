// Pitch mode labels. Each note names the finding it answers (from the
// planning doc) and says what is different from the real site today.
// Three kinds, so nothing is overclaimed:
//   fix:      answers a documented gap
//   proposal: not offered today (from the benchmark or our own ideas)
//   kept:     already on the real site, credited rather than claimed

export type PitchKind = 'fix' | 'proposal' | 'kept'

export interface PitchNote {
  id: string
  kind: PitchKind
  /** Where it comes from in the planning doc, such as "Finding 11". */
  source: string
  title: string
  /** The real site today. */
  today: string
  /** What this prototype does instead. */
  here: string
  /** Where the note appears, for the index page. */
  page: { name: string; to: string }
  /** How to reach it in the demo, if it needs a particular state. */
  hint?: string
}

/** The short text on the pill. */
export function pillLabel(note: PitchNote): string {
  if (note.kind === 'proposal') return 'Proposal'
  if (note.kind === 'kept') return 'Kept'
  return note.source
}

export const kindNames: Record<PitchKind, string> = {
  fix: 'Answers a finding',
  proposal: 'Proposal: not offered today',
  kept: 'Kept from the real site',
}

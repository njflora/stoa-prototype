// The live show's phases, and what each means for the viewer. The demo
// panel moves the show through them (useViewer keeps the current one).

/** In order: upcoming → live (free stream) → break → members (after-show) → ended. */
export type LivePhase = 'upcoming' | 'live' | 'break' | 'members' | 'ended'

export const livePhases: { id: LivePhase; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'break', label: 'Break' },
  { id: 'members', label: "Members'" },
  { id: 'ended', label: 'Ended' },
]

/** What the chat shows: closed before the show, the replay after it, and locked for non-members during the after-show. */
export type LiveChatMode = 'closed' | 'live' | 'locked' | 'replay'

export function liveChatMode(phase: LivePhase, member: boolean): LiveChatMode {
  if (phase === 'upcoming') return 'closed'
  if (phase === 'ended') return 'replay'
  if (phase === 'members' && !member) return 'locked'
  return 'live'
}

/** The line under the title. `startsAt` is a label such as "today at 1:00 pm". */
export function liveStatusText(phase: LivePhase, startsAt: string): string {
  switch (phase) {
    case 'upcoming':
      return `Starts ${startsAt}`
    case 'live':
      return 'Live now. Free for everyone.'
    case 'break':
      return "The free stream has ended. The members' after-show is next."
    case 'members':
      return "Members' after-show, live now"
    case 'ended':
      return 'Recorded earlier today. Chat replay alongside.'
  }
}

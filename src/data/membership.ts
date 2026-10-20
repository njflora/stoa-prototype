// Membership tiers and what each one includes. Tier names, monthly prices
// and perks follow the reference site's Premium page (checked 18 October
// 2026). Yearly prices are not collected yet, so none are shown.

export type TierId = 'bronze' | 'silver' | 'gold'
export type PlanId = 'free' | TierId

export interface Tier {
  id: TierId
  name: string
  /** Pounds per month. */
  monthly: number
  summary: string
  /** What this tier adds on top of the one below. */
  adds: string[]
}

export const tiers: Tier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    monthly: 5,
    summary: 'Every show, every series, the whole archive.',
    adds: [
      "All members' shows and the full back catalogue",
      "The members' after-show, live",
      'Comment and vote on episodes and articles',
      'Live reminders',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    monthly: 10,
    summary: 'Take it with you.',
    adds: ['Everything in Bronze', 'Monthly downloads to watch offline', 'Audio versions of articles'],
  },
  {
    id: 'gold',
    name: 'Gold',
    monthly: 30,
    summary: 'Be part of the show.',
    adds: [
      'Everything in Silver',
      'Send video questions to the hosts, live',
      'A monthly video call with the team',
    ],
  },
]

/** One row of the comparison table: which plans include it. */
export interface Feature {
  label: string
  includedIn: PlanId[]
}

const everyone: PlanId[] = ['free', 'bronze', 'silver', 'gold']
const members: PlanId[] = ['bronze', 'silver', 'gold']

export const features: Feature[] = [
  { label: 'Daily free shows and the live stream', includedIn: everyone },
  { label: 'Live chat (with a free account)', includedIn: everyone },
  { label: "Free previews of members' shows", includedIn: everyone },
  { label: 'Articles and reading lists', includedIn: everyone },
  { label: "All members' shows and series", includedIn: members },
  { label: 'The full back catalogue', includedIn: members },
  { label: "The members' after-show, live", includedIn: members },
  { label: 'Comment and vote', includedIn: members },
  { label: 'Live reminders', includedIn: members },
  { label: 'Monthly downloads', includedIn: ['silver', 'gold'] },
  { label: 'Audio articles', includedIn: ['silver', 'gold'] },
  { label: 'Video questions to the hosts', includedIn: ['gold'] },
  { label: 'Monthly video call with the team', includedIn: ['gold'] },
]

/**
 * A proposal from the benchmark: most comparable outlets offer a trial.
 * Bronze and Silver only (Nick's call): Gold's extras, such as video
 * questions and the monthly call, are not something to give away free.
 */
export const TRIAL_DAYS = 7
export const TRIAL_TIERS: TierId[] = ['bronze', 'silver']

export function hasTrial(tier: TierId): boolean {
  return TRIAL_TIERS.includes(tier)
}

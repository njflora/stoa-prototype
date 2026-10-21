// Mock live chat for the prototype. Every username is invented. Each
// message records when it was sent, in seconds from the start of the show,
// so the same list drives the live feed and the replay of the recording.

export type ChatTier = 'free' | 'bronze' | 'silver' | 'gold' | 'staff'

export interface ChatMessage {
  id: string
  /** Seconds from the start of the show. */
  at: number
  user: string
  tier: ChatTier
  text: string
  /** A Gold member's question for the hosts, highlighted in chat. */
  question?: boolean
  likes: number
  dislikes: number
}

export const tierStyles: Record<ChatTier, { label: string; class: string }> = {
  free: { label: '', class: '' },
  bronze: { label: 'Bronze', class: 'bg-[#a8703a] text-white' },
  silver: { label: 'Silver', class: 'bg-[#b9c0c4] text-ink' },
  gold: { label: 'Gold', class: 'bg-gold text-ink' },
  staff: { label: 'Staff', class: 'bg-accent text-white' },
}

const raw: [number, string, ChatTier, string, boolean?][] = [
  // The rush as the stream opens. (Also why the demo clip, a few seconds
  // long, has messages to show when the replay follows the player.)
  [1, 'Wessex_Walker', 'gold', 'Here we go!'],
  [2, 'HollyFromHull', 'bronze', 'First!'],
  [3, 'pete_from_leeds', 'free', 'Hello from Leeds'],
  [4, 'GrumpyHistorian', 'silver', 'Evening all. Or afternoon, whatever it is'],
  [5, 'Stoa_Producer', 'staff', 'Welcome in, everyone. The show starts in a moment.'],
  [6, 'CanalBoatKev', 'free', 'Picture is a bit wavy on my end'],
  [40, 'pete_from_leeds', 'free', 'Afternoon all'],
  [62, 'MargaretH', 'silver', 'Good afternoon from Shropshire'],
  [95, 'teabreak_tim', 'bronze', 'Made it just in time, kettle on'],
  [140, 'NorthernLass', 'free', 'Sound is great today'],
  [210, 'bookish_bill', 'gold', 'Looking forward to the budget segment'],
  [300, 'CanalBoatKev', 'free', 'Watching from the boat, signal holding up'],
  [380, 'quietreader', 'bronze', 'Andrew is on form already'],
  [455, 'Brummie_Rob', 'free', 'Is this the one with the energy prices chat?'],
  [520, 'MargaretH', 'silver', 'Yes, after the news round I think'],
  [640, 'the_real_dave', 'free', 'Good point about council tax there'],
  [760, 'HollyFromHull', 'bronze', 'First time catching it live, this is fun'],
  [830, 'Stoa_Producer', 'staff', 'Gold members: send your questions now for the end of the show.'],
  [905, 'bookish_bill', 'gold', 'How much of the energy rise is the wholesale price and how much is the network charges?', true],
  [1010, 'pete_from_leeds', 'free', 'Tom with the stats again'],
  [1120, 'GrumpyHistorian', 'silver', 'That happened in 1976 as well, worth looking up'],
  [1240, 'NorthernLass', 'free', 'Ha, the producer laughing in the background'],
  [1380, 'teabreak_tim', 'bronze', 'Second cup. This segment is a good one'],
  [1500, 'Wessex_Walker', 'gold', 'Would love a longer piece on housing'],
  [1620, 'CanalBoatKev', 'free', 'Lost signal for a minute, what did I miss?'],
  [1680, 'quietreader', 'bronze', 'Just the rent figures, nothing major'],
  [1810, 'the_real_dave', 'free', 'Can someone link the article Richard mentioned?'],
  [1840, 'Stoa_Producer', 'staff', 'It is on the homepage under Latest articles.'],
  [1990, 'Brummie_Rob', 'free', 'Cheers'],
  [2150, 'Wessex_Walker', 'gold', 'Could the hosts explain how the price cap is actually set each quarter?', true],
  [2290, 'MargaretH', 'silver', 'Good question that'],
  [2440, 'HollyFromHull', 'bronze', 'The chat is so friendly today'],
  [2600, 'GrumpyHistorian', 'silver', 'They always say that before a budget'],
  [2780, 'pete_from_leeds', 'free', 'Who else is staying for the after-show?'],
  [2860, 'teabreak_tim', 'bronze', 'Always'],
  [3020, 'NorthernLass', 'free', 'Not a member yet, might join for this one'],
  [3200, 'bookish_bill', 'gold', 'The after-show is where the best bits happen'],
  [3380, 'CanalBoatKev', 'free', 'Great show today lads'],
  [3550, 'Wessex_Walker', 'gold', "How does this year's council tax rise compare with the last five years?", true],
  [3700, 'Stoa_Producer', 'staff', 'Good one. Passing that to the hosts now.'],
  [3880, 'quietreader', 'bronze', 'Thanks all, see you tomorrow'],
  [4050, 'the_real_dave', 'free', 'Good one today'],
  [4300, 'HollyFromHull', 'bronze', 'Bye everyone'],
  [4600, 'MargaretH', 'silver', 'See you in the after-show'],
  [5100, 'Stoa_Producer', 'staff', 'That is the free stream done. Members, see you in about 30 minutes.'],
]

export const chatMessages: ChatMessage[] = raw.map(([at, user, tier, text, question], i) => ({
  id: `m${i}`,
  at,
  user,
  tier,
  text,
  question,
  // A fixed spread of votes, so the replay looks the same every time.
  likes: question ? 12 + (i % 5) : (i * 37) % 11,
  dislikes: i % 4 === 0 ? (i * 13) % 6 : 0,
}))

/** Length of the free stream in seconds, used by the replay timeline. */
export const showLengthSeconds = 5400

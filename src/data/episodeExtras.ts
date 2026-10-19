// Comments and reading lists for every episode.
//
// Hand-written threads (such as the live show's) are used where they
// exist. Every other episode draws a stable mix from its show's pool of
// placeholder comments and sources, seeded by the episode id, so each
// episode looks different but the same on every visit. Real data can
// replace this file without touching the pages.

import type { ChatTier } from './chat'
import { commentThreads, type Comment } from './comments'
import { readingLists, type ReadingItem, type SourceType } from './readingLists'
import type { Episode } from '@/types/content'
import { pickSome, randomInt, seededRandom } from '@/utils/random'

type Commenter = [user: string, tier: ChatTier]

/** Members who comment. Commenting is a members' perk, so no free tier. */
const commenters: Commenter[] = [
  ['MargaretH', 'silver'],
  ['bookish_bill', 'gold'],
  ['teabreak_tim', 'bronze'],
  ['HollyFromHull', 'bronze'],
  ['quietreader', 'bronze'],
  ['Wessex_Walker', 'gold'],
  ['GrumpyHistorian', 'silver'],
  ['Brummie_Rob', 'bronze'],
  ['NorthernLass', 'bronze'],
  ['NorthernLad', 'bronze'],
  ['CanalBoatKev', 'silver'],
  ['the_real_dave', 'bronze'],
]

const commentPools: Record<string, string[]> = {
  'stoa-podcast': [
    'Best episode in weeks. The opening segment set it up perfectly.',
    'Tom had the numbers ready again. That makes such a difference.',
    "I'd like a follow-up on this once the figures are confirmed.",
    'Respectfully disagree with Andrew on this one, but he argued it well.',
    'Good to hear all three of them pushing back on each other today.',
    'The chat was on fire for this one. Glad I caught it live.',
    "Could we get a guest on who disagrees? I'd like to hear the other side.",
    'Richard summed up the whole argument in two sentences at the end.',
    'Shared this with my dad and he has now watched three more episodes.',
  ],
  'morning-brief': [
    'Perfect length for the commute.',
    'Danny packs more into twenty minutes than most do into an hour.',
    'Would love a weekend edition.',
    'The markets bit at the end is always useful.',
    'Listened twice to catch the figures. Clear as ever.',
    'Kettle on, Morning Brief on. Daily routine sorted.',
    'The reading list makes it easy to follow up on the stories.',
  ],
  conversations: [
    'What a guest. I could have listened for another hour.',
    'Richard lets guests finish their thoughts, which is rarer than it should be.',
    "Ordered the guest's book halfway through.",
    'The bit about the early years was the highlight for me.',
    'Please get them back on for a part two.',
    'A calm, thoughtful conversation. Exactly what I come here for.',
    'Not sure I agreed with all of it, but it made me think.',
  ],
  chronos: [
    'Helen brings these people to life. Fantastic storytelling.',
    'I studied this period and still learnt something new.',
    'The maps in the reading list really helped me follow along.',
    'Small quibble on the dates, but it does not change the story.',
    'Saving this to watch again with my son, who is studying it at school.',
    'The best history series on any platform, and I have tried a few.',
    'Can we get a series on the Normans next?',
    'That ending gave me chills.',
  ],
  statecraft: [
    'Rachel explains these things more clearly than any broadcaster.',
    'The map of the shipping routes was eye-opening.',
    "I'd push back on the conclusion, but the evidence was well laid out.",
    'This should be required viewing before every election.',
    'Would like a follow-up in six months to see how it played out.',
    'Rare to hear the regional detail. Thank you for doing the homework.',
    'Strong episode, though I think the risks were overstated.',
  ],
  ledger: [
    'Finally someone explains this without the jargon.',
    'Neil makes economics feel like common sense.',
    'Sent this to my brother, who has argued the opposite for years.',
    'The worked example made it click for me.',
    'I think the conclusion is too optimistic, but a fair hearing.',
    'Could you do one on pensions for people in their thirties?',
    'The charts in the reading list are worth a look.',
  ],
  'the-forum': [
    'Laughed out loud three times. Best Forum yet.',
    'Danny was robbed in the final vote.',
    "Andrew's answer was the correct one and I will not be taking questions.",
    'The live chat during this was chaos, in the best way.',
    'Please make this a regular format.',
    'Neil defending that pick was the highlight of my week.',
    'Strongly disagree with the winner, but what a debate.',
  ],
}

const replyPool: string[] = [
  'Agreed, well put.',
  'Not sure about that, but fair point.',
  'Same here.',
  'This is exactly what I was thinking.',
  'Have to disagree, though I see where you are coming from.',
  'Ha, spot on.',
  'Good shout. Seconded.',
]

type Source = Omit<ReadingItem, 'id' | 'at'>

const source = (type: SourceType, title: string, by: string, year: number, to?: string): Source => ({
  type,
  title,
  source: by,
  year,
  to,
})

const sourcePools: Record<string, Source[]> = {
  'stoa-podcast': [
    source('Article', 'Local Elections Are Telling Us Something', 'Gary Lowther, Stoa', 2026, '/articles/local-elections'),
    source('Article', 'The Quiet Collapse of the Centre Ground', 'Andrew Pickering, Stoa', 2026, '/articles/centre-ground'),
    source('Data', 'Public Attitudes Tracker, Autumn 2026', 'Civic Opinion Unit', 2026),
    source('Report', 'How Westminster Spends Its Week', 'Parliamentary Practice Review', 2025),
    source('Book', 'The Long Campaign', 'E. M. Talbot', 2022),
    source('Report', 'Councils Under Strain', 'Civic Budget Institute', 2026),
  ],
  'morning-brief': [
    source('Data', 'Overnight Markets Summary', 'Daily Markets Digest', 2026),
    source('Report', 'Weekly Economic Calendar', 'Household Finance Monitor', 2026),
    source('Article', 'What the Energy Crunch Means for Winter Bills', 'Rachel Ashworth, Stoa', 2026, '/articles/winter-bills'),
    source('Data', 'Regional Weather and Travel Outlook', 'Met Desk', 2026),
  ],
  conversations: [
    source('Article', 'In Defence of the Long Novel', 'Richard Holloway, Stoa', 2026, '/articles/long-novel'),
    source('Book', 'Notes From a Working Life', 'Peter Ridley', 2024),
    source('Book', 'Cities That Work', 'Joanne Hartley', 2023),
    source('Book', 'The Newsroom Years', 'Mark Brindley', 2021),
    source('Article', 'What Happened to the British Sitcom?', 'Tom Heywood, Stoa', 2026, '/articles/british-sitcom'),
  ],
  chronos: [
    source('Article', 'Why the Romans Feared Their Own Generals', 'Helen Thwaite, Stoa', 2026, '/articles/roman-generals'),
    source('Article', 'Agincourt Without the Myths', 'Helen Thwaite, Stoa', 2026, '/articles/agincourt-myths'),
    source('Book', 'The Last Republic', 'A. J. Wexley', 2016),
    source('Book', 'Empire of the East', 'C. R. Danvers', 2019),
    source('Book', 'Crowns and Longbows', 'H. P. Ashcombe', 2014),
    source('Data', 'Atlas of the Ancient Mediterranean', 'Historical Maps Project', 2020),
    source('Report', 'Coin Finds and Trade Routes', 'Society for Ancient Economies', 2022),
  ],
  statecraft: [
    source('Article', 'The Shipping Lanes Nobody Talks About', 'Rachel Ashworth, Stoa', 2026, '/articles/shipping-lanes'),
    source('Report', 'Global Energy Outlook', 'International Energy Review', 2026),
    source('Data', 'World Shipping Chokepoints', 'Maritime Trade Monitor', 2026),
    source('Book', 'The Map and the Throne', 'L. K. Varga', 2021),
    source('Report', 'Sanctions and Their Side Effects', 'Institute for Policy Studies', 2025),
  ],
  ledger: [
    source('Article', 'A Plain Guide to the National Debt', 'Sally Dunmore, Stoa', 2026, '/articles/national-debt'),
    source('Article', 'Rents, Wages and the Missing Middle', 'Neil Barraclough, Stoa', 2026, '/articles/missing-middle'),
    source('Data', 'Household Income Survey', 'Household Finance Monitor', 2026),
    source('Book', 'Money Without the Mystery', 'J. T. Hartnell', 2020),
    source('Report', 'Productivity Since 2008', 'Institute for Economic Review', 2025),
  ],
  'the-forum': [
    source('Book', 'The Pub Quiz Companion', 'B. A. Linton', 2018),
    source('Data', 'Audience Vote Results', 'Stoa', 2026),
    source('Article', 'What Happened to the British Sitcom?', 'Tom Heywood, Stoa', 2026, '/articles/british-sitcom'),
  ],
}

/** Sources for a series, so each part cites its own period. */
const seriesSourcePools: Record<string, Source[]> = {
  'The Fall of the Republic': [
    source('Article', 'Why the Romans Feared Their Own Generals', 'Helen Thwaite, Stoa', 2026, '/articles/roman-generals'),
    source('Book', 'The Last Republic', 'A. J. Wexley', 2016),
    source('Data', 'Atlas of the Ancient Mediterranean', 'Historical Maps Project', 2020),
    source('Report', 'Coin Finds and Trade Routes', 'Society for Ancient Economies', 2022),
    source('Book', 'Senate and Sword', 'R. G. Ellery', 2019),
  ],
  'Roman Resurgence': [
    source('Book', 'Empire of the East', 'C. R. Danvers', 2019),
    source('Data', 'Atlas of the Ancient Mediterranean', 'Historical Maps Project', 2020),
    source('Report', 'Plague and Population in Late Antiquity', 'Society for Ancient Economies', 2023),
    source('Book', 'The City of Walls', 'M. E. Corrigan', 2017),
  ],
  "The Hundred Years' War": [
    source('Article', 'Agincourt Without the Myths', 'Helen Thwaite, Stoa', 2026, '/articles/agincourt-myths'),
    source('Book', 'Crowns and Longbows', 'H. P. Ashcombe', 2014),
    source('Data', 'Battlefields of France: A Gazetteer', 'Historical Maps Project', 2021),
    source('Book', 'The Disputed Crown', 'S. L. Marlowe', 2018),
  ],
}

/** Likes and dislikes; now and then a deliberately divisive split. */
function votes(random: () => number): [number, number] {
  if (random() < 0.2) {
    const total = randomInt(random, 20, 60)
    const likes = Math.round(total * (0.5 + random() * 0.08))
    return [likes, total - likes]
  }
  return [randomInt(random, 0, 35), randomInt(random, 0, 3)]
}

/** A time between release and now (at most a week after release). */
function postedAfter(random: () => number, publishedAt: string): string {
  const start = new Date(publishedAt).getTime() + 10 * 60_000
  const end = Math.min(Date.now() - 60_000, start + 7 * 86_400_000)
  return new Date(start + random() * Math.max(0, end - start)).toISOString()
}

function generateComments(episode: Episode): Comment[] {
  const random = seededRandom(`${episode.id}:comments`)
  const pool = commentPools[episode.showId] ?? []
  const texts = pickSome(random, pool, randomInt(random, 4, Math.min(8, pool.length)))

  return texts.map((text, i) => {
    const [user, tier] = commenters[randomInt(random, 0, commenters.length - 1)]!
    const id = `${episode.id}-c${i}`
    const postedAt = postedAfter(random, episode.publishedAt)
    const [likes, dislikes] = votes(random)
    const replyCount = random() < 0.3 ? randomInt(random, 1, 2) : 0
    const replies = pickSome(random, replyPool, replyCount).map((reply, j): Comment => {
      const [replyUser, replyTier] = commenters[randomInt(random, 0, commenters.length - 1)]!
      const [replyLikes, replyDislikes] = votes(random)
      return {
        id: `${id}-r${j}`,
        user: replyUser,
        tier: replyTier,
        postedAt: postedAfter(random, postedAt),
        text: reply,
        likes: replyLikes,
        dislikes: replyDislikes,
        replies: [],
      }
    })
    return { id, user, tier, postedAt, text, likes, dislikes, replies }
  })
}

function generateReadingList(episode: Episode): ReadingItem[] {
  const random = seededRandom(`${episode.id}:reading`)
  const pool =
    (episode.series && seriesSourcePools[episode.series.name]) || sourcePools[episode.showId] || []
  const picked = pickSome(random, pool, randomInt(random, 3, Math.min(5, pool.length)))
  const lengthSeconds = episode.durationMin * 60

  return picked.map((item, i) => ({
    ...item,
    id: `${episode.id}-s${i}`,
    // Somewhere after the opening and before the last few minutes.
    at: Math.round(lengthSeconds * (0.05 + random() * 0.85)),
  }))
}

/** The comments for a hand-written thread id, or else for the given episode. */
export function commentsForThread(threadId: string, episode?: Episode): Comment[] {
  const handWritten = commentThreads[threadId]
  if (handWritten) return handWritten
  return episode ? generateComments(episode) : []
}

/** The reading list for a hand-written list id, or else for the given episode. */
export function readingListForThread(listId: string, episode?: Episode): ReadingItem[] {
  const handWritten = readingLists[listId]
  if (handWritten) return handWritten
  return episode ? generateReadingList(episode) : []
}

// Comments and reading lists for every episode, every article and the live
// show, written into the seed data by generate.mjs. Laravel stores them and
// decides who may read them.
//
// Each episode draws a stable mix from its show's pool of placeholder
// comments and sources, seeded by its id, so episodes differ but every run
// gives the same result. A thread's size follows how much the episode was
// discussed: a handful on a quiet Morning Brief, a dozen on a busy Stoa
// Podcast. Every username is invented. A few comments are deliberately
// divisive, so the Controversial sort has something to show.

/** Members who comment. Commenting is a members' perk, so no free tier. */
const commenters = [
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

const commentPools = {
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

// Comments under articles, by category. Invented for the demo.
const articleCommentPools = {
  Politics: [
    'The point about loyalty no longer being inherited rings true in my family.',
    'Good piece, though I think you underrate how much the voting system protects the big two.',
    'Every party says it listens. Few of them ever seem to hear anything.',
    'I would like to see the numbers behind this. Still, a fair argument.',
    'Our ward changed hands on forty votes. Local results matter more than people think.',
    'This is the clearest explanation of the problem I have read in a while.',
    'I disagree with the conclusion, but the analysis is honest.',
    'More of this, please. Less shouting, more explaining.',
  ],
  Analysis: [
    'The bit about prepayment meters should be read by every MP.',
    'Insulation first, every time. It is the cheapest energy there is.',
    'I had no idea how much passes through so few narrow straits.',
    'Useful and calm. Bookmarked to send to my parents.',
    'A good primer. A follow-up on what the government could do would be welcome.',
    'The rerouting costs explain a lot about what I have seen in the shops.',
    'Clear writing on a complicated subject. Thank you.',
    'I would quibble with one figure, but the overall picture is right.',
  ],
  History: [
    'Helen writes the way she talks on Chronos. Clear and never dull.',
    'The part the legend leaves out is always the most interesting part.',
    'I visited the battlefield last summer. The ground really is that narrow.',
    'Great to see the primary sources taken seriously.',
    'This made me go back and rewatch the whole series.',
    'The monks deserve more credit than they get in school.',
    'A fair and balanced take on a period full of myths.',
    'Could we have a reading list for beginners on this?',
  ],
  Culture: [
    'Finally someone says it. Long books are worth the time.',
    'The old sitcoms worked because everyone watched them together.',
    'Twenty minutes a day is good advice. I finished my first big novel that way.',
    'Some of the best new comedy is online now. Agree completely.',
    'I miss the studio audience. The laughter made it feel like an event.',
    'Lovely piece. It made me want to pick up a book I abandoned years ago.',
    'Not sure I agree about the decline, but I enjoyed the argument.',
    'The bit about the monthly instalments was fascinating.',
  ],
  Economics: [
    'The difference between debt and deficit should be taught in schools.',
    'Rent takes over half of my pay. This piece describes my life.',
    'Clear, plain and no jargon. More like this, please.',
    'I would add that pension funds holding gilts affects all of us.',
    'Building more homes is the answer everyone agrees on and nobody delivers.',
    'Interest on the debt is the number I wish more people knew.',
    'A fair explanation. I came away understanding more than before.',
    'The missing middle is real. Too rich for help, too poor to save.',
  ],
}

const replyPool = [
  'Agreed, well put.',
  'Not sure about that, but fair point.',
  'Same here.',
  'This is exactly what I was thinking.',
  'Have to disagree, though I see where you are coming from.',
  'Ha, spot on.',
  'Good shout. Seconded.',
]

const source = (type, title, by, year, to) => ({
  type,
  title,
  source: by,
  year,
  to,
})

const sourcePools = {
  'stoa-podcast': [
    source(
      'Article',
      'Local Elections Are Telling Us Something',
      'Gary Lowther, Stoa',
      2026,
      '/articles/local-elections',
    ),
    source(
      'Article',
      'The Quiet Collapse of the Centre Ground',
      'Andrew Pickering, Stoa',
      2026,
      '/articles/centre-ground',
    ),
    source('Data', 'Public Attitudes Tracker, Autumn 2026', 'Civic Opinion Unit', 2026),
    source('Report', 'How Westminster Spends Its Week', 'Parliamentary Practice Review', 2025),
    source('Book', 'The Long Campaign', 'E. M. Talbot', 2022),
    source('Report', 'Councils Under Strain', 'Civic Budget Institute', 2026),
  ],
  'morning-brief': [
    source('Data', 'Overnight Markets Summary', 'Daily Markets Digest', 2026),
    source('Report', 'Weekly Economic Calendar', 'Household Finance Monitor', 2026),
    source(
      'Article',
      'What the Energy Crunch Means for Winter Bills',
      'Rachel Ashworth, Stoa',
      2026,
      '/articles/winter-bills',
    ),
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
    source(
      'Article',
      'Why the Romans Feared Their Own Generals',
      'Helen Thwaite, Stoa',
      2026,
      '/articles/roman-generals',
    ),
    source('Article', 'Agincourt Without the Myths', 'Helen Thwaite, Stoa', 2026, '/articles/agincourt-myths'),
    source('Book', 'The Last Republic', 'A. J. Wexley', 2016),
    source('Book', 'Empire of the East', 'C. R. Danvers', 2019),
    source('Book', 'Crowns and Longbows', 'H. P. Ashcombe', 2014),
    source('Data', 'Atlas of the Ancient Mediterranean', 'Historical Maps Project', 2020),
    source('Report', 'Coin Finds and Trade Routes', 'Society for Ancient Economies', 2022),
  ],
  statecraft: [
    source(
      'Article',
      'The Shipping Lanes Nobody Talks About',
      'Rachel Ashworth, Stoa',
      2026,
      '/articles/shipping-lanes',
    ),
    source('Report', 'Global Energy Outlook', 'International Energy Review', 2026),
    source('Data', 'World Shipping Chokepoints', 'Maritime Trade Monitor', 2026),
    source('Book', 'The Map and the Throne', 'L. K. Varga', 2021),
    source('Report', 'Sanctions and Their Side Effects', 'Institute for Policy Studies', 2025),
  ],
  ledger: [
    source('Article', 'A Plain Guide to the National Debt', 'Sally Dunmore, Stoa', 2026, '/articles/national-debt'),
    source(
      'Article',
      'Rents, Wages and the Missing Middle',
      'Neil Barraclough, Stoa',
      2026,
      '/articles/missing-middle',
    ),
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
const seriesSourcePools = {
  'The Fall of the Republic': [
    source(
      'Article',
      'Why the Romans Feared Their Own Generals',
      'Helen Thwaite, Stoa',
      2026,
      '/articles/roman-generals',
    ),
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

// ---------- the live show (hand-written) ----------
// Times are minutes before the catalogue was generated.
const comment = (user, tier, minutes, [likes, dislikes], text, replies = []) => ({
  user,
  tier,
  minutes,
  likes,
  dislikes,
  text,
  replies,
})

const liveThread = [
  comment(
    'MargaretH',
    'silver',
    12,
    [14, 1],
    'The segment on council budgets was the clearest explanation I have heard anywhere. More of that please.',
    [comment('GrumpyHistorian', 'silver', 8, [3, 0], 'Agreed. Tom had the figures ready, which helps.')],
  ),
  comment(
    'bookish_bill',
    'gold',
    25,
    [31, 2],
    'Thanks for taking my question on the energy price cap. Answered better than I expected.',
    [
      comment(
        'Stoa_Producer',
        'staff',
        20,
        [9, 0],
        'Glad it helped. The sources are in the reading list next to the comments.',
      ),
      comment('Wessex_Walker', 'gold', 18, [2, 0], 'Same question was on my list, so thank you both.'),
    ],
  ),
  comment(
    'teabreak_tim',
    'bronze',
    40,
    [9, 8],
    'Could we get a follow-up on the housing figures? Felt like there was more to say.',
  ),
  comment(
    'HollyFromHull',
    'bronze',
    55,
    [11, 0],
    'First time watching live instead of catching up later. The chat makes a real difference.',
  ),
  comment(
    'Brummie_Rob',
    'bronze',
    60,
    [40, 35],
    'Hot take: the after-show should be free for everyone. The best discussion happens there.',
    [
      comment(
        'Wessex_Walker',
        'gold',
        58,
        [22, 6],
        'Someone has to pay for it. The after-show is what the membership is for.',
      ),
      comment('NorthernLass', 'bronze', 50, [12, 9], 'A free taster once a month would be a fair middle ground.'),
      comment(
        'NorthernLad',
        'bronze',
        45,
        [31, 2],
        '@NorthernLass A free taster for everyone? Sounds a bit communist to me.',
      ),
    ],
  ),
  comment('quietreader', 'bronze', 70, [4, 3], 'Richard was on good form today. Looking forward to the after-show.'),
  comment(
    'Wessex_Walker',
    'gold',
    95,
    [22, 4],
    'Good to see the schedule on the site now. Much easier than checking three different places.',
    [comment('MargaretH', 'silver', 90, [5, 0], 'The reminders are handy too.')],
  ),
  comment(
    'GrumpyHistorian',
    'silver',
    130,
    [18, 16],
    'Small correction: the 1976 figure Andrew mentioned was for the year, not the quarter. Does not change the point.',
  ),
  comment('teabreak_tim', 'bronze', 180, [4, 6], 'Audio was a bit quiet for the first five minutes, fine after that.'),
  comment(
    'bookish_bill',
    'gold',
    240,
    [17, 15],
    'Would happily pay for a longer version of the budget breakdown as its own episode.',
  ),
  comment(
    'HollyFromHull',
    'bronze',
    300,
    [3, 0],
    'Has anyone found the article Richard mentioned? The one on the long novel.',
    [comment('quietreader', 'bronze', 295, [4, 0], 'It is on the homepage under Latest articles.')],
  ),
  comment(
    'MargaretH',
    'silver',
    420,
    [7, 5],
    'Lovely to hear the producer laughing in the background. Keeps it human.',
  ),
  comment('Wessex_Walker', 'gold', 600, [1, 0], 'Early comment from the countdown. See you all at one.'),
]

const liveReadingList = [
  {
    type: 'Data',
    title: 'Council Spending Power, 2026 to 2027',
    source: 'Local Finance Monitor',
    year: 2026,
    at: 840,
  },
  {
    type: 'Book',
    title: 'Britain in the 1970s: A Decade of Crisis',
    source: 'J. R. Halloran',
    year: 2018,
    at: 1120,
  },
  {
    type: 'Report',
    title: 'Who Pays for Local Services?',
    source: 'Civic Budget Institute',
    year: 2025,
    at: 1210,
  },
  {
    type: 'Article',
    title: 'What the Energy Crunch Means for Winter Bills',
    source: 'Rachel Ashworth, Stoa',
    year: 2026,
    at: 1810,
    to: '/articles/winter-bills',
  },
  {
    type: 'Report',
    title: 'How the Energy Price Cap Is Set',
    source: 'Household Energy Review',
    year: 2026,
    at: 2150,
  },
  {
    type: 'Book',
    title: 'The Housing Trap',
    source: 'M. A. Pembroke',
    year: 2021,
    at: 2600,
  },
]

// ---------- generation ----------
const randomInt = (random, min, max) => min + Math.floor(random() * (max - min + 1))

/** `count` different items from a list, in a shuffled order. */
function pickSome(random, items, count) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length))
}

/** Likes and dislikes; now and then a deliberately divisive split. */
function votes(random) {
  if (random() < 0.2) {
    const total = randomInt(random, 20, 60)
    const likes = Math.round(total * (0.5 + random() * 0.08))
    return [likes, total - likes]
  }
  return [randomInt(random, 0, 35), randomInt(random, 0, 3)]
}

/** A time after `from` (at most a week after), and before the catalogue was generated. */
function postedAfter(random, from, now) {
  const start = new Date(from).getTime() + 10 * 60_000
  const end = Math.min(now.getTime() - 60_000, start + 7 * 86_400_000)
  return new Date(start + random() * Math.max(0, end - start)).toISOString()
}

/**
 * A thread of comments from a pool, the same every run for a given thread.
 * `discussed` (the generated comment count) sets how many: popular episodes
 * get more, up to the size of the pool.
 */
function thread(seed, pool, publishedAt, discussed, now) {
  const random = seeded(`${seed}:comments`)
  const count = Math.max(2, Math.min(pool.length, Math.round(Math.sqrt(discussed))))
  return pickSome(random, pool, count).map((text) => {
    const [user, tier] = commenters[randomInt(random, 0, commenters.length - 1)]
    const postedAt = postedAfter(random, publishedAt, now)
    const [likes, dislikes] = votes(random)
    const replyCount = random() < 0.3 ? randomInt(random, 1, 2) : 0
    const replies = pickSome(random, replyPool, replyCount).map((reply) => {
      const [replyUser, replyTier] = commenters[randomInt(random, 0, commenters.length - 1)]
      const [replyLikes, replyDislikes] = votes(random)
      return {
        user: replyUser,
        tier: replyTier,
        postedAt: postedAfter(random, postedAt, now),
        text: reply,
        likes: replyLikes,
        dislikes: replyDislikes,
        replies: [],
      }
    })
    return { user, tier, postedAt, text, likes, dislikes, replies }
  })
}

/** Sources for an episode, each placed at the moment it came up. */
function readingList(episode) {
  const random = seeded(`${episode.id}:reading`)
  const pool = (episode.series && seriesSourcePools[episode.series.name]) || sourcePools[episode.showId] || []
  const picked = pickSome(random, pool, randomInt(random, 3, Math.min(5, pool.length)))
  const lengthSeconds = episode.durationMin * 60
  // Somewhere after the opening and before the last few minutes.
  return picked.map((item) => ({ ...item, at: Math.round(lengthSeconds * (0.05 + random() * 0.85)) }))
}

const size = (comments) => comments.reduce((total, c) => total + 1 + c.replies.length, 0)
const minutesBefore = (now, minutes) => new Date(now.getTime() - minutes * 60_000).toISOString()
const fromMinutes =
  (now) =>
  ({ minutes, replies, ...c }) => ({
    ...c,
    postedAt: minutesBefore(now, minutes),
    replies: replies.map(fromMinutes(now)),
  })

/**
 * Every thread and reading list. Each episode's and article's comment count
 * is set to its thread's real size, so cards and threads always agree.
 * `seededRandom` is the generator's seeded() function.
 */
let seeded
export function buildExtras({ episodes, articles, now, seededRandom }) {
  seeded = seededRandom
  const threads = []
  const lists = []
  for (const episode of episodes) {
    const comments = thread(episode.id, commentPools[episode.showId] ?? [], episode.publishedAt, episode.comments, now)
    episode.comments = size(comments)
    threads.push({ thread: `episode:${episode.id}`, comments })
    lists.push({ list: `episode:${episode.id}`, items: readingList(episode) })
  }
  for (const article of articles) {
    const comments = thread(
      `article-${article.id}`,
      articleCommentPools[article.category],
      article.publishedAt,
      article.comments,
      now,
    )
    article.comments = size(comments)
    threads.push({ thread: `article:${article.id}`, comments })
  }
  threads.push({ thread: 'live:live-show', comments: liveThread.map(fromMinutes(now)) })
  lists.push({ list: 'live:live-show', items: liveReadingList })
  return { threads, lists }
}

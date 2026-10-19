// Placeholder comments, keyed by thread (one thread per episode). Every
// username is invented. Times are relative to now so the demo stays fresh.
// A few comments are deliberately divisive, so the Controversial sort has
// something to show.

import type { ChatTier } from './chat'

export interface Comment {
  id: string
  user: string
  tier: ChatTier
  /** ISO 8601 date string. */
  postedAt: string
  text: string
  likes: number
  dislikes: number
  replies: Comment[]
  /** Posted by the viewer in this session. */
  mine?: boolean
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function comment(
  id: string,
  user: string,
  tier: ChatTier,
  minutes: number,
  [likes, dislikes]: [number, number],
  text: string,
  replies: Comment[] = [],
): Comment {
  return { id, user, tier, postedAt: minutesAgo(minutes), text, likes, dislikes, replies }
}

export const commentThreads: Record<string, Comment[]> = {
  'stoa-podcast-1432': [
    comment('c1', 'MargaretH', 'silver', 12, [14, 1], 'The segment on council budgets was the clearest explanation I have heard anywhere. More of that please.', [
      comment('c1r1', 'GrumpyHistorian', 'silver', 8, [3, 0], 'Agreed. Tom had the figures ready, which helps.'),
    ]),
    comment('c2', 'bookish_bill', 'gold', 25, [31, 2], 'Thanks for taking my question on the energy price cap. Answered better than I expected.', [
      comment('c2r1', 'Stoa_Producer', 'staff', 20, [9, 0], 'Glad it helped. The reading list with the sources goes up tonight.'),
      comment('c2r2', 'Wessex_Walker', 'gold', 18, [2, 0], 'Same question was on my list, so thank you both.'),
    ]),
    comment('c3', 'teabreak_tim', 'bronze', 40, [9, 8], 'Could we get a follow-up on the housing figures? Felt like there was more to say.'),
    comment('c4', 'HollyFromHull', 'bronze', 55, [11, 0], 'First time watching live instead of catching up later. The chat makes a real difference.'),
    comment('c13', 'Brummie_Rob', 'bronze', 60, [40, 35], 'Hot take: the after-show should be free for everyone. The best discussion happens there.', [
      comment('c13r1', 'Wessex_Walker', 'gold', 58, [22, 6], 'Someone has to pay for it. The after-show is what the membership is for.'),
      comment('c13r2', 'NorthernLass', 'bronze', 50, [12, 9], 'A free taster once a month would be a fair middle ground.'),
    ]),
    comment('c5', 'quietreader', 'bronze', 70, [4, 3], 'Richard was on good form today. Looking forward to the after-show.'),
    comment('c6', 'Wessex_Walker', 'gold', 95, [22, 4], 'Good to see the schedule on the site now. Much easier than checking three different places.', [
      comment('c6r1', 'MargaretH', 'silver', 90, [5, 0], 'The reminders are handy too.'),
    ]),
    comment('c7', 'GrumpyHistorian', 'silver', 130, [18, 16], 'Small correction: the 1976 figure Andrew mentioned was for the year, not the quarter. Does not change the point.'),
    comment('c8', 'teabreak_tim', 'bronze', 180, [4, 6], 'Audio was a bit quiet for the first five minutes, fine after that.'),
    comment('c9', 'bookish_bill', 'gold', 240, [17, 15], 'Would happily pay for a longer version of the budget breakdown as its own episode.'),
    comment('c10', 'HollyFromHull', 'bronze', 300, [3, 0], 'Has anyone found the article Richard mentioned? The one on the long novel.', [
      comment('c10r1', 'quietreader', 'bronze', 295, [4, 0], 'It is on the homepage under Latest articles.'),
    ]),
    comment('c11', 'MargaretH', 'silver', 420, [7, 5], 'Lovely to hear the producer laughing in the background. Keeps it human.'),
    comment('c12', 'Wessex_Walker', 'gold', 600, [1, 0], 'Early comment from the countdown. See you all at one.'),
  ],
}

/** Total comments in a thread, replies included. */
export function countComments(comments: Comment[]): number {
  return comments.reduce((total, c) => total + 1 + c.replies.length, 0)
}

// Pitch notes on the live page (/live).

import type { PitchNote } from '../types'

const page = { name: 'Live page', to: '/live' }

export const notes: PitchNote[] = [
  {
    id: 'live-countdown',
    kind: 'fix',
    source: 'Finding 11',
    title: 'A countdown on the site',
    today: 'The countdown exists only on Rumble. The site shows a looped "starting soon" video about 10 minutes early.',
    here: 'A countdown to the next show on the live page, with reminders for members.',
    page,
    hint: 'Demo panel: Live show on "Upcoming".',
  },
  {
    id: 'player-switch',
    kind: 'fix',
    source: 'Finding 1',
    title: 'Switching source never goes black',
    today:
      'Rumble shows a black screen after switching to another source and back, even during the live show. The player logo links out to Rumble.',
    here: 'Each switch builds a fresh player. Title, viewers and share sit outside the platform player, and nothing links off-site.',
    page,
  },
  {
    id: 'live-handoff',
    kind: 'fix',
    source: 'Finding 11',
    title: "Hand-off to the members' segment",
    today: 'The members-only after-show starts about 30 minutes after the free stream, with no route into it.',
    here: 'The break counts down to the after-show, with "Continue as a member" on the video and pinned in chat.',
    page,
    hint: 'Demo panel: Live show on "Break".',
  },
  {
    id: 'live-phone',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Video above chat on phones',
    today: 'On phones the chat covers the whole screen.',
    here: 'Video at the top, chat filling the space below. The chat never covers the video.',
    page,
    hint: 'Best seen at phone width.',
  },
  {
    id: 'live-reminders',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Schedule and reminders',
    today: 'No schedule, countdown or reminder on the site itself.',
    here: 'A "Coming up live" schedule, with browser reminders for members.',
    page,
  },
  {
    id: 'chat-kept',
    kind: 'kept',
    source: 'Finding 11',
    title: 'Their own live chat',
    today:
      'A real strength: tier and Staff badges, replies, likes and images, with almost no delay. Gold members can also send video questions.',
    here: 'Kept as it is, and built on rather than replaced.',
    page,
  },
  {
    id: 'chat-replay',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Chat replay',
    today: 'The chat disappears once a viewer leaves the stream or reloads the page.',
    here: 'The chat replays alongside the recording, in time with it.',
    page,
    hint: 'Demo panel: Live show on "Ended", or open a Stoa Podcast episode.',
  },
  {
    id: 'votes',
    kind: 'proposal',
    source: 'New idea',
    title: 'Disagreement made visible',
    today: 'Comments already have dislikes. The live chat has likes only.',
    here: 'Dislikes in chat too, and a "Controversial" sort for comments: lots of votes, split close to evenly.',
    page,
  },
]

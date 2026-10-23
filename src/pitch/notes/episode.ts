// Pitch notes on an episode page (/watch/stoa-podcast-1530).

import type { PitchNote } from '../types'

const page = { name: 'Episode page', to: '/watch/stoa-podcast-1530' }

export const notes: PitchNote[] = [
  {
    id: 'every-stream',
    kind: 'proposal',
    source: 'Finding 1',
    title: 'Every stream, one player',
    today:
      'Each episode goes out on several platforms (Rumble, Odysee, BitChute and their own video on demand), each one managed separately.',
    here: "One record per episode lists every platform it is on, kept current by a sync. The player offers only those platforms, in one frame, and shows any still processing. The site's own video plays in its own player, with no third party.",
    page,
    hint: "Shows that air live are on Rumble, Odysee and the site's own player; the rest on Rumble, BitChute and the site's own player.",
  },
  {
    id: 'reading-lists',
    kind: 'fix',
    source: 'Finding 4',
    title: 'Sourcing on every episode and article',
    today: 'Some episodes have a reading list, in different shapes, open to everyone.',
    here: 'The same reading list on every episode: type, title, source and year, and when it came up. Making it part of membership on members\' shows is a proposal (see "The members\' gate").',
    page,
  },
  {
    id: 'own-player',
    kind: 'proposal',
    source: 'New idea',
    title: "The site's own player, in their style",
    today: 'Their own player shows a progress bar, volume, live status and full screen.',
    here: "The same style for the site's own video, plus quality and speed (0.25× to 2×, or any speed up to 3×). Sized so the player and the chat always fit on screen.",
    page,
    hint: '"Change player source", then the site\'s own player.',
  },
  {
    id: 'chat-sync',
    kind: 'proposal',
    source: 'New idea',
    title: 'Chat replay in step with the video',
    today: 'The chat disappears once a viewer leaves the stream.',
    here: 'The replay follows the site\'s own player both ways: seek, pause and speed move the chat, and the chat\'s timeline moves the video. "Sync with player" turns it off, to scan the chat on its own.',
    page,
    hint: '"Live chat replay", with the site\'s own player chosen.',
  },
]

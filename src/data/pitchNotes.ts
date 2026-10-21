// Pitch mode labels. Each note names the finding it answers (from the
// planning doc) and says what is different from the real site today.
// Three kinds, so nothing is overclaimed:
//   fix:      answers a documented gap
//   proposal: not offered today (from the benchmark or our own ideas)
//   kept:     already on the real site, credited rather than claimed

import { brand } from '@/config/brand'

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

const home = { name: 'Homepage', to: '/' }
const live = { name: 'Live page', to: '/live' }
const episode = { name: 'Episode page', to: '/watch/stoa-podcast-1530' }
const seriesEpisode = { name: 'Episode in a series', to: '/watch/chronos-111?series=the-fall-of-the-republic' }
const join = { name: "Members' preview", to: '/join' }
const lockedEpisode = { name: 'A locked episode', to: '/watch/chronos-116?series=roman-resurgence' }
const showPage = { name: 'A show page', to: '/shows/chronos' }
const coursesPage = { name: 'Courses', to: '/courses' }
const shopPage = { name: 'Shop', to: '/shop' }
const searchPage = { name: 'Search, over any page', to: '/?search=rome' }

export const pitchNotes: PitchNote[] = [
  {
    id: 'intro',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'Brand moment (optional)',
    today: 'Visitors land straight on the homepage.',
    here: 'A first-visit welcome: the view down a Greek stoa to a purple wax seal, broken to enter. The page they arrived on loads behind it, and the homepage plays on arrival as soon as the seal breaks. It shows once per visitor, whichever link they follow, "Skip intro" is always there, and with "reduce motion" on it is a simple fade. Optional: it can be dropped without touching anything else.',
    page: home,
    hint: 'Demo panel: "Replay intro", or add ?intro=1 to any link.',
  },
  {
    id: 'hero-plays',
    kind: 'fix',
    source: 'Finding 12',
    title: 'The homepage plays on arrival',
    today: 'Static banners and still thumbnails. Nothing plays.',
    here: 'The hero plays something the moment the page opens: the live stream, or a featured episode.',
    page: home,
  },
  {
    id: 'live-takeover',
    kind: 'fix',
    source: 'Finding 11',
    title: 'The live show takes the homepage',
    today: 'On 19 October the hero promoted another show while the live show sat as an ordinary card under "Latest".',
    here: 'While the show is live it holds the hero and stays there. No click needed.',
    page: home,
    hint: 'Demo panel: Live show on "Live".',
  },
  {
    id: 'nav',
    kind: 'fix',
    source: 'Finding 2',
    title: 'One short top bar',
    today: 'A left sidebar with 9 top-level items, 12 more under Premium and more under Authors, all expanded at once.',
    here: 'Five links and search in one bar, with Shop and Upgrade on the right.',
    page: home,
  },
  {
    id: 'continue-watching',
    kind: 'fix',
    source: 'Finding 12',
    title: 'Continue watching',
    today: 'No "Continue watching" for returning visitors.',
    here: 'Part-watched episodes, newest first, with progress bars.',
    page: home,
  },
  {
    id: 'start-here',
    kind: 'fix',
    source: 'Finding 12',
    title: 'A way in for newcomers',
    today: 'The homepage assumes visitors already know what they want.',
    here: '"Start here" offers one way into every show.',
    page: home,
  },
  {
    id: 'card-previews',
    kind: 'proposal',
    source: 'Finding 12',
    title: 'Hover to preview, with sound on demand',
    today: 'Still thumbnails.',
    here: 'Cards stay still until you hover, then play a preview with a themed animation per show. On phones, the card in view plays. Free viewers preview free content; members preview everything. A mute button on the preview turns sound on for every card.',
    page: home,
  },
  {
    id: 'series-row',
    kind: 'fix',
    source: 'Finding 10',
    title: 'Series as series',
    today: 'Series are not tracked. Parts are numbered inconsistently ("Part VII", "Part 1", "Part I").',
    here: 'Every series has its own page, played in order and numbered the same way.',
    page: home,
  },
  {
    id: 'members-rows',
    kind: 'fix',
    source: 'Topic 3',
    title: 'Show what members get',
    today: 'The "Premium Preview" section was removed in 2023. Only 2 of the last 30 Epochs episodes were free.',
    here: "Members' shows appear in full, locked for free viewers, with a free preview playable in each.",
    page: home,
  },
  {
    id: 'live-countdown',
    kind: 'fix',
    source: 'Finding 11',
    title: 'A countdown on the site',
    today: 'The countdown exists only on Rumble. The site shows a looped "starting soon" video about 10 minutes early.',
    here: 'A countdown to the next show on the live page, with reminders for members.',
    page: live,
    hint: 'Demo panel: Live show on "Upcoming".',
  },
  {
    id: 'player-switch',
    kind: 'fix',
    source: 'Finding 1',
    title: 'Switching source never goes black',
    today: 'Rumble shows a black screen after switching to another source and back, even during the live show. The player logo links out to Rumble.',
    here: 'Each switch builds a fresh player. Title, viewers and share sit outside the platform player, and nothing links off-site.',
    page: live,
  },
  {
    id: 'every-stream',
    kind: 'proposal',
    source: 'Finding 1',
    title: 'Every stream, one player',
    today: 'Each episode goes out on several platforms (Rumble, Odysee, BitChute and their own video on demand), each one managed separately.',
    here: 'One record per episode lists every platform it is on, kept current by a sync. The player offers only those platforms, in one frame, and shows any still processing. The site\'s own video plays in its own player, with no third party.',
    page: episode,
    hint: 'Shows that air live are on Rumble, Odysee and the site\'s own player; the rest on Rumble, BitChute and the site\'s own player.',
  },
  {
    id: 'one-source',
    kind: 'proposal',
    source: 'Consolidation',
    title: 'One source of truth',
    today: 'Each platform holds its own copy of the catalogue, kept in step by hand.',
    here: 'One record per episode, in Laravel, lists every platform it is on. A sync reads each platform\'s feed every hour, matches each upload to its episode by show, time and title, and links it. The desk shows what is missing, still processing or failed, and can re-sync on demand.',
    page: { name: 'Content desk', to: '/desk' },
    hint: 'Demo panel: switch to "Staff", then open the content desk.',
  },
  {
    id: 'live-handoff',
    kind: 'fix',
    source: 'Finding 11',
    title: "Hand-off to the members' segment",
    today: 'The members-only after-show starts about 30 minutes after the free stream, with no route into it.',
    here: 'The break counts down to the after-show, with "Continue as a member" on the video and pinned in chat.',
    page: live,
    hint: 'Demo panel: Live show on "Break".',
  },
  {
    id: 'live-phone',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Video above chat on phones',
    today: 'On phones the chat covers the whole screen.',
    here: 'Video at the top, chat filling the space below. The chat never covers the video.',
    page: live,
    hint: 'Best seen at phone width.',
  },
  {
    id: 'live-reminders',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Schedule and reminders',
    today: 'No schedule, countdown or reminder on the site itself.',
    here: 'A "Coming up live" schedule, with browser reminders for members.',
    page: live,
  },
  {
    id: 'chat-kept',
    kind: 'kept',
    source: 'Finding 11',
    title: 'Their own live chat',
    today: 'A real strength: tier and Staff badges, replies, likes and images, with almost no delay. Gold members can also send video questions.',
    here: 'Kept as it is, and built on rather than replaced.',
    page: live,
  },
  {
    id: 'chat-replay',
    kind: 'fix',
    source: 'Finding 11',
    title: 'Chat replay',
    today: 'The chat disappears once a viewer leaves the stream or reloads the page.',
    here: 'The chat replays alongside the recording, in time with it.',
    page: live,
    hint: 'Demo panel: Live show on "Ended", or open a Stoa Podcast episode.',
  },
  {
    id: 'votes',
    kind: 'proposal',
    source: 'New idea',
    title: 'Disagreement made visible',
    today: 'Comments already have dislikes. The live chat has likes only.',
    here: 'Dislikes in chat too, and a "Controversial" sort for comments: lots of votes, split close to evenly.',
    page: live,
  },
  {
    id: 'reading-lists',
    kind: 'fix',
    source: 'Finding 4',
    title: 'Sourcing on every episode and article',
    today: 'Some episodes have a reading list, in different shapes, open to everyone.',
    here: 'The same reading list on every episode: type, title, source and year, and when it came up. Making it part of membership on members\' shows is a proposal (see "The members\' gate").',
    page: episode,
  },
  {
    id: 'series-autoplay',
    kind: 'fix',
    source: 'Finding 10',
    title: 'Play this series in order',
    today: 'No series view, and nothing plays the next part.',
    here: 'The series queue sits beside the player, and the next part plays after a short countdown.',
    page: seriesEpisode,
    hint: 'Demo panel: Viewing as "Member".',
  },
  {
    id: 'join-previews',
    kind: 'fix',
    source: 'Site history',
    title: 'Premium Preview, revived',
    today: 'A free "Premium Preview" section existed in 2022 and was removed in 2023.',
    here: "A free preview from every members' show.",
    page: join,
  },
  {
    id: 'join-compare',
    kind: 'fix',
    source: 'Topic 3',
    title: 'What free gets',
    today: 'No clear comparison of what free gets and what each tier adds.',
    here: 'One table across Free, Bronze, Silver and Gold.',
    page: join,
  },
  {
    id: 'join-trial',
    kind: 'proposal',
    source: 'Benchmark',
    title: 'A 7-day free trial',
    today: 'Not offered today. Most comparable outlets offer one.',
    here: 'Bronze and Silver start with a 7-day free trial. Gold, with its extras, does not.',
    page: join,
    hint: 'Viewing as "Free account" or "Signed out".',
  },
  {
    id: 'join-tiers',
    kind: 'kept',
    source: 'Premium page',
    title: 'Their real tiers',
    today: 'Bronze £5, Silver £10 and Gold £30 a month, with these perks.',
    here: 'Kept as they are. Yearly prices are still to collect.',
    page: join,
  },
  {
    id: 'show-archive',
    kind: 'fix',
    source: 'Finding 3',
    title: 'Every episode, sorted and filtered',
    today: 'Content listing pages offer only a From/To date range filter. There is no way to filter by show, host, or topic, despite the site already maintaining that taxonomy as nav categories and tagging each piece of content with a category badge and named contributors.',
    here: 'Each show lists every episode it has made, 50 to a page: newest, oldest, or most watched this week, month, year or all time. Filter by free or members-only, and by contributor. The view is kept in the address, so it can be shared.',
    page: showPage,
  },
  {
    id: 'courses-inside',
    kind: 'proposal',
    source: 'Courses site',
    title: 'Courses inside the site',
    today: 'Courses sit on a separate site, with its own design and checkout.',
    here: 'Courses live in the main site, with the same look, navigation and account, and link to related series. Same product types and price points as today.',
    page: coursesPage,
  },
  {
    id: 'shop-inside',
    kind: 'proposal',
    source: 'Merch store',
    title: 'One shop inside the site',
    today: 'Merch is sold in a separate store, styled on its own and run apart from the main content site.',
    here: "The shop inside the main site, in the same design and with the same account, as part of bringing everything into one site. A region switch changes prices and currency in place, using the store's current prices.",
    page: shopPage,
  },
  {
    id: 'community-forums',
    kind: 'proposal',
    source: 'Courses site',
    title: 'Forums for each community',
    today: 'A single philosophy community on the separate courses site, joined by email.',
    here: `Join with one click on your ${brand.name} account. One forum is open; more are planned, and the same model could give every show or series its own forum.`,
    page: coursesPage,
  },
  {
    id: 'buy-episode',
    kind: 'kept',
    source: 'Their site',
    title: 'Buy a single episode',
    today: 'A members\' episode can be bought on its own for £1.89.',
    here: 'The same, from the locked episode page: bought to keep, unlocked at once, and marked "Owned" on its cards. In the Laravel version the server unlocks that one episode and no other.',
    page: lockedEpisode,
    hint: 'Viewing as "Free account".',
  },
  {
    id: 'open-spaces',
    kind: 'proposal',
    source: 'New idea',
    title: 'Open spaces and members\' spaces',
    today: 'Commenting is a members\' perk everywhere.',
    here: 'Free accounts can post where discussion is casual: the free daily shows, articles and the Circle\'s general forum. Members\' shows and topic forums stay members-only, which keeps them civil.',
    page: { name: 'An article', to: '/articles/centre-ground' },
    hint: 'Viewing as "Free account".',
  },
  {
    id: 'contributor-profiles',
    kind: 'kept',
    source: 'Their site',
    title: 'Contributor profiles, upgraded',
    today: 'Contributors have profile pages.',
    here: 'Each profile adds the shows they appear on, their series, their articles and every episode they are in, newest first. Their names link here from across the site.',
    page: { name: 'A contributor', to: '/contributors/helen' },
  },
  {
    id: 'members-shows',
    kind: 'proposal',
    source: "Nick's feedback",
    title: "The Shows page, for members",
    today: 'Everyone sees the same Shows page.',
    here: 'Members get Continue watching, Trending this week and Latest first, and the shows they have unlocked. Free viewers see the shows to try, each with a free preview.',
    page: { name: 'Shows', to: '/shows' },
    hint: 'Viewing as "Member".',
  },
  {
    id: 'members-gate',
    kind: 'proposal',
    source: "Nick's feedback",
    title: "The members' gate",
    today: 'Discussion and reading lists are open to everyone; nothing is gated.',
    here: "On members' shows, the discussion and the reading list are part of membership. Non-members see a blurred gate with an invitation. In the Laravel version the server sends them only a count, so nothing real sits behind the blur.",
    page: lockedEpisode,
    hint: 'Viewing as "Signed out" or "Free account".',
  },
  {
    id: 'article-comments',
    kind: 'kept',
    source: 'Their site',
    title: 'Comments under articles',
    today: 'Articles have comments, open to everyone.',
    here: 'The same comments, with the votes and sorting (Newest, Top, Controversial) that episodes have. Any account can post.',
    page: { name: 'An article', to: '/articles/centre-ground' },
  },
  {
    id: 'article-reading-lists',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'Reading lists on articles',
    today: 'Articles have no reading list.',
    here: 'Every article ends with its sources, in the same shape as an episode\'s reading list.',
    page: { name: 'An article', to: '/articles/centre-ground' },
  },
  {
    id: 'phone-tabs',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'A tab bar on phones',
    today: 'On phones, the menu opens a long list.',
    here: 'Home, Live, Shows, Search and More at the bottom of the screen, within reach of a thumb. More opens a sheet with the rest.',
    page: home,
    hint: 'On a phone, or a narrow window.',
  },
  {
    id: 'footer',
    kind: 'kept',
    source: 'Their site',
    title: 'A footer with the essentials',
    today: 'The footer links to the terms, privacy and cookie policies, About us, Find Us, Contact and FAQ, with a newsletter sign-up.',
    here: 'The same footer, with Contributors added. Courses and the shop stay in the top bar.',
    page: home,
  },
  {
    id: 'latest-articles',
    kind: 'kept',
    source: 'Their site',
    title: 'Articles on the homepage',
    today: 'The homepage shows the latest articles.',
    here: 'The same: the newest articles in a row on the homepage, free to read.',
    page: home,
  },
  {
    id: 'own-player',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'The site\'s own player, in their style',
    today: 'Their own player shows a progress bar, volume, live status and full screen.',
    here: 'The same style for the site\'s own video, plus quality and speed (0.25× to 2×, or any speed up to 3×). Sized so the player and the chat always fit on screen.',
    page: episode,
    hint: '"Change player source", then the site\'s own player.',
  },
  {
    id: 'chat-sync',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'Chat replay in step with the video',
    today: 'The chat disappears once a viewer leaves the stream.',
    here: 'The replay follows the site\'s own player both ways: seek, pause and speed move the chat, and the chat\'s timeline moves the video. "Sync with player" turns it off, to scan the chat on its own.',
    page: episode,
    hint: '"Live chat replay", with the site\'s own player chosen.',
  },
  {
    id: 'articles-index',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'Articles: trending, popular and controversial',
    today: 'Articles are listed newest first.',
    here: 'Newest, trending, popular this week, month or all time, and controversial (many votes, split close to evenly), by category, with a lead piece.',
    page: { name: 'Articles', to: '/articles' },
  },
  {
    id: 'account-page',
    kind: 'proposal',
    source: "Nick's feedback",
    title: 'One account for everything',
    today: 'The content site, the courses site and the merch store appear to be separate sites. A site login does not work in the store, so they seem to need separate accounts.',
    here: 'One account, one site and one source of truth: membership, communities joined, episodes bought, watch history, reminders and the newsletter in one place.',
    page: { name: 'Account', to: '/account' },
    hint: 'Viewing as "Member" or "Free account".',
  },
  {
    id: 'search',
    kind: 'fix',
    source: 'Finding 9',
    title: 'Search as you type',
    today: 'Site-wide search exists, but results appear only after pressing enter or the search button, not as you type.',
    here: 'Results appear as you type, grouped by kind, across about 5,500 episodes, over whatever page you are on. Small typos are forgiven. Press "/" anywhere to search. In the Laravel version it runs on the server, with Laravel Scout and Meilisearch.',
    page: searchPage,
  },
]

const byId = new Map(pitchNotes.map((note) => [note.id, note]))

export function getPitchNote(id: string): PitchNote | undefined {
  return byId.get(id)
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

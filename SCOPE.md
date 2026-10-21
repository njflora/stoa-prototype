# Scope

Everything in the Stoa prototype, area by area, as of 21 October 2026. Use it as the checklist for the pitch: every row says what it does, where it lives, which version has it, what it answers in the planning doc, how finished it is, and whether pitch mode labels it.

**Columns**
- **Version:** *Static* is the static preview (GitHub Pages, no server). *Laravel* is the full version with the API. *Both* means the feature works in each; in Laravel it is also saved or enforced on the server.
- **Answers:** a finding or topic in the planning doc, a real feature of their site that is kept, or "Proposal: Nick's idea" where no finding applies.
- **Status:** built, partial, placeholder, or planned (week 6).
- **Note:** whether a pitch note labels it.

## Site-wide

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Top bar | Five links, search, Shop and Upgrade in one short bar | `SiteHeader.vue` | Both | Finding 2 | Built | Yes |
| Phone tab bar | Home, Live, Shows, Search and More, within reach of a thumb | `MobileTabBar.vue` | Both | Proposal: Nick's idea | Built | Yes |
| Footer | Contributors, FAQ and contact links (courses and shop are in the top bar), credits, newsletter sign-up | `SiteFooter.vue`, `NewsletterSignup.vue` | Both | Proposal: Nick's idea | Built (the newsletter sends nothing) | Yes |
| Account menu and tier badge | The signed-in name, tier badge and reminders bell | `SiteHeader.vue`, `UserBadge.vue`, `NotificationBell.vue` | Both | Finding 11 (reminders) | Built | Partly (reminders) |
| Sign in | An honest page: no passwords; the demo panel is the easier way | `SignInView.vue` | Both | Demo only | Placeholder | No (demo only) |
| Contact | Placeholder addresses | `ContactView.vue` | Both | Proposal: Nick's idea | Placeholder | No |
| Credits | Every image and video, with its licence | `CreditsView.vue`, `CREDITS.md` | Both | Licence hygiene | Built | No (not a product feature) |
| Static preview banner | Says the preview saves in the browser and checks access in the page | `PreviewBanner.vue` | Static | Demo only | Built | No (demo only) |
| Branding in one file | Name, wording and logo from one file and one component | `src/config/brand.ts`, `BrandLogo.vue` | Both | Proposal: Nick's idea | Built | No (for the team, not visitors) |
| Phone layouts | Every page checked at 375 px and 320 px | All views | Both | Finding 11 (phones) and the brief | Built | Partly (live page) |
| Reduce motion | Video and animation stay still with "reduce motion" on | `HeroVideo.vue`, `usePreview.ts`, `StoaIntro.vue` | Both | Accessibility | Built | No |

## Homepage

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Hero that plays on arrival | The newest episodes, with a CC0 video loop | `HomeView.vue`, `HeroBanner.vue`, `HeroVideo.vue` | Both | Finding 12 | Built | Yes |
| Live takeover | The live show takes the hero while it is on | `HomeView.vue` | Both | Finding 11 | Built | Yes |
| Continue watching | Picks up where you left off | `HomeView.vue`, `useWatchProgress.ts` | Both | Finding 12 | Built | Yes |
| Start here | One way into every show, for newcomers | `HomeView.vue` | Both | Finding 12 | Built | Yes |
| Series row | Multi-part series, played in order | `HomeView.vue`, `SeriesCard.vue` | Both | Finding 10 | Built | Yes |
| Card previews, with sound on demand | Cards play a preview on hover (or in view on phones); a mute button | `EpisodeCard.vue`, `PreviewAnimation.vue`, `PreviewSoundButton.vue` | Both | Finding 12 (proposal) | Built | Yes |
| Members' shows rows | Members' shows in full, locked for free viewers, with a free preview | `HomeView.vue` | Both | Topic 3 | Built | Yes |
| Latest articles row | The newest articles | `HomeView.vue`, `ArticleCard.vue` | Both | Kept (their site) | Built | Yes |

## Live page

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Five phases | Upcoming, live, break, members' after-show, ended | `LiveView.vue`, `useLiveStatus.ts` | Both | Finding 11 | Built | Yes |
| Countdown | Counts down to the show on the site | `LiveCountdown.vue` | Both | Finding 11 | Built | Yes |
| Members' hand-off | "Continue as a member" into the after-show | `MemberHandoff.vue` | Both | Finding 11 | Built | Yes |
| Schedule and reminders | Coming up live, from each show's slot; browser reminders | `LiveView.vue`, `useReminders.ts`, `ReminderButton.vue` | Both | Finding 11 | Built (notifications only while a tab is open) | Yes |
| Video above chat on phones | Both fit the screen | `LiveView.vue` | Both | Finding 11 | Built | Yes |
| Live chat | Their kept chat, mocked: tiers, staff, replies, likes | `LiveChat.vue`, `src/data/chat.ts` | Both | Finding 11 (kept) | Partial (a mock; nothing is sent) | Yes |
| Comments and reading list | The live show's discussion and sources | `CommentSection.vue`, `ReadingList.vue` | Both | Finding 4, proposal | Built | Yes |

## Episodes

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| One player for every stream | Rumble, Odysee, BitChute and Stoa; only the platforms an episode is on; never goes black | `SourcePlayer.vue`, `src/data/streams.ts` | Both | Finding 1 | Built (real embeds untested) | Yes |
| Stoa player controls | Their style: progress, volume, quality, speed, full screen | `VodPlayer.vue` | Both | Proposal: Nick's idea | Built | Yes |
| Player sized to the screen | Player and chat always fit on screen | `src/assets/main.css` (`--player-max-w`) | Both | Proposal: Nick's idea | Built | Yes (with the player) |
| Locked episodes | Blurred art, Upgrade, or buy this one | `WatchView.vue` | Both | Topic 3 | Built | Yes |
| Buy a single episode | £1.89, kept on the account; the server unlocks that one | `BuyEpisodeDialog.vue`, `usePurchases.ts`, `AccountController.php` | Both | Kept (their site) | Built (no payment taken) | Yes |
| Chat replay | The live chat beside the recording | `LiveChat.vue` | Both | Finding 11 | Built | Yes |
| Chat replay synced with the player | Seek, pause and speed move both ways; can be unsynced | `usePlayerClock.ts`, `LiveChat.vue` | Both | Proposal: Nick's idea | Built | Yes |
| Comments | Votes, sorting, replies; open or members only | `CommentSection.vue`, `DiscussionController.php` | Both | Proposal (votes); kept (comments) | Built | Yes |
| Open and members' spaces | Free accounts post in casual spaces only | `config/stoa.php`, `ThreadPolicy.php` | Both | Proposal: Nick's idea | Built | Yes |
| Reading list | Sources in one shape, with when they came up | `ReadingList.vue` | Both | Finding 4 | Built | Yes |
| The members' gate | Members' discussion and lists behind a blurred gate; the server sends a count | `MembersGate.vue`, `Discussions.php` | Both | Proposal: Nick's idea | Built | Yes |
| Watch progress and Up next | Progress saved; the next part plays after a countdown | `WatchView.vue`, `useWatchProgress.ts`, `usePlayback.ts` | Both | Finding 10, Finding 12 | Built | Yes |

## Series

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Series page | Every part in order, with total running time | `SeriesView.vue` | Both | Finding 10 | Built | Yes |
| Play in order | The queue beside the player, autoplay of the next part | `SeriesQueue.vue`, `WatchView.vue` | Both | Finding 10 | Built | Yes |

## Shows

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Shows page, for members | Continue watching, trending and latest for members; shows to try for others | `ShowsView.vue` | Both | Proposal: Nick's idea | Built | Yes |
| Show archive | Every episode, 50 a page; newest, oldest or most watched by period; by access and contributor | `ShowView.vue`, `FilterChips.vue`, `PageNav.vue` | Both | Finding 3 | Built | Yes |
| Schedule line | When each show airs, from its slot | `ShowView.vue`, `src/utils/schedule.ts` | Both | Finding 11 | Built | Partly (live page) |

## Contributors

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Contributors page | Everyone who presents or writes | `ContributorsView.vue` | Both | Kept (their site), upgraded | Built | Yes |
| Profile pages | Bio, shows, series, articles, every episode | `ContributorView.vue` | Both | Kept (their site), upgraded | Built | Yes |
| Name links | Every name links to its profile | `ContributorNames.vue` | Both | Kept, upgraded | Built | Yes (with profiles) |

## Articles

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Articles index | Newest, trending, popular by period and controversial; categories; a lead piece | `ArticlesView.vue` | Both | Proposal: Nick's idea | Built | Yes |
| Article page | The piece, its sources, an episode to watch next, more from the writer | `ArticleView.vue` | Both | Finding 4 | Built | Yes |
| Comments under articles | Open to every account, with votes and sorting | `CommentSection.vue` | Both | Kept (their site) | Built | Yes |
| Reading lists on articles | Every article ends with its sources | `ReadingList.vue` | Both | Proposal: Nick's idea | Built | Yes |

## Courses

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Courses inside the site | Their course shop's format and prices, a page per course | `CoursesView.vue`, `CourseView.vue`, `src/data/courses.ts` | Both | Proposal (courses site) | Built (no checkout) | Yes |
| The Philosophy Circle | A free membership on your account, with forums | `CourseView.vue`, `useCommunity.ts` | Both | Proposal (courses site) | Built | Yes |
| Forums | General discussion open to all accounts; topic forums members only; more planned | `CourseView.vue`, `DiscussionController.php` | Both | Proposal (courses site) | Partial (start a topic; no replies) | Yes |

## Shop

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| One shop inside the site | Their stores' product format and prices, with a region switch | `ShopView.vue`, `src/data/shop.ts` | Both | Proposal (separate merch store) | Built (no checkout) | Yes |

## Account

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Account page | Membership, communities, bought episodes, watch history, reminders, newsletter | `AccountView.vue` | Both | Proposal: Nick's idea | Built (billing and passwords are placeholders) | Yes |

## Members' page

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Premium Preview, revived | Free previews of members' shows | `JoinView.vue` | Both | Site history | Built | Yes |
| What free gets | A comparison of free and each tier | `JoinView.vue`, `src/data/membership.ts` | Both | Topic 3 | Built | Yes |
| Their real tiers | Bronze £5, Silver £10, Gold £30 a month | `JoinView.vue` | Both | Kept (premium page) | Built | Yes |
| 7-day free trial | Bronze and Silver only | `JoinView.vue` | Both | Benchmark (proposal) | Built (no checkout) | Yes |

## Search

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Search as you type | Over any page, grouped results, typo-tolerant, keyboard throughout, in the address | `SearchOverlay.vue`, `SearchPanel.vue`, `useSearch.ts` | Both | Finding 9 | Built | Yes |
| In-browser engine | MiniSearch over `search-docs.json` | `src/api/search.ts` | Static | Finding 9 | Built | Yes (with search) |

## Intro

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| The stoa intro | First visit only: the view down a stoa to a wax seal, broken to enter; Skip intro; Replay intro in the demo panel | `StoaIntro.vue`, `useIntro.ts` | Both | Proposal: Nick's idea | Built | Yes |

## Pitch mode

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Labels | A pill on each improvement: fix, proposal or kept | `PitchNote.vue`, `src/data/pitchNotes.ts` | Both | The pitch | Built | Not applicable |
| Detail panel | Their site today, and this prototype | `PitchNoteDrawer.vue` | Both | The pitch | Built | Not applicable |
| Index | Every note, with a link to where it appears | `PitchView.vue` (`/pitch`) | Both | The pitch | Built | Not applicable |

## Demo panel

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Viewing as | Signed out, free, member or staff; in Laravel, a seeded demo account | `DemoControls.vue`, `useViewer.ts` | Both | Demo only | Built | Not applicable |
| Live phase, finish episode, watch progress, pitch mode, replay intro | Reach every state in a pitch | `DemoControls.vue` | Both | Demo only | Built | Not applicable |
| Mode line | Says which version is running and where access is checked | `DemoControls.vue` | Both | Demo only | Built | Not applicable |

## Laravel API

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Source of truth | The catalogue in a database; every answer from one class | `backend/app/Catalogue/Catalogue.php`, migrations, seeder | Laravel | Consolidation | Built (SQLite; MySQL in production) | Yes (one source) |
| Read API | Reference, home, episodes, articles, trending | `CatalogueController.php`, `routes/api.php` | Laravel | Scale (Finding 3) | Built | No (behind the scenes) |
| Access control | Policies; non-members get counts and no stream links | `ThreadPolicy.php`, `EpisodePolicy.php`, `Discussions.php` | Laravel | Proposal: Nick's idea (members' gate) | Built, 12 tests | Yes (members' gate) |
| Saved activity | Comments, votes, purchases, communities, forum topics | `DiscussionController.php`, `AccountController.php` | Laravel | Proposal: Nick's idea | Built | Partly |
| Demo sign-in | Seeded accounts, no passwords, development only | `AccountController.php`, Sanctum | Laravel | Demo only | Built | Not applicable |
| Static export | Writes the static preview from the same classes | `ExportStatic.php` (`stoa:export`) | Laravel | Hosting on GitHub Pages | Built | No (behind the scenes) |

## Content desk

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| The desk | Every episode's link on each platform; totals, filters, latest syncs, Re-sync | `DeskView.vue`, `backend/app/Desk/Desk.php`, `DeskController.php` | Both (static replays a recorded sync) | Consolidation | Built | Yes |
| Staff viewer | Staff see what members see, plus the desk | `useViewer.ts` | Both | Consolidation | Built | Yes (with the desk) |

## Platform sync

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Adapters | One per platform, each reading its own feed format | `backend/app/Sources/` | Laravel | Consolidation | Partial (sample feeds; live feeds to verify) | Yes (one source) |
| Matcher | Links an upload to its episode by time and normalised title | `EpisodeMatcher.php` | Laravel | Consolidation | Built, tested | Yes (one source) |
| Sync job | Hourly; on demand from the desk; every run recorded | `SyncPlatform.php`, `stoa:sync`, `routes/console.php` | Laravel | Consolidation | Built (needs a queue worker in production) | Yes (one source) |

## Search server

| Feature | What it does | Where | Version | Answers | Status | Note |
|---|---|---|---|---|---|---|
| Scout and Meilisearch | Five indexes; typo-tolerant; every word required; newer first on ties | `SiteSearch.php`, `config/scout.php`, `compose.yaml` | Laravel | Finding 9 | Built, 4 tests | Yes (with search) |
| Index rebuild | From the database; a fresh seed runs it | `IndexSearch.php` (`stoa:index`) | Laravel | Finding 9 | Built | Not applicable |

## Out of scope

Decided against, or outside the prototype:
- **Real payments.** No checkout, no card details, no real purchases; "Buy" and "Join" take no payment.
- **Real accounts.** No passwords, sign-up or password reset; the demo panel switches viewers.
- **Client branding.** No logos, names or footage until the proposal is accepted (BRANDING.md).
- **Real platform connections.** The sync reads sample feeds; live feeds come after the pitch (CONSOLIDATION.md).
- **A live chat server.** The chat is a mock; their own chat is kept as it is.
- **Forum replies and moderation.** Topics can be started; threads and moderation are not built.
- **Hosting the Laravel version.** To decide after testing it locally.

## Planned for week 6

- **Deployment** of the static preview to GitHub Pages (needs the repository name and a small router change).
- **The installable app (PWA)**, with `vite-plugin-pwa` (approved): installable, works offline for visited pages.
- **Web Push reminders**, which need the PWA's service worker.

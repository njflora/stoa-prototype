# Architecture

A map of the Stoa prototype: what lives where, how data moves, and what would change for a real backend. Line numbers were correct on 20 October 2026.

Stack: Vue 3 with `<script setup>`, TypeScript, Vite, Tailwind CSS v4 and Vue Router. One runtime package beyond Vue: MiniSearch, for search.

## The big picture

```
scripts/data/generate.mjs ──writes──▶ public/data/*.json   (the "API": static files)
scripts/media/fetch_media.py ──writes──▶ public/media/*  +  src/data/media.generated.json  +  CREDITS.md

Browser:
main.ts ──▶ loadReference() ──▶ shows, hosts, series, live event (once)
        ──▶ App.vue ──▶ header, <RouterView>, footer, tab bar, demo panel, search overlay, pitch drawer

A view (page) ──▶ useQuery(...) ──▶ src/api/catalogue.ts ──▶ src/api/client.ts ──▶ fetch public/data/...
          └──▶ composables (viewer, progress, votes, pitch mode...) ──▶ localStorage via storage.ts
```

There is no server. The "API" is a folder of JSON files laid out the way a paged API would answer. Everything a visitor does (switching viewer, watch progress, purchases) is kept in their own browser.

## Folder by folder

| Folder | What lives there | Why |
|---|---|---|
| `src/main.ts` | Fonts, CSS, then `loadReference()` before mounting the app (lines 17 to 24) | Show names, hosts and series are needed on almost every page, so they load once, up front |
| `src/App.vue` | The page shell: header, the routed page, footer, tab bar, demo panel, search overlay, pitch drawer | Everything that appears on every page |
| `src/router/` | Every route, page titles and scroll behaviour | One place to see the whole site's map |
| `src/views/` | One component per page (`HomeView`, `LiveView`, `WatchView` and so on) | A view fetches data and arranges components |
| `src/components/` | Reusable pieces: cards, rows, the player, chat, comments, dialogs | Shared by several views |
| `src/composables/` | Shared logic and state, named `useSomething` | State that several components read, and browser storage |
| `src/api/` | `client.ts` (fetch with a cache), `catalogue.ts` (paged episode and article functions), `search.ts` | The only code that knows where data comes from |
| `src/data/` | Small hand-written data and lookups: pitch notes, chat, comments, reading lists, courses, shop, membership, media | Data that does not need paging |
| `src/types/content.ts` | TypeScript shapes for shows, episodes, hosts, articles | One definition of each shape, used everywhere |
| `src/utils/` | Formatting (dates, counts, prices), seeded randomness, search highlighting | Small pure functions with no Vue in them |
| `src/assets/main.css` | Tailwind import, colour tokens, the tab bar height variable | The design tokens live in one place |
| `scripts/data/` | `generate.mjs` builds the catalogue; `articles.mjs` holds the hand-written articles | Real-scale data without a database |
| `scripts/media/` | `fetch_media.py` and `sources.json`: licence check and image conversion | Only public-domain or CC0 media can get in |
| `public/data/` | Generated JSON: about 10 MB, 755 files | Served as-is, so it works on GitHub Pages |
| `public/media/` | WebP images and the CC0 hero video | Served as-is |

## How data flows

### 1. Generation (once, on a developer's machine)

`node scripts/data/generate.mjs` builds the whole catalogue and writes `public/data`. It is seeded, so the same day gives the same catalogue.

- Shows, hosts and the live event: `scripts/data/generate.mjs` lines 91 to 124.
- Episodes for each show: lines 229 to 358. The Stoa Podcast runs #1 to #1530, Morning Brief has three items every weekday, and the members' shows are weekly.
- Titles come from "decks" of topics that never repeat within a show (`deck()`, line 50).
- Line-ups rotate with their own random sequence (`lineup()`, line 109), so changing them never moves anything else.
- Pages are written by `writePages()` (line 446) and the popular lists by `writePopular()` (line 455).
- Every combination of show, access and contributor is written ahead of time (lines 468 to 488). A real API would run a query instead.
- Articles, trending, the homepage file and the search documents follow (lines 490 to 600).

### 2. The static API (`public/data`)

| File or folder | What it answers |
|---|---|
| `meta.json`, `shows.json`, `hosts.json`, `series.json`, `live.json` | Reference data, loaded once at start-up |
| `home.json` | Everything the homepage shows first, in one request |
| `episodes/<show>/<page>.json` | 50 episodes, newest first |
| `episodes/<show>/free/…`, `…/members/…` | The same, filtered by access (only shows that mix both) |
| `episodes/<show>/…/host-<id>/…` | The same, filtered by contributor |
| `episodes/<show>/…/popular/<period>.json` | The 50 most-watched in a week, month, year or all time |
| `episodes/by-host/<id>/<page>.json` | One contributor's episodes across every show |
| `trending.json` | The most-watched episodes of the last 7 days |
| `articles/pages/<category or author>/…` | Article lists, including popular and controversial |
| `articles/<id>.json` | One full article |
| `search-docs.json` | Everything search needs, with short keys to keep it small |

### 3. The API layer (`src/api`)

- `client.ts` line 12, `getJson(path)`: fetches a file once per visit and shares the promise, so two components asking at once make one request. A failed request is forgotten (line 20), so "Try again" really retries.
- `catalogue.ts` is the only place pages get episodes and articles. Each function names the Laravel endpoint it stands in for:
  - `loadReference()` (line 82): reference data, and the date shift that keeps the demo current (lines 63 to 71).
  - `getHome()` (line 103), `listEpisodes()` (line 178), `listEpisodesByHost()` (line 207), `getTrending()` (line 213).
  - `getEpisode(id)` (line 223) works out which page holds an episode from its id, with no lookup table.
  - `listArticles()` (line 125) and `getArticle()` (line 141).
- `search.ts`: builds a MiniSearch index in the browser the first time someone searches (line 81), then answers `search(query)` (line 136).

### 4. Composables

`useQuery` (`src/composables/useQuery.ts`) turns any of the API functions into reactive `data`, `loading` and `error` for a template. It re-runs when its input changes, and ignores answers that arrive late (lines 22 to 34).

### 5. Views and components

A view decides what to fetch and arranges components. Components receive data through props and report back through events. For example, `WatchView.vue` fetches the episode (line 39), then hands it to `ReadingList`, `CommentSection` and `EpisodeCard`.

## Routing

All routes are in `src/router/index.ts`. Every page except the homepage is loaded on demand, so the first visit downloads less.

| Route | View | Notes |
|---|---|---|
| `/` | `HomeView` | Loaded up front |
| `/live` | `LiveView` | The live show, all five phases |
| `/watch/:id` | `WatchView` | One episode. `?series=` adds the series queue |
| `/series/:slug` | `SeriesView` | A multi-part series |
| `/shows` | `ShowsView` | Every show; different first rows for members |
| `/shows/:id` | `ShowView` | One show's archive. `?page=`, `?sort=`, `?period=`, `?access=`, `?host=` |
| `/articles` | `ArticlesView` | `?category=`, `?sort=`, `?period=`, `?page=` |
| `/articles/:id` | `ArticleView` | One article |
| `/courses`, `/courses/:id` | `CoursesView`, `CourseView` | Courses and the Philosophy Circle |
| `/contributors`, `/contributors/:id` | `ContributorsView`, `ContributorView` | Profiles |
| `/join` | `JoinView` | The members' preview and plans |
| `/shop` | `ShopView` | Merch |
| `/account` | `AccountView` | Built from the demo's state |
| `/contact` | `ContactView` | Placeholder addresses |
| `/pitch` | `PitchView` | Every pitch note |
| `/credits` | `CreditsView` | Media credits |
| `/sign-in` | `PlaceholderView` | No real accounts |
| `/search` | (redirect) | Old links open the search overlay on the homepage |
| anything else | `PlaceholderView` | "Page not found" |

Search is not a route. It is an overlay that opens on any page, controlled by `?search=` in the address (`src/composables/useSearchOverlay.ts`).

Scroll behaviour (lines 149 to 156): Back returns to where you were, a new page starts at the top, and a change on the same page (a filter, opening search) keeps your place.

## State: what is stored and who owns it

Most shared state is a `ref` declared at the top of a composable file, outside the function. Every component that calls the composable gets the same `ref`. `src/composables/storage.ts` wraps `localStorage` so a blocked or private browser falls back to defaults instead of breaking.

| What | Browser key | Owner | Kept after reload? |
|---|---|---|---|
| Viewer type and live phase | `stoa-demo` | `useViewer.ts` | Yes |
| Watch progress | `stoa-progress` | `useWatchProgress.ts` | Yes |
| Live reminders | `stoa-reminders` | `useReminders.ts` | Yes |
| Pitch mode on or off | `stoa-pitch` | `usePitchMode.ts` | Yes |
| Autoplay next part | `stoa-autoplay` | `usePlayback.ts` | Yes |
| Bought episodes | `stoa-purchases` | `usePurchases.ts` | Yes |
| Joined communities | `stoa-communities` | `useCommunity.ts` | Yes |
| Shop region | `stoa-shop-region` | `ShopView.vue` | Yes |
| Likes and dislikes | none | `useVotes.ts`, one per comment section or chat | No, page only |
| Posted comments and forum threads | none | `CommentSection.vue`, `CourseView.vue` | No, page only |
| Preview sound on or off | none | `usePreview.ts` (`previewMuted`) | No, page only |

## Pitch mode

- **Notes:** each improvement has a note in `src/data/pitchNotes.ts`. A note has a kind: `fix` (answers a finding), `proposal` (not offered today) or `kept` (already on their site).
- **The label:** `<PitchNote id="...">` (`src/components/PitchNote.vue`) renders a small pill only when pitch mode is on, so it never changes the layout.
- **The detail:** clicking the pill opens `PitchNoteDrawer.vue`, which shows "On the real site today" and "In this prototype".
- **Switching it on and off:** `usePitchMode.ts` keeps it on or off. `?pitch=1` in any link turns it on (line 18).
- **The index:** `/pitch` lists every note with a link to where it appears.

## The media pipeline

1. `scripts/media/sources.json` lists each Wikimedia Commons file and what it illustrates.
2. `python scripts/media/fetch_media.py` asks the Commons API for each file's licence and refuses anything that is not "Public domain" or "CC0" (`ALLOWED`, line 31; check at lines 91 to 93).
3. It downloads the resized copies and saves two WebP files per image: 1280 px for heroes and 640 px for cards (lines 146 to 161). No metadata is written.
4. It writes `src/data/media.generated.json` and `CREDITS.md` (line 168).
5. `src/data/media.ts` reads the manifest and picks art for each show, series and episode. `artForEpisode()` (line 57) uses the episode id as a seed, so an episode always gets the same painting.

## The demo panel

`src/components/DemoControls.vue` is not part of the design. It lets a pitch show every state:
- viewer type: signed out, free account or member
- live phase: upcoming, live, break, members or ended
- "Finish episode", which stands in for a real video ending
- pitch mode on or off
- clearing and restoring watch progress

It changes the same state the real site would get from a login and a schedule, through `useViewer.ts` and friends.

## Connecting a real backend

| Today | With a real backend | Where |
|---|---|---|
| Static JSON in `public/data` | A Laravel API with the same response shapes | Change `API_BASE` in `src/api/client.ts` line 6. The functions in `src/api/catalogue.ts` keep their names |
| Every filter combination pre-built | One query per request (`?show=&access=&host=&sort=&period=&page=`) | `listEpisodes()` becomes a single fetch with query parameters; the "oldest first" page joining (lines 193 to 203) goes away |
| Dates shifted forward in the browser | Real dates | Remove `shiftDate()` and `normalise()` in `src/api/catalogue.ts` |
| Search index built in the browser | Laravel Scout with Meilisearch, or similar | Replace the inside of `search()` in `src/api/search.ts`; `SearchPanel` only sees `SearchResults` |
| Viewer type from the demo panel | A real login and the member's tier | `useViewer.ts`: `user` and `isMember` come from the session |
| Watch progress, purchases, communities in `localStorage` | Saved to the account | The composables keep their functions; their insides call the API |
| Votes and comments in the page only | Saved to the server, with moderation | `useVotes.ts`, `CommentSection.vue`, `src/data/episodeExtras.ts` |
| Placeholder comments, chat and reading lists | Real ones | `src/data/episodeExtras.ts`, `chat.ts`, `readingLists.ts` |
| Placeholder video | Their player, or Rumble and Odysee embeds | `LivePlayer.vue` already loads real embeds from `.env.local`; `WatchView.vue` line 137 is where an episode player would go |
| Notifications only while a tab is open | Web Push with a service worker | `useReminders.ts`; belongs with the PWA work |
| "Buy this episode" records an id | A real checkout and entitlement | `usePurchases.ts` and `BuyEpisodeDialog.vue` |
| Members' comments sent, then blurred | The server sends only a count to non-members | `MembersGate.vue` usage in `CommentSection.vue` and `ReadingList.vue` |

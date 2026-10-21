# Architecture

A map of the Stoa prototype: what lives where, how data moves, and who is allowed to see what. Rewritten on 21 October 2026, after the Laravel work. It names files and functions rather than line numbers, so it stays true as code moves: search for the name.

**Stack.**
- **Site:** Vue 3 (`<script setup>`), TypeScript, Vite, Tailwind CSS v4 and Vue Router. In the browser it also uses MiniSearch (search in the static preview), Workbox through `vite-plugin-pwa` (the installable app) and two font packages.
- **Server:** Laravel 13 on PHP 8.4, with Sanctum (sign-in), Scout (search) and Meilisearch. It runs in Docker, with SQLite as the database. Production would use MySQL.

## The big picture

```
scripts/data/generate.mjs ─writes─▶ backend/database/seed/*.json        the invented catalogue, comments, sources
                          ─writes─▶ backend/tests/fixtures/feeds/*      sample platform feeds, for the sync
                                         │
                     php artisan migrate:fresh --seed  (then stoa:index for search)
                                         ▼
                     Laravel (SQLite): THE source of truth
                     ├── /api/...                live API: answers depend on who is signed in
                     ├── stoa:sync               links each episode's platform uploads
                     └── php artisan stoa:export ─▶ public/data/*.json   the static preview

The site (Vue):  npm run dev:laravel → VITE_API_MODE=laravel → /api (Vite passes it to Laravel)
                 npm run dev         → static preview        → public/data (works on GitHub Pages)
```

Laravel is the only producer of the site's data. The API and the static export call the same PHP classes, so the two cannot drift apart. The generator only invents the catalogue; on the real site, the platform sync would fill the database instead.

## Running it

| Version | Commands | Notes |
|---|---|---|
| Static preview | `npm run dev` | Reads `public/data`. Everything a visitor does is saved in their browser |
| Laravel version | `cd backend`, `docker compose up -d app`, then `npm run dev:laravel` in the project folder | Starts the API on port 8000 and Meilisearch on 7700. Sign-in, access and saving are real |
| Pages build | `npm run build:pages`, then `npm run preview:pages` | The static preview as GitHub Pages serves it: under `/stoa-prototype/`, with the service worker. `npm run dev` never registers it |

Both versions offer the same features (a design decision). The static preview checks access in the page; the Laravel version checks it on the server. The demo panel says which version is running, and the static preview has a slim banner saying so.

## Folder by folder

### The site

| Folder | What lives there |
|---|---|
| `src/main.ts` | Fonts and CSS, then the reference data (and, in Laravel mode, who is signed in) before the app mounts |
| `src/App.vue` | The page shell: preview banner, header, the routed page, footer, tab bar, demo panel, search overlay, pitch drawer, intro |
| `src/router/` | Every route, page titles and scroll behaviour |
| `src/views/` | One component per page |
| `src/components/` | Reusable pieces: cards, rows, the players, chat, comments, dialogs |
| `src/composables/` | Shared logic and state, named `useSomething` |
| `src/api/` | The only code that knows where data comes from (see below) |
| `src/config/brand.ts` | The site's identity: name, wording, player name. See BRANDING.md |
| `src/data/` | Small hand-written data: pitch notes, chat, courses, shop, membership, media, platform labels |
| `src/types/content.ts` | TypeScript shapes for shows, episodes, hosts, articles |
| `src/utils/` | Formatting, seeded randomness, search highlighting |
| `src/assets/main.css` | Tailwind, the colour and font tokens, layout variables |
| `scripts/data/` | The generator: `generate.mjs` (catalogue), `articles.mjs`, `extras.mjs` (comments and reading lists), `sources.mjs` (platform links and sample feeds) |
| `scripts/media/` | `fetch_media.py`: licence check, image conversion, the demo video's sizes |
| `scripts/icons/` | `make_icons.py`: the installable app's icons, drawn from the wordmark |
| `public/data/` | The static preview, written by `stoa:export`: about 31 MB, 1,122 files |
| `public/media/` | WebP images and the CC0 video in 480p, 360p and 240p |
| `.github/` | The deploy and checks workflows, and Dependabot's settings |

### The server (`backend/`)

| Folder | What lives there |
|---|---|
| `compose.yaml` | The `app` (PHP), `composer` and `meilisearch` services |
| `database/migrations/` | The catalogue, accounts and discussion, platform sources, sync runs |
| `database/seed/` | The generator's output |
| `database/seeders/DatabaseSeeder.php` | Loads the seed files, creates the demo accounts, records the last sync, rebuilds the search index |
| `app/Models/` | One model per table |
| `app/Catalogue/Catalogue.php` | Every catalogue answer the site reads: reference data, home, episode pages, articles, search documents |
| `app/Discussion/` | `Thread` (open or members only) and `Discussions` (comments and reading lists, as one person may see them) |
| `app/Policies/` | `ThreadPolicy` (read and post) and `EpisodePolicy` (watch) |
| `app/Sources/` | One adapter per platform, and `EpisodeMatcher` |
| `app/Jobs/SyncPlatform.php` | The platform sync |
| `app/Desk/Desk.php` | The content desk's answers |
| `app/Search/SiteSearch.php` | Search with Scout and Meilisearch |
| `app/Http/Controllers/` | Thin controllers: each hands a request to one of the classes above |
| `app/Http/Middleware/SecurityHeaders.php` | Security headers on every response |
| `app/Console/Commands/` | `stoa:export`, `stoa:sync`, `stoa:index` |
| `config/stoa.php` | Who may post where, the communities, the export folder, the sample feeds |
| `tests/Feature/` | 29 tests: access, the sync and desk, search, security, and the app as it runs in production. With `tests/Unit/`, 30 in all |

## The data

### Generation

`node scripts/data/generate.mjs` invents the catalogue at the real site's scale: 5,521 episodes, 12 articles, 31,363 comments, 20,346 reading-list sources and 16,563 platform links. It is seeded and dated to a fixed day (20 October 2026), so every run gives the same data. Each thread's size follows its episode's popularity, and every card's comment count is the real size of its thread.

### Laravel's API

| Route | Who | Answers |
|---|---|---|
| `GET /api/reference` | Anyone | Shows (with counts), hosts, series, the live event, metadata |
| `GET /api/home`, `/api/trending` | Anyone | The homepage in one request; the week's most watched |
| `GET /api/episodes?show=&access=&host=&sort=&period=&page=` | Anyone | 50 at a time, by real queries |
| `GET /api/episodes/{id}` | Anyone | One episode card |
| `GET /api/episodes/{id}/play` | Depends | Where to watch it, or `{ locked: true }` and nothing else |
| `GET /api/articles?…`, `/api/articles/{id}` | Anyone | Article lists and one article |
| `GET /api/threads/{type}/{id}` | Depends | Comments, or `{ locked: true, count }` for a non-member |
| `GET /api/reading-lists/{type}/{id}` | Depends | Sources, or `{ locked: true, count }` |
| `GET /api/search?q=` | Anyone | Search results, grouped, with counts |
| `GET /api/me` | Anyone | Who is signed in, their purchases and communities |
| `POST /api/threads/{type}/{id}/comments`, `/api/comments/{id}/vote` | Signed in, and allowed | Post and vote |
| `POST /api/purchases`, `/api/communities/{id}` | Signed in | Buy an episode; join or leave a community |
| `GET`, `POST /api/forums/{community}/{forum}/topics` | Depends | Forum topics |
| `GET /api/desk`, `POST /api/desk/sync` | Staff | The content desk; sync now |
| `POST /api/demo/login {as}` | Development only | Signs in as a seeded demo account, with no password |

Sign-in is a session cookie (Sanctum's SPA mode), with CSRF protection on every change. Guests get a 401, never a server error.

### The static export

`php artisan stoa:export` writes every answer the API can give, as files, by calling the same classes. Comments and reading lists are exported as a member sees them, and the page applies the members' gate itself. The content is invented, so nothing private is published.

| File or folder | What it holds |
|---|---|
| `meta.json`, `shows.json`, `hosts.json`, `series.json`, `live.json` | Reference data |
| `home.json`, `trending.json` | As the API |
| `episodes/<show>/…` | Pages for every filter a show page offers, and the popular lists |
| `articles/…` | Article lists and articles |
| `extras/episodes/<show>/<page>.json` | Each archive page's comments, reading lists and sources, together |
| `extras/articles/`, `extras/live/` | Articles' and the live show's discussion |
| `desk/…` | The content desk's pages, and a recorded re-sync with its pages afterwards |
| `search-docs.json` | What the browser search indexes |

### The site's API layer (`src/api`)

| File | What it does |
|---|---|
| `client.ts` | The mode (`API_MODE`), cached reads (`getJson`), fresh reads for personal data (`getFresh`), and changes with the CSRF token (`send`) |
| `catalogue.ts` | Reference data, home, episode pages, articles. `shiftDate()` moves the snapshot's dates forward by whole weeks, so "today" stays today |
| `discussion.ts` | Threads, reading lists, posts, votes, forum topics, and where to watch. In the static preview, posts, votes and topics are saved in the browser |
| `account.ts` | Who is signed in, demo sign-in, purchases, communities (Laravel mode) |
| `desk.ts` | The content desk |
| `search.ts` | Search: the server in Laravel mode, MiniSearch in the browser otherwise |

`useQuery` turns any of these into `data`, `loading` and `error` for a template, re-runs when its input changes, and ignores answers that arrive late.

## Who may see what

The rules live in one file, `backend/config/stoa.php`:
- **Open discussion and reading lists:** The Stoa Podcast and Morning Brief (the free daily shows), the live show, articles, and the Philosophy Circle's General discussion. Anyone reads; any account posts.
- **Members only:** every other show's discussion and reading list, and the Circle's topic forums. Members and staff read and post.
- **Watching:** free episodes and previews are for everyone. Members' episodes are for members, and for a free account that bought that episode.

In the Laravel version, `ThreadPolicy` and `EpisodePolicy` enforce this on the server. A non-member asking for a members' thread gets its count and nothing else; the blurred gate (`MembersGate.vue`) shows neutral placeholder shapes, never real text. 12 feature tests prove it (`tests/Feature/AccessTest.php`).

In the static preview, the same rules run in the page, and the banner says so.

## The players

- **`SourcePlayer.vue`:** one player for every stream, on the live page and episode pages. It offers only the platforms an episode is on, from its sources. Shows that air live (and the live stream) are on Rumble, Odysee and the site's own player; the rest on Rumble, BitChute and the site's own player. Every switch builds a fresh player, so it never goes black (Finding 1). Its size is capped to the screen (`--player-max-w`).
- **`VodPlayer.vue`:** the site's own player, with controls in the reference site's style: progress, play, volume, settings (quality and speed) and full screen. Quality really switches between the demo clip's sizes.
- **`src/data/streams.ts`:** platform labels, and what each source can play. The platform links are invented, so their frames show a placeholder unless a real test embed is set in `.env.local`.
- **`usePlayerClock.ts`:** the site's own player shares its time, pause and speed. The chat replay beside a recording follows it both ways, and "Sync with player" turns that off.

## The platform sync and the content desk

- **Adapters** (`app/Sources`): one per platform, each reading its own feed format: Odysee's claim_search JSON, BitChute's RSS, a Rumble list, the site's storage listing. They read recorded sample feeds (`--fixtures`); the live feeds are not connected yet (see CONSOLIDATION.md).
- **`EpisodeMatcher`:** links an upload to its episode by time (within 12 hours) and title, compared without the platforms' habits. Daily editions match by show and date.
- **`SyncPlatform`:** a queued job, hourly, also run by `stoa:sync` and the desk's Re-sync. Every run is recorded in `ingest_runs`.
- **The desk** (`/desk`, staff only): every episode's link on each platform, totals, filters, the latest syncs, and Re-sync. In the static preview, Re-sync replays a sync the export recorded.

## Search

- **Laravel version:** Laravel Scout with Meilisearch. One index each for episodes, articles, series, shows and contributors, searching title, show, hosts and text. It forgives typos, matches the start of words, requires every word, and puts newer items ahead on equal matches. `stoa:index` rebuilds it; a fresh seed runs it.
- **Static preview:** MiniSearch in the browser over `search-docs.json`, built the first time someone searches.
- Both answer in the same shape, so `SearchPanel.vue` does not know which ran.

## Routing

All routes are in `src/router/index.ts`. Every page except the homepage loads on demand.

| Route | View | Notes |
|---|---|---|
| `/` | `HomeView` | Loaded up front |
| `/live` | `LiveView` | The live show, all five phases |
| `/watch/:id` | `WatchView` | One episode. `?series=` adds the series queue |
| `/series/:slug` | `SeriesView` | A multi-part series |
| `/shows`, `/shows/:id` | `ShowsView`, `ShowView` | The archive: `?page=`, `?sort=`, `?period=`, `?access=`, `?host=` |
| `/articles`, `/articles/:id` | `ArticlesView`, `ArticleView` | `?category=`, `?sort=`, `?period=`, `?page=` |
| `/courses`, `/courses/:id` | `CoursesView`, `CourseView` | Courses and the Philosophy Circle |
| `/contributors`, `/contributors/:id` | `ContributorsView`, `ContributorView` | Profiles |
| `/desk` | `DeskView` | The content desk, for staff. `?filter=`, `?page=` |
| `/join`, `/shop`, `/account`, `/contact`, `/pitch`, `/credits` | | |
| `/sign-in` | `PlaceholderView` | The demo panel switches viewers instead |
| `/terms`, `/privacy`, `/cookies`, `/about`, `/find-us` | `PlaceholderView` | Their footer pages, as placeholders |

Search is not a route: it is an overlay over any page, controlled by `?search=`.

## State in the browser

Shared state is a `ref` declared at the top of a composable file, so every component shares it. `storage.ts` wraps `localStorage`, so a blocked browser falls back to defaults.

| What | Browser key | Owner | Laravel version |
|---|---|---|---|
| Viewer type and live phase | `stoa-demo` | `useViewer.ts` | Viewer: the signed-in account. Phase: browser |
| Seen the intro | `stoa-intro-seen` | `useIntro.ts` | Browser |
| Watch progress | `stoa-progress` | `useWatchProgress.ts` | Browser |
| Live reminders | `stoa-reminders` | `useReminders.ts` | Browser |
| Pitch mode, autoplay, shop region | `stoa-pitch`, `stoa-autoplay`, `stoa-shop-region` | | Browser |
| Bought episodes | `stoa-purchases` | `usePurchases.ts` | The account |
| Joined communities | `stoa-communities` | `useCommunity.ts` | The account |
| Comments posted, votes | `stoa-posts`, `stoa-votes` | `discussion.ts` | The account |
| Forum topics started | `stoa-forum-topics` | `discussion.ts` | The account |
| A re-sync from the desk | `stoa-desk-sync` | `desk.ts` | The database |

## The demo panel

`DemoControls.vue` is not part of the design. It shows which version is running, and lets a pitch reach every state: the viewer (signed out, free, member or staff), the live phase, finishing an episode, pitch mode, the intro, and watch progress. In the Laravel version, choosing a viewer signs in to a seeded demo account.

## Pitch mode, media and branding

- **Pitch mode:** each improvement has a note in `src/data/pitchNotes.ts`, marked `fix`, `proposal` or `kept`. `/pitch` lists them all; `?pitch=1` turns pitch mode on.
- **Media:** `scripts/media/fetch_media.py` refuses anything on Wikimedia Commons that is not public domain or CC0, then writes WebP images, the video sizes, a manifest and CREDITS.md.
- **Branding:** the site's name and wording come from `src/config/brand.ts`, the wordmark from `BrandLogo.vue`, the colours from the theme tokens. BRANDING.md explains how to take on a client's identity.

## Security

The Laravel API limits requests: 300 a minute, 60 searches and 20 changes, per account or address. It sends security headers on every response (`app/Http/Middleware/SecurityHeaders.php`). Each model lists the fields a request may set, so no request can grant a tier or the staff role. Every built page carries a Content Security Policy (`vite.config.ts`): scripts and data come only from the site, and frames only from the three video platforms. SECURITY.md has the full list, what is demo-only, and the checklist for production.

## Deployment and the installable app

- **GitHub Pages.** `npm run build:pages` builds under `/stoa-prototype/`. Every address in the site follows `import.meta.env.BASE_URL`, so the same code runs at `/` in development. Pages has no server rewrites, so the build saves a copy of `index.html` as `404.html`: a refreshed deep link loads the app, and the router shows the page.
- **The workflows.** `.github/workflows/deploy.yml` builds and publishes on every push to main. `.github/workflows/ci.yml` builds the site, runs the Laravel tests and audits the packages on every push and pull request. Each action is pinned to an exact commit, and Dependabot proposes updates.
- **The installable app.** `vite-plugin-pwa` writes the manifest from `brand.ts` and the theme tokens, and builds the service worker. It saves the app shell for offline use, refreshes the data in the background, and keeps images for 30 days. It never saves video or third-party players.
- **In the page.** `UpdatePrompt.vue` registers the service worker and asks before a new version reloads. `InstallApp.vue` offers "Install app", with a Home Screen hint on iPhone. `OfflineNotice.vue` and the player say when there is no connection (`useOnline.ts`).

## Going live: what is still to do

| Today | For real |
|---|---|
| SQLite in Docker | MySQL, and a PHP host set up from SECURITY.md's checklist. GitHub Pages can carry only the static preview |
| Sample platform feeds | The live feeds or APIs of Rumble, Odysee and BitChute, one adapter at a time (CONSOLIDATION.md) |
| The sync run by hand or by `schedule:run` | A queue worker and the scheduler running on the server |
| Demo sign-in, no passwords | Their real accounts and login |
| "Buy this episode" with no payment | A real checkout through the payment providers already in use, and the entitlement it grants |
| The demo clip in three sizes | Their own video hosting, with HLS for adaptive quality |
| Notifications only while a tab is open | Web Push from the Laravel version, to the installable app |
| Invented catalogue, comments and sources | Their real data, through the sync and an import |

# Changelog

All notable changes to this prototype are listed here. Newest first.

## v2, in progress on the `refine` branch

v2 makes the code easier to maintain, better tested and more secure. It adds no new features. `main` and the live preview stay as they are until `refine` is merged.

### 2026-10-22: Linting and formatting for the site

#### Added
- ESLint checks the site and the data scripts (`npm run lint`). It uses the recommended JavaScript, TypeScript and Vue rules, including the TypeScript rules that use type information, such as promises that are never handled.
- Prettier sets one layout for code and docs (`npm run format`, checked by `npm run format:check`): no semicolons, single quotes, lines up to 120 characters. Generated files, the back end and CHANGELOG.md are left out.
- `.git-blame-ignore-revs` lists the reformat commit, so `git blame` and GitHub show who last changed each line's meaning, not its layout.

#### Changed
- The site and docs are formatted with Prettier. Layout only.
- Two click handlers in the demo panel and the search panel are named functions. Prettier's layout drops the semicolon between their two statements, which Vue's template compiler needs.

#### Notes
- The TypeScript and Vue rules are set up directly with typescript-eslint and eslint-plugin-vue. The usual wrapper package depends on a library with a high-severity advisory and no fix yet, which would fail the audit.

### 2026-10-22: Checks run on the refine branch

#### Changed
- The checks workflow (ci.yml) runs on every push to `refine`, as well as to `main` and on pull requests. The deploy workflow still runs only from `main`, so `refine` cannot change the live preview.

## 2026-10-21: A second bug report

### Added
- docs/premium-access-bug.md: a premium episode on the real site plays in full for a signed-out visitor, although the page offers to sell access. It covers the steps, the expected result, two possible causes and how the prototype checks access on the server. The episode is described rather than named, so the gap is not advertised before their team hears of it. The README links to it.

## 2026-10-21: The bug report, tightened

### Changed
- The bug report says where it was reproduced (Chrome on Android and Edge on desktop) and adds the expected result.
- Step 5 no longer claims that no error is shown, which had not been checked.
- The first fix states that their site is built with Vue, which its scripts show, and says hiding the player works only if Rumble's player can be paused while hidden. The opening says we cannot see their source code, since that fix cites their public scripts.

## 2026-10-21: The docs agree with each other

### Changed
- SECURITY.md matches the roadmap. The new features would use the site's existing accounts and payment providers, with Laravel Fortify or Cashier only for anything new.
- SECURITY.md says plainly what the static preview does: it applies the members' gate in the page, but every file can be read.
- ARCHITECTURE.md names what the site loads in the browser beyond Vue: MiniSearch, Workbox for the installable app, and two font packages. Its going-live table names the existing payment providers.
- The README no longer says "nothing to install" just before the option to install the app.
- A roadmap bullet's punctuation is fixed.

## 2026-10-21: PHP security update and the articles note

### Security
- The local Docker setup runs PHP 8.4.27, which fixes the two critical PHP flaws released today (CVE-2026-109618 and CVE-2026-109619). The Composer tool runs PHP 8.5.12. The live site runs no PHP, so it was never affected. The 30 Laravel tests pass on the new version.
- Docker serves the API (port 8000) and Meilisearch (port 7700) to this computer only, not to the rest of the network. A phone on the same network still reaches the site through the Vite dev server.
- The README lists the commands that update PHP and Meilisearch to their latest patched images.

### Changed
- The articles pitch note matches the page: newest, popular (this week, this month or all time) and controversial. It says to choose Popular to pick the period. "Trending" is gone from the note and from SCOPE.md.

## 2026-10-21: Docs brought up to date for reviewers

### Changed
- Working notes are kept out of the public repository, and the docs no longer link to them. Past changelog entries describe those changes without naming the notes.
- Decisions are described neutrally: "a design decision" in the docs and code comments, "New idea" on pitch notes, and "Proposal: new idea" in SCOPE.md.
- The README's opening is reworded. The bug report's note on the phone during the live stream is removed as outdated. SCOPE.md's last section is now "Final Stage", and the automation discussion is removed from the roadmap.
- README: the Node.js versions the site needs (24.12 or later, or 22.18 or later), the real clone address, and 30 server tests.
- ARCHITECTURE.md: new sections on security and on deployment and the installable app, plus the Pages build, the footer pages, the new folders and 30 tests.
- SCOPE.md: the live address, the security work (rate limits, security headers, fillable fields and the Content Security Policy), and no "planned" status left.
- BRANDING.md: the installed app's name, colours and icons, and how to replace the icons.
- The production settings template uses MySQL, as the docs say. The example settings no longer include a local network address.
- The site's package is named stoa-prototype, and the API's Composer package stoa/api.
- Dependabot skips major updates of TypeScript, because vue-tsc cannot run on TypeScript 7 yet, and of @types/node, so the types match the Node 24 build. Minor and patch updates still come.

## 2026-10-21: Security hardening

### Added
- Rate limits on the Laravel API: 300 requests a minute, 60 searches and 20 changes, per account or per address. Over the limit, it answers 429.
- Security headers on every API response: nosniff, a strict referrer policy, no framing, no camera or location, HSTS over HTTPS, and a Content Security Policy that lets nothing load from the API.
- A Content Security Policy in every built page of the site. Scripts, data and media come only from the site itself, and frames only from Rumble, Odysee and BitChute. It was checked across the site with no violations, and a frame from any other site is blocked.
- A test that the password-less demo sign-in does not exist in production. It fails if the route is allowed there.
- A checks workflow on every push and pull request: the site builds, the Laravel tests pass, and npm and Composer report no known security problems. Dependabot proposes updates weekly.
- SECURITY.md: what protects the prototype, what is demo-only, a production checklist, and what real accounts and payments would need. backend/.env.production.example holds safe production settings. The README links to SECURITY.md.

### Changed
- Every model lists the fields a request may set. Tier and staff can no longer be mass-assigned. Outside production, setting any other field is an error, which caught one place in the export: it now sets its stand-in member's tier on purpose.
- Every GitHub Action in both workflows is pinned to an exact commit.
- 30 Laravel tests now, up from 24.

## 2026-10-21: A roadmap

### Added
- ROADMAP.md: what I would do if hired, and when each change would reach the live site. The content overhaul (homepage, the live show on desktop and mobile, episodes, search and the player) goes live by 18 April 2027, with a buffer and a freeze from 12 April. The shop and courses follow in weeks 16 to 21, then the platform consolidation from CONSOLIDATION.md. The README links to it.

## 2026-10-21: A bug report on the real site's player

### Added
- docs/player-bug.md: switching the real site's player from Rumble to Odysee and back leaves it black until a refresh. It covers the steps to reproduce, what the page appears to do, three possible fixes and how the prototype avoids it. A short note records the Rumble player not loading on a phone during the 19 October live stream, cause not yet diagnosed. The README links to it.

## 2026-10-21: Week 6: GitHub Pages and the installable app

### Added
- `npm run build:pages` builds the static preview under /stoa-prototype/ for GitHub Pages. `npm run preview:pages` serves that build locally. Dev and dev:laravel stay at /.
- A copy of index.html is saved as 404.html in the Pages build, so a refreshed deep link opens the right page.
- `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to main.
- The installable app, with vite-plugin-pwa:
  - a manifest with the name from brand.ts and the colours from the theme tokens, scoped to the base path
  - icons drawn from the wordmark: 192, 512 and a maskable 512, plus an Apple touch icon (`scripts/icons/make_icons.py`)
  - the app shell saved for offline use, the data refreshed in the background, and images kept for 30 days; video and third-party players are never saved
  - "You're offline" above a page that was not saved, and in the player
  - "Install app" in the footer and the More sheet, with a Home Screen hint on iPhone, hidden once installed
  - "Update available" with a Reload button, instead of a silent reload
- A pitch note on the installable app. Their site has a basic web manifest and no service worker, and their Android app was last updated on 9 February 2024. The 45 notes are now 19 that answer findings, 19 proposals and 7 kept.
- `.gitattributes`, so line endings stay consistent on Windows.

### Changed
- Web Push reminders move to the Laravel version, since they need a server to send messages (SCOPE.md).
- The README links to the live site and says how to install the app. The documentation for the deployment and the app now explains how each part works.
- The remaining client names outside the disclaimers are reworded through the repository's history.

### Fixed
- Two questions in the project notes had lost their closing bracket and question mark in an earlier clean-up.

## 2026-10-21: No focus ring around the seal on arrival

### Fixed
- On a fresh page load, the browser drew its keyboard focus ring around the intro's seal. The seal still takes focus, so Enter, Space and Escape still work, but the ring is no longer drawn on arrival. It shows as normal once a visitor presses Tab. Safari ignores this setting and may still show the ring.

## 2026-10-21: Reset first visit, in the demo panel

### Added
- A "Reset first visit" button in the demo panel, beside "Replay intro". It forgets that this browser has seen the intro and reloads the page, so the page opens as it would for a new visitor. It works in the static preview and the Laravel version.

## 2026-10-21: The intro plays on any first page again

### Changed
- The stoa intro plays once per visitor again, on whichever page they arrive first. A direct link, such as /live, shows it too. The homepage-only rule is removed. After it has been seen or skipped once, it does not show again on that device. "Replay intro" in the demo panel and ?intro=1 still play it.

## 2026-10-21: The footer matches their site

### Changed
- The footer pitch note is marked kept: their site already has a footer with FAQ, Contact and a newsletter sign-up. The note no longer claims those links are hard to find. The 44 notes are now 19 that answer findings, 18 proposals and 7 kept.
- The footer carries their links, in their order: Terms of Use, Privacy Policy, Cookie Policy, About us, Find Us, Contact and FAQ. Contributors and Pitch notes follow. Three columns on wider screens, two on phones.
- On phones the footer has more space at the bottom, so the Demo button no longer covers the last link.

### Added
- Placeholder pages for the terms, privacy and cookie policies, About us and Find Us. A real build would carry their text over from the current site.

## 2026-10-21: Pushed to a private GitHub repository

### Added
- The project is on GitHub, in a private repository: njflora/stoa-prototype. The main branch is pushed. Nothing is public and nothing is deployed. Local settings, databases and installed packages are not in the repository.

## 2026-10-21: Accessibility notes 5 to 8, checked

### Checked
- Review notes 5 (slideshow pause), 6 (More sheet focus), 7 (chat announcements) and 8 (demo panel tap targets) were fixed earlier today. Each was checked again at 375 px and at desktop width, and each passes.

## 2026-10-21: The README's opening, reworded

### Changed
- The README's opening now says how their content on every platform could be brought together, so it no longer reads as if their real content is in the prototype.

## 2026-10-21: The intro plays only on the homepage

### Changed
- The stoa intro plays only when a visitor lands on the homepage. A direct link to any other page, such as /live?pitch=1, goes straight to that page. It still shows once per device, ?intro=1 still forces it, and "Replay intro" in the demo panel still works.

## 2026-10-21: The account note, corrected

### Changed
- The "One account for everything" note now says their sites appear to be separate today (a site login does not work in the store), and proposes one account, one site and one source of truth.

## 2026-10-21: The shop note, corrected

### Changed
- The "One shop inside the site" note now describes their store as it is: one separate store, styled on its own, apart from the main content site. The proposal is to bring it into the main site with everything else.

## 2026-10-21: Articles on the homepage are kept

### Changed
- The "Articles on the homepage" pitch note is marked kept: their homepage already shows the latest articles. The 44 notes are now 19 that answer findings, 19 proposals and 6 kept.

## 2026-10-21: Loose ends from the review notes

### Changed
- The footer no longer lists Courses and Shop: both are in the top bar, which is almost always on screen.

### Fixed
- An article that fails to load shows "Try again"; only a missing article shows "not found" (note 4).
- The homepage slideshow has a pause and play button (note 5).
- On phones, the More sheet keeps keyboard focus inside it (note 6).
- The live chat no longer reads out every new message to screen readers (note 7).
- Every link and button in the demo panel is at least 24 px tall (note 8).
- The "Preview" chip sits in the corner unless a mute button is there (note 11).
- A series episode from a live show no longer offers a chat replay it cannot show (note 12).
- A stale comment, a duplicated line and a missing field tidied (note 13).
- Search finds artwork without building a fake episode (note 16).
- The browser keeps the last 200 data files, not every file ever loaded (note 19).
- `npm run data` and `npm run media` run the scripts (note 21).
- Reminders start openly in `main.ts`, not through a hidden import (note 23).

### Review notes
- Every note is marked addressed or deferred with its reason. Deferred: 14 and 15 (refactors with nothing visible), 17 (static preview only), and the new notes 25 to 29 found while building SCOPE.md.

## 2026-10-21: A README for reviewers

### Changed
- README.md rewritten for a reviewer arriving from the pitch: what Stoa is (an unofficial concept, stated plainly), how to view the static preview (link to come at deployment), how to run the full Laravel version step by step on Windows or Mac, the demo accounts, and where to read more. The steps were tested from an empty database; they include creating the database file, which a fresh copy does not have.

### Checked
- The intro already shows once per visitor, remembered in the browser, with "Skip intro" and "Replay intro" in the demo panel. Confirmed in the browser; no change needed.

## 2026-10-21: A pitch note for every feature

### Added
- Pitch notes for the features that had none, all proposals: the phone tab bar, the footer, articles on the homepage, the site's own player, the chat replay in step with the video, the articles index and the account page. The contributors page shows the profiles note too. All 44 notes are placed: 19 answer findings, 20 are proposals and 5 credit what their site already does.

### Changed
- The intro's note is now "Brand moment (optional)": a proposal, noting that the homepage loads behind it and plays on arrival.
- The show archive's note covers Popular by period and the contributor filter.
- The "today" lines for Findings 3 and 9 quote the planning doc exactly.

## 2026-10-21: The scope, in one place

### Added
- SCOPE.md: every feature, page and backend capability, one table per area, with what it does, where it lives, which version has it, what it answers in the planning doc, its status and whether a pitch note labels it. It ends with what is out of scope and what is planned for week 6.

## 2026-10-21: Answers to the open questions

### Added
- A sign-in page that says plainly the demo has no passwords and that the demo panel is the easier way, with the same choices (free account, member, staff, sign out) for convenience. Nothing is typed or collected.
- Pitch notes: "Contributor profiles, upgraded" and "Comments under articles" (kept: their site has them), and "The Shows page, for members", "The members' gate" and "Reading lists on articles" (proposals).
- The Forum has the live chat replay beside its recordings, like the other shows that air live.

### Changed
- A single members' episode costs £1.89, as on their site, and its pitch note is marked kept.
- Card previews and their mute button are marked as a proposal. The reading-list note now says lists exist on their site, open to all; gating them is the proposal.

### Fixed
- The demo panel could not switch accounts in the Laravel version when the site's dev server landed on a port Laravel did not trust. Any localhost port is trusted in development.

## 2026-10-21: Archive dates across clock changes

### Fixed
- The generator stepped back through the calendar 24 hours at a time, so at each clock change it landed on one day twice. Twice in the archive, two Chronos episodes shared a Sunday, and "Athens and Sparta" had part 2 dated with part 1. It now steps back by calendar days. 44 episodes from before March 2026 moved; nothing newer changed. Every weekly show now has one episode a week.

## 2026-10-21: Documentation for the Laravel version

### Added
- CONSOLIDATION.md: the plan for one source of truth across Rumble, Odysee, BitChute and their own video, in six phases (inventory, the canonical record, ingest and match, backfill, cut over, retire duplicates), each with its risks and how to check it. What each platform's real feed offers is marked "to verify".
- Documentation for the stoa intro; Laravel, the API and access control; and one player, the platform sync and the content desk.
- A README that says what the project is, how to run both versions, and where to read more.

### Changed
- ARCHITECTURE.md rewritten for the Laravel version: the source-of-truth flow, both versions, every API route, who may see what, the players, the sync, search, and what is still to do for real. It names files and functions rather than line numbers.
- The documentation for the shared player and the two versions is brought up to date.
- Review notes 1, 3, 9, 10 and 24 marked as addressed.
- The project notes cover the Laravel stages, four viewer types, and two new questions (hosting the Laravel version, the real platform feeds).

## 2026-10-21: Ready for their brand

### Added
- `src/config/brand.ts` holds the site's identity: its name, description, footer line, the name of its own video player, and the welcome animation's words. The header, footer, page titles, notifications, the player menu, the intro and index.html all read from it.
- `src/components/BrandLogo.vue`, the wordmark in the header and footer, so a logo replaces it in one place.
- BRANDING.md: where the identity lives, and the six steps to take on a client's identity (name, logo, colours, fonts, icons, the server's name). Tested by renaming the brand in `brand.ts` alone: every place followed. No client assets are added.

## 2026-10-21: Search on the server

### Added
- In Laravel mode, search runs on the server: Laravel Scout with Meilisearch, in Docker (the meilisearch service). One index each for episodes, articles, series, shows and contributors, searching title, show, hosts and text, with typos forgiven, the start of words matched, every word required, and newer items ahead on equal matches. GET /api/search answers in the search panel's shape, so the panel is unchanged. Each search takes about a millisecond.
- `php artisan stoa:index` rebuilds the index from the database; a fresh seed runs it.
- When a group holds only the best matches (50 episodes), its heading still says how many matched, and a line says to add a word to narrow it down.
- 4 PHP tests for the search answer (using Scout's in-memory driver, so tests need no search server).

### Changed
- The static preview keeps searching in the browser (MiniSearch), over the same fields.

### Fixed
- Search found a contributor only by the shows they present regularly, so "Gary Forum" missed Gary. Both searches now use every show they appear on (review note 9).
- Search guessed an episode's series from its text, which a topic could fool. Both searches now read the series from the episode's record (review note 10).

## 2026-10-21: The content desk and the platform sync

### Added
- A content desk at /desk, for staff: every episode, newest first, with its link on Rumble, Odysee, BitChute and the site's own player (linked, processing, missing or failed, and when it was last synced). Totals per platform, filters (Needs attention, All, and each platform's problems), pages of 50, the latest syncs, and Re-sync now. A card per episode on phones.
- "Staff" in the demo panel's Viewing as. Staff see everything members see, plus a Desk link in the header and the phone's More sheet.
- The platform sync in Laravel. An adapter per platform reads its feed in that platform's shape (Odysee's claim_search JSON, BitChute's RSS, a Rumble list, the site's own storage listing). EpisodeMatcher links each upload to its episode by time (within 12 hours) and title, compared without the platforms' habits (capitals, "|" or "-", a channel name on the end); daily editions match by show and date. Uploads that are not episodes, such as clips, are counted and listed. Every run is recorded (ingest_runs).
- `php artisan stoa:sync {platform?} --fixtures`, an hourly schedule, and POST /api/desk/sync for staff. The live feeds are not connected: the sync reads recorded sample feeds in backend/tests/fixtures/feeds, written by the generator. Which public feed or API each platform offers is still to verify.
- The desk works in the static preview too. Its Re-sync replays the sync the export ran against the same feeds (then rolled back), saved in this browser, and the episode player picks up the new links.
- 6 PHP tests: title normalising, a missing upload linked and a clip left unmatched, a daily edition matched by date, a second sync linking nothing new, the desk for staff only, and Re-sync from the desk.
- A pitch note: "One source of truth".

### Fixed
- An API request from a signed-out visitor without a JSON header got a server error instead of 401.

## 2026-10-21: The chat replay follows the Stoa player

### Added
- While the site's own player shows a recording, it and the chat replay are synced both ways. The player's seek, pause and speed move the chat; the chat's play button and timeline move the player. Dragged past the end of a short recording, the player waits at its end and the chat stays where it was dragged.
- The chat replay keeps its own bar (play, timeline, time). "Sync with player" turns the sync off, to scan the chat on its own, with 10×, without moving the video. With Rumble, Odysee or BitChute showing (iframes, which cannot share their time), the replay keeps its own clock, as before.
- A few opening messages in the first seconds of every show's chat, as real chats start, so the sync shows within the few seconds of the demo clip.

## 2026-10-21: Quality and speed in the Stoa player

### Added
- A settings button (a cog) in the Stoa player, beside full screen. Speed: 0.25× to 2×, plus Custom, a slider from 0.25× to 3×. The live stream has no speed setting, as it plays in real time. Escape closes the menu and returns focus to the button.
- Quality really switches. The demo clip comes in the sizes Wikimedia Commons publishes (480p, 360p and a new 240p file, 181 KB), and choosing one swaps the file and carries on from the same moment, at the same speed. The menu lists only the sizes the browser can play: 360p is Safari's format, so Chrome and Firefox show Auto, 480p and 240p. With real hosting the sizes would come from an HLS stream, with Auto following the connection.
- scripts/media/fetch_media.py also fetches the 240p file, so a re-run keeps it.

## 2026-10-21: Platforms by whether a show airs live

### Changed
- Shows that air live (The Stoa Podcast, Morning Brief, The Forum) and the live stream play on Rumble, Odysee and the site's own player. Shows that do not (Chronos, Ledger, Statecraft, Conversations) play on Rumble, BitChute and the site's own player (a design decision). Members' episodes are on the platforms too; their links still go only to people who may watch.

### Fixed
- The generator dated the catalogue "today", so running it on a different day shifted every episode by a day. It now uses a fixed day (20 October 2026), so every run gives the same data. The site still moves dates forward by whole weeks.

## 2026-10-21: The player fits the screen, in the reference site's style

### Changed
- The player always fits on screen with its buttons below it, on the live page (with the chat beside it) and on episode pages. Its width is the largest 16:9 that fits the window's height, and the page is centred. On a 1903 by 909 screen it is 1189 by 669, down from 1824 by 1026 on episode pages.
- The source switch is an outlined pink button, "Change player source", as on the reference site. It opens a small menu of the episode's platforms, with any still processing greyed out. Arrow keys move through it and Escape closes it. Share has the same outlined style.
- The site's own video has controls in the site's skin, after the reference site's player: a pink progress bar with a round handle, then pause, volume, a red LIVE dot (or the time) and full screen. They fade while playing and come back on any movement, tap or keyboard focus.

### Fixed
- In the static preview, the live page's chat ran a few pixels off the bottom of the screen, because its height did not allow for the preview banner.

## 2026-10-21: One player for every stream

### Added
- One player for Rumble, Odysee, BitChute and the site's own video on demand (VOD), on the live page and every episode page. It offers only the platforms an episode is on, and shows any still processing greyed out. Every switch builds a fresh player, so it never goes black.
- Every episode's platforms are in the database (episode_sources): 19,814 links. The Stoa Podcast and Morning Brief are on all four platforms; Conversations on Rumble, Odysee and VOD; members' shows on VOD only, with free previews also on Rumble. The newest episodes are still processing on the mirrors, and a few links are missing or failed, ready for the content desk.
- The site's own player really plays: VOD points at the CC0 ocean clip already in the site. The platform links are invented, so their frames show a placeholder unless a real test embed is set in .env.local. BitChute embeds are accepted only from bitchute.com/embed.
- A pitch note: "Every stream, one player" (Finding 1).

### Changed
- Stream links for members' episodes come from /api/episodes/{id}/play, and only for viewers who may watch: a members' episode sends nobody else even the list of platforms. The static preview holds every episode's sources and checks in the page.
- The episode page uses the same player as the live page instead of its own placeholder.

### Fixed
- The intro's pitch note described the old version (a stoa tied with a ribbon). It now describes the view down the colonnade.

## 2026-10-20: Real access control

### Added
- Members-only content never leaves the server for anyone else, in Laravel mode. Someone who may not read a members' discussion or reading list gets its count and nothing more: no text, no names. Someone who may not watch a members' episode gets no stream addresses. The rules are Laravel policies, and one file holds who may post where (backend/config/stoa.php).
- Comments, votes, purchases, joined communities and new forum topics are saved on the account in Laravel mode. Posts show as "You", votes stay pressed after a reload, and a bought episode unlocks for that account only.
- The demo panel's "Viewing as" signs in to one of three seeded accounts (free, member, staff) in Laravel mode, with no password typed. That route exists only in development and tests. Sign-in uses Laravel Sanctum's session cookie, with CSRF protection on every change.
- Every episode, article and the live show has its discussion and reading list in the database: 31,363 comments and 20,346 sources, generated with the catalogue (scripts/data/extras.mjs).
- 12 PHP feature tests prove the rules: a free account gets a count, not comments, on a members' show; a purchase unlocks one episode's streams and no others; a free account cannot post or vote in a members' thread or forum; signed-out visitors cannot post anywhere.

### Changed
- The blurred glimpse behind the members' gate is neutral placeholder shapes, not real comments or sources: there is nothing real to blur.
- Each thread's size follows how much its episode was discussed, and every card's comment count is now the real size of its thread, so the two always agree. Counts are smaller than before (2 to 13 a thread).
- The static preview behaves like the real site (a design decision). It holds every thread and reading list as a member sees them, and applies the members' gate in the page. Comments, votes and new forum threads are saved in the browser, as purchases and communities already were, so a reload keeps them. Its comments are invented, so nothing private is published.
- The demo panel says which version is running. Static: "Saved in this browser. In the Laravel version, the server checks who can see what." Laravel: "Saved on the account, and the server checks who can see what." The panel scrolls on short phone screens.
- The static banner now reads "Preview: saved in this browser, with access checked here rather than on a server."

## 2026-10-20: Laravel, every stream in one player, and the stoa intro

### Added
- Laravel is now the source of truth for the catalogue. A Laravel 13 API lives in backend/ and runs in Docker, so nothing needs installing on the host. The generator writes seed data (backend/database/seed); the seeder loads it into the database (SQLite in development): shows, contributors, series, 5,521 episodes with their credits, articles and the live event.
- A read API in the shapes the site already uses: /api/reference, /api/home, /api/trending, /api/episodes (by show, access, contributor, sort, period and page), /api/episodes/{id}, /api/articles (by category, author, sort, period and page), /api/articles/{id} and /api/search-docs. Bad filters get a clear error; unknown ids get a 404.
- `php artisan stoa:export` writes the static preview to public/data from the same code as the API, so the two cannot drift apart. Its 755 files match the old generator's output, checked file by file.
- Two ways to run the site: `npm run dev` reads the static preview, as before; `npm run dev:laravel` reads the Laravel API through Vite. Both give identical answers, checked across the homepage, show archives, contributors, articles, episodes and search. The static preview says so in a slim line above the header: "Preview: data is a snapshot and access is not enforced."
- "Controversial" articles are an indexed sort. Each article stores its score and the model updates it whenever the votes change.
- A welcome: on the first visit, a full-screen view down a Greek stoa, like standing in the Stoa of Attalos, in a modern, vaporwave style. Seen from low down, looking up: fluted Doric columns tower on both sides, ceiling beams run overhead and a neon grid covers the floor, all leading to the middle of the screen, where a striped sun sets behind a purple wax seal. Above, a strip of night sky with "στοά" in it sits over a slim lintel. Breaking the seal (a real button) cracks it, makes the neon flare, sends the columns rushing past and carries the view down the corridor into the light and into the site, which has been loading behind. About two seconds.
- The intro covers the whole screen, keeps focus inside (the page behind is inert), opens with Enter or Space, skips with "Skip intro" or Escape, and is a short fade with "reduce motion" on. It plays once per device; "Replay intro" in the demo panel or ?intro=1 in any link plays it again. A pitch note: "A welcome". The seal is always in the middle of the screen, and the sky band with the name is pinned to the top, so it is never cut off on wide screens or phones.

### Fixed
- The live page's "Coming up live" contradicted the show pages (The Forum on Thursdays, Statecraft on Fridays). Each show now has one slot (days, hour, and whether it airs live) that drives its episode dates, its schedule line and the live page, so they can never disagree. "Coming up live" lists the shows that air live: The Stoa Podcast, Morning Brief and The Forum, soonest first. Episode data is unchanged.
- Times on the live page use the site's style ("1:00 pm", "Friday 23rd October") instead of "13:00".
- A series listed part 2 of "Athens and Sparta" before part 1, because two Chronos episodes shared a timestamp. Series now list their parts in part order.
- The seal on the intro bears the Delphic E, the old form of the letter carved at Apollo's temple at Delphi, instead of a modern Σ. It is drawn as lines rather than typed, so it looks the same in every font, and the crack runs through its upright.
- The intro's sun showed only one stripe beside the seal. It now has seven vaporwave stripes across its lower half, thin and far apart near the middle and thicker towards the horizon, so they show on both sides of the seal. Its size and position are unchanged.

## 2026-10-20: Preview sound and a shorter credits page

### Added
- Card previews (episode, series and show cards) have a mute and unmute button in the corner while they play, as on YouTube. One setting for every card: unmute once and every preview plays with sound. The demo has no audio, so the button shows the control only. It sits beside the card's link rather than inside it, and moving keyboard focus onto it keeps the preview playing.

### Changed
- The credits page is just its heading and the list: the introductory paragraph is gone.

## 2026-10-20: Trial, single episodes, article comments, who can post

### Added
- Buy a single members' episode for £1.99, kept on the account. A confirmation dialog shows the episode and price and says that no payment is taken in the demo. It follows the dialog pattern: focus moves in, Escape closes, and focus returns. Signed-out visitors are asked to sign in first; members never see the option.
- Comments under every article, with the same votes, sorting (Newest, Top, Controversial) and posting as episodes. They come from a hand-written pool per category. On wide screens the comments sit left, with the sources and "Watch next" on the right.
- Bought episodes unlock everywhere at once, carry an "Owned" badge, and are listed under "Your episodes" on the account page. A pitch note: "Buy a single episode".

### Changed
- Who can post (a design decision): free accounts post, reply and vote in casual spaces, meaning comments on The Stoa Podcast and Morning Brief (and the live show), under articles, and in the Philosophy Circle's General discussion. Members' shows and the Circle's topic forums are members-only. Every comment section and forum says which it is ("Open to all accounts" or "Members only"), and the rule lives in one place (FREE_POSTING_SHOWS in src/data/membership.ts).
- Reading lists on members' shows sit behind the same gate: non-members see a blurred glimpse and "The members' reading list". The free daily shows and articles keep theirs open. This reverses the earlier "reading lists free for everyone" (a design decision); the pitch note says so. Both gates now share one component, MembersGate.
- Members-only discussions feel exclusive: anyone who is not a member sees only a blurred glimpse of the comments (no sorting, no reading, nothing to click), behind a "The members' discussion" card with the comment count and "Become a member". A real site would send only the count; the demo blurs its placeholder comments.
- The Circle's Ethics forum is now open, members-only, so the lock can be seen. "Start a thread" works in any forum you may post in (kept on the page only). A pitch note: "Open spaces and members' spaces".
- Bronze's perk now reads "Comment on members' shows, and post in every forum".
- Locked episode cards open the episode page, which now offers two ways in: "Upgrade to watch everything" or "Buy this episode, £1.99".
- The 7-day free trial is for Bronze and Silver only. Gold's button reads "Join Gold", and the Join page, FAQ, account page and pitch note say which tiers have the trial.

## 2026-10-20: Popular, contributors and members

### Changed
- Line-ups rotate, as on a real show: The Stoa Podcast draws 3 of 5 presenters, The Forum 4 of 6 panellists, Conversations is usually Richard, and Sally covers some Morning Briefs. Ids, titles and dates are unchanged.
- Contributors have profiles: a role, a short invented bio, the shows they appear on, and counts.

### Added
- Data for "Popular": the 50 most-watched episodes per show for this week, month, year and all time, for every access and contributor combination. A real API would run a query; the static demo stores each answer.
- Each contributor's episodes across every show, paged, and a site-wide "trending this week" list.
- Article engagement: views, comments, likes and dislikes, with sorted lists for popular (week, month, all time) and controversial.
- Show pages sort by Popular, with This week, This month, This year or All time. The heading follows ("Most watched this month").
- /contributors and a profile page for each contributor: role, bio, the shows they appear on (each opening that show filtered to them), their series, their articles and every episode they are in, paged.
- Contributor names link to their profiles across the site: episode and article cards, the episode, live, series, article and course pages, and the homepage hero. On cards the names now sit below the main link, since a link cannot sit inside another. Series, show and course cards keep plain names, as each card is a single link.
- Search: a contributor result opens their profile.
- A footer links block: Contributors, FAQ, Contact, Courses, Shop and Pitch notes. FAQ jumps to the questions on the members' page, below the sticky header.
- /contact: placeholder addresses for general, membership and press enquiries. A contact form is not part of this demo.
- The Shows page for members: it leads with Continue watching, Trending this week (across every show) and Latest, then the show grids as "The daily shows" and "Members' shows, all unlocked with your Gold membership". Free and signed-out viewers see it as before.
- Articles sort by Newest, Popular (this week, this month or all time) or Controversial, combined with category and kept in the address. Controversial counts only pieces with at least 100 reactions and comments, and ranks them as comment sections do: many votes, split close to evenly. A line under the chips says so.
- Article cards show views and comments; article pages also show likes and dislikes.
- The Philosophy Circle is now a free membership on your Stoa account, as their real community is free: no lessons, a member and post count, and "Join the Circle" (or "Sign in to join"). Joining is remembered on the device and listed under Communities on the account page.
- The Circle's forums: General discussion is open, with recent threads; Ethics, Political philosophy, Classics reading room and Book club are marked as planned. A pitch note, "Forums for each community", suggests the same model for every show or series. Posting is not part of this demo.
- Show pages filter by contributor. Click a name in the show's header, or use the contributor chips above the list; "View profile" appears beside the active filter. Contributor, access and sort combine, and all of it is kept in the address.

## 2026-10-20: An account page from the demo's real state

### Added
- /account: the tier and monthly price for members (or an Upgrade button with the 7-day trial for free accounts), continue watching with "Clear history", live reminders with a switch to turn each off, the newsletter, and account settings.
- It follows the demo panel: switch viewer, watch something or set a reminder, and the page changes to match.
- Email, password, payment and cancelling say they are not part of this demo. Signed-out visitors are asked to sign in, with a pointer to the Demo button.

## 2026-10-20: One shop inside the site

### Added
- /shop: T-shirts and mugs with designs from the site's public-domain paintings, titled in the reference store's format ("Agincourt | T-Shirt UK").
- A store switch (UK, Europe and Worldwide, USA and Canada) changes titles, prices and currency in place. Prices are the real stores' prices for each product type: £22.99 and $27.99 for T-shirts, £14.99, $20.99 and $25.99 to $27.99 for mugs. The choice is remembered on the device.
- Category chips for T-shirts and mugs. There is no Posters filter: the real store's posters category is empty.
- "Add to basket" says that checkout is not part of this demo.
- A pitch note: "One shop inside the site". Today their merch sits on three regional stores.

## 2026-10-20: Courses inside the site

### Added
- /courses: a course shop in the reference site's format (type, title, description, price), filtered by Courses, Bundles or Community. Six invented products at their real price points: a philosophy community, a £325 virtue ethics course, a £375 trivium bundle, and three £150 courses.
- /courses/:id: what each course covers, module by module, who teaches it, the price and links to related series. The bundle lists its three courses and the saving (£75). "Enrol" says that enrolment is not part of this demo.
- A pitch note: "Courses inside the site". Today their courses live on a separate site.

## 2026-10-20: Articles, each ending with its sources

### Added
- /articles: every article, newest first, 24 a page. The newest piece leads, large. Category chips (Politics, Analysis, History, Culture, Economics) filter the list, and the choice is kept in the address.
- /articles/:id: the full piece, set in a serif at a comfortable reading width. After the last paragraph come its reading list (Finding 4), an episode on the same subject to watch next, and more from the same writer.
- Bodies for all 12 articles, including two new ones: "The Monks Who Kept the Books" and "What a Select Committee Actually Does". Reading time is worked out from the length (about 200 words a minute).

### Changed
- Articles are served like episodes: lists by page, category and author, plus one file per article. The homepage row now comes from the homepage request, and search reads articles from the search data. Nothing about articles is bundled into the app any more.
- Article bodies are plain paragraphs, never rendered as HTML, so nothing in the data can inject markup.
- The reading lists pitch note now covers articles too.

### Notes
- The plan put a newsletter sign-up at the end of each article. The footer already has one directly below, as on episode pages, so a second form was left out.

## 2026-10-20: Shows, every episode within reach

### Added
- /shows: every show in a grid, free shows first. Each card has the show's painting and hover preview, hosts, episode count and schedule ("Live weekdays at 1:00 pm").
- /shows/:id: a page for each show. A header with "Watch the latest" (or Upgrade and a free preview), "Search this show", the show's series, then every episode it has made (Finding 3).
- The archive shows 50 episodes a page, with page numbers, Newest or Oldest first, and on mixed shows All, Free to watch or Members, with counts. The view lives in the address (?page=4&sort=oldest&access=free), so Back and shared links land on it.
- The data includes filtered pages for shows that mix free and members' episodes, as an API would return for ?access=free. "Oldest first" reads the same pages from the other end.
- A pitch note: "Every episode, sorted and filtered".

### Changed
- A change on the same page (a filter, a page of results, opening search) no longer scrolls to the top or resets the tab title.

## 2026-10-20: Instant search, over any page

### Added
- Search as you type (Finding 9), across all 5,521 episodes plus series, shows, hosts and articles. Results are grouped by kind, with a painting, the matched words highlighted, and a lock on members' episodes for free viewers. Episodes show 8 at first, then 20 more at a time.
- Search opens over the page you are on, which stays visible behind a see-through, frosted panel. Open it with the header button, the Search tab on phones, or "/" anywhere.
- Prefix, typo and accent-free matching: "agin" and "agincort" both find Agincourt, and "crecy" finds Crécy. Titles count most, and newer episodes win ties.
- Keyboard: ↑ and ↓ move through results, Enter opens one, Escape clears, a second Escape closes. Tab stays inside the panel, and closing returns focus to where it was. Screen readers hear the number of results.
- The search lives in the address (?search=rome), so it can be shared, and Back from a result reopens it. Old /search?q= links open it over the homepage.
- A pitch note: "Search as you type".

### Changed
- The Chronos series "Byzantium Rising" is now "Roman Resurgence", with the same episodes, artwork and reading list. Its address is /series/roman-resurgence.
- Every Chronos series episode has its own title before the series name, as in "Chronos #275 | Justinian's Gamble | Roman Resurgence, Part 2". All 25 series, 114 parts.
- Every episode title is now unique within its show. Topics are dealt like a deck of cards, pairing a subject with an angle, such as "Ledger #151 | The Bond Market: The Winners". Before, a few short topic lists repeated, so search showed the same title many times.
- Ledger has running numbers like the other shows. "Preview:" is gone from titles: free previews are marked by their access badge.
- Chronos uses its own random sequence, so changes to other shows never move its series. It now has 121 episodes.

### Notes
- MiniSearch (MIT licence) builds its index in the browser the first time search opens, from public/data/search-docs.json (92 KB compressed). The plan said to pre-build the index; building it on first use keeps the search settings in one file, and takes about 0.4 seconds once. Pages that do not open search download none of it.

## 2026-10-19: Built for the real site's scale

### Added
- A catalogue at real volume: 5,458 episodes. The Stoa Podcast runs #1 to #1530, Morning Brief has three segments every weekday for about four years, and the members' shows run weekly, with 25 Chronos series. Generated by scripts/data/generate.mjs, the same every run.
- The data is served like a paged API: static JSON in public/data, 50 episodes a page, newest first. It works on GitHub Pages, and each function names the Laravel endpoint it stands in for.
- src/api: one place for all data. Shows, hosts, series and the live event load once at start-up. Episodes are fetched on demand, and any episode can be found from its id without a separate lookup.
- useQuery: data, loading and error for any request, re-run when its input changes. Card-shaped placeholders while rows load, and "Try again" if a request fails.
- Cards show the reference site's line: "Published 16th October", views and comments.

### Changed
- Titles and numbering follow the reference site's format (decided, replacing the earlier neutral numbers): "The Stoa Podcast #1530", "Chronos #286 | The Hundred Years' War, Part 2", "Morning Brief | Monday 19th October 2026". Access stays as data and badges, not "PREMIUM:" in the title (Finding 10).
- The homepage makes one request for its rows (about 50 KB, roughly 10 KB compressed). The app no longer bundles any episodes, so it stays the same size as the catalogue grows.
- Dates on episode, series and article pages use the "Published 7th December, 2020" style.

## 2026-10-19: Account always in the phone top bar

### Changed
- On phones the account is always at the top: members see the bell then their initials, free accounts see Upgrade then their initials, and signed-out visitors see Upgrade then "Sign in". It is still in the More sheet too.
- Below 360px, Upgrade shows only its crown so everything fits. Screen readers still hear "Upgrade".
- Checked at 375px and 320px for all three viewers, with pitch labels on: everything ends 16px from the edge.

## 2026-10-19: Mobile navigation and a full mobile pass

### Added
- An app-style tab bar on phones (below 768px): Home, Live (with an on-air dot), Shows, Search and More. The current section is highlighted. More opens a sheet with Articles, Courses, Shop and the account.
- The More sheet closes with Escape, a tap outside, or when you go to another page, and focus returns to the More button.
- Room for the bar everywhere: pages pad by its height, the Demo button and pitch panel sit above it, and the live page's phone layout leaves space for it. iPhones with a home indicator get extra padding.

### Changed
- The phone top bar now holds only Stoa, Upgrade (or the bell for members) and the pitch label. The swipeable link strip is gone, so nothing runs off the edge.
- Small controls are at least 24px tall, the WCAG minimum: pitch labels, votes, Reply, "See all", "Show me", series links, the credits link, the autoplay switch and the chat replay controls.

### Fixed
- The live page's "Coming up live" rows were wider than a phone screen, so phones zoomed out the whole page. The reminder button now takes its own line on phones.
- On the members' preview, hidden screen-reader labels in the comparison table escaped its scroll box and widened the page. The scroll box now contains them.

### Checked
- Every page, for signed-out, free and member viewers and all five live phases, at 375px and 320px: nothing wider than the screen, and no tap target under 24px.

## 2026-10-19: Hover previews

### Added
- YouTube-style previews. Cards show a still painting until you hover for a moment or focus them with the keyboard, then they "play": a faster pan, a themed animation, a progress bar and a "Preview" chip. Moving away stops it. One card plays at a time.
- A simple themed animation per show: audio levels (The Stoa Podcast), a sunrise (Morning Brief), two voices taking turns (Conversations), candlelight and dust (Chronos), routes drawing on a map (Statecraft), a price line (Ledger) and stage spotlights (The Forum).
- On phones, which have no hover, the first fully visible card in each row plays, and the next takes over after a swipe.
- Signed-out visitors and free accounts preview free episodes and free previews. Members preview everything. Locked cards never play, and on hover say "Members preview every episode".

### Changed
- Cards no longer drift at rest. With "reduce motion" on, nothing previews.
- Pitch note "Previews on cards" is now "Hover to preview".

## 2026-10-19: Pitch mode

### Added
- Pitch mode: small labels on each improvement, naming the finding it answers. Off by default. Switch it on in the demo panel, or open any link with ?pitch=1.
- Three kinds of label, so nothing is overclaimed: "Finding" (answers a documented gap), "Proposal" (not offered today) and "Kept" (already on the real site, credited).
- Clicking a label opens a panel at the bottom of the screen: "On the real site today" and "In this prototype". It closes with Escape, the close button or a click outside, and focus returns to the label.
- 22 notes across the homepage, live page (changing with the show's phase), episode pages, series pages and the members' preview. All the text lives in src/data/pitchNotes.ts.
- /pitch: every note grouped by page, with "Show me" links. It doubles as the running order for a walkthrough.

## 2026-10-19: Real-feeling media

### Added
- Public-domain paintings and engravings on every thumbnail, hero and player, from Wikimedia Commons. Each show has its own set, and each Chronos series its own image. Episodes keep the same painting on every visit.
- A slow pan and zoom on animated cards. Locked cards stay blurred and still. Motion pauses off screen and stops with "reduce motion".
- A short CC0 ocean-waves loop in the homepage hero and the live player, muted, with a pause button. With "reduce motion" on it shows a still poster.
- scripts/media/fetch_media.py: checks every file's licence on Commons and refuses anything not public domain or CC0, then downloads, resizes and compresses. It paces its requests and caches raw downloads outside git.
- CREDITS.md and a /credits page, both generated from the same data, with a footer link.

### Changed
- Images are WebP: 640px cards and 1280px heroes, about 2 MB in total. Heroes get a 1px blur before compression, which is invisible under the dark gradient and saves about 75% of their size.
- A new ideas list for the backlog, with the finding each idea answers.

## 2026-10-19: Neutral numbering and no-deploy rule

### Changed
- Episode numbers no longer echo the reference site. The Stoa Podcast runs #201 to #212 with the live show at #213. Chronos runs #31 to #44, Statecraft #14 to #22 and The Forum #41 to #47.
- The live show's comment thread and reading list are now keyed "live-show" instead of an episode number.
- Working rules: new rule, no deployment until it is approved. Hosting on GitHub Pages moves to week 6, with the PWA.

## 2026-10-19: Progress summary

### Added
- A self-contained summary of what is built, decisions made, what is untested and open questions.

## 2026-10-19: Chat replay on recordings, and demo progress controls

### Added
- "Live chat replay" button on episodes of shows streamed live: The Stoa Podcast and Morning Brief. It opens the chat replay beside the player, or under the episode details on phones. The replay starts at the beginning, plays along, and its timeline matches the episode's length.
- Shows can be marked as streamed live in the data.

### Changed
- Demo panel: "Reset watch progress" did work, but it restored the same sample progress a fresh visit shows, so it looked like nothing happened. It is now two buttons with a short confirmation: "Clear watch progress" (as for a brand-new visitor) and "Restore sample progress".

## 2026-10-19: Comments and reading lists on every episode

### Added
- Every episode page has the same comments section and reading list as the live show. Live chat is now the only thing unique to the live page.
- Same rules everywhere: anyone can read comments and see votes; members comment, vote and reply. Reading lists are free for everyone, including on members' episodes.
- Placeholder comments and sources for every episode, drawn from pools that fit each show. Each Chronos series cites its own period. The mix is seeded by the episode id, so it is stable on every visit.
- Comment times fall after the episode's release, and "Mentioned at" times fall within its running time.
- The live show keeps its hand-written thread and reading list.
- One lookup each for comments and reading lists, so real data can replace the placeholders without changing the pages.

## 2026-10-19: Members' preview

### Added
- Members' preview page at /join, where every Join, Unlock and Upgrade link already leads.
- Hero with the starting price and a 7-day free trial. The trial is a proposal drawn from the benchmark.
- "Free previews" row with one free preview from every members' show, reviving the idea behind the old Premium Preview section.
- Tier cards for Bronze (£5), Silver (£10) and Gold (£30) a month, with what each adds. Prices and perks follow the reference site's Premium page.
- "What free gets, and what members add" comparison table across Free, Bronze, Silver and Gold.
- Short FAQ on the trial, cancelling, changing tier, gifts and free accounts.
- Members see "You're a Gold member", their tier marked, and options to switch.
- Free previews for Ledger and The Forum, so every members' show has one.

### Notes
- No checkout. The tier buttons say "Checkout isn't part of this prototype".
- No yearly prices yet. The reference site's yearly prices are still to collect, so only monthly prices show.

## 2026-10-19: Episode page and autoplay

### Added
- Episode page at /watch/:id, replacing the placeholder: player, title, hosts, date, running time and a "More from" row.
- For series episodes, a queue beside the player listing every part, with the current one highlighted, ticks for watched parts, and previous and next buttons.
- "Autoplay next part" switch, remembered between visits.
- When a part ends, "Up next" shows over the player and plays the next part after 8 seconds, with Play now and Cancel. With autoplay off it waits. After the last part it offers a way back to the series.
- Finishing a part marks it watched, which updates the series page and Continue watching.
- Free viewers see members' episodes locked, with "Upgrade to watch".
- Demo panel: "Finish episode" on episode pages, since the placeholder video never ends by itself.

## 2026-10-19: Series view

### Added
- Series page at /series/:name. It shows the series art, host, number of parts, total running time, a description and progress ("2 of 5 watched").
- One main button that picks the right place: Play from Part I, Continue with a part already started, or Watch again.
- Parts listed in order with duration, release date, progress and a tick when watched. Part numbers always read Part I, Part II and so on.
- Free viewers see the parts locked, with "Upgrade to watch the series" and a free preview from the same show.
- "Watch a whole series" row on the homepage, and a "Part II of 5 · See the series" link on episode cards.
- "More series from" row on each series page.

### Fixed
- The chat no longer asks when the reading list goes up, since it is published before the show. The producer's comment now points to the reading list on the page.

## 2026-10-19: Votes and purple accents

### Added
- Likes and dislikes on comments. Members can vote, one vote per comment: click again to remove it, or switch sides. Everyone else sees the counts.
- Likes and dislikes in live chat. Anyone signed in can vote. Counts show only above zero, and on desktop the buttons appear when you hover over or tab to a message.
- A third comment sort, Controversial: lots of votes, split close to evenly.
- A few divisive placeholder comments, so each sort orders the list differently.
- NorthernLad replies to NorthernLass in the after-show thread, with strong support.

### Changed
- Purple accents, as on the reference site: the selected comment sort, the selected video source and the newsletter button.
- Top now ranks comments by likes minus dislikes.

## 2026-10-19: Newsletter

### Added
- Newsletter sign-up on the right of the footer. On phones it comes before the disclaimer.
- Signed-out visitors and free accounts enter an email address. The browser checks it looks valid, then a thank-you message shows.
- Members already have an email on file, so they get a single "Subscribe to the newsletter" button that toggles to "Subscribed".
- Nothing is sent or stored, and the form says so.

## 2026-10-19: Reading list and footer

### Added
- Reading list beside the comments on the live page. On phones it comes first. On large screens it sits on the right, under the chat column.
- Each source shows its type (Book, Article, Report or Data), title, author or publisher, year and when it came up in the show. Sources Stoa published link to the article; invented sources have no links.
- Free for everyone, and reusable on episode and article pages.

### Changed
- The footer no longer names the author. It reads: "Stoa is an unofficial concept. Every show, host and episode is a placeholder."

## 2026-10-19: Comments

### Added
- Comments section on the live page, under "Coming up live". Comments stay with the episode after the show.
- Everyone can read. Members can post, like and reply. Free accounts see "Upgrade to comment" with a lock. Signed-out visitors see a sign-in prompt.
- Each comment shows initials, username, tier badge, time posted and likes, with replies one level deep.
- Sort by Newest or Top, and "Show more comments" five at a time.
- A dozen placeholder comments. Members' own posts last until the page reloads, since the prototype has no server.
- Reusable comment components, ready for episode pages.

## 2026-10-19: Shop and Upgrade buttons

### Changed
- Shop is a purple button with a shopping bag icon. On phones it is a purple pill at the end of the link strip.
- Upgrade has a crown icon.
- "Sign in / Sign up" shortens to "Sign in" below laptop width, so no button wraps onto two lines.

## 2026-10-19: Navigation bar

### Changed
- New link order: Stoa, Live, Home, Shows, Articles, Courses, Search. On phones, the links sit in a swipeable strip with Shop at the end.
- Right side depends on the viewer. Signed out: Shop, Upgrade, Sign in / Sign up. Free account: Shop, Upgrade, username. Member: Shop, reminders bell, username with tier badge.
- Demo panel now offers three viewers: signed out, free account and member.
- Free accounts can type in live chat (a mock-up). Signed-out visitors see "Sign in to chat".

### Added
- Reminders bell for members. It lists their live reminders with a remove button, and flags a followed show that is live now.
- Placeholder pages for Shop and the account page.

## 2026-10-19: Live reminders and chat format

### Added
- Live reminders through browser notifications, as a members' perk. "Notify me" asks for permission, confirms with a notification, and shows "Reminder on". Switching the demo to Live fires the "live now" notification.
- Free viewers see "Upgrade for reminders" with a lock in the same places. Members-only shows in "Coming up live" have locked, blurred thumbnails.

### Changed
- Chat shows a colon and a space between the username and the message.
- The mock chat loops without repeating the opening welcome or the closing sign-off.

### Removed
- "Add to calendar" and its .ics file.

## 2026-10-19: Live page

### Added
- Live page at /live covering the whole show: countdown, free stream, break, members' after-show and recording.
- Player frame with a Rumble and Odysee source switcher. Each switch builds a fresh player, so it never goes black. Title, viewer count and share sit outside the platform's player, and nothing links off-site.
- Real embeds load from .env.local (see .env.example). Only each platform's own embed path is accepted. With no URL set, a placeholder shows.
- Countdown before the show, with "Add to calendar" (a working .ics file and a 10 minute reminder).
- The break as a sign-up moment: a countdown to the members' after-show with "Continue as a member", on the video and pinned in chat. Members see "You're in", and the after-show starts by itself.
- Free viewers see the after-show blurred and locked, with a route to join.
- Mock live chat with tier badges, staff messages and highlighted Gold questions.
- Chat replay beside the recording, with a timeline, play and 10x speed.
- Phone layout: video at the top, chat filling the screen below it, never covering the video.
- "Coming up live" schedule with calendar buttons.
- Demo panel now moves the show through all five phases.

## 2026-10-19: Contributor names

### Changed
- Replaced every placeholder host, writer and interview guest with an ordinary English name. Host ids now match the new names.
- Replaced Kate Hollins with Richard Holloway.

## 2026-10-19: Articles row

### Added
- "Latest articles" row on the homepage, under the latest episodes.
- Still, editorial article thumbnails: serif headline, category colour and no motion, so articles read differently from videos.
- Ten invented articles across five categories, all free to read.
- Placeholder article page at /articles/:id.

## 2026-10-19: Homepage

### Added
- Placeholder outlet name, Stoa, with invented shows, hosts and episodes.
- Design tokens from the reference site's dark palette, plus Poppins and PT Serif.
- Animated title cards that stand in for preview clips. They pause off screen and respect "reduce motion".
- Hero built from an enlarged title card. When live, the live show holds the hero and plays on arrival. Otherwise it rotates through featured episodes with a countdown to the next show.
- Netflix-style rows that scroll sideways, with arrows on larger screens.
- "Continue watching", "Start here", "Latest" and one row per members' show.
- Free and member views. Free viewers see premium episodes blurred and locked, with a prompt to join. Free previews stay watchable.
- A "what free gets" panel for free viewers.
- One top bar in place of the side navigation. Articles and Courses sit beside Upgrade.
- Demo panel to switch between free and member, and between on air and off air.
- Placeholder pages for sections still to build.

### Changed
- Upgrade button uses dark text on gold for better contrast.

## 2026-10-19: Setup

### Added
- Project setup with Vue 3, TypeScript and Vite.
- Vue Router for page navigation.
- Tailwind CSS v4 through the Vite plugin.
- Placeholder home page.
- Project notes with purpose and working rules.

### Removed
- Demo components, icons, logo and About page from the Vue scaffold.

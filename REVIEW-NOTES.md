# Review notes

Things noticed while reading the code for the walkthrough on 20 October 2026. The most important come first. Each note is now marked **Addressed** (fixed) or **Deferred** (with the reason). Notes 25 to 29 were found while building SCOPE.md.

Effort: **S** is under an hour, **M** is a few hours to a day, **L** is several days.

---

## Worth fixing before anyone else sees it

### 1. The live page's schedule contradicts the show pages
- **Where:** `src/views/LiveView.vue` lines 96 to 109.
- **What I saw:**
  - "Coming up live" puts The Forum on Thursdays at 7 pm (`nextWeekday(4, 19)`) and Statecraft on Fridays at 3 pm (`nextWeekday(5, 15)`).
  - The generated data and the show pages say The Forum is "Live on Fridays at 7:00 pm" and Statecraft is "Tuesdays at 3:00 pm" (`scripts/data/generate.mjs` lines 340 to 342 and the `schedule` field in `shows.json`).
- **Why it matters:** two pages a reviewer is likely to open disagree. It undermines the "schedule on the site" point (Finding 11).
- **Suggested fix:** build the schedule from the shows' own data, the publishing weekday and hour the generator already uses, instead of hard-coded days. **S**
- **Addressed (20 October):** each show has one slot (days, hour, and whether it airs live) that drives its episode dates, its schedule line and the live page, so they cannot disagree.

### 2. Several recent features have no pitch note, and one note is out of date
- **Where:** `src/data/pitchNotes.ts`.
- **What I saw:**
  - **No pitch note:**
    - contributor profiles and name links
    - the members' gate on comments and reading lists
    - article comments
    - the preview mute button
    - the members' version of the Shows page
  - **One note out of date:** the `show-archive` note (lines 244 to 251) describes only newest or oldest and the access filter, not Popular or the contributor filter.
  - **Two vague notes:** `show-archive` and `search` say only "Listed as a gap in the planning doc" for what the real site does today.
- **Why it matters:** the brief asks that every change trace back to a finding. In a pitch, unlabelled features look like scope creep. A vague "today" line is weak evidence.
- **Suggested fix:**
  - Add notes for each feature, marked `proposal` with source "Nick's feedback" where no finding applies.
  - Update `show-archive`.
  - Copy the actual wording of Findings 3 and 9 from the planning doc into "today". **S**
- **Addressed (21 October):** every feature in SCOPE.md now has a note where it makes sense, `show-archive` is up to date, and Findings 3 and 9 are quoted exactly.

### 3. Members-only content is protected only in the browser
- **Where:**
  - `src/components/MembersGate.vue`
  - `src/components/CommentSection.vue` lines 159 to 172
  - `src/components/ReadingList.vue`
  - `src/composables/useViewer.ts` lines 79 to 82
  - `src/composables/usePurchases.ts`
- **What I saw:**
  - The blurred glimpse renders the real placeholder comments and sources, then hides them with CSS.
  - "Bought" episodes are an id in `localStorage`, which anyone can add by hand.
- **Why it matters:** fine for a demo. It is the first thing a technical reviewer will probe, and the honest answer must be ready (the walkthrough's crib sheet, question 4).
- **Suggested fix:** keep it as it is for the prototype, and make sure ARCHITECTURE.md and the pitch say plainly that a real server must enforce access. On a real backend, the API returns only a count to non-members. **S** (wording), **L** (real enforcement)
- **Addressed (20 October):** the Laravel version enforces access on the server. Non-members get a count for members' threads and reading lists, and `{ locked: true }` for members' streams; purchases are saved on the account; the gate blurs placeholder shapes, not real text. 12 feature tests prove it. The static preview applies the same rules in the page, and its banner says so.

### 4. An article that fails to load is shown as "not found"
- **Where:** `src/api/catalogue.ts` lines 141 to 149, and `src/views/ArticleView.vue`.
- **What I saw:** `getArticle()` catches every error and returns `undefined`. A dropped connection therefore shows "Article not found". The page's "This article could not load. Try again" state can never appear.
- **Why it matters:** misleading on a flaky phone connection. It is also the one API function that behaves differently from the rest.
- **Suggested fix:** return `undefined` only for a 404 (or a bad id), and let other errors reach `useQuery` so the retry state shows. **S**
- **Addressed (21 October):** only a 404 (or the dev server's own page) means not found; a dropped connection shows "Try again".

---

## Accessibility

### 5. The hero carousel has no visible pause control
- **Where:** `src/components/HeroBanner.vue` lines 31 and 105 to 124.
- **What I saw:** slides change every 8 seconds. They pause on hover or focus and respect reduce motion, but there is no button to stop them.
- **Why it matters:** WCAG 2.2.2 asks for a way to pause anything that moves or updates automatically for more than five seconds. Hover is not available on phones or to many assistive technologies.
- **Suggested fix:** a small pause and play button beside the slide dots, as `HeroVideo.vue` already has. **S**
- **Addressed (21 October):** a pause and play button beside the slide dots.

### 6. The More sheet claims to be modal but lets focus escape
- **Where:** `src/components/MobileTabBar.vue` lines 121 to 128.
- **What I saw:** the sheet has `role="dialog"` and `aria-modal="true"`, and focus moves into it. Tab can still leave it and reach the page behind.
- **Why it matters:** screen readers are told the rest of the page is inert, while keyboard users can wander into it.
- **Suggested fix:** trap Tab inside the sheet, as `SearchPanel.vue` (lines 91 to 108) and `BuyEpisodeDialog.vue` do. See note 14 for a shared helper. **S**
- **Addressed (21 October):** Tab and Shift+Tab stay inside the sheet while it is open.

### 7. The live chat announces every new message
- **Where:** `src/components/LiveChat.vue` lines 158 to 164.
- **What I saw:** the list is `role="log"` with `aria-live="polite"`, and a message arrives every 2.8 seconds (line 33).
- **Why it matters:** a screen-reader user hears a constant stream and cannot follow the rest of the page.
- **Suggested fix:** keep `role="log"` without announcing every message, or add a "Read messages aloud" toggle that is off by default. **S**
- **Addressed (21 October):** the chat list no longer announces each new message.

### 8. Demo panel links are under 24 px tall
- **Where:** `src/components/DemoControls.vue` lines 107 and 114 to 119.
- **What I saw:** "All notes", "Clear watch progress" and "Restore sample progress" are small text buttons. The phone audits only covered the page and footer, not the demo panel.
- **Why it matters:** low, since the panel is not part of the design. It is used live in pitches, though, often on a phone.
- **Suggested fix:** add `min-h-6` like the rest of the site. **S**
- **Addressed (21 October):** every demo panel link and button is at least 24 px tall.

---

## Fragile or inconsistent

### 9. Search lists the wrong shows for some hosts
- **Where:** `src/api/search.ts` line 116.
- **What I saw:** a host's "presents" text is built from each show's `hostIds`, the regulars. Gary and Sally appear on hundreds of episodes but are not regulars anywhere, so their search entry has no shows. Searching "Gary Forum" misses his profile.
- **Suggested fix:** use `h.showIds` from `hosts.json`, which the profile pages already use. **S**
- **Addressed (21 October):** both searches now index every show a contributor appears on. "Gary Forum" finds Gary.

### 10. Search guesses an episode's series by substring
- **Where:** `src/api/search.ts` line 90.
- **What I saw:** `e.x.includes(s.name)` finds the series by checking whether the episode's extra text contains a series name. A topic containing a series name (for example "Hannibal") could attach the wrong series.
- **Suggested fix:** write the series slug into `search-docs.json` in the generator, and read it directly. **S**
- **Addressed (21 October):** the series slug is stored with each episode's search entry (`sl` in `search-docs.json`, `seriesSlug` in Meilisearch) and read directly.

### 11. The "Preview" chip assumes a mute button its parent may not add
- **Where:** `src/components/TitleCard.vue` lines 3 and 84 to 89.
- **What I saw:**
  - The chip sits at `right-11` to leave room for `PreviewSoundButton`, which only the card components add. Any new use of `preview` without the button leaves an odd gap.
  - `AppIcon` is still imported (line 3) but no longer used.
- **Suggested fix:** add a `soundButton` prop, or move the chip into the same component as the button. Remove the unused import. **S**
- **Addressed (21 October):** a `soundButton` prop moves the chip only when the card adds its mute button; the unused import is gone.

### 12. A series episode from a live-streamed show would get a dead button
- **Where:** `src/views/WatchView.vue` lines 56 to 58 and 278.
- **What I saw:** "Live chat replay" shows whenever the show was streamed live, but the replay itself is hidden when the series queue is showing (`!showQueue`). No such episode exists today, so it is latent.
- **Suggested fix:** hide the button when the queue is showing, or put the replay in a tab beside the queue. **S**
- **Addressed (21 October):** the chat replay button is hidden while the series queue shows.

### 13. Stale and duplicated lines
- **`src/data/catalogue.ts` line 14:** a leftover comment ("An ISO date `days` ago...") from a deleted helper, sitting above `listShows`.
- **`src/api/catalogue.ts` lines 97 and 98:** `reference.shows` is assigned twice in a row.
- **`src/api/catalogue.ts` line 11:** the `Meta` type lacks `articleCount`, which the generator writes.
- **`src/views/WatchView.vue` line 304:** `ReadingList`'s props are crammed onto one line, unlike the rest of the file.
- **Suggested fix:** tidy all four in one pass. **S**
- **Addressed (21 October):** the stale comment, the double assignment and the `Meta` type are fixed. The crammed `ReadingList` line went in an earlier change.

---

## Duplication

### 14. Three hand-written focus traps, and one missing
- **Where:** `SearchPanel.vue` lines 91 to 108, `BuyEpisodeDialog.vue`, and the missing one in `MobileTabBar.vue` (note 6).
- **Suggested fix:** one `useFocusTrap(panelRef)` composable, used by all three. **M**
- **Deferred:** a medium refactor with nothing visible to show; note 6 got its own fix.

### 15. Address-based filters are hand-rolled twice
- **Where:** `src/views/ShowView.vue` lines 40 to 85 and `src/views/ArticlesView.vue` lines 19 to 64.
- **What I saw:** both read sort, period, category or page from the address, build the next query, and push it, in nearly the same way.
- **Suggested fix:** a small `useAddressState()` composable that maps typed values to and from `route.query`. **M**
- **Deferred:** a medium refactor with no visible change, during the feature freeze.

### 16. `SearchPanel` invents a fake episode to find artwork
- **Where:** `src/components/SearchPanel.vue` lines 111 to 121.
- **What I saw:** `asEpisode()` builds an `Episode` with made-up fields (duration 0, part 1 of 1) just to call `artForEpisode()`.
- **Suggested fix:** let `artForEpisode()` accept `{ id, showId, seriesName }`. **S**
- **Addressed (21 October):** `artForEpisode()` takes an id, a show and a series name, so search no longer builds a fake episode.

---

## Performance

### 17. The search index is built on the main thread
- **Where:** `src/api/search.ts` lines 81 to 131.
- **What I saw:** the first search downloads `search-docs.json` (about 944 KB raw, 92 KB compressed), then parses it and indexes about 5,500 documents. That took about 0.4 seconds on a desktop. A mid-range phone will take noticeably longer, and the page cannot respond meanwhile.
- **Suggested fix:**
  - **Quick:** build the index in a Web Worker.
  - **Better:** pre-build and save the index in the generator, then load it with `MiniSearch.loadJSON`.
  - On a real backend this goes away. **M**
- **Deferred:** medium effort, and only the static preview builds the index; the Laravel version searches on the server.

### 18. Every filter combination is a file
- **Where:** `scripts/data/generate.mjs` lines 446 to 488.
- **What I saw:** `public/data` is about 10 MB across 755 files, mostly the same episodes written into many filtered folders. Each page fetched is small.
- **Why it matters:** fine for GitHub Pages, but every rebuild rewrites all of it, and a git diff of the data is unreadable.
- **Suggested fix:**
  - Keep it for the demo, and consider adding `public/data` to the build step instead of committing it.
  - A real API makes this moot. **S** (process), **L** (real API)
- **Addressed (20 October):** the Laravel version runs one query per request. The files remain only for the static preview, by design, written by `stoa:export`.

### 19. The fetch cache never forgets
- **Where:** `src/api/client.ts` line 10.
- **What I saw:** every page of data fetched in a visit stays in memory.
- **Why it matters:** low. A long browsing session through many show archives would hold every page.
- **Suggested fix:** cap the cache, for example the last 200 files. **S**
- **Addressed (21 October):** the cache keeps the last 200 files, dropping the least recently used.

---

## Process and documentation

### 20. README.md is still the Vite template
- **Where:** `README.md`.
- **What I saw:** it describes a generic "scaffold". It does not mention the generator, the media script, `.env.example`, or how to run the demo.
- **Suggested fix:** a short README pointing to ARCHITECTURE.md and WALKTHROUGH.md, with the four commands that matter. **S**
- **Addressed (21 October):** README.md is written for a reviewer, with tested steps for both versions.

### 21. The scripts have no npm commands
- **Where:** `package.json` lines 6 to 12.
- **What I saw:** `node scripts/data/generate.mjs` and `python scripts/media/fetch_media.py` are run by hand.
- **Suggested fix:** add `"data": "node scripts/data/generate.mjs"`, and note the Python requirement for media. **S**
- **Addressed (21 October):** `npm run data` and `npm run media`.

### 22. "Same every run" is true only on the same day
- **Where:** `scripts/data/generate.mjs`, where `generatedAt` is set to today.
- **What I saw:**
  - **What changes:** running the generator on another day changes view counts, which topic falls on which date, and therefore what "popular this week" contains.
  - **What stays stable:** the ids, and the pitch links that use them.
- **Suggested fix:** let the generation date be passed in (for example `GENERATED_AT=2026-10-20`), and record it in CHANGELOG when data is regenerated. **S**
- **Addressed (21 October):** the generator uses a fixed date, so every run gives the same data.

### 23. Hidden start-up through an import
- **Where:** `src/components/DemoControls.vue` line 6.
- **What I saw:** `import '@/composables/useReminders'` exists only so the file's top-level `watch` starts, which makes "live now" notifications work from any page. Removing the demo panel would silently break reminders.
- **Suggested fix:** export an explicit `startReminders()` and call it in `main.ts`. **S**
- **Addressed (21 October):** `startReminders()` is called in `main.ts`.

### 24. Votes forget themselves, unlike everything else
- **Where:** `src/composables/useVotes.ts` line 9.
- **What I saw:** each comment section and chat creates its own votes, which vanish when you leave the page. Watch progress, purchases and reminders all survive a reload.
- **Why it matters:** in a demo, a liked comment "un-likes" itself after navigating, which can look like a bug.
- **Suggested fix:** save votes like the rest (`readJson` and `writeJson`), or say "votes are not saved in this demo" in the pitch notes. **S**
- **Addressed (20 October):** comment votes are saved: on the account in the Laravel version, in the browser in the static preview. Live chat votes stay in the page, like the live chat itself.

---

## Found while building SCOPE.md (21 October)

### 25. Forums can start topics, not reply to them
- **Where:** `src/views/CourseView.vue`, `backend/app/Http/Controllers/DiscussionController.php`.
- **What I saw:** a forum lists topics and lets you start one, but a topic has no page and no replies.
- **Deferred:** replies are a new feature, outside the feature freeze. SCOPE.md marks forums as partial. **M**

### 26. The live chat is the same conversation for every show
- **Where:** `src/data/chat.ts`, `src/components/LiveChat.vue`.
- **What I saw:** The Forum's chat replay shows the same messages as The Stoa Podcast's, including talk of a budget segment.
- **Deferred:** placeholder content; the real chat would replace it. **S**

### 27. Server search shows the best 50 episodes only
- **Where:** `backend/app/Search/SiteSearch.php`, `src/components/SearchPanel.vue`.
- **What I saw:** the count is right (for example 122), and a line says to narrow the search, but "Show more" cannot reach past the first 50.
- **Deferred:** paging search results is a new feature. **S**

### 28. The README's clone step has a placeholder
- **Where:** `README.md`, "Run the full Laravel version".
- **What I saw:** `git clone <repository address>` until the repository is named.
- **Deferred:** to be filled in at deployment, with the static preview's link. **S**

### 29. The Laravel dev server is slow to start
- **Where:** `backend/compose.yaml` (`php artisan serve`).
- **What I saw:** the first request after starting can take about 15 seconds, and requests are handled one at a time.
- **Deferred:** development only; a production host would use a proper web server. **S**

## Things that are in good shape

Worth saying, so the notes are balanced:
- No `v-html` anywhere. Article bodies are plain text by design.
- Embed URLs are checked against each platform's embed path (`src/data/streams.ts`).
- Every `localStorage` call is guarded (`src/composables/storage.ts`).
- Every page except the homepage, and the whole search panel, is loaded on demand.
- Late answers are ignored throughout (`useQuery`, `useSearch`), so fast clicking never shows stale data.
- Reduce motion is respected by every animation found: cards, previews, hero video, drawers and the search overlay.

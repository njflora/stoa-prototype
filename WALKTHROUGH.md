# Walkthrough

A self-paced course through the Stoa codebase, in thirteen lessons. Each lesson says what the part does, where it lives, shows a short excerpt, gives you a way to explain it out loud, and ends with three questions to check yourself.

Read `ARCHITECTURE.md` first for the map. Line numbers in lessons 1 to 10 were correct on 20 October 2026; if code moves, search for the quoted line instead. Lessons 11 to 13 name files and functions instead.

Reading time is about 2 hours 25 minutes in total. Each lesson gives its own estimate.

---

## Lesson 1. The Vue basics this project uses

About 15 minutes.

**What it does.** Every screen is built from Vue single-file components. A component keeps its logic, its markup and sometimes its styles in one `.vue` file. Shared logic lives in "composables", plain functions whose names start with `use`.

**Files**
- `src/components/VoteButtons.vue`: a small, complete component (props, emits, computed).
- `src/composables/useVotes.ts`: a composable with a `ref`.
- `src/composables/useWatchProgress.ts`: a composable whose state is shared by the whole site.
- `src/router/index.ts`: the routes.
- `src/components/FilterChips.vue`: `defineModel` and a generic component.

### Single-file components

A `.vue` file has up to three blocks: `<script setup lang="ts">` for logic, `<template>` for markup, and optionally `<style>`. Everything declared in `<script setup>` can be used in the template directly.

### `ref` and `computed`

```ts
// src/composables/useVotes.ts, line 9
const votes = ref<Record<string, Vote>>({})
```

A `ref` is a box holding a value that Vue watches. Read or change it with `.value` in TypeScript. In a template, Vue unwraps it for you. When the value changes, anything that used it updates on screen.

```ts
// src/components/VoteButtons.vue, lines 23 to 24
const up = computed(() => props.likes + (props.vote === 'up' ? 1 : 0))
const down = computed(() => props.dislikes + (props.vote === 'down' ? 1 : 0))
```

A `computed` is a value worked out from other values. Vue remembers the answer and only recalculates when something it depends on changes. Here, the like count shown is the stored count plus one if you liked it.

### Props and emits

```ts
// src/components/VoteButtons.vue, lines 9 to 21
const props = withDefaults(
  defineProps<{
    likes: number
    dislikes: number
    vote?: Vote | null
    canVote: boolean
    compact?: boolean
  }>(),
  { vote: null, compact: false },
)

const emit = defineEmits<{ vote: [direction: Vote] }>()
```

**Props** are inputs from the parent, read-only inside the component. `withDefaults` fills in the optional ones. **Emits** are messages back to the parent: when you click "like", the component calls `emit('vote', 'up')` and the parent decides what to do. Data goes down as props, and events come up. That one rule keeps components predictable.

`defineModel` (`src/components/FilterChips.vue` line 15) is a shortcut for the common "prop plus update event" pair. It lets a parent write `v-model="sort"` on a component, just as on an `<input>`.

### Composables

```ts
// src/composables/useWatchProgress.ts, lines 33 to 37
const progress = ref<ProgressMap>(readJson(STORAGE_KEY, seed()))

watch(progress, (value) => writeJson(STORAGE_KEY, value), { deep: true })

export function useWatchProgress() {
```

The `ref` is declared outside the function, at the top of the file. A file's top level runs once, so every component that calls `useWatchProgress()` gets the same `progress`. That is how a "Continue watching" row and an episode page agree without passing data between them. The `watch` saves every change to the browser.

### Vue Router

```ts
// src/router/index.ts, lines 66 to 71
{
  path: '/watch/:id',
  name: 'watch',
  component: () => import('../views/WatchView.vue'),
  meta: { title: 'Episode' },
},
```

Each route maps an address to a view. `:id` is a parameter: the page reads it with `useRoute().params.id` (`src/views/WatchView.vue` line 39). `() => import(...)` loads the page's code only when someone visits it, so the first download stays small.

**How I'd explain it.** "Every screen is made of small Vue components. Data flows down into them as props, and they report back with events. Shared state, like watch progress, lives in composables, so any page can read it without wiring components together."

**Check yourself**
1. Why does `useWatchProgress()` give every component the same progress, instead of a fresh copy each time?
2. A child component wants its parent to change something. What does it use, and why not change the prop itself?
3. What does `() => import('../views/WatchView.vue')` in a route save?

<details><summary>Answers</summary>

1. The `ref` is declared at the top level of the file, which runs once. The function only returns things that use that one `ref`.
2. It emits an event (`defineEmits`). Props are read-only in the child, so the parent stays in charge of its own data.
3. Download size. The episode page's code is fetched only when someone opens an episode, not on the homepage.

</details>

---

## Lesson 2. The live page and player source switching

About 12 minutes.

**What it does.** The live page and every episode page use one player, with "Change player source" below it: Rumble, Odysee or BitChute, and the site's own player. Switching builds a brand-new player every time, so the screen is never left black. This answers Finding 1.

**Files**
- `src/components/SourcePlayer.vue`: the frame, the source menu and the player.
- `src/data/streams.ts`: the platforms, and what each can play.
- `.env.example`: where real embed URLs go (copy it to `.env.local`).
- `src/views/LiveView.vue` and `WatchView.vue` place the player.

### The bug on the real site (Finding 1)

On the reference site, switching from Rumble to another source and back leaves Rumble's area black, even during the live show (`src/data/pitchNotes.ts`, note `player-switch`, line 126). From the outside, it appears the site empties the Rumble box when you switch away and never rebuilds it. The player is gone, and nothing puts a new one back.

### What the prototype does instead

```vue
<!-- src/components/SourcePlayer.vue -->
<iframe
  v-if="playable.kind === 'iframe'"
  :key="`iframe-${platform}`"
  :src="playable.url"
  :title="`${title} on ${label}`"
  class="absolute inset-0 size-full"
  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
  allowfullscreen
  referrerpolicy="strict-origin-when-cross-origin"
/>
```

The important part is the `:key`. Vue uses `key` to decide whether an element is "the same one" as before. When the key changes from Rumble's to Odysee's, Vue does not try to update the old player. It removes it completely and creates a new `<iframe>` with the new address from the very start.

That is why the screen can never be left empty:

1. **No half-reset player.** The embed always starts fresh, exactly as it does on first load, which is the case every platform tests.
2. **No hidden player playing behind.** The obvious alternative is to keep both players and hide one. A third-party iframe cannot be paused from outside (it is a different website), so a hidden Rumble player would keep playing sound. The comment at the top of the file records this.
3. **No empty box.** Clearing the old box is not a separate step that can fail. Rebuilding is the only path.

With no embed URLs set, the same idea applies to the placeholder, which is also keyed by platform. The site's own player (`VodPlayer.vue`) is keyed the same way.

```ts
// src/data/streams.ts
function checkedEmbedUrl(value: string | undefined, allowedPrefix: string): string | null {
  const url = value?.trim()
  if (!url) return null
  if (!url.startsWith(allowedPrefix)) {
    console.warn(`Ignoring embed URL that does not start with ${allowedPrefix}`)
    return null
  }
  return url
}
```

Embed addresses come from environment variables, and only addresses on the platform's own embed path are accepted. The frame can never be pointed at another site by mistake.

**Honest limits.** Real Rumble, Odysee and BitChute embeds have not been tested yet, since no embed URLs are set (PROGRESS.md, "Not done or not tested"). Rebuilding also costs a moment of loading, and for a recording it starts from the beginning. A real version could pass the current time to the new embed.

**How I'd explain it.** "When you switch source, we don't try to reuse or hide the old player. We throw it away and build a new one, the same way it was built when the page first loaded. Your site appears to clear the Rumble player without ever rebuilding it, which is why it goes black."

**Check yourself**
1. What does changing an element's `key` make Vue do?
2. Why not keep both players on the page and hide the one not in use?
3. Where do real embed URLs come from, and what stops a wrong address being loaded?

<details><summary>Answers</summary>

1. Vue treats it as a different element: it removes the old one and creates a new one from scratch.
2. A third-party iframe cannot be paused from your page, so the hidden player would keep playing sound and using data.
3. From `VITE_RUMBLE_EMBED_URL`, `VITE_ODYSEE_EMBED_URL` and `VITE_BITCHUTE_EMBED_URL` in `.env.local`. `checkedEmbedUrl()` only accepts addresses that start with the platform's own embed path.

</details>

---

## Lesson 3. The live show phases and the member hand-off

About 10 minutes.

**What it does.** The live page moves through five phases: upcoming, live, break, members and ended. During the break, free viewers get a clear route into the members' after-show, on the video and pinned in chat. This answers Finding 11's missing hand-off.

**Files**
- `src/composables/useViewer.ts`: lines 20 to 32 define the phases; the demo panel sets them.
- `src/views/LiveView.vue`: lines 25 to 65 hold the break countdown, the status line and the chat mode. Lines 127 to 186 choose what fills the player area.
- `src/components/MemberHandoff.vue`: the pinned message in chat.
- `src/components/LiveCountdown.vue`: the countdown panel.
- `src/composables/useLiveStatus.ts`: the next start time and the countdown.

```ts
// src/views/LiveView.vue, lines 60 to 65
const chatMode = computed(() => {
  if (phase.value === 'upcoming') return 'closed'
  if (phase.value === 'ended') return 'replay'
  if (phase.value === 'members' && !isMember.value) return 'locked'
  return 'live'
})
```

One `computed` turns "which phase, and is this a member?" into one of four chat modes. The chat component never needs to know about phases or membership. It just shows the mode it is given.

```ts
// src/views/LiveView.vue, lines 32 to 39
const breakEndsAt = ref(Date.now() + BREAK_MS)
watch(phase, (p) => {
  if (p === 'break') breakEndsAt.value = Date.now() + BREAK_MS
})
const breakCountdown = computed(() => formatCountdown(breakEndsAt.value - now.value.getTime()))
watchEffect(() => {
  if (phase.value === 'break' && now.value.getTime() >= breakEndsAt.value) setPhase('members')
})
```

When the break starts, the end time is set. `now` ticks every second (`useLiveStatus.ts` line 22), so the countdown updates by itself. When it reaches zero, the page moves itself to the members' phase. A member who stays on the page goes straight into the after-show, which is what the pinned message promises.

In the template, the player area is a chain of `v-if` and `v-else-if` (lines 127 to 186): a countdown before the show, the break countdown with "Continue as a member", a locked screen for free viewers during the after-show, and otherwise the player.

**How I'd explain it.** "The live page knows which part of the show it is in. When the free stream ends, everyone sees a countdown to the members' after-show. Free viewers get one button to join, on the video and pinned in chat, and members are carried straight in."

**Check yourself**
1. Which component decides the chat's mode, and why doesn't the chat decide it?
2. What makes the page move from "break" to "members" without anyone clicking?
3. In the prototype, who changes the phase? What would change it on a real site?

<details><summary>Answers</summary>

1. `LiveView` decides, in `chatMode`. The chat only displays a mode, so it can be reused (for example for replays on episode pages).
2. The `watchEffect` compares the ticking `now` with `breakEndsAt` and calls `setPhase('members')` when the time is up.
3. The demo panel, through `setPhase` in `useViewer.ts`. On a real site, the schedule or the streaming server would.

</details>

---

## Lesson 4. Live chat, voting and chat replay

About 12 minutes.

**What it does.** The chat shows messages with tier badges, likes and dislikes. In "live" mode, mock messages arrive every few seconds. In "replay" mode, beside a recording, a timeline shows the messages sent up to that point. This keeps the chat after the show, answering Finding 11.

**Files**
- `src/components/LiveChat.vue`: all four modes.
- `src/data/chat.ts`: the mock messages, each with a time in seconds.
- `src/components/VoteButtons.vue`, `src/composables/useVotes.ts`: likes and dislikes.
- `src/views/WatchView.vue`: lines 277 to 287 show the replay on episode pages.

```ts
// src/components/LiveChat.vue, lines 72 to 79
const replaySource = computed(() => {
  const scale = length.value / showLengthSeconds
  return chatMessages.map((m) => ({ ...m, at: Math.round(m.at * scale) }))
})
// ...
const replayMessages = computed(() => replaySource.value.filter((m) => m.at <= position.value))
```

Every message has a time (`at`). Replay is a filter: show every message sent before the current position. The mock chat was written for a 90-minute show, so its times are stretched or squeezed to fit each recording. On a real site, `position` would follow the video player instead of the slider.

```ts
// src/composables/useVotes.ts, lines 11 to 16
function vote(id: string, direction: Vote) {
  const next = { ...votes.value }
  if (next[id] === direction) delete next[id]
  else next[id] = direction
  votes.value = next
}
```

One vote per item. The same vote again removes it, and the other vote switches it. The function builds a new object and assigns it, which makes it clear to Vue that something changed.

The "Controversial" sort uses `controversy()` (`useVotes.ts` lines 39 to 43): total votes raised to the power of how evenly they split. Forty up and 35 down scores far above 50 up and 2 down. Articles use the same formula.

Two details worth knowing:
- **Keeping the newest message in view:** the chat follows new messages only if you are already at the bottom (lines 86 to 100). If you scroll up to read, it stops jumping.
- **Votes are not saved:** they live in the page only. A real site would save them to the account.

**How I'd explain it.** "Your chat is a strength, so we kept it and built on it. Every message has a timestamp, so after the show the chat replays alongside the recording. We also added dislikes, so disagreement is visible, and a controversial sort."

**Check yourself**
1. How does replay decide which messages to show?
2. What happens if you click "like" twice on the same message?
3. Why does the chat stop scrolling when you scroll up?

<details><summary>Answers</summary>

1. It keeps every message whose time is at or before the current position, after scaling the times to the recording's length.
2. The second click removes your like (`delete next[id]`).
3. `onScroll` records whether you are near the bottom. New messages only scroll the list when `pinnedToBottom` is true.

</details>

---

## Lesson 5. The data layer: generated catalogue, paging and API functions

About 15 minutes.

**What it does.** The real site has 1,500+ mainline episodes and daily shows with three or more items a day. The prototype generates 5,521 episodes at that scale and serves them as pages of 50, the way an API would. No page ever downloads the whole catalogue.

**Files**
- `scripts/data/generate.mjs`: builds everything (see ARCHITECTURE.md for line numbers).
- `src/api/client.ts`: fetch with a shared cache.
- `src/api/catalogue.ts`: the functions pages call.
- `src/composables/useQuery.ts`: turns a request into `data`, `loading` and `error`.

```ts
// src/api/catalogue.ts, lines 223 to 232
export async function getEpisode(id: string): Promise<Episode | undefined> {
  const split = id.lastIndexOf('-')
  const showId = id.slice(0, split)
  const sequence = Number(id.slice(split + 1))
  const show = reference.shows.find((s) => s.id === showId)
  if (!show?.episodeCount || !Number.isInteger(sequence) || sequence < 1 || sequence > show.episodeCount) return undefined
  const page = Math.floor((show.episodeCount - sequence) / reference.pageSize)
  const { items } = await listEpisodes(showId, page)
  return items.find((e) => e.id === id)
}
```

Episode ids look like `stoa-podcast-1530`: the show, then a sequence number counting up from the first episode. Pages are newest first, 50 each. From the id alone you can work out the page: #1530 of 1530 is on page 0, and #1 is on page 30. No index file is needed.

```ts
// src/composables/useQuery.ts, lines 22 to 36
async function load() {
  const run = ++latest
  loading.value = true
  error.value = null
  try {
    const result = await fetcher()
    if (run === latest) data.value = result
  } catch (cause) {
    if (run === latest) error.value = cause instanceof Error ? cause : new Error(String(cause))
  } finally {
    if (run === latest) loading.value = false
  }
}

watch(input, load, { immediate: true })
```

Every request gets a ticket number. If you click page 2, then quickly page 3, the answer for page 2 might arrive last. The ticket check throws away any answer that is not the latest, so the screen never shows the wrong page.

Three other ideas in this layer:
- **One request at a time:** `client.ts` stores the promise for each file (line 10), so two components asking for the same page at the same moment make one request.
- **Dates stay current:** the data was generated on one day, and `shiftDate()` (`catalogue.ts` lines 63 to 71) moves every date forward by whole weeks. "Published today" stays true, and weekdays stay right.
- **Oldest first without extra files:** "Oldest first" reads the newest-first pages from the other end, joining at most two of them (lines 193 to 203).

**Two modes.** Since the Laravel work, each of these functions asks one of two places (`API_MODE` in `client.ts`, see Lesson 12). In Laravel mode, `listEpisodes()` is one request with query parameters, and the database runs the query; the stored files and the "oldest first" page joining are only for the static preview. `getEpisode(id)` above is the static preview's path; Laravel answers `/api/episodes/{id}` directly.

**How I'd explain it.** "Pages never download the catalogue. They ask for one page of 50 at a time, through a small set of functions named after the Laravel endpoints. In the Laravel version each is a real query; the static preview stores the same answers as files, so it runs on GitHub Pages."

**Check yourself**
1. How does `getEpisode('chronos-116')` know which page to fetch?
2. What problem does the ticket number in `useQuery` solve?
3. Why is every filter combination stored as a file here, and what would a real backend do instead?

<details><summary>Answers</summary>

1. From the id: Chronos has 121 episodes, so sequence 116 is the 6th newest, which is on page 0 (`(121 - 116) / 50` rounded down).
2. Answers arriving out of order. Only the latest request may update the screen.
3. Static hosting cannot run queries, so `stoa:export` writes each answer ahead of time. The Laravel version runs one database query per request.

</details>

---

## Lesson 6. Instant search

About 10 minutes.

**What it does.** Search opens over any page, with results as you type, grouped into episodes, series, shows, hosts and articles. Small typos are forgiven, accents are ignored, and newer episodes edge ahead. This answers Finding 9.

**Files**
- `src/composables/useSearchOverlay.ts`: open and close, kept in the address as `?search=`.
- `src/components/SearchOverlay.vue`: the see-through backdrop. It loads the panel only when needed (line 9).
- `src/components/SearchPanel.vue`: the box, results and keyboard handling.
- `src/composables/useSearch.ts`: typing, debounce and the address.
- `src/api/search.ts`: the MiniSearch index and the `search()` function.
- `src/utils/highlight.ts`: marks the matched words.

```ts
// src/api/search.ts, lines 146 to 158
const results = engine.search(trimmed, {
  prefix: true,
  fuzzy: (term) => (term.length > 4 ? 0.2 : false),
  combineWith: 'AND',
  boost: { title: 3, show: 1.5, hosts: 1.5, text: 1 },
  boostDocument: (_id, _term, stored) => {
    const date = stored?.publishedAt as string | undefined
    if (!date || newestMs === oldestMs) return 1
    return 1 + 0.25 * ((new Date(date).getTime() - oldestMs) / (newestMs - oldestMs))
  },
})
```

What each option does:
- `prefix`: "agin" finds "Agincourt".
- `fuzzy`: allows a small typo in words longer than four letters, so "agincort" also works.
- `combineWith: 'AND'`: every word must match.
- `boost`: a match in a title counts three times as much as one in a description.
- `boostDocument`: gives newer episodes up to 25 per cent extra.

```ts
// src/composables/useSearch.ts, lines 46 to 63 (shortened)
watch(query, (value, previous) => {
  clearTimeout(timer)
  const go = () => { /* update ?search= in the address, then run the search */ }
  if (previous === undefined) go()
  else timer = setTimeout(go, DEBOUNCE_MS)
}, { immediate: true })
```

**Debouncing** waits until typing pauses for 150 ms before searching, so it does not search on every keystroke. The query sits in the address, so a search can be shared, and Back from a result reopens it.

How it loads and behaves:
- **Loaded on first use:** the index is built in the browser the first time someone searches, about 0.4 seconds once. Pages that never open search download none of it.
- **Keyboard:** the search box follows the ARIA combobox pattern (`SearchPanel.vue` lines 187 to 194). Focus stays in the box, and the arrow keys move a highlight through results.

**Two engines.** Since stage G, the Laravel version searches on the server: Laravel Scout with Meilisearch (`backend/app/Search/SiteSearch.php`), which answers in about a millisecond. This lesson's MiniSearch index runs only in the static preview. Both answer in the same `SearchResults` shape, so the panel never knows which ran.

**How I'd explain it.** "Search works as you type, across about 5,500 episodes plus articles and contributors, over whatever page you are on. In the Laravel version it's Scout and Meilisearch on the server; the static preview builds the same search in the browser, and the page can't tell the difference."

**Check yourself**
1. What is debouncing, and why use it here?
2. Why does search live in the address (`?search=`) instead of only in a variable?
3. What would you change to use a server search engine?

<details><summary>Answers</summary>

1. Waiting until typing pauses before acting. It avoids running a search for every letter.
2. So it can be shared and survives a reload, and so Back from a result reopens the search.
3. The inside of `search()` in `src/api/search.ts`. It would call the server and return the same `SearchResults` shape, so the panel stays the same.

</details>

---

## Lesson 7. Pitch mode

About 7 minutes.

**What it does.** Pitch mode shows small labels on each improvement. Each label opens a panel that says what the real site does today, what the prototype does instead, and which finding it answers. It is off by default, so the site looks like a real site until you want the commentary.

**Files**
- `src/data/pitchNotes.ts`: every note, with its kind, source, "today" and "here".
- `src/components/PitchNote.vue`: the pill.
- `src/components/PitchNoteDrawer.vue`: the detail panel.
- `src/composables/usePitchMode.ts`: on or off, and which note is open.
- `src/views/PitchView.vue`: `/pitch`, the index of all notes.

```ts
// src/data/pitchNotes.ts, lines 121 to 129
{
  id: 'player-switch',
  kind: 'fix',
  source: 'Finding 1',
  title: 'Switching source never goes black',
  today: 'Rumble shows a black screen after switching to another source and back, ...',
  here: 'Each switch builds a fresh player. ...',
  page: live,
},
```

Notes have three kinds, so nothing is overclaimed:
- **`fix`:** answers a documented gap.
- **`proposal`:** something their site does not offer today.
- **`kept`:** something already on their site, credited rather than claimed.

```vue
<!-- src/components/PitchNote.vue, lines 24 to 26 -->
<button
  v-if="enabled && note"
```

The pill renders nothing at all unless pitch mode is on, so turning it off leaves the layout exactly as a visitor would see it. Opening a note remembers which pill opened it, so closing the panel returns keyboard focus there (`usePitchMode.ts` lines 26 to 36). Any link with `?pitch=1` turns pitch mode on (line 18), which is handy for sending a pitch link.

**How I'd explain it.** "Every change is labelled with the finding it answers, and labelled honestly: a fix, a proposal, or something you already do well that we kept. Turn the labels off and it's just the site."

**Check yourself**
1. What are the three kinds of note, and why have three?
2. How do you send someone a link that opens with pitch mode on?
3. Why does `PitchNoteDrawer` use `<Teleport to="body">`?

<details><summary>Answers</summary>

1. Fix, proposal and kept. They keep the pitch honest: improvements, new ideas, and credit for what already works.
2. Add `?pitch=1` to the address.
3. So the panel renders at the end of the page, outside the card or row that opened it, where `overflow: hidden` would cut it off (comment at lines 11 to 12).

</details>

---

## Lesson 8. The phone layout and the tab bar

About 8 minutes.

**What it does.** Below 768 px the top links move to an app-style tab bar at the bottom, within reach of a thumb. On the live page, the video sits on top and the chat fills the space below, so chat never covers the video (Finding 11). Every page was checked at 375 px and 320 px.

**Files**
- `src/assets/main.css`: the `--tabbar-h` variable, lines 28 to 37.
- `src/components/MobileTabBar.vue`: the tabs and the More sheet.
- `src/components/SiteHeader.vue`: what stays at the top on phones.
- `src/views/LiveView.vue`: the phone layout, lines 117 to 121.

```css
/* src/assets/main.css, lines 28 to 37 */
:root {
  --tabbar-h: calc(3.5rem + 1px + env(safe-area-inset-bottom));
}

@media (min-width: 48rem) {
  :root {
    --tabbar-h: 0px;
  }
}
```

One CSS variable holds the tab bar's height, including the iPhone home-indicator area. It is zero on larger screens. Everything that must clear the bar uses it: the page padding (line 46), the demo button, the pitch panel and the search overlay. Changing the bar's height means changing one line.

```vue
<!-- src/views/LiveView.vue, lines 119 to 121 -->
<div
  class="flex h-[calc(100svh-var(--header-h,6rem)-var(--tabbar-h,0px))] flex-col lg:grid ..."
>
```

On phones, the live page is exactly one screen tall: the screen height (`100svh`) minus the header and the tab bar. The video takes its natural height, and the chat (`flex-1`) takes the rest. On large screens it becomes a two-column grid instead. `--header-h` is measured live by the header itself (`SiteHeader.vue`, using a `ResizeObserver`).

Other phone details:
- **Search is a button, not a link:** it opens over the current page (`MobileTabBar.vue` lines 89 to 100).
- **The narrowest phones:** on screens under 360 px, "Upgrade" shows only its crown, with the word kept for screen readers (`SiteHeader.vue` line 110).

**How I'd explain it.** "On phones the navigation moves to the bottom, where your thumb is. On the live page the video stays on top and the chat fills the rest of the screen, so the chat never covers the stream."

**Check yourself**
1. What is `--tabbar-h`, and why is it a CSS variable rather than a number in each component?
2. How does the live page fit exactly one screen on a phone?
3. Why is it zero on larger screens?

<details><summary>Answers</summary>

1. The tab bar's height, including the iPhone safe area. One variable means everything that must clear the bar stays right if the bar changes.
2. Its height is the screen height minus the header and tab bar, and the chat takes the space the video leaves.
3. There is no tab bar above 768 px, so nothing needs to make room for it.

</details>

---

## Lesson 9. Media, hover previews, reduce motion and credits

About 12 minutes.

**What it does.** Cards show public-domain paintings that drift slowly while they "play". Hovering a card starts a YouTube-style preview, with a themed animation for each show and a mute button. Everything respects "reduce motion" and pauses when off screen. Every file is checked for its licence and credited.

**Files**
- `scripts/media/fetch_media.py`: the licence check and conversion (ARCHITECTURE.md, "The media pipeline").
- `src/data/media.ts`: picks art for each show, series and episode.
- `src/components/TitleCard.vue`: the painting, the slow pan and the preview layer.
- `src/components/PreviewAnimation.vue`: one small animation per show.
- `src/composables/usePreview.ts`: when a card previews.
- `src/components/PreviewSoundButton.vue`: mute and unmute.
- `src/components/HeroVideo.vue`: the hero video, with a pause button.
- `src/views/CreditsView.vue`: `/credits`.

```css
/* src/components/TitleCard.vue, lines 117 to 119 and 154 to 159 */
.is-animated .art {
  animation: ken-burns 20s ease-in-out infinite alternate;
}

@media (prefers-reduced-motion: reduce) {
  .title-card .art,
  .title-card :deep(*) {
    animation: none !important;
  }
}
```

The "Ken Burns" pan only animates `transform`, which the browser can do on the graphics chip without redrawing the page. With "reduce motion" switched on in the device's settings, nothing moves.

```ts
// src/composables/usePreview.ts, lines 25 to 29
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const noHover = window.matchMedia('(hover: none)').matches

/** The card playing on a device with a mouse. One at a time, page-wide. */
const activeId = ref<string | null>(null)
```

Previews work differently by device:
- **With a mouse:** a card previews after resting on it for 450 ms, so sweeping across a row does not set everything off. Only one card plays at a time, page-wide.
- **On phones:** with no hover, the first fully visible card in each row plays, detected with an `IntersectionObserver` (`provideRowPreview`, line 49).
- **Keyboard:** focusing a card plays it.
- **Who sees what:** free viewers preview free content; members preview everything. The card decides, through the `allowed` function it passes in.

```ts
// src/components/HeroVideo.vue, lines 46 to 50
onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) pausedByViewer.value = true
  else play()
```

The hero video starts itself in code, not with the `autoplay` attribute, so it can respect reduce motion. It has a visible pause button, because moving content longer than five seconds must be pausable (WCAG 2.2.2). It also pauses when scrolled out of view.

**How I'd explain it.** "Every image is public domain or CC0, checked automatically against its licence and credited. Cards come alive when you hover, like YouTube, and everything stops moving if your device asks for reduced motion."

**Check yourself**
1. What stops media with the wrong licence getting into the site?
2. How does a phone, with no hover, decide which card previews?
3. Why does the hero video start itself in code rather than with `autoplay`?

<details><summary>Answers</summary>

1. `fetch_media.py` checks each file's licence on Wikimedia Commons and refuses anything that is not "Public domain" or "CC0".
2. Each row tracks its cards with an `IntersectionObserver` and plays the first one that is at least 90 per cent on screen.
3. So it can check "reduce motion" first, and only play when that is off.

</details>

---

## Lesson 10. What is needed for deployment and the PWA in week 6

About 10 minutes.

**What it does.** Nothing is deployed yet, on purpose (a working rule: "Do not deploy until Nick says so"). This lesson lists what deployment to GitHub Pages and an installable PWA would need. None of it is built.

**Already in place**
- **Every address respects the site's base path:**
  - the router: `createWebHistory(import.meta.env.BASE_URL)`, `src/router/index.ts` line 14
  - the data API: `src/api/client.ts` line 6
  - media: `src/data/media.ts` line 27
  - the notification icon: `src/composables/useReminders.ts` line 25
- **The data is static files,** which GitHub Pages can serve as they are.
- **Embed URLs live outside the code,** in `.env.local`.

**Needed for GitHub Pages**
1. **Set `base` in `vite.config.ts`** to the repository name, for example `base: '/stoa/'`. A project site lives under a sub-path.
2. **Handle deep links.** Opening `/shows/chronos` directly asks GitHub Pages for a file that does not exist. The usual fix is to copy `index.html` to `404.html` at build time, so every unknown address loads the app and the router takes over. Switching to hash addresses (`/#/shows/chronos`) is the other option, and it is uglier.
3. **A GitHub Actions workflow** to build and publish. `VITE_` variables are baked in at build time, so embed URLs would need to be repository secrets or variables.
4. **Remember a free Pages site is public.** That is why deployment waits for your go.

**Needed for the PWA (Finding 8)**
1. **A web app manifest:** name, icons in several sizes, theme colour (`index.html` already sets `theme-color`), and `display: standalone`.
2. **A service worker** to cache the app shell, media and data pages for offline use. `vite-plugin-pwa` is the common route. It is a new package, so it needs your approval first.
3. **Lock-screen controls** through the Media Session API, once there is real audio or video.
4. **Real reminders with the site closed** need Web Push. That needs a server to send the messages, so it cannot run on GitHub Pages alone (`useReminders.ts` lines 7 to 11).

**How I'd explain it.** "It's built to be hosted as plain files, so deployment is a build plus a small router setting. The installable app needs a manifest and a service worker for offline use. Push reminders need a small server, which is the one piece static hosting can't do."

**Check yourself**
1. Why does opening `/shows/chronos` directly fail on GitHub Pages without extra setup?
2. Where would the Rumble and Odysee embed URLs come from in a deployed build?
3. Which PWA feature needs a server, and why?

<details><summary>Answers</summary>

1. GitHub Pages looks for a real file at that path. The app's routes exist only in the browser, so a `404.html` copy of the app (or hash addresses) is needed.
2. From build-time variables, such as GitHub Actions secrets, because `VITE_` values are fixed into the build.
3. Web Push reminders. A server has to send the push message when the show starts, even with the site closed.

</details>

---

## Lesson 11. The stoa intro

About 10 minutes.

**What it does.** On a first visit, a full-screen view down a Greek stoa, in a vaporwave style, leads the eye to a purple wax seal in the middle of the screen. Breaking the seal (a real button) cracks it and carries the view down the colonnade into the site, which has been loading behind it all along. It plays once per device.

**Files**
- `src/components/StoaIntro.vue`: the drawing and the animation.
- `src/composables/useIntro.ts`: when it plays.
- `src/config/brand.ts`: its words.

```ts
// src/components/StoaIntro.vue
const at = (offsetX: number, offsetY: number, d: number) => `${VP.x + offsetX * d},${VP.y + offsetY * d}`
```

The whole drawing is one-point perspective from this one line. Every point has an offset from the middle and a depth `d`: 1 at the entrance, smaller further down the corridor. Multiplying the offset by the depth pulls far things towards the vanishing point, `VP`, where the seal sits. So every column, beam and floor line leads to the seal.

```ts
// src/composables/useIntro.ts
const forced = new URLSearchParams(window.location.search).get('intro') === '1'

const open = ref<boolean>(forced || (onHomepage && !readJson(SEEN_KEY, false)))
```

It plays on a visitor's first page, whichever link they followed, when the browser has not seen it. It also plays when the link says `?intro=1`. The demo panel's "Replay intro" sets `open` again.

Accessibility, in short:
- the page behind is `inert` while the intro is open
- Enter or Space breaks the seal; "Skip intro" and Escape skip it
- with "reduce motion" on, it is a short fade
- focus moves to the page when it ends

**How I'd explain it.** "It's a welcome, not a gate. The page loads behind it, it plays once, and it can always be skipped. The drawing is plain SVG, worked out from one perspective formula, so it needs nothing to download."

**Check yourself**
1. Why does everything in the drawing lead to the seal?
2. How do you show the intro again in a pitch?
3. What happens for someone with "reduce motion" on?

<details><summary>Answers</summary>

1. Every point is placed by `at()`, which scales its offset by depth towards the vanishing point, and the seal sits on the vanishing point.
2. "Replay intro" in the demo panel, or `?intro=1` in any link.
3. The animation is replaced by a short fade.

</details>

---

## Lesson 12. Laravel, the API and access control

About 20 minutes.

**What it does.** Laravel is the source of truth. It loads the catalogue, answers the site's questions, and decides who may see what. Members-only discussion, reading lists and streams never leave the server for anyone else: a non-member gets a count, or `{ locked: true }`, and nothing more.

**Files**
- `backend/app/Catalogue/Catalogue.php`: every catalogue answer.
- `backend/config/stoa.php`: who may post where.
- `backend/app/Policies/ThreadPolicy.php` and `EpisodePolicy.php`: the rules.
- `backend/app/Discussion/Discussions.php`: comments and reading lists, as one person may see them.
- `backend/app/Console/Commands/ExportStatic.php`: the static preview.
- `src/api/client.ts`: the site's two modes.
- `backend/tests/Feature/AccessTest.php`: the proof.

```php
// backend/app/Policies/ThreadPolicy.php
public function read(?User $user, Thread $thread): bool
{
    return $thread->open || (bool) $user?->isMember();
}

public function post(?User $user, Thread $thread): bool
{
    return $user !== null && ($thread->open || $user->isMember());
}
```

A policy is a class of yes-or-no questions. `?User` means the user may be missing (signed out). An open thread can be read by anyone and posted to by any account; a members' thread is for members, for reading as well as posting. `Discussions` asks `read` first, and if the answer is no, it returns only `{ locked: true, open, count }`.

```ts
// src/api/client.ts
export const API_MODE: 'laravel' | 'static' = import.meta.env.VITE_API_MODE === 'laravel' ? 'laravel' : 'static'
```

One switch decides where the site's data comes from. Each API function asks either Laravel (through Vite's `/api` proxy, so the sign-in cookie just works) or the static file that stands in for it. The static files are written by `stoa:export`, which calls the same PHP classes as the API, so the two can never disagree.

Three ideas worth knowing:
- **Sign-in with a cookie.** Sanctum's SPA mode: the site signs in, Laravel sets a session cookie, and every change sends a CSRF token back (`send()` in `client.ts`). The demo panel signs in to a seeded account with no password; that route exists only in development.
- **One rule, two places.** The posting rules live in `config/stoa.php`. The static preview applies the same rules in the page, using the `open` flag each thread carries.
- **Saved for real.** In Laravel mode, comments, votes, purchases, communities and forum topics are saved on the account. In the static preview, the browser saves them instead.

**How I'd explain it.** "Access is decided on the server. If you're not a member, the API doesn't send members' comments, sources or stream addresses at all. It sends a count, and the page draws a gate. There are tests that prove a free account gets a count, a purchase unlocks one episode and no other, and a free account can't post in a members' forum."

**Check yourself**
1. What does a free account get when it asks for a members' show's comments?
2. Why do the API and the static export never disagree?
3. What does the `?` in `?User $user` allow?

<details><summary>Answers</summary>

1. `{ locked: true, open: false, count }`: how many comments there are, and nothing else. The gate shows placeholder shapes.
2. Both call the same PHP classes (`Catalogue`, `Discussions`, `Desk`); the export writes their answers to files.
3. A signed-out visitor: the policy still runs, with no user.

</details>

---

## Lesson 13. One player, the platform sync and the content desk

About 15 minutes.

**What it does.** Every episode has one record that knows every platform it is on. A sync reads each platform's feed, matches each upload to its episode, and links it. The player offers only the platforms an episode is on, and the content desk shows staff what is missing, still processing or failed.

**Files**
- `backend/app/Sources/`: one adapter per platform, and `EpisodeMatcher`.
- `backend/app/Jobs/SyncPlatform.php`: the sync.
- `src/components/SourcePlayer.vue` and `VodPlayer.vue`: the players.
- `src/views/DeskView.vue`: the desk.
- `CONSOLIDATION.md`: the plan for their real platforms.

```php
// backend/app/Sources/EpisodeMatcher.php
$title = self::normalise($item->title);
$candidates = Episode::whereBetween('published_at', [
    $item->publishedAt->subHours(self::WINDOW_HOURS),
    $item->publishedAt->addHours(self::WINDOW_HOURS),
])->get();
```

The platforms share no id with the site, so the matcher looks for episodes published within 12 hours of the upload, then compares titles normalised: lower case, punctuation gone, the channel's name stripped from the end. "CHRONOS #280 - AGINCOURT - Stoa" and "Chronos #280 | Agincourt" both become "chronos 280 agincourt". Daily editions have no title, so they match by show and date. The closest in time wins; anything unmatched is listed on the desk.

Each platform's adapter knows only its own format (Odysee's JSON, BitChute's RSS and so on) and turns it into the same `FeedItem`. Connecting a real platform means changing one adapter. Today they read recorded sample feeds; which real feed each platform offers is still to verify.

On the site, `SourcePlayer` builds a fresh player on every switch (Lesson 2). The site's own player, `VodPlayer`, has its own controls in the reference site's style, and shares its time with the chat replay through `usePlayerClock`.

**How I'd explain it.** "Today each platform holds its own copy of your catalogue. Here there's one record per episode, and a sync that links every upload to it, every hour. Staff see the gaps on one page, and the player can offer every platform without anyone pasting links."

**Check yourself**
1. How does the matcher find an upload's episode without a shared id?
2. What changes when a real Rumble feed is connected?
3. Why is running the sync twice safe?

<details><summary>Answers</summary>

1. Episodes within 12 hours of the upload, then the normalised title (or, for daily editions, the show and date). The closest in time wins.
2. One adapter, `RumbleAdapter`: how it fetches and reads the feed. The matcher, the sync and the desk stay the same.
3. A link that already exists with the same id is not counted as new, so a second run links nothing (a test checks this).

</details>

---

## Interview crib sheet

The ten questions their team is most likely to ask, with short, honest answers. Put them in your own words.

**1. Why Vue, TypeScript, Vite and Tailwind?**
It matches their stack, so the pieces could slot into their site. TypeScript catches mistakes before the browser does, and every change was type-checked.

**2. Does it cope with a catalogue our size?**
Yes. It holds 5,521 generated episodes, including 1,530 of the mainline show and daily shows with three items a day. Pages fetch 50 at a time and never the whole catalogue. The homepage needs one data request plus reference data.

**3. How does the source switch avoid the black screen?**
Each switch builds a new player from scratch instead of reusing or hiding the old one (`SourcePlayer.vue`, `:key`). The honest caveat: it has not been tested with real Rumble, Odysee and BitChute embeds yet.

**4. Is members-only content actually protected?**
Yes, in the Laravel version. Policies on the server decide who may read, post and watch. A non-member asking for a members' thread or reading list gets only its count, and asking for a members' episode's streams gets `{ locked: true }`. 12 feature tests prove it. The honest caveat: the static preview on GitHub Pages cannot check anything, so it applies the same rules in the page, and its banner says so.

**5. How would it connect to our backend?**
It already has one, in your framework: a Laravel 13 API in `backend/`, with the routes listed in ARCHITECTURE.md. The pages talk only to the functions in `src/api`, so pointing them at your own Laravel app means serving the same shapes. Your real catalogue would come in through the platform sync (CONSOLIDATION.md) and an import.

**6. What is still not production-ready on the server?**
- **Database and hosting:** SQLite in Docker; production wants MySQL and a PHP host.
- **Platform feeds:** the sync reads recorded sample feeds; each real feed is still to verify.
- **Accounts and payments:** demo sign-in with no passwords, and "Buy this episode" takes no payment.
- **Saving:** watch progress and reminders are still in the browser.
- **Dates:** the snapshot's dates are moved forward to today; real data would not need it.

**7. How was each change checked?**
- **What I decided:** the plan, the features and the wording. For example, the episode numbering and the trial tiers were my calls.
- **How each change was checked:**
  - a type-check and a production build
  - testing in a browser at desktop and at 375 px and 320 px phone widths
  - scripted checks of paging, filters and search
  - the media licence script
- **What I can explain myself:** this walkthrough is how I made sure I understand and can explain every part.

**8. How accessible is it?**
Implemented:
- the keyboard combobox pattern in search
- focus management in dialogs and the pitch panel
- tap targets of at least 24 px
- reduce motion respected
- pausable video
- screen-reader labels throughout

There are known gaps in REVIEW-NOTES.md: the hero carousel has no visible pause, the More sheet does not trap focus, and the live chat announces every message.

**9. How fast is it?**
The main JavaScript is about 12 KB compressed, plus Vue's runtime at about 25 KB compressed. Pages load their code on demand. Search loads only when opened. Its data is about 92 KB compressed, and the index takes about 0.4 seconds to build once. In the Laravel version, Meilisearch answers each search in about a millisecond.

**10. What is not finished?**
- deployment and the installable PWA (week 6); the Laravel version needs a PHP host
- real Rumble, Odysee and BitChute embeds, and their real feeds for the sync
- real notifications on phones
- sign-in, which is a placeholder: the demo panel signs in to demo accounts instead

Comments, chat and reading lists are invented, generated with the catalogue.

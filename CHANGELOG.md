# Changelog

All notable changes to this prototype are listed here. Newest first.

## 2026-10-20: Trial, single episodes, article comments, who can post

### Added
- Buy a single members' episode for £1.99, kept on the account. A confirmation dialog shows the episode and price and says that no payment is taken in the demo. It follows the dialog pattern: focus moves in, Escape closes, and focus returns. Signed-out visitors are asked to sign in first; members never see the option.
- Bought episodes unlock everywhere at once, carry an "Owned" badge, and are listed under "Your episodes" on the account page. A pitch note: "Buy a single episode".

### Changed
- Locked episode cards open the episode page, which now offers two ways in: "Upgrade to watch everything" or "Buy this episode, £1.99".
- The 7-day free trial is for Bronze and Silver only. Gold's button reads "Join Gold", and the Join page, FAQ, account page and pitch note say which tiers have the trial.

## 2026-10-20: Popular, contributors and members (Nick's feedback)

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
- Titles and numbering follow the reference site's format (Nick's decision, replacing the earlier neutral numbers): "The Stoa Podcast #1530", "Chronos #286 | The Hundred Years' War, Part 2", "Morning Brief | Monday 19th October 2026". Access stays as data and badges, not "PREMIUM:" in the title (Finding 10).
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
- PROGRESS.md: new Ideas list for the backlog, with the finding each idea answers.

## 2026-10-19: Neutral numbering and no-deploy rule

### Changed
- Episode numbers no longer echo the reference site. The Stoa Podcast runs #201 to #212 with the live show at #213. Chronos runs #31 to #44, Statecraft #14 to #22 and The Forum #41 to #47.
- The live show's comment thread and reading list are now keyed "live-show" instead of an episode number.
- Working rules: new rule, "Do not deploy until Nick says so". Hosting on GitHub Pages moves to week 6, with the PWA.

## 2026-10-19: Progress report

### Added
- PROGRESS.md: a self-contained summary of what is built, decisions made, what is untested and open questions, as a self-contained progress report.

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

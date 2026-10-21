# Prototype progress report

Status as of 21 October 2026, after the Laravel plan (stages A to I). Written as a self-contained progress report.

## In one paragraph

The pitch prototype is built and working locally, in two versions. The site runs on Vue 3, TypeScript, Vite and Tailwind, matching their stack. Behind it, a Laravel 13 API, their framework, is the source of truth: it enforces members-only access, saves what accounts do, links every episode to its platforms (Rumble, Odysee, BitChute and the site's own video) through a sync, and searches with Meilisearch. A static preview, exported from Laravel, offers the same features without a server, for GitHub Pages. It is unbranded: the outlet is called "Stoa", every show, host and episode is invented, and one brand file would give it their identity (BRANDING.md). There are 80 commits so far. It is not deployed, and will not be until Nick says so. Deployment is planned for week 6 (23 to 29 November), with the installable PWA.

## Context

- **Project:** an unofficial, unbranded prototype of a modern media site, to pitch improvements to a media publisher.
- **Planning doc:** kept privately(findings, topics, mini-projects, schedule).
- **Stack:** Vue 3, TypeScript, Vite 8, Tailwind CSS v4, Vue Router. A Laravel 13 API in backend/, run with Docker, is the source of truth for the catalogue.
- **Look:** their dark theme (near-black, magenta #9f3878, gold #d5b720), Poppins for text and a serif for the wordmark. No logos, names or footage.
- **Run it:** `npm install` then `npm run dev` in the project folder for the static preview. For the Laravel API, run `docker compose up -d app` in backend/, then `npm run dev:laravel`.

## What is built

### Across the site

- **One top bar instead of the long side nav.** Left: Stoa, Live (with a red dot when on air), Home, Shows, Articles, Courses, Search. Right: a purple Shop button, a gold Upgrade button with a crown, then the account.
- **Phones get an app-style tab bar** (Home, Live, Shows, Search, More), with More opening a sheet for Articles, Courses, Shop and the account. Every page was checked at 375px and 320px for overflow and tap-target size.
- **Built for the real site's scale.** 5,521 generated episodes, each title unique within its show (The Stoa Podcast #1 to #1530, Morning Brief with three segments a weekday) served by a paged Laravel API, or by its static snapshot in public/data. Pages fetch only what they show; the homepage needs one request.
- **Every show has a page** with its full archive: 50 episodes a page, newest, oldest or most watched (this week, month, year or all time), filtered by access and by contributor. The view is kept in the address.
- **Contributor profiles.** Every presenter and writer has a page with a bio, their shows, series, articles and episodes. Their names link there across the site, and the footer lists them alongside FAQ and Contact.
- **The Shows page suits members.** Members get Continue watching, Trending this week and Latest first; free viewers see the shows to try.
- **Articles have an index and full pages.** Newest, Popular and Controversial sorts, category filters, a lead piece, and at the end of each article its sources, an episode to watch next and more from the writer.
- **Courses live inside the site**, in their course shop's format and at their price points, with a page per course. The Philosophy Circle is a free membership on your account, with an open forum and more forums on the roadmap.
- **One shop inside the site**, using the real stores' product format and prices, with a store switch in place of three separate regional stores.
- **An account page** built from the demo's state: membership, watch history, reminders and the newsletter. Billing and passwords say they are not part of the demo.
- **Buy a single episode.** Free accounts can buy one members' episode for £1.89 to keep, from the locked episode page, as on their site today. No payment is taken in the demo.
- **Comments under articles,** and a clear rule for who can post: free accounts in casual spaces (the free daily shows, articles, the Circle's General discussion), members everywhere. Every comment section and forum says which it is.
- **Instant search over any page** (Finding 9). Press "/", the header button or the Search tab on phones. Results appear as you type, grouped as Episodes, Series, Shows, Hosts and Articles, in a see-through panel over the current page. Small typos are forgiven, the keyboard works throughout, and the search is kept in the address so it can be shared.
- **Four viewer types**, switched from a demo panel since there is no real login (in the Laravel version, each signs in to a seeded demo account):
  - Signed out: Upgrade and a "Sign in / Sign up" button.
  - Free account: Upgrade and the username.
  - Member (Gold in the demo): a reminders bell and the username with a tier badge.
  - Staff: everything members see, plus the content desk.
- **Locked content looks the same everywhere.** Free viewers see members' episodes blurred and still, behind a lock, with an upgrade prompt.
- **Real-feeling media.** Thumbnails, heroes and players show public-domain paintings and engravings (Hogarth, Turner, Monet, Raphael, Vermeer and others). The homepage hero and the live player play a short CC0 ocean-waves loop on arrival. Cards stay still until hovered (or, on phones, scrolled into view), then play a YouTube-style preview with a themed animation per show. Free viewers preview free content; members preview everything. Everything pauses off screen, has a pause button where it is video, and stays still with "reduce motion" on.
- **Credits.** Every file was checked against its licence on Wikimedia Commons by a script that refuses anything not public domain or CC0. CREDITS.md and a /credits page list each one with its source. Images total about 2 MB; the video is 0.7 MB.
- **Footer newsletter.** An email form for visitors and free accounts; a single button for members. Nothing is sent or stored.
- **Pitch mode.** Off by default. When on, small labels name the finding each improvement answers, mark proposals clearly, and credit what the real site already does well ("Kept"). Each opens a panel comparing the real site today with the prototype. /pitch lists all 22 notes. Any link with ?pitch=1 opens annotated.
- **Demo panel** (bottom left, not part of the design): viewer type, live show phase, finish an episode, and clear or restore watch progress.

### Homepage (Finding 12, Topic 2)

- The hero plays something on arrival. When the show is live, the live stream takes the hero and stays there; no click needed. Otherwise it rotates through featured episodes with a countdown to the next live show.
- Netflix-style rows that scroll sideways: Continue watching, Start here (one way into every show), Watch a whole series, Latest, Latest articles, one row per members' show, and Conversations.
- A "what free gets, members get everything" panel for free viewers.

### Live page (Finding 11, Topic 1)

- **One page for the whole show**, in five phases: upcoming (countdown), live (free stream), break, members' after-show, ended (recording).
- **Player frame with a Rumble and Odysee switcher.** Each switch builds a fresh player, which avoids the black-screen bug from Finding 1. Title, viewer count and share sit outside the platform player. Nothing links off-site. Real embeds load from a local settings file; without one, a placeholder shows.
- **The break as a conversion moment.** A countdown to the members' after-show with "Continue as a member", on the video and pinned in chat. Members see "You're in" and the after-show starts by itself.
- **Live chat** with tier badges, staff messages, highlighted Gold questions, and likes and dislikes. Anyone signed in can vote.
- **Chat replay** beside the recording, with a timeline, play and 10x.
- **Phone layout:** video at the top, chat filling the screen below it. The chat never covers the video.
- **Reminders for members** through browser notifications ("Notify me"). Free viewers see an upgrade prompt in the same place.
- **Coming up live** schedule, then the comments section and the reading list.

### Episode pages

- Every episode has a player, details, a reading list and a comments section, the same as the live show. Live chat is the only thing unique to the live page.
- Episodes of shows that stream live (The Stoa Podcast, Morning Brief) also get a "Live chat replay" button.
- **Comments:** everyone reads and sees votes; members comment, vote and reply. Sort by Newest, Top or Controversial (many votes, split close to evenly).
- **Reading lists** (Finding 4, Mini-project C): type, title, source, year and when it came up in the show. Free for everyone.

### Series view (Finding 10, "play this series in order")

- A series page with an adaptive button: Play from Part I, Continue with a part already started, or Watch again.
- Parts listed in order, always numbered Part I, Part II and so on.
- On the episode page, a queue beside the player and an "Autoplay next part" switch. When a part ends, "Up next" counts down 8 seconds and moves on.

### Members' preview (Topic 3, "Why should I join?")

- Lives at /join, where every Join, Unlock and Upgrade link leads.
- A free preview from every members' show, reviving the idea behind their old "Premium Preview".
- Bronze £5, Silver £10 and Gold £30 a month, with their real perks.
- A 7-day free trial, shown as a proposal from the benchmark.
- A "what free gets, and what members add" comparison table, and a short FAQ.

## Since the second brief: Laravel and one source of truth

Nick's direction: show that the site slots into their current setup, with a clear plan to bring their separate streams into one source of truth, in Laravel, ready to take on their brand. Done in nine stages, each committed and checked in both versions and on phones:

- **A. The live schedule matches the show pages.** One slot per show drives its dates, its schedule line and the live page.
- **B. A welcome.** A first-visit intro: the view down a Greek stoa to a purple wax seal bearing the Delphic E, broken to enter.
- **C. Laravel is the source of truth.** A Laravel 13 API in Docker, seeded from the generator. `stoa:export` writes the static preview from the same code.
- **D. Real access control.** Policies on the server; members' discussion, reading lists and streams never leave it for anyone else. Comments, votes, purchases and communities are saved. 12 tests.
- **E. One player for every stream.** Rumble, Odysee, BitChute and the site's own video, offering only the platforms an episode is on. Styled like their player, sized to the screen, with quality and speed, and a chat replay that follows it both ways.
- **F. The content desk and the sync.** An adapter per platform, a matcher, an hourly sync and a desk for staff. Sample feeds stand in for the real ones.
- **G. Search on the server.** Laravel Scout with Meilisearch.
- **H. Ready for their brand.** One brand file, one logo component, and BRANDING.md.
- **I. Documentation.** ARCHITECTURE.md rewritten, CONSOLIDATION.md (the plan for their streams), WALKTHROUGH.md lessons 11 to 13.

## Decisions made along the way

| Decision | Reason |
|---|---|
| Outlet named "Stoa" | Neutral, classical, no clash with their show names |
| Invented English names for hosts and commenters | Avoid generic or obviously generated names |
| A name echoing their founder was declined | Keeps the public prototype neutral |
| Author name removed from the footer | The footer reads "Stoa is an unofficial concept" |
| Real tier names, prices and perks | So the pitch maps directly onto their offer |
| No yearly prices | Their yearly prices are still to collect |
| 7-day trial for Bronze and Silver only | The benchmark lists "no free trial" as a gap; Gold's extras are not given away free (Nick's call) |
| Single members' episodes for £1.89, bought to keep | Their site already sells them at £1.89, so it is marked as kept, not a proposal |
| No checkout, no real login | The plan rules out anything resembling a payment or credential flow |
| Reading lists are free on the free shows and articles; on members' shows they sit behind the members' gate with the discussion | Nick's call: members' shows should feel exclusive. Reverses the earlier "free for everyone" |
| Free accounts post in casual spaces (the free daily shows, articles, the Circle's General discussion); members' shows and topic forums are members-only; chat is open to any account | Nick's call: open where it is casual, members-only where it could get unruly |
| Browser notifications replace "Add to calendar" | Reminders become a members' perk |
| Live chat replay on The Stoa Podcast, Morning Brief and The Forum | The shows that air live (Nick's call); Statecraft does not |
| Episode numbers and titles follow the real site's format (#1530, "Show #N \| Topic") | Nick's call: this is a tech demo of what their site could be. It reverses an earlier move to neutral numbers |
| Built for real scale: 5,521 generated episodes, paged through an API layer | The real site has 1,500+ mainline episodes and daily shows with 3+ segments a day |
| Search opens over the current page, in a see-through panel | Nick's call: you keep your place, and the page stays visible behind |
| The search index is built in the browser on first use, not pre-built | Keeps the search settings in one file; takes about 0.4 seconds once. The real site can swap in a server engine behind the same search() function |
| Laravel is the source of truth; public/data is a snapshot exported from it | They use Laravel. The API and the export share one code path, so the static preview can never disagree with the API |
| In Laravel mode, members-only content never leaves the server; non-members get a count only | Review note 3: a blurred glimpse of real text was still sent to the browser. The gate now blurs placeholder shapes |
| Search runs on Meilisearch through Laravel Scout | Scout is Laravel's own search layer, so swapping engines is a setting; Meilisearch is open source, fast, forgives typos and runs in Docker |
| The platform sync reads recorded sample feeds, not the live platforms | Which public feed or API each platform offers is still to verify; the adapters isolate that, so connecting one changes one class |
| Episodes are matched to uploads by time and title, not by an id the platforms share | The platforms share no id with the site; matching by show, time and normalised title is how the desk can link a catalogue it did not upload |
| The static preview keeps every feature, checked and saved in the browser | Nick's call: the client will most likely see the static site, so it must behave like the real one. The demo panel and banner say where the real checks run |
| Thread sizes follow popularity, and card counts equal real thread sizes | Generating the 111,000 comments the old counts implied would repeat the same phrases in every thread |
| The demo sign-in picks a seeded account with no password, and exists only in development | The plan rules out credential flows; the tier checks themselves are real |
| The static preview stays, with a banner | It runs on GitHub Pages with no server. It cannot enforce access, and the banner says so |
| Public-domain and CC0 media only, from Wikimedia Commons | Safe for a public repo; every file is credited |
| Ocean-waves loop for the hero video | The smallest option (0.7 MB), chosen over clouds and an Earth timelapse |
| No deployment until Nick says so | A free GitHub Pages site is public |

## Not done or not tested

- **Not deployed, on purpose.** Deployment is scheduled for week 6 with the PWA. GitHub Pages will need a small router change, and it can carry only the static preview: showing the Laravel version to others needs a PHP host.
- **The real platform feeds are not connected.** The sync reads sample feeds; what each platform offers is listed as "to verify" in CONSOLIDATION.md.
- **Real Rumble, Odysee and BitChute embeds are untested.** No embed URLs are set, so the placeholder shows for those platforms. The site's own video (VOD) plays a CC0 clip. Rumble on phones (a key finding) needs a real embed to test.
- **Real notifications are untested.** The test browser blocks them. The logic is in place.
- **Not started:** installable PWA, the technical audit, the bug report and screen recording, the Topic 4 and 5 write-ups, the measurement page.

## Known limits of the prototype

- **The static preview pre-builds its answers.** Every combination of show, access, contributor and period is stored as a file, so public/data is about 10 MB on disk. The Laravel API runs queries instead.

- **Two versions, the same features.**

  | | Static preview (GitHub Pages) | Laravel version |
  |---|---|---|
  | Members' comments and reading lists | In the files; the page shows the gate to non-members | Sent to members only; others get a count |
  | Members' stream links | In the files; the page shows the lock | Sent only to those who may watch |
  | Comments, votes, forum threads | Saved in this browser | Saved on the account |
  | Purchases, communities | Saved in this browser | Saved on the account |
  | Who can see what | Checked in the page | Checked on the server, with tests |
  | Viewing as | Switches on this device | Signs in to a seeded demo account |
  | Search | MiniSearch in the browser, over search-docs.json | Laravel Scout with Meilisearch on the server |
  | Content desk Re-sync | Replays the export's recorded sync, saved in this browser | Runs the sync against the sample feeds |

- Reminders and watch progress live in the browser in both versions.
- Showing the Laravel version to others needs a PHP host. GitHub Pages carries the static preview.
- Notifications only appear while the site is open in a tab. Real reminders need Web Push, which belongs with the PWA work.
- Comments, chat and reading lists are placeholders. Each episode draws a stable mix from pools that fit its show. Real data can replace them in one file each.

## Ideas

Each idea maps to a finding in the planning doc. Effort is S (hours), M (a day or two) or L (several days). Nothing here is built without Nick's approval.

| Idea | Finding it answers | Effort | Status |
|---|---|---|---|
| Follow shows and hosts, and a personalised "For you" row | Mini-project B; benchmark (The Free Press, Nebula) | M | Proposed |
| Private members' podcast feed demo: a sample feed page showing how to add an ad-free feed to Apple Podcasts or Spotify | Finding 10; Mini-project H | M | Proposed |
| Searchable transcripts and chapters for a few episodes, using public-domain audio only | Topic 2 stretch; Mini-project B | L | Proposed |
| Installable PWA with offline downloads and lock-screen media controls (Media Session API) | Finding 8 | L | Proposed, with deployment in week 6 |
| Community rooms built on the live chat, with tier badges | Finding 6; Mini-project D | M | Proposed |
| Course cross-links from relevant episodes | Mini-project G | S | Proposed |
| Styled feed page with a Subscribe panel (Apple Podcasts, Spotify, copy link) instead of raw XML | Finding 10; Mini-project F | S | Suggested during review |

## Questions for you

1. **Which review notes should be fixed first?** REVIEW-NOTES.md lists 24. Notes 1, 3, 9, 10 and 24 are now fixed. The suggestion for next is notes 2, 4 and 5 (missing and out-of-date pitch notes, the article error state, and a pause button on the hero carousel). Each is small.
2. **Pitch notes for your feedback features.** Answered: contributor profiles and article comments are kept (their site has them); the members' Shows page, card previews and their mute button, the members' gate and article reading lists are proposals. Buying a single episode is kept, at their £1.89. Was: Contributor profiles, the members' gate, article comments, the preview mute button and the members' Shows page have no pitch note. Should they be labelled as proposals with the source "Nick's feedback", or tied to a finding in the planning doc?
3. **The exact wording of Findings 3 and 9.** The pitch notes for the show archive and search only say "Listed as a gap in the planning doc". Can you paste the findings' wording, so the "today" line is specific?
4. **Real Rumble, Odysee and BitChute embed URLs.** Finding 1 (the black screen) and Rumble on phones cannot be tested without them. Do you have test videos that are fine to use in a public repo?
5. **Deployment in week 6.** What should the GitHub repository be called (it sets the site's address and the `base` setting)? (`vite-plugin-pwa` for the installable app is approved.)
6. **Live chat replay.** Answered: The Forum has it too. Was: **Live chat replay for The Forum and Statecraft.** Both are described as live shows. Should they get chat replay too, like The Stoa Podcast and Morning Brief?
7. **Votes.** Answered: comment votes are now saved (on the account, or in the browser in the static preview).
8. **Sign in.** Answered: a small honest page that says the demo panel is the easier way, with the same choices.

10. **Hosting the Laravel version.** To decide after testing it locally. GitHub Pages can carry only the static preview. Should the Laravel version be shown on a small PHP host (with Meilisearch), or only demonstrated from this machine?
11. **The real platform feeds.** Can their team say how they list a channel's uploads on Rumble, Odysee and BitChute today (an API, a feed, or by hand)? CONSOLIDATION.md lists what needs verifying.

# Prototype progress report

Status as of 19 October 2026, updated during step 4 of the second brief (real-feeling media with hover previews, pitch mode, mobile navigation, and a data layer at real scale). Written as a self-contained progress report.

## In one paragraph

The pitch prototype is built and working locally. All three priority sections from the plan are done: the homepage, the live page, and the series view with a members' preview. It runs on Vue 3, TypeScript, Vite and Tailwind, matching their stack. It is unbranded: the outlet is called "Stoa", and every show, host and episode is invented. There are 34 commits so far. It is not deployed, and will not be until Nick says so. Deployment is planned for week 6 (23 to 29 November), with the installable PWA.

## Context

- **Project:** an unofficial, unbranded prototype of a modern media site, to pitch improvements to a media publisher.
- **Planning doc:** kept privately(findings, topics, mini-projects, schedule).
- **Stack:** Vue 3, TypeScript, Vite 8, Tailwind CSS v4, Vue Router. No backend.
- **Look:** their dark theme (near-black, magenta #9f3878, gold #d5b720), Poppins for text and a serif for the wordmark. No logos, names or footage.
- **Run it:** `npm install` then `npm run dev` in the project folder.

## What is built

### Across the site

- **One top bar instead of the long side nav.** Left: Stoa, Live (with a red dot when on air), Home, Shows, Articles, Courses, Search. Right: a purple Shop button, a gold Upgrade button with a crown, then the account.
- **Phones get an app-style tab bar** (Home, Live, Shows, Search, More), with More opening a sheet for Articles, Courses, Shop and the account. Every page was checked at 375px and 320px for overflow and tap-target size.
- **Built for the real site's scale.** 5,458 generated episodes (The Stoa Podcast #1 to #1530, Morning Brief with three segments a weekday) served as a paged API from static JSON. Pages fetch only what they show; the homepage needs one request.
- **Three viewer types**, switched from a demo panel since there is no real login:
  - Signed out: Upgrade and a "Sign in / Sign up" button.
  - Free account: Upgrade and the username.
  - Member (Gold in the demo): a reminders bell and the username with a tier badge.
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

## Decisions made along the way

| Decision | Reason |
|---|---|
| Outlet named "Stoa" | Neutral, classical, no clash with their show names |
| Invented English names for hosts and commenters | Avoid generic or obviously generated names |
| A name echoing their founder was declined | Keeps the public prototype neutral |
| Author name removed from the footer | The footer reads "Stoa is an unofficial concept" |
| Real tier names, prices and perks | So the pitch maps directly onto their offer |
| No yearly prices | Their yearly prices are still to collect |
| 7-day trial shown | The benchmark lists "no free trial" as a gap |
| No checkout, no real login | The plan rules out anything resembling a payment or credential flow |
| Reading lists are free for everyone | Sourcing builds trust |
| Commenting is a members' perk; chat is open to any account | Matches their current rules |
| Browser notifications replace "Add to calendar" | Reminders become a members' perk |
| Live chat replay only on Stoa Podcast and Morning Brief | The shows named as streamed live; The Forum and Statecraft could be added |
| Episode numbers and titles follow the real site's format (#1530, "Show #N \| Topic") | Nick's call: this is a tech demo of what their site could be. It reverses an earlier move to neutral numbers |
| Built for real scale: 5,458 generated episodes, paged through an API layer | The real site has 1,500+ mainline episodes and daily shows with 3+ segments a day |
| Public-domain and CC0 media only, from Wikimedia Commons | Safe for a public repo; every file is credited |
| Ocean-waves loop for the hero video | The smallest option (0.7 MB), chosen over clouds and an Earth timelapse |
| No deployment until Nick says so | A free GitHub Pages site is public |

## Not done or not tested

- **Not deployed, on purpose.** Deployment is scheduled for week 6 with the PWA. GitHub Pages will need a small router change.
- **Real Rumble and Odysee embeds are untested.** No embed URLs are set, so the placeholder shows. Rumble on phones (a key finding) needs a real embed to test.
- **Real notifications are untested.** The test browser blocks them. The logic is in place.
- **Pages still placeholders:** Shows, Articles index and article pages, Courses, Search, Account, Shop, Sign in.
- **Not started:** installable PWA, the technical audit, the bug report and screen recording, the Topic 4 and 5 write-ups, the measurement page.

## Known limits of the prototype

- No server. Comments, votes, reminders and watch progress live in the browser only.
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

1. **How best to share the site?** Options: deploy to GitHub Pages for a public link, take screenshots of key screens, or record a short walkthrough video. GitHub Pages is the next planned step.
2. Should The Forum and Statecraft also get live chat replay, since they stream live?
3. Should article pages come next (the reading-list overhaul from Finding 4), or the installable PWA (Finding 8)?
4. Is the 7-day trial the right proposal, or should the page show their offer exactly as it is today?
5. Anything in the pitch plan that the prototype should show and does not yet?

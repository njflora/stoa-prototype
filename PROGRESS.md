# Prototype progress report

Status as of 19 October 2026. Written as a self-contained progress report.

## In one paragraph

The pitch prototype is built and working locally. All three priority sections from the plan are done: the homepage, the live page, and the series view with a members' preview. It runs on Vue 3, TypeScript, Vite and Tailwind, matching their stack. It is unbranded: the outlet is called "Stoa", and every show, host and episode is invented. There are 22 commits so far. It is not deployed yet, so there is no public link. That is the next decision.

## Context

- **Project:** an unofficial, unbranded prototype of a modern media site, to pitch improvements to a media publisher.
- **Planning doc:** kept privately(findings, topics, mini-projects, schedule).
- **Stack:** Vue 3, TypeScript, Vite 8, Tailwind CSS v4, Vue Router. No backend.
- **Look:** their dark theme (near-black, magenta #9f3878, gold #d5b720), Poppins for text and a serif for the wordmark. No logos, names or footage.
- **Run it:** `npm install` then `npm run dev` in the project folder.

## What is built

### Across the site

- **One top bar instead of the long side nav.** Left: Stoa, Live (with a red dot when on air), Home, Shows, Articles, Courses, Search. Right: a purple Shop button, a gold Upgrade button with a crown, then the account.
- **Three viewer types**, switched from a demo panel since there is no real login:
  - Signed out: Upgrade and a "Sign in / Sign up" button.
  - Free account: Upgrade and the username.
  - Member (Gold in the demo): a reminders bell and the username with a tier badge.
- **Locked content looks the same everywhere.** Free viewers see members' episodes blurred and still, behind a lock, with an upgrade prompt.
- **Animated title cards** stand in for preview clips. They pause off screen and respect "reduce motion".
- **Footer newsletter.** An email form for visitors and free accounts; a single button for members. Nothing is sent or stored.
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

## Not done or not tested

- **Not deployed.** No public link yet. GitHub Pages is planned and needs a small router change.
- **Real Rumble and Odysee embeds are untested.** No embed URLs are set, so the placeholder shows. Rumble on phones (a key finding) needs a real embed to test.
- **Real notifications are untested.** The test browser blocks them. The logic is in place.
- **Pages still placeholders:** Shows, Articles index and article pages, Courses, Search, Account, Shop, Sign in.
- **Not started:** installable PWA, the technical audit, the bug report and screen recording, the Topic 4 and 5 write-ups, the measurement page.

## Known limits of the prototype

- No server. Comments, votes, reminders and watch progress live in the browser only.
- Notifications only appear while the site is open in a tab. Real reminders need Web Push, which belongs with the PWA work.
- Comments, chat and reading lists are placeholders. Each episode draws a stable mix from pools that fit its show. Real data can replace them in one file each.

## Questions for you

1. **How best to share the site?** Options: deploy to GitHub Pages for a public link, take screenshots of key screens, or record a short walkthrough video. GitHub Pages is the next planned step.
2. Should The Forum and Statecraft also get live chat replay, since they stream live?
3. Should article pages come next (the reading-list overhaul from Finding 4), or the installable PWA (Finding 8)?
4. Is the 7-day trial the right proposal, or should the page show their offer exactly as it is today?
5. Anything in the pitch plan that the prototype should show and does not yet?

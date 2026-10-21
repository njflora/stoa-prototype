# Roadmap

What I would do if I joined the team, and when each change would reach the live site. The aim is a Stoa-style site, built into the current one section by section.

## The deadline

**The content overhaul goes live by 18 April 2027.** That covers the homepage, the live show on desktop and mobile, episodes, search and the player. The date is fixed, ahead of a period when live viewing is likely to peak.

The weeks below assume I start in the first week of January 2027 (week 1). If I start later, the date stays the same. The lower-priority items in weeks 7 to 12 move to after the deadline instead.

## How I would work

- **No big-bang rewrite.** The current site is a continuum that has improved steadily since 2022. Stoa's ideas would go into the same Laravel and Vue codebase page by page, behind feature flags, so nothing goes dark while it changes.
- **Something visible every two weeks.** Each phase ships on its own, so the work already shipped still stands if plans change.
- **Staging first.** Every change is tested on a staging copy of the site and released when the team signs it off.
- **Estimates are provisional.** I haven't seen the real code yet. I would re-estimate everything at the end of week 2 and share the revised dates.

## At a glance

| When | Phase | What changes for viewers |
|---|---|---|
| Weeks 1–2 | Settle in and quick fixes | The player stops going black; the live show works on a phone |
| Weeks 3–6 | The live show and the homepage | A "Live now" banner, one live page, a route into the members' segment, something ready to play, an installable site |
| Weeks 7–10 | Finding things | Search as you type, filters, a shorter menu, linked show and host pages, reading lists on articles |
| Weeks 11–12 | One player | One player for every source, offering only the platforms an episode is on |
| Weeks 13–15 | Hardening and buffer | Nothing new; testing under heavy traffic, fixes, then a freeze from 12 April |
| **18 April 2027** | **Content overhaul live** | |
| Weeks 16–21 | Shop and courses | The shop and courses moved onto the main site, under one account |
| Weeks 22–26 | One record per episode | Behind the scenes: every platform's copy linked to one episode, with a content desk for staff |
| Week 27 onwards | Reminders, the app and community | Live-show reminders on phones, a decision on the Android app and a community space |

## Weeks 1–2: settle in and quick fixes

- Get access to the code, hosting and platform accounts. Run the site locally and set up staging if there isn't one.
- Read the codebase and write a short audit, with revised estimates for everything below.
- **Fix the Rumble player bug** ([docs/player-bug.md](docs/player-bug.md)). About 1 to 3 days, including testing on every source.
- **A mobile layout for the live show:** the player loads on a phone, and the chat no longer covers the screen.
- Small fixes found in the audit, for example the podcast feed link opening raw XML, and an Epochs image that breaks on a "#" in its file name.

## Weeks 3–6: the live show and the homepage

- **A "Live now" banner with a countdown**, shown across the site when a show is starting or on air.
- **One live page** that holds the stream, the chat and the schedule.
- **A "Continue as a member" route** from the free stream into the members' segment.
- **A homepage with something ready to play:** the latest episode, the live show when it's on, and "Continue watching" for signed-in viewers.
- **An installable site:** a full web app manifest and a service worker, so it installs properly on a phone's home screen and opens quickly, as the prototype does.
- **Chat replay**, if the team wants it: saving the live chat so it can be shown next to the recording.

## Weeks 7–10: finding things

- **Search as you type**, using Laravel Scout with a search server such as Meilisearch, as the prototype does.
- **Filters** by show, series, host, length and access, alongside the existing date filter.
- **A shorter menu** in place of the long category tree.
- **Show, series and contributor pages** that link everything together.
- **Reading lists at the end of articles**, in the same shape the podcast pages already use.
- **Animated hover previews** on thumbnails, for members.

## Weeks 11–12: one player

- **One player** for every source, with the same controls whichever platform is playing. It offers only the platforms an episode is on, using the sources the site already lists for each episode.
- Every old address keeps working, with redirects where pages move.

## Weeks 13–15: hardening and buffer

- Test the new pages under the kind of traffic a big live show brings, on desktop and phones.
- Fix what turns up, and leave room for anything that ran over.
- **Freeze from 12 April:** no new changes in the final week, so the site is stable on the day.

## Weeks 16–21: shop and courses

- Bring the shop and courses onto the main site, so one account covers watching, courses and buying.
- Link them from the content they relate to, for example a course from the episodes of the same series.
- Payments stay with the providers already in use. This phase moves where things appear, not how money is taken, and is tested with particular care.

## Weeks 22–26: one record per episode

The platform consolidation plan in [CONSOLIDATION.md](CONSOLIDATION.md):

1. List every channel and platform, and who holds each login.
2. Agree one record per episode with the team.
3. Connect each platform's real feed, one at a time, and match uploads to episodes.
4. Backfill the archive, show by show, and clear what doesn't match on the content desk.
5. Switch the site and the player to read from the single record.
6. Retire duplicate uploads and hand-kept lists.

Viewers see little change here. Staff get the content desk, which shows where each episode is published and what is missing.

## Week 27 onwards: reminders, the app and community

- **Reminders before each live show**, sent to phones through the installable site (Web Push).
- **A decision on the Android app**, which was last updated in February 2024: update it, or replace it with the installable site.
- **A community space**, if the team wants one, to replace the current Philosophy Community page.
- **Automation:** finding ways to increase capacity through bespoke, proprietary solutions.

## Throughout

- A short monthly report on what shipped and how it is used: live viewers on the site, search use, and the route from free viewer to member. Only numbers the site actually records.
- Keep the docs, changelog and this roadmap up to date as plans change.

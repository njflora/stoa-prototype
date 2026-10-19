# Changelog

All notable changes to this prototype are listed here. Newest first.

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

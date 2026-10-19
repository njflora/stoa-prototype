# Changelog

All notable changes to this prototype are listed here. Newest first.

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

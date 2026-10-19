# Changelog

All notable changes to this prototype are listed here. Newest first.

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

# Consolidation: one source of truth for every stream

A plan for bringing a client's separate content streams together: Rumble, Odysee, BitChute and their own video on demand (VOD). Today each platform holds its own copy of the catalogue. The aim is one record per episode, in Laravel, that knows every place the episode is published, with the site, the player and the content desk all reading from it.

The prototype already runs this design end to end on invented data: the canonical record (Laravel's `episodes` and `episode_sources` tables), a sync with one adapter per platform, a matcher, a record of every sync run, and a content desk for staff. ARCHITECTURE.md describes it. What it does not have is the real platforms' feeds. Those are phase 3.

## The six phases

### 1. Inventory every channel and platform

**What.** List every place their content lives: each channel or account on Rumble, Odysee and BitChute, their own hosting, podcast feeds, and any older archive. For each, note who owns the login, how much is there, and how its uploads are named.

**Risks.** A forgotten channel, or a platform where nobody has the login any more.

**How to check.** The count of uploads per platform, set against the count of episodes the site lists. Any big gap means a missing channel.

### 2. Agree the canonical episode record

**What.** One row per episode: show, running number, title, date, length, access (free, free preview or members), hosts and series. Platforms hang off it, one row each (`episode_sources`: platform, its id, embed address, status, last synced). The prototype's tables are a starting point to review with their team.

**Risks.** Shows that number episodes differently, daily shows with several items a day, and episodes that exist on one platform only.

**How to check.** Every show's archive page lists its episodes in the right order, with no gaps or duplicates in the numbering.

### 3. Ingest and match

**What.** Connect each platform's real feed to its adapter (`backend/app/Sources`), one platform at a time. The matcher links each upload to its episode by time (within 12 hours) and title, compared without the platform's habits. What it cannot match is listed on the desk for a person to decide.

**To verify, per platform.** None of these has been tested against the real platform yet:

- **Rumble:** what their account can use to list a channel's videos (an API with their account, or a feed). The prototype's Rumble format is a placeholder.
- **Odysee:** whether its public API's channel search (the shape the prototype's Odysee adapter reads) covers their channel in full, and its limits.
- **BitChute:** whether a channel RSS feed is available and how far back it goes. The prototype reads RSS.
- **Their own hosting:** how files are named and listed, and whether HLS (several sizes for adaptive quality) is already produced.

**Risks.** Titles that differ a lot between platforms, uploads published days apart, and rate limits.

**How to check.** On each run, the desk's numbers: in the feed, matched, newly linked, not episodes. A test per adapter, against a recorded copy of the real feed, as the prototype does with its sample feeds.

### 4. Backfill the archive

**What.** Run the sync over each platform's whole history, not only the newest uploads, show by show. Review what stays unmatched on the desk, then fix titles or link by hand.

**Risks.** Old uploads with titles that follow no pattern; removed or failed uploads.

**How to check.** For each show, the share of episodes linked on each platform it should be on. The desk's "Missing on …" filters list the rest.

### 5. Cut over the site

**What.** The site reads only from the canonical record. The player offers only the platforms an episode is on, and the desk becomes the place staff check publishing. Run both side by side first, and compare.

**Risks.** Old links and bookmarks. Keep every old address working with redirects to the new pages.

**How to check.** A sample of episodes opened on every platform from the new player, and the old addresses tested.

### 6. Retire duplicates

**What.** With one record per episode, duplicate uploads, stray playlists and hand-kept lists can go. Decide per platform what stays as a mirror and what the site's own player serves.

**Risks.** Removing something still linked from outside.

**How to check.** The desk shows every episode linked where it should be, and the sync's runs stay clean for several weeks before anything is removed.

## What a sync run looks like

Each run is recorded and shown on the desk:

| Field        | Meaning                           |
| ------------ | --------------------------------- |
| In the feed  | Uploads the platform listed       |
| Matched      | Uploads that are episodes         |
| Newly linked | Links that were new or changed    |
| Not episodes | Clips and extras, listed by title |
| Status       | Done, or failed with the reason   |

The sync runs every hour, and on demand from the desk. Running it twice links nothing new, so it is safe to repeat.

## In the prototype

- `php artisan stoa:sync --fixtures` (in `backend/`) runs the sync against the sample feeds in `backend/tests/fixtures/feeds`.
- The content desk is at `/desk`; choose "Staff" in the demo panel.
- `tests/Feature/DeskTest.php` covers title matching, linking a missing upload, matching a daily edition by date, a second run linking nothing new, and the desk being for staff only.

# Bug report: a premium episode plays in full for free

A short report on an access bug in the real site's episode pages. It was observed from outside, signed out, in a browser.

## Symptom

An episode page shows the signs of members-only content: a title starting "PREMIUM:" and an offer to "Buy full access for £1.89". The video still plays for a visitor who is not signed in.

## Seen

- On 21 October 2026, signed out, in a desktop browser.
- On a premium episode published on 20 October 2026, about 30 minutes long.
- The video was playing at 3:06 of 30:15.

## Steps to reproduce

1. Without signing in, open the episode's page.
2. The title starts "PREMIUM:", and the page offers full access for £1.89.
3. Press play.
4. The video plays, although the page presents it as paid content.

## Expected result

It depends on what the team intended:

- If the episode is meant to be free, the "PREMIUM:" title and the £1.89 offer should go.
- If it is meant to be premium, a signed-out visitor should not get the full video.

## Possible causes

- **Labelled premium by mistake.** The episode may also be public on their YouTube channel, which would make it free in practice. This is not confirmed.
- **The access check lets the video through.** The page may give the player the video whether or not the visitor has access.

## Why it matters

- If it is a labelling mistake, free content looks paywalled, which turns away new viewers.
- If it is an access mistake, paid content is free to anyone. That loses sales, is unfair to paying members, and could affect other premium episodes too.

## How the prototype handles it

- Access is decided on the server. The player asks `GET /api/episodes/{id}/play`, and a visitor without access gets `{ locked: true }` with no stream addresses at all ([WatchController.php](../backend/app/Http/Controllers/WatchController.php), [EpisodePolicy.php](../backend/app/Policies/EpisodePolicy.php)).
- A test checks that buying one episode unlocks that episode's streams and no others ([AccessTest.php](../backend/tests/Feature/AccessTest.php)).
- Access is a field shown as a badge, not a word in the title, so correcting a label is a one-field change.

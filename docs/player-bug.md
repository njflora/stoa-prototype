# Bug report: the Rumble player goes black after switching sources

A short report on a bug in the real site's episode player. It was observed from outside, in a browser. We cannot see their source code, so the cause below describes what the page appears to do.

## Symptom

On an episode page, switch the player from Rumble to Odysee, then back to Rumble. The player area stays black. Only a page refresh brings Rumble back. Switching to Odysee keeps working every time.

## Reproduced

- Every time, on podcast episode #1529 (18 October 2026).
- Live, on podcast episode #1530 (19 October 2026).
- In Chrome on Android and in Edge on desktop.

## Steps to reproduce

1. Open an episode page that offers both Rumble and Odysee.
2. Let the Rumble player load.
3. Switch the player source to Odysee. Odysee plays.
4. Switch the player source back to Rumble.
5. The player is black, and nothing plays.
6. Refresh the page. Rumble loads again.

## Expected result

Switching back to Rumble shows the Rumble player again, ready to play.

## What the page appears to do

- The Rumble player is not a plain iframe. Rumble's JavaScript loader builds it inside a box on the page, with an id starting `rumble-player-`.
- Switching to Odysee empties that box. Its child elements go from 1 to 0.
- Switching back to Rumble shows the same box again. The player inside it is never rebuilt, so the box stays empty and black.
- Odysee is a plain iframe. Showing it again loads it again, which is why it is unaffected.

## Possible fixes, simplest first

1. **Keep both players and hide the inactive one.** Their site is built with Vue (its scripts include Vue's component helper), so `v-show` could hide the Rumble player without removing it, and it would never be emptied. A hidden player keeps playing, so this works only if Rumble's player can be paused while it is hidden.
2. **Call the Rumble loader again on switch-back.** When Rumble is chosen again, ask Rumble's loader to build the player in the box once more, as it does on page load.
3. **Use Rumble's documented iframe embed.** The embed code from Rumble's Share, then Embed option is a plain iframe, like Odysee's. It loads again each time it is shown. It gives up any control the JavaScript player offers.

## How the prototype handles it

The prototype's player, [SourcePlayer.vue](../src/components/SourcePlayer.vue), rebuilds the player on every switch. Each source is keyed by its platform, so Vue removes the old player and builds a fresh one each time. A player is never left empty, and a hidden player can never keep playing in the background.

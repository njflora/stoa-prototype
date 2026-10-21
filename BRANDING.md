# Branding

This prototype is unbranded on purpose. It is called Stoa, and every show, host and episode is invented. It carries no client logos, names or footage.

It is built to take on their identity quickly if the proposal is accepted. The site's identity lives in a few small places, listed below. Changing them changes the whole site. No other file needs editing.

## Where the identity lives

| What | Where | What it controls |
|---|---|---|
| Name and wording | `src/config/brand.ts` | The header, the footer, page titles, the page description, notifications, the name of the site's own video player, the welcome animation's words, and the installed app's name |
| Logo | `src/components/BrandLogo.vue` | The wordmark in the header and the footer |
| Colours | `src/assets/main.css`, the `@theme` block | Every colour on the site, through Tailwind classes such as `bg-accent` and `text-gold`, and the installed app's colours |
| Fonts | `src/main.ts` (the font files) and the `--font-sans` and `--font-serif` tokens in `src/assets/main.css` | All text |
| Browser tab icon | `public/favicon.ico` | The icon in tabs and bookmarks |
| App icons | `public/icons/`, drawn by `scripts/icons/make_icons.py` | The installed app's icon and the iPhone Home Screen icon |
| The server's name | `APP_NAME` in `backend/.env` | Emails and anything Laravel names itself |

`index.html` takes its title and description from `brand.ts` when the site is built, through a small step in `vite.config.ts`. The installable app's manifest takes its name from `brand.ts` and its colours from the theme tokens in the same way.

## Taking on a client's identity

1. **Name and wording.** In `src/config/brand.ts`, set `name`, `description` and `footerLine`. Set `playerName` to what their own player should be called in the "Change player source" menu, beside Rumble and the rest. The intro's `word` and `prompt` can stay or change.
2. **Logo.** Put their logo file in `public/brand/`. In `BrandLogo.vue`, replace the text with an image of it, using `brand.name` as its alternative text. The header and footer set its size.
3. **Colours.** The tokens already follow their dark theme: near-black backgrounds, magenta `#9f3878` and gold `#d5b720`. Check each value against their style guide in the `@theme` block. Every page follows.
4. **Fonts.** Swap the `@fontsource` packages in `src/main.ts` for their fonts, and update the two font tokens.
5. **Icons.** Replace `public/favicon.ico`. For the installed app, put their icons in `public/icons/` at the same sizes: 192 and 512 pixels, a 512 maskable icon with the logo inside the middle 80%, and a 180 Apple touch icon. If their logo is a wordmark, `scripts/icons/make_icons.py` can draw them; set its colours and font at the top first.
6. **The server.** Set `APP_NAME` in `backend/.env`.

That is the whole change. It was tested by renaming the brand in `brand.ts` alone: the header, footer, page titles, the served `index.html`, the intro and the player menu all followed.

## What is not branding

- **The catalogue.** Show names (such as "The Stoa Podcast"), contributor names, episode titles and articles are data. They come from the database, which the platform sync fills from their real channels. They are not in the brand file.
- **The welcome animation's look.** The stoa, the seal and its vaporwave colours are drawn in `src/components/StoaIntro.vue`. The words come from `brand.ts`. A rebrand would restyle the drawing there, or drop the intro.
- **Pitch notes.** The notes that compare the prototype with the real site (`src/data/pitchNotes.ts`) are for the pitch, not the product.

## Rules while it stays a pitch

- No client logos, names or footage are added to this repository.
- Their assets would be added only once the proposal is accepted, and with their permission.

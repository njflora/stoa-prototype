"""Draws the app icons from the wordmark: the site's name in PT Serif Bold,
white on the ink background, with a short accent bar under it.

Run from the project root after `npm install`:
    python scripts/icons/make_icons.py [name]

Writes public/icons/: icon-192.png, icon-512.png, maskable-512.png and
apple-touch-icon.png. Needs Pillow. Colours match the theme tokens in
src/assets/main.css.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

NAME = sys.argv[1] if len(sys.argv) > 1 else 'Stoa'
INK = '#101112'
ACCENT = '#9f3878'
FONT = Path('node_modules/@fontsource/pt-serif/files/pt-serif-latin-700-normal.woff')
OUT = Path('public/icons')


def draw(size: int, text_width: float) -> Image.Image:
    """text_width: how much of the icon's width the name fills (0 to 1)."""
    image = Image.new('RGB', (size, size), INK)
    pen = ImageDraw.Draw(image)

    # Grow the type until the name fills the width it is given.
    points = 10
    while True:
        font = ImageFont.truetype(str(FONT), points + 1)
        left, top, right, bottom = pen.textbbox((0, 0), NAME, font=font)
        if right - left > size * text_width:
            break
        points += 1
    font = ImageFont.truetype(str(FONT), points)
    left, top, right, bottom = pen.textbbox((0, 0), NAME, font=font)
    width, height = right - left, bottom - top

    bar_height = max(2, round(size * 0.025))
    gap = round(size * 0.05)
    block = height + gap + bar_height
    x = (size - width) / 2 - left
    y = (size - block) / 2 - top
    pen.text((x, y), NAME, font=font, fill='white')

    bar_width = width * 0.35
    bar_top = (size - block) / 2 + height + gap
    pen.rectangle(
        [((size - bar_width) / 2, bar_top), ((size + bar_width) / 2, bar_top + bar_height)],
        fill=ACCENT,
    )
    return image


OUT.mkdir(parents=True, exist_ok=True)
draw(192, 0.72).save(OUT / 'icon-192.png')
draw(512, 0.72).save(OUT / 'icon-512.png')
# Maskable icons are cropped to a circle by some phones: keep the name inside the middle 80 %.
draw(512, 0.56).save(OUT / 'maskable-512.png')
draw(180, 0.72).save(OUT / 'apple-touch-icon.png')
print('Wrote', ', '.join(sorted(p.name for p in OUT.glob('*.png'))))

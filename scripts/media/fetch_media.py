"""Fetch and check the prototype's media from Wikimedia Commons.

Usage (from the project root):
    python scripts/media/fetch_media.py            check licences only, download nothing
    python scripts/media/fetch_media.py --download download, optimise and write credits

Every file listed in sources.json must be Public domain or CC0 on Commons.
Anything else is refused. Downloads use Commons' resized copies, so
originals of 20 MB or more are never fetched. Requests are paced, because
Commons is run by volunteers and rate-limits fast clients.
"""

import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCES = ROOT / 'scripts' / 'media' / 'sources.json'
OUT_DIR = ROOT / 'public' / 'media'
MANIFEST = ROOT / 'src' / 'data' / 'media.generated.json'
CREDITS = ROOT / 'CREDITS.md'

API = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'StoaPrototypeMedia/0.1 (licence check for an unbranded portfolio prototype)'}
ALLOWED = {'Public domain', 'CC0'}
HERO_WIDTH = 1280
CARD_WIDTH = 640
PAUSE = 3  # seconds between requests to the file server
CACHE = ROOT / 'scripts' / 'media' / '.cache'  # raw downloads, kept out of git


def fetch(url, method='GET'):
    for attempt in range(5):
        try:
            request = urllib.request.Request(url, headers=HEADERS, method=method)
            return urllib.request.urlopen(request, timeout=60)
        except urllib.error.HTTPError as error:
            if error.code != 429:
                raise
            wait = 30 * (attempt + 1)
            print(f'   rate limited, waiting {wait}s')
            time.sleep(wait)
    raise SystemExit('Commons kept rate-limiting. Try again later.')


def api(params):
    params = {'action': 'query', 'format': 'json', **params}
    return json.load(fetch(API + '?' + urllib.parse.urlencode(params)))


def plain(value):
    """Commons metadata is HTML; keep the readable text only."""
    text = re.sub(r'<div style="display: none;">.*?</div>', '', value or '', flags=re.S)
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', html.unescape(text)).strip()


def meta(info, key):
    return plain(info.get('extmetadata', {}).get(key, {}).get('value', ''))


def check_images(images):
    found = {}
    for start in range(0, len(images), 20):
        batch = images[start:start + 20]
        data = api({
            'titles': '|'.join(i['title'] for i in batch),
            'prop': 'imageinfo',
            'iiprop': 'url|size|extmetadata',
            'iiurlwidth': str(HERO_WIDTH),
        })
        for page in data['query']['pages'].values():
            found[page['title']] = page
    return found


def licence_report(images, found):
    ok, refused = [], []
    for item in images:
        page = found.get(item['title'])
        if not page or 'imageinfo' not in page:
            refused.append((item['id'], 'not found on Commons'))
            continue
        info = page['imageinfo'][0]
        licence = meta(info, 'LicenseShortName')
        if licence not in ALLOWED:
            refused.append((item['id'], f'licence is "{licence}"'))
            continue
        item.update({
            'licence': licence,
            'artist': meta(info, 'Artist') or 'Unknown',
            'date': meta(info, 'DateTimeOriginal') or 'Unknown',
            'name': meta(info, 'ObjectName') or item['title'][5:].rsplit('.', 1)[0],
            'sourceUrl': info['descriptionurl'],
            'thumbUrl': info.get('thumburl') or info['url'],
            'original': f"{info['width']}x{info['height']}",
        })
        # Hand-checked corrections, such as crediting the painter rather than the photographer.
        item.update(item.get('credit', {}))
        ok.append(item)
    return ok, refused


def check_video(video):
    data = api({'titles': video['title'], 'prop': 'videoinfo', 'viprop': 'url|derivatives|extmetadata', 'iiurlwidth': str(HERO_WIDTH)})
    page = next(iter(data['query']['pages'].values()))
    info = page['videoinfo'][0]
    licence = meta(info, 'LicenseShortName')
    if licence not in ALLOWED:
        raise SystemExit(f'Video refused: licence is "{licence}"')
    derivatives = info.get('derivatives', [])
    webm = next((d for d in derivatives if d.get('height') == 480 and 'webm' in d['type']), None)
    # Commons' H.264 version comes as a QuickTime .mov file, which Safari and iPhones play.
    mov = next((d for d in derivatives if d.get('height') == 360 and ('mp4' in d['type'] or 'quicktime' in d['type'])), None)
    poster = api({'titles': video['title'], 'prop': 'imageinfo', 'iiprop': 'url', 'iiurlwidth': str(HERO_WIDTH)})
    poster_url = next(iter(poster['query']['pages'].values()))['imageinfo'][0].get('thumburl')
    video.update({
        'licence': licence,
        'artist': meta(info, 'Artist') or 'Unknown',
        'date': meta(info, 'DateTimeOriginal') or 'Unknown',
        'name': meta(info, 'ObjectName') or video['title'][5:].rsplit('.', 1)[0],
        'sourceUrl': info['descriptionurl'],
        'webmUrl': webm and webm['src'],
        'movUrl': mov and mov['src'],
        'posterUrl': poster_url,
    })
    return video


def download(url, name):
    """Fetch once, then reuse the cached copy, so re-encoding never asks Commons again."""
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / name
    if not cached.exists():
        time.sleep(PAUSE)
        cached.write_bytes(fetch(url).read())
    return cached.read_bytes()


def save_webp(data, stem):
    from PIL import Image, ImageFilter  # Pillow, only needed when downloading

    image = Image.open(io.BytesIO(data)).convert('RGB')
    out = {}
    # Heroes always sit under a dark gradient. A 1px blur removes fine detail
    # (engraving lines, map lettering, paint cracks) that would otherwise
    # cost a lot of bytes and never be seen.
    for label, width, quality, blur in (('hero', HERO_WIDTH, 48, 1.0), ('card', CARD_WIDTH, 58, 0)):
        copy = image.copy()
        if copy.width > width:
            copy = copy.resize((width, round(copy.height * width / copy.width)), Image.LANCZOS)
        if blur:
            copy = copy.filter(ImageFilter.GaussianBlur(blur))
        path = OUT_DIR / f'{stem}-{label}.webp'
        copy.save(path, 'WEBP', quality=quality, method=6)  # no metadata is written
        out[label] = f'media/{path.name}'
        out[f'{label}Size'] = path.stat().st_size
    out['width'], out['height'] = image.width, image.height
    return out


def write_credits(images, video):
    lines = [
        '# Credits',
        '',
        'Every image and video on this prototype is in the public domain or released under CC0.',
        'Each was checked against its licence on Wikimedia Commons by `scripts/media/fetch_media.py`.',
        'Images were resized and converted to WebP. Nothing else was changed.',
        'This file is generated. Edit `scripts/media/sources.json` and run the script again.',
        '',
        '## Images',
        '',
        '| File | Work | Artist | Date | Licence | Source |',
        '|---|---|---|---|---|---|',
    ]
    for i in images:
        lines.append(f"| `{i['id']}` | {i['name']} | {i['artist']} | {i['date']} | {i['licence']} | [Wikimedia Commons]({i['sourceUrl']}) |")
    lines += [
        '',
        '## Video',
        '',
        '| File | Work | Author | Date | Licence | Source |',
        '|---|---|---|---|---|---|',
        f"| `{video['id']}` | {video['name']} | {video['artist']} | {video['date']} | {video['licence']} | [Wikimedia Commons]({video['sourceUrl']}) |",
        '',
    ]
    CREDITS.write_text('\n'.join(lines), encoding='utf-8', newline='\n')


def main():
    should_download = '--download' in sys.argv
    sources = json.loads(SOURCES.read_text(encoding='utf-8'))
    images = sources['images']

    print('Checking licences on Wikimedia Commons...')
    ok, refused = licence_report(images, check_images(images))
    video = check_video(dict(sources['video']))

    print(f'\n{len(ok)} images accepted, {len(refused)} refused.\n')
    for i in ok:
        print(f"  OK  {i['id']:<24} {i['licence']:<14} {i['artist'][:28]:<28} {i['date'][:24]:<24} {i['original']}")
    for item_id, reason in refused:
        print(f'  NO  {item_id:<24} {reason}')
    print(f"\n  Video: {video['name']} | {video['licence']} | {video['artist'][:40]}")
    print(f"         WebM 480p: {video['webmUrl']}\n         MOV 360p:  {video['movUrl']}")

    if refused:
        raise SystemExit('\nFix or remove the refused files before downloading.')
    if not should_download:
        print('\nCheck only. Nothing was downloaded. Run with --download to fetch and optimise.')
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {'images': {}, 'video': {}}
    for i in ok:
        print(f"Preparing {i['id']}...")
        files = save_webp(download(i['thumbUrl'], f"{i['id']}.jpg"), i['id'])
        manifest['images'][i['id']] = {
            'for': i['for'], 'alt': i['alt'], 'name': i['name'], 'artist': i['artist'],
            'date': i['date'], 'licence': i['licence'], 'sourceUrl': i['sourceUrl'], **files,
        }

    poster = save_webp(download(video['posterUrl'], f"{video['id']}-poster.jpg"), f"{video['id']}-poster")
    entry = {'alt': video['alt'], 'name': video['name'], 'artist': video['artist'], 'date': video['date'],
             'licence': video['licence'], 'sourceUrl': video['sourceUrl'],
             'poster': poster['hero'], 'posterCard': poster['card']}
    for key, ext in (('webmUrl', 'webm'), ('movUrl', 'mov')):
        if video.get(key):
            time.sleep(PAUSE)
            path = OUT_DIR / f"{video['id']}.{ext}"
            path.write_bytes(fetch(video[key]).read())
            entry[ext] = f'media/{path.name}'
            entry[f'{ext}Size'] = path.stat().st_size
    manifest['video'] = entry

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8', newline='\n')
    write_credits(ok, video)

    # Cross-check: every file on disk is listed in the manifest, and the reverse.
    listed = {Path(v).name for item in manifest['images'].values() for k, v in item.items() if k in ('hero', 'card')}
    listed |= {Path(entry[k]).name for k in ('poster', 'posterCard', 'webm', 'mov') if k in entry}
    on_disk = {p.name for p in OUT_DIR.iterdir()}
    if listed != on_disk:
        raise SystemExit(f'Mismatch. Unlisted files: {on_disk - listed}. Missing files: {listed - on_disk}.')

    total_images = sum(item['heroSize'] + item['cardSize'] for item in manifest['images'].values())
    print(f'\nImages: {total_images // 1024} KB in total (budget 3072 KB).')
    for ext in ('webm', 'mov'):
        if f'{ext}Size' in entry:
            print(f"Video {ext}: {entry[ext + 'Size'] // 1024} KB")
    print(f'Wrote {MANIFEST.relative_to(ROOT)} and {CREDITS.relative_to(ROOT)}.')


if __name__ == '__main__':
    main()

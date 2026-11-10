"""Build the site's responsive images from scripts/photos.json.

Downloads each remote source once into .cache/photos/, applies the optional crop and the house
grade (see GRADE), and writes
WebP renditions to src/assets/img/<key>-<width>.webp plus src/data/photos.generated.json,
which the page templates read for widths, dimensions, alt text and focal points.

    python3 scripts/images.py            # build anything missing
    python3 scripts/images.py --force    # rebuild everything
"""
import hashlib, json, sys, urllib.request
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'scripts' / 'photos.json'
CACHE = ROOT / '.cache' / 'photos'
OUT = ROOT / 'src' / 'assets' / 'img'
DATA = ROOT / 'src' / 'data' / 'photos.generated.json'
WIDTHS = [240, 480, 800, 1200, 1600]
HERO_WIDTHS = [240, 640, 960, 1280, 1920, 2400]
# Page heroes also get a 3:4 crop, so phones in portrait load a sharp, small file instead of
# stretching a landscape one to fill a tall screen.
PORTRAIT_WIDTHS = [480, 640, 800, 960, 1280]
QUALITY = 74
# The house grade. Stock photos come from forty different cameras and editors; this pulls them
# toward one look: restrained colour, cool shadows, faintly warm highlights, a soft film curve.
GRADE = {'sat': 0.82, 'tone': 1.0, 'curve': 0.22}


def grade(im, spec):
    """Apply the house grade. `spec` is False to skip, or overrides for GRADE."""
    if spec is False:
        return im
    g = {**GRADE, **(spec or {})}
    a = np.asarray(im).astype(np.float32) / 255.0
    lum = (a * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)).sum(-1, keepdims=True)
    a = lum + (a - lum) * g['sat']
    shadows, highlights = (1 - lum) ** 2.0, lum ** 2.0
    a = a + g['tone'] * (shadows * np.array([-0.034, 0.002, 0.036], dtype=np.float32) + highlights * np.array([0.016, 0.006, -0.020], dtype=np.float32))
    a = np.clip(a, 0, 1)
    a = a + (a * a * (3 - 2 * a) - a) * g['curve']
    a = 0.030 + a * (0.985 - 0.030)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def source(key, spec):
    src = spec['src']
    if src.startswith('http'):
        CACHE.mkdir(parents=True, exist_ok=True)
        path = CACHE / f'{key}.jpg'
        # The cache may be shared between checkouts: a key that is new here gets a name tied to
        # its source, so two checkouts can use the same key for different photos.
        if not path.exists():
            path = CACHE / f"{key}-{hashlib.sha1(src.encode()).hexdigest()[:8]}.jpg"
        if not path.exists():
            req = urllib.request.Request(src, headers={'User-Agent': 'uresco-site image build'})
            with urllib.request.urlopen(req, timeout=60) as r:
                path.write_bytes(r.read())
        return path
    return ROOT / src


def crop_portrait(im, focal):
    """Largest 3:4 crop, placed the way CSS object-position would place it."""
    fx, fy = 0.5, 0.5
    if focal:
        parts = focal.replace('%', '').split()
        fx, fy = float(parts[0]) / 100, float(parts[1]) / 100
    w, h = im.size
    cw, ch = (round(h * 3 / 4), h) if w / h > 3 / 4 else (w, round(w * 4 / 3))
    left, top = round((w - cw) * fx), round((h - ch) * fy)
    return im.crop((left, top, left + cw, top + ch))


def main(force=False):
    photos = {k: v for k, v in json.loads(MANIFEST.read_text()).items() if not k.startswith('_')}
    OUT.mkdir(parents=True, exist_ok=True)
    out = {}
    for key, spec in photos.items():
        alias = spec['src'][1:] if spec['src'].startswith('@') else None
        base = photos[alias] if alias else spec
        im = Image.open(source(alias or key, base))
        im = ImageOps.exif_transpose(im).convert('RGB')
        crop = spec.get('crop') or base.get('crop')
        if crop:
            w, h = im.size
            im = im.crop((round(crop[0] * w), round(crop[1] * h), round(crop[2] * w), round(crop[3] * h)))
        im = grade(im, spec.get('grade', base.get('grade')))
        hero = spec.get('hero', base.get('hero', False))
        widths = [w for w in (HERO_WIDTHS if hero else WIDTHS) if w <= im.width]
        # Small originals (the old site's photos) keep their native size as the largest file.
        if not widths or (im.width < 1200 and im.width > widths[-1] * 1.1):
            widths.append(im.width)
        for w in widths:
            dest = OUT / f'{key}-{w}.webp'
            if force or not dest.exists():
                h = round(im.height * w / im.width)
                im.resize((w, h), Image.LANCZOS).save(dest, 'WEBP', quality=QUALITY, method=6)
        portrait, pw, ph = [], None, None
        if spec.get('art', base.get('art')):
            crop_im = crop_portrait(im, spec.get('focal') or base.get('focal'))
            pw, ph = crop_im.size
            portrait = [w for w in PORTRAIT_WIDTHS if w <= pw]
            if not portrait or pw > portrait[-1] * 1.1:
                portrait.append(pw)
            for w in portrait:
                dest = OUT / f'{key}-p-{w}.webp'
                if force or not dest.exists():
                    crop_im.resize((w, round(ph * w / pw)), Image.LANCZOS).save(dest, 'WEBP', quality=QUALITY, method=6)
        out[key] = {
            'widths': widths,
            'width': widths[-1],
            'height': round(im.height * widths[-1] / im.width),
            'alt': spec.get('alt') or base.get('alt', ''),
            'focal': spec.get('focal') or base.get('focal'),
            'credit': base.get('credit'),
            'page': base.get('page'),
            'standIn': bool(alias),
            'portrait': portrait,
            'pwidth': portrait[-1] if portrait else None,
            'pheight': round(ph * portrait[-1] / pw) if portrait else None,
            # Average colour, painted behind the image while it loads.
            'color': '#%02x%02x%02x' % im.resize((1, 1), Image.LANCZOS).getpixel((0, 0)),
        }
    # Drop renditions no longer referenced.
    keep = {f'{k}-{w}.webp' for k, v in out.items() for w in v['widths']}
    keep |= {f'{k}-p-{w}.webp' for k, v in out.items() for w in v['portrait']}
    for f in OUT.glob('*.webp'):
        if f.name not in keep:
            f.unlink()
    DATA.write_text(json.dumps(out, indent=1) + '\n')
    # Credits for every photo the site uses, regenerated with the images.
    lines = ['# Photo credits', '', 'Generated by `npm run images` from scripts/photos.json.', '',
             '| Key | Photo | Credit | Source |', '|---|---|---|---|']
    for k, v in sorted(out.items()):
        if v['standIn']:
            continue
        src = f"[link]({v['page']})" if v.get('page') else 'Uresco archive (uresco.com)'
        lines.append(f"| `{k}` | {v['alt']} | {v['credit']} | {src} |")
    stand = [k for k, v in out.items() if v['standIn']]
    if stand:
        lines += ['', 'Stand-ins (reuse another photo until a real one is supplied): ' + ', '.join(f'`{k}`' for k in stand)]
    (ROOT / 'PHOTO-CREDITS.md').write_text('\n'.join(lines) + '\n')
    total = sum(f.stat().st_size for f in OUT.glob('*.webp'))
    print(f'{len(out)} photos, {len(keep)} files, {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main(force='--force' in sys.argv)

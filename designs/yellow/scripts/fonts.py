"""Subset the site's fonts to what it actually uses.

The whole site is set in one family: Archivo. Headlines use its wide, black end (width 125%,
weight 900) and text uses the normal width, so a single variable file carries both voices.
Archivo ships as a 650 KB variable font with Latin Extended split into a second file; this
keeps Latin plus the few extended characters the copy uses ("Utqiaġvik"), and pins the axes
to the ranges the CSS uses (width 100–125%, weight 400–900).

    python3 scripts/fonts.py        (needs: pip install fonttools brotli)
"""
import urllib.request
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'fonts'
OUT = ROOT / 'src' / 'assets' / 'fonts'
CDN = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/'
SOURCES = {
    'archivo-wide-var.woff2': ('archivo/Archivo%5Bwdth,wght%5D.ttf', {'wdth': (100, 125), 'wght': (400, 900)}),
}
# Basic Latin, Latin-1, Ġ ġ (Utqiaġvik), typographic punctuation, arrows, ™ €.
UNICODES = ('U+0020-007E,U+00A0-00FF,U+0120-0121,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,'
            'U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2193,U+2212,U+00B0')


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    for out, (path, axes) in SOURCES.items():
        src = CACHE / Path(path).name.replace('%5B', '[').replace('%5D', ']')
        if not src.exists():
            req = urllib.request.Request(CDN + path, headers={'User-Agent': 'uresco-site font build'})
            src.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        font = TTFont(src)
        if axes:
            font = instancer.instantiateVariableFont(font, axes)
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'case', 'ss01']
        opts.name_IDs = [1, 2, 3, 4, 6]
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(UNICODES))
        sub.subset(font)
        font.flavor = 'woff2'
        font.save(OUT / out)
        print(f'{out}: {(OUT / out).stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()

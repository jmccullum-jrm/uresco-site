"""Download and subset the site's fonts.

Three families, four files, about 113 KB in total:

  fraunces-var.woff2         Fraunces roman, display cut (optical size pinned at 144), weight 300-560
  fraunces-italic-var.woff2  Fraunces italic, same cut, weight 300-500
  instrument-sans-var.woff2  Instrument Sans, normal width, weight 400-700
  dm-mono-400.woff2          DM Mono Regular (latitudes, captions, labels)

Fraunces ships with four axes and is about 360 KB per style. The site only sets it large, so the
optical-size axis is pinned to its display end and the SOFT and WONK axes are dropped; that is what
gets each style under 40 KB. Everything is cut to Latin plus the few extra characters the copy
uses (Ġ ġ for Utqiaġvik, typographic punctuation, arrows).

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
    'fraunces-var.woff2': ('fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf', {'SOFT': 0, 'WONK': 0, 'opsz': 144, 'wght': (300, 560)}),
    'fraunces-italic-var.woff2': ('fraunces/Fraunces-Italic%5BSOFT,WONK,opsz,wght%5D.ttf', {'SOFT': 0, 'WONK': 0, 'opsz': 144, 'wght': (300, 500)}),
    'instrument-sans-var.woff2': ('instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf', {'wdth': 100, 'wght': (400, 700)}),
    'dm-mono-400.woff2': ('dmmono/DMMono-Regular.ttf', None),
}
# Basic Latin, Latin-1, Ġ ġ (Utqiaġvik), typographic punctuation, arrows, ™ €.
UNICODES = ('U+0020-007E,U+00A0-00FF,U+0120-0121,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,'
            'U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2193,U+2212')
FEATURES = ['kern', 'liga', 'calt', 'tnum', 'pnum', 'lnum', 'case', 'ss01', 'frac', 'ordn']


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for out, (path, axes) in SOURCES.items():
        src = CACHE / Path(path).name.replace('%5B', '[').replace('%5D', ']')
        if not src.exists():
            req = urllib.request.Request(CDN + path, headers={'User-Agent': 'site font build'})
            src.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        font = TTFont(src)
        if axes:
            font = instancer.instantiateVariableFont(font, axes)
        # Partial instancing can leave glyphs without a variation record, which the subsetter trips on.
        if 'gvar' in font:
            for g in font.getGlyphOrder():
                font['gvar'].variations.setdefault(g, [])
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = FEATURES
        opts.name_IDs = [1, 2, 3, 4, 6]
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(UNICODES))
        sub.subset(font)
        font.flavor = 'woff2'
        font.save(OUT / out)
        size = (OUT / out).stat().st_size
        total += size
        print(f'{out}: {size / 1024:.1f} KB')
    keep = set(SOURCES)
    for f in OUT.glob('*.woff2'):
        if f.name not in keep:
            f.unlink()
    print(f'total: {total / 1024:.1f} KB')


if __name__ == '__main__':
    main()

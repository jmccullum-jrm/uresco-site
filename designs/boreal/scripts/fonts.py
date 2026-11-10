"""Subset the site's fonts to what it actually uses.

Geist (text and headlines) and Geist Mono (coordinates, data, labels) ship as variable fonts
of about 170 KB each. This keeps Latin plus the few extended characters the copy uses
("Utqiaġvik"), and pins the weight axis to the range the CSS uses, giving one small file
per family.

    python3 scripts/fonts.py        (needs: pip install fonttools brotli)
"""
import urllib.request
from io import BytesIO
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'fonts'
OUT = ROOT / 'src' / 'assets' / 'fonts'
CDN = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/'
SOURCES = {
    'geist-var.woff2': ('geist/Geist%5Bwght%5D.ttf', {'wght': (400, 700)}),
    'geistmono-var.woff2': ('geistmono/GeistMono%5Bwght%5D.ttf', {'wght': (400, 600)}),
}
# Basic Latin, Latin-1, Ġ ġ (Utqiaġvik), typographic punctuation, arrows, ™ €, ° ′ ″ and the middle dot.
UNICODES = ('U+0020-007E,U+00A0-00FF,U+0120-0121,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,'
            'U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2193,U+2197,U+2212')


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    for out, (path, axes) in SOURCES.items():
        src = CACHE / Path(path).name.replace('%5B', '[').replace('%5D', ']')
        if not src.exists():
            req = urllib.request.Request(CDN + path, headers={'User-Agent': 'uresco-site font build'})
            src.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        font = TTFont(src)
        if axes:
            # Round-trip through bytes: the subsetter needs the narrowed variation tables recompiled.
            buf = BytesIO()
            instancer.instantiateVariableFont(font, axes).save(buf)
            buf.seek(0)
            font = TTFont(buf)
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'case', 'zero', 'ss01', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08', 'ss09']
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

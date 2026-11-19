"""Put the generated chapters (tools/levels/ch5.json ... ch12.json) into index.html.

usage: python3 tools/embed-levels.py [last chapter, default 12]   e.g. 9 -> chapters 5-9 (90 levels)
Replaces everything between the GENERATED markers inside the LEVELS array, so it can be re-run."""
import json, pathlib, re, sys
LAST = int(sys.argv[1]) if len(sys.argv) > 1 else 12

root = pathlib.Path(__file__).resolve().parent.parent
f = root / 'index.html'
s = f.read_text(encoding='utf-8')
START, END = ' /*GENERATED*/', ' /*ENDGENERATED*/'

lines = []
for ch in range(5, LAST + 1):
    p = root / 'tools' / 'levels' / ('ch%d.json' % ch)
    levels = json.loads(p.read_text(encoding='utf-8'))
    assert len(levels) == 10, (p, len(levels))
    lines.append(' /* ---- chapter %d (levels %d-%d) ---- */' % (ch, (ch - 1) * 10 + 1, ch * 10))
    for L in levels:
        lines.append(' ' + json.dumps(L, separators=(',', ':')) + ',')
block = START + '\n' + '\n'.join(lines) + '\n' + END

if START in s:
    s = re.sub(re.escape(START) + r'.*?' + re.escape(END), lambda m: block, s, flags=re.S)
else:
    # first run: after the last hand-made level (chapter 4 boss)
    anchor = 'boss:1}\n];'
    i = s.index('/* ---- chapter 4')
    j = s.index(anchor, i)
    s = s[:j] + 'boss:1},\n' + block + '\n];' + s[j + len(anchor):]
n = sum(1 for l in lines if l.startswith(' {'))
s = re.sub(r'const CHAPTERS=\d+,PER=10;[^\n]*', 'const CHAPTERS=%d,PER=10;' % LAST, s)
f.write_text(s, encoding='utf-8')
print('embedded', n, 'levels; CHAPTERS =', LAST)

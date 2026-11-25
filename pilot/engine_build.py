from pathlib import Path

ROOT = Path(__file__).resolve().parent

def engine():
    source = '\n'.join((ROOT/name).read_text(encoding='utf8') for name in ('dictionary.js','markers.js','pixels.js'))
    return 'const Kart = (()=>{\n' + source + '\nreturn {cards,detect,svg};\n})();'

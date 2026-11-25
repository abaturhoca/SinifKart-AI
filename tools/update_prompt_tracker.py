"""Build the clickable prompt overview from the latest report status table."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
report = (ROOT / 'docs' / 'Rapor_2026-11-24_Soru_CSV_v27.md').read_text(encoding='utf-8')
rows = []
for line in report.splitlines():
    cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
    if len(cells) != 3 or cells[0] in ('Prompt', '---'):
        continue
    if cells[0].startswith(('Ana ', 'H')):
        rows.append(cells)
for row in rows:
    if row[0] == 'Ana 10':
        row[2] = 'Web CSV/yazdırma ve öğretmen Excel/yazdırma toplamları 40×6 örnekte eşleşti. Gerçek tarayıcıda PDF, indirme ve uzun dönem kabulü açık.'
tracked = [row for row in rows if row[0] not in ('Ana 0', 'HK')]
assert len(tracked) == 20 and sum(row[1] == 'Tamam' for row in tracked) == 1
html = ['<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
        '<title>SınıfKart prompt takibi</title><style>body{max-width:60em;margin:2em auto;padding:0 1em;font:17px/1.55 system-ui;color:#12263a}details{padding:.7em;border-bottom:1px solid #bbb}summary{cursor:pointer}small{color:#566}a{color:#135483}</style>',
        '<h1>SınıfKart · Prompt takibi</h1><p>24 Kasım 2026 · 20 promptun <strong>1 tanesi tam kabul</strong>, 19 tanesi kısmi kabul. Her satıra tıklayarak açık kabulü görün.</p>']
for title, status, gate in rows:
    html.append(f'<details><summary><strong>{escape(title)}</strong> · {escape(status)}</summary><p>{escape(gate)}</p></details>')
html.append('<p><small>H2 ve H3 sentetik test kapısını geçti. Fiziksel baskı, gerçek kamera, Android APK ve P580 kabulü yapılmadı. v28 web kaynağı yeniden derlenmedi.</small></p></html>')
(ROOT / 'Prompt_Takibi.html').write_text(''.join(html), encoding='utf-8')

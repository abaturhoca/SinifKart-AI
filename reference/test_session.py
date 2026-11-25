"""Replay simulated camera frames through the desktop scanner's actual persistence layer."""
import csv
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from test_detection import scene
from detect_image import detect
from session import Session


def main():
    image,expected=scene(20)
    rows=detect(image)[1]['cards']
    with TemporaryDirectory() as folder:
        path=Path(folder)/'test.sqlite'
        session=Session(path,'demo','1',20)
        session.observe(rows)
        session.observe(rows)
        assert session.answers()=={}
        session.observe(rows)
        assert session.answers()==expected
        session.observe(rows)
        assert session.db.execute('select count(*) from history').fetchone()[0]==20
        changed,_=scene(20,question=1)
        changed_rows=detect(changed)[1]['cards']
        session.observe(changed_rows)
        session.observe([])
        session.observe(changed_rows)
        session.observe(changed_rows)
        assert session.answers()==expected
        session.observe(changed_rows)
        expected={r['cardId']:r['answer'] for r in changed_rows}
        assert session.answers()==expected
        for _ in range(4):
            session.observe([rows[0],dict(rows[0],answer='D')])
        assert session.answers()==expected
        session.db.close()
        reopened=Session(path,'demo','1',20)
        assert reopened.answers()==expected
        dest=Path(folder)/'answers'
        reopened.export(dest)
        packet=json.loads(dest.with_suffix('.json').read_text())
        assert {r['cardId']:r['answer'] for r in packet['responses']}==expected
        with dest.with_suffix('.csv').open(encoding='utf-8-sig') as stream:
            assert {int(r['Kart']):r['Cevap'] for r in csv.DictReader(stream)}==expected
        reopened.db.close()
    print('PASS: 20 cards, confirmation, repeated frames, interrupted streak, changes, duplicates, persistence, JSON/CSV')


if __name__=='__main__':
    main()

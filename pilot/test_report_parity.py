"""Compare the same synthetic exam in web CSV/print and teacher Excel/print."""
from contextlib import closing
from html.parser import HTMLParser
from io import BytesIO, StringIO
import csv
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import server
from reports import excel, printable, report


class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.current = None
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.current = []
            self.tables.append(self.current)
        elif tag == 'tr' and self.current is not None:
            self.row = []
            self.current.append(self.row)
        elif tag in ('td', 'th') and self.row is not None:
            self.cell = ''

    def handle_data(self, data):
        if self.cell is not None:
            self.cell += data

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(self.cell)
            self.cell = None
        elif tag == 'tr':
            self.row = None
        elif tag == 'table':
            self.current = None


class ReportParity(unittest.TestCase):
    def test_40_students_six_questions(self):
        node = os.environ.get('SINIFKART_TEST_NODE') or shutil.which('node')
        if not node:
            self.skipTest('Node bulunamadı; çapraz format testi için SINIFKART_TEST_NODE ayarlayın')
        fixture = Path(__file__).resolve().parents[1] / 'web' / 'parity-fixture.mjs'
        web = json.loads(subprocess.check_output([node, str(fixture)], text=True, encoding='utf-8'))
        previous = server.DATA
        with tempfile.TemporaryDirectory() as directory:
            server.DATA = Path(directory)
            try:
                server.init()
                with closing(server.connect()) as db:
                    students = [{'number': str(i + 1), 'name': f'Öğrenci {i + 1}', 'cardId': i + 1}
                                for i in range(40)]
                    with db:
                        cid = server.change(db, '/class', {'name': '6-A', 'students': students})['class_id']
                    for q in range(6):
                        with db:
                            token = server.change(db, '/session', {
                                'class_id': cid, 'exam': 'Deneme', 'outcome': 'FB.6.1.1',
                                'title': f'Soru {q + 1}', 'opts': list('ABCD'), 'correct': 'ABCD'[q % 4]
                            })['token']
                        if q < 5:
                            with db:
                                server.change(db, '/import', {'token': token, 'answers': {
                                    str(i + 1): 'ABCD'[(i + q) % 4] for i in range(40)
                                }})
                    tables = report(db, cid, 'Deneme')
            finally:
                server.DATA = previous

        from openpyxl import load_workbook
        book = load_workbook(BytesIO(excel(tables)), read_only=True, data_only=True)
        for title, rows in tables.items():
            self.assertEqual(list(book[title].values), [tuple(value if value != '' else None for value in row) for row in rows])
        pilot_print = Tables()
        pilot_print.feed(printable(tables))
        self.assertEqual(len(pilot_print.tables), 3)
        for parsed, rows in zip(pilot_print.tables, tables.values()):
            self.assertEqual(parsed, [[str(cell) if cell is not None else '-' for cell in row] for row in rows])
        web_print = Tables()
        web_print.feed(web['html'])
        self.assertEqual(len(web_print.tables), 2)
        student_csv = list(csv.reader(StringIO(web['studentCsv'].lstrip('\ufeff')), delimiter=';'))
        question_csv = list(csv.reader(StringIO(web['questionCsv'].lstrip('\ufeff')), delimiter=';'))
        self.assertEqual(web_print.tables[0], student_csv)
        self.assertEqual(web_print.tables[1], question_csv)
        self.assertEqual(len(student_csv) - 1, 40)
        self.assertEqual(len(question_csv) - 1, 6)
        self.assertEqual(sum(int(row[4]) for row in question_csv[1:]), 200)
        self.assertEqual(sum(int(row[5]) for row in question_csv[1:]), 50)
        self.assertEqual([row[4:8] for row in tables['Sorular'][1:]],
                         [[int(value) for value in row[8:12]] for row in question_csv[1:]])
        self.assertEqual([row[9] for row in tables['Sorular'][1:]], [int(row[5]) for row in question_csv[1:]])
        self.assertEqual([row[8] for row in tables['Sorular'][1:]], [int(row[7]) for row in question_csv[1:]])
        self.assertEqual([row[-3:] for row in tables['Öğrenciler'][1:]],
                         [[int(value) for value in row[-3:]] for row in student_csv[1:]])


if __name__ == '__main__':
    if len(sys.argv) > 1:
        os.environ['SINIFKART_TEST_NODE'] = sys.argv[1]
    unittest.main(argv=[sys.argv[0]])

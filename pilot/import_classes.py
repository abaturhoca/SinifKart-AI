"""Import the six workbook class sheets into the local teacher database."""
import argparse
import json
from contextlib import closing
from pathlib import Path

from openpyxl import load_workbook
import server

CLASSES = ("5-A", "5-B", "5-C", "6-A", "6-B", "6-C")


def read_classes(path):
    workbook = load_workbook(path, read_only=True, data_only=True)
    try:
        result = {}
        for class_name in CLASSES:
            sheet = workbook[class_name]
            students = []
            for row in sheet.iter_rows(min_row=6, max_col=4, values_only=True):
                order, number, name, reported_class = row
                if order is None and number is None and name is None:
                    continue
                if not isinstance(order, int) or order != len(students) + 1:
                    raise ValueError(f"{class_name} sıra numarası hatalı.")
                if not isinstance(name, str) or not name.strip():
                    raise ValueError(f"{class_name} öğrenci adı eksik.")
                if number is None or not str(number).strip():
                    raise ValueError(f"{class_name} okul numarası eksik.")
                if reported_class and str(reported_class).strip().upper().replace("/", "-") != class_name:
                    raise ValueError(f"{class_name} öğrenci sınıfı uyuşmuyor.")
                students.append({"number":str(number).strip(),"name":name.strip(),"cardId":order})
            if not 1 <= len(students) <= 100:
                raise ValueError(f"{class_name} sınıf mevcudu geçersiz.")
            if len({s["number"] for s in students}) != len(students):
                raise ValueError(f"{class_name} tekrar eden öğrenci numarası.")
            result[class_name] = students
        return result
    finally:
        workbook.close()


def import_workbook(path):
    classes = read_classes(path)
    server.init()
    with closing(server.connect()) as db, db:
        existing = {row["name"]:row["id"] for row in db.execute("SELECT id,name FROM classes")}
        for name, students in classes.items():
            if name in existing:
                stored = db.execute("SELECT students FROM class_cards WHERE class_id=?",(existing[name],)).fetchone()
                if not stored or json.loads(stored[0]) != students:
                    raise ValueError(f"{name} zaten farklı içerikle kayıtlı. Önce sınıfı inceleyin.")
                continue
            server.change(db,"/class",{"name":name,"students":students})
    return {name:len(students) for name,students in classes.items()}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="5-A, 5-B, 5-C, 6-A, 6-B ve 6-C listelerini al.")
    parser.add_argument("workbook",type=Path)
    args = parser.parse_args()
    print(import_workbook(args.workbook))

import argparse
import sqlite3
from contextlib import closing
from pathlib import Path
from server import DATA

if __name__=="__main__":
    parser=argparse.ArgumentParser(description="SınıfKart verisinin tutarlı SQLite yedeğini alır.")
    parser.add_argument("hedef",type=Path)
    args=parser.parse_args()
    src=DATA/"sinifkart.sqlite"
    if not src.is_file():parser.error("Veritabanı bulunamadı.")
    with args.hedef.open("xb"):pass
    try:
        with closing(sqlite3.connect(src)) as source, closing(sqlite3.connect(args.hedef)) as dest:
            source.backup(dest)
            if dest.execute("PRAGMA integrity_check").fetchone()[0]!="ok":raise RuntimeError("Yedek doğrulanamadı.")
    except Exception:
        args.hedef.unlink()
        raise
    print("Yedek doğrulandı.",args.hedef)

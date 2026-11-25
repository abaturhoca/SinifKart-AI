"""Restore a verified SQLite backup into a fresh teacher data directory."""
import argparse
import sqlite3
from contextlib import closing
from pathlib import Path


def restore(source, directory):
    source=Path(source).resolve(strict=True)
    directory=Path(directory)
    directory.mkdir(parents=True,exist_ok=True)
    target=directory/"sinifkart.sqlite"
    with closing(sqlite3.connect(source.as_uri()+"?mode=ro",uri=True)) as original:
        for table,columns in {"classes":"id,name,roster","sessions":"token,class_id,title,opts,correct","votes":"token,card,answer"}.items():
            original.execute(f"SELECT {columns} FROM {table} LIMIT 0")
        if original.execute("PRAGMA integrity_check").fetchone()[0]!="ok" or original.execute("PRAGMA foreign_key_check").fetchone():
            raise ValueError("Yedek bütünlük kontrolünden geçemedi.")
        with target.open("xb"):pass
        try:
            with closing(sqlite3.connect(target)) as copy:
                original.backup(copy)
                if copy.execute("PRAGMA integrity_check").fetchone()[0]!="ok":
                    raise ValueError("Geri yükleme doğrulanamadı.")
        except BaseException:
            target.unlink()
            raise
    return target

if __name__=="__main__":
    parser=argparse.ArgumentParser(description="SınıfKart yedeğini yeni veri klasörüne geri yükler.")
    parser.add_argument("yedek",type=Path)
    parser.add_argument("klasor",type=Path)
    args=parser.parse_args()
    print(restore(args.yedek,args.klasor))

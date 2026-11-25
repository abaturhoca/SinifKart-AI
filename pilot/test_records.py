import tempfile
import unittest
from contextlib import closing
from pathlib import Path
import server


class Records(unittest.TestCase):
    def setUp(self):
        tmp=tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        old=server.DATA
        self.addCleanup(setattr,server,"DATA",old)
        server.DATA=Path(tmp.name)
        server.init()
        self.db=server.connect()
        self.addCleanup(self.db.close)
        self.put("/class",{"name":"6-A","names":["Bir","İki","Üç"]})
        self.token=self.put("/session",{"class_id":1,"title":"Soru","opts":list("abcd"),"correct":"A"})["token"]

    def put(self,path,data):
        with self.db:
            return server.change(self.db,path,data)

    def votes(self,answers):
        self.put("/import",{"token":self.token,"answers":answers})

    def test_idempotent_and_persistent(self):
        self.votes({"1":"A"})
        self.votes({"1":"A"})
        with closing(server.connect()) as db:
            self.assertEqual([tuple(r) for r in db.execute("SELECT card,answer FROM votes")],[(1,"A")])

    def test_conflict_atomic(self):
        self.votes({"2":"B"})
        with self.assertRaises(ValueError):self.votes({"1":"A","2":"D"})
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM votes").fetchone()[0],1)

    def test_invalid_batch_atomic(self):
        with self.assertRaises(ValueError):self.votes({"1":"A","4":"C"})
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM votes").fetchone()[0],0)

    def test_answers_are_scoped(self):
        with self.assertRaises(ValueError):self.put("/import",{"token":"other","answers":{"1":"A"}})
        with self.assertRaises(ValueError):self.votes({"3":"E"})

    def test_empty_class(self):
        with self.assertRaises(ValueError):self.put("/class",{"name":"6-B","names":[]})

    def test_restore_in_fresh_directory(self):
        from restore import restore
        import sqlite3
        self.votes({"1":"A"})
        restored=restore(server.DATA/"sinifkart.sqlite",server.DATA/"recovered")
        with closing(sqlite3.connect(restored)) as other:
            self.assertEqual(other.execute("SELECT card,answer FROM votes").fetchall(),[(1,"A")])
        with self.assertRaises(FileExistsError):restore(server.DATA/"sinifkart.sqlite",restored.parent)

if __name__=="__main__":unittest.main()

"""HTTP integration check; uses a temporary directory and an ephemeral port."""
import json
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request,urlopen
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import patch
from http.server import ThreadingHTTPServer
import server


class TeacherWorkflow(unittest.TestCase):
    def test_lesson(self):
        with TemporaryDirectory() as temp, patch.object(server,"DATA",Path(temp)):
            server.init()
            http=ThreadingHTTPServer(("127.0.0.1",0),server.Handler)
            port=http.server_port
            with patch.object(server,"PORT",port):
                thread=threading.Thread(target=http.serve_forever,daemon=True)
                thread.start()
                try:
                    base=f"http://127.0.0.1:{port}"
                    def get(path):return urlopen(base+path).read().decode("utf-8-sig")
                    def post(path,data,origin=base):
                        req=Request(base+path,json.dumps(data).encode(),headers={"Content-Type":"application/json","Origin":origin})
                        return json.load(urlopen(req))
                    self.assertIn("Öğretmen paneli",get("/"))
                    post("/class",{"name":"6-A","names":["=Example","Örnek İki"]})
                    token=post("/session",{"class_id":1,"title":"<örnek>","opts":list("abcd"),"correct":"D"})["token"]
                    scanner=get("/scan/"+token)
                    self.assertNotIn("__ENGINE__",scanner)
                    self.assertNotIn("<örnek>",scanner)
                    self.assertNotIn("Örnek İki",scanner)
                    post("/import",{"token":token,"answers":{"1":"D"}})
                    self.assertEqual(json.loads(get("/result/"+token)),[[1,"=Example","D",1],[2,"Örnek İki","",None]])
                    self.assertIn("'=Example;D;1",get("/csv/"+token))
                    packet=json.loads(get("/packet/"+token))
                    self.assertEqual(packet,{"sessionId":token,"questionId":token,"classSize":2,"options":"ABCD"})
                    post("/import",{"version":1,"sessionId":token,"questionId":token,
                                    "responses":[{"cardId":1,"answer":"D"}]})
                    from io import BytesIO
                    from openpyxl import load_workbook
                    book=load_workbook(BytesIO(urlopen(base+"/xlsx/"+token).read()))
                    self.assertEqual(len(book.sheetnames),3)
                    student=book.worksheets[0]
                    self.assertEqual(student["B2"].data_type,"s")
                    self.assertEqual([cell.value for cell in student[2]][2:],["D",1,0,0])
                    self.assertEqual([cell.value for cell in student[3]][2:],[None,None,None,1])
                    self.assertEqual([cell.value for cell in book.worksheets[2][2]][1:],[1,1,2,100,50])
                    self.assertIn("&lt;örnek&gt;",get("/print-report/"+token))
                    self.assertIn("SınıfKart",get("/web/"))
                    self.assertIn("SınıfKart",get("/index.html"))
                    self.assertIn("FB.5.1.1",get("/curriculum.json"))
                    self.assertIn("FB.5.1.1",get("/sourced-questions.json"))
                    self.assertIn("sinifkart-static-",get("/sw.js"))
                    with self.assertRaises(HTTPError):get("/web/unknown.json")
                    projection=get("/projection/"+token)
                    self.assertIn("&lt;örnek&gt;",projection)
                    self.assertNotIn("=Example",projection)
                    self.assertEqual(json.loads(get("/participation/"+token)),{"count":1,"size":2})
                    packet=json.loads(get("/exam-export/"+token))
                    self.assertNotIn("=Example",str(packet))
                    packet.update(exam="İkinci sınav",class_id=1)
                    with self.assertRaises(HTTPError):
                        post("/exam-import",{**packet,"questions":packet["questions"]+[{}]})
                    self.assertEqual(len(json.loads(get("/state"))["sessions"]),1)
                    tokens=post("/exam-import",packet)["tokens"]
                    self.assertEqual(len(tokens),1)
                    self.assertEqual(json.loads(get("/exam-export/"+tokens[0]))["questions"],packet["questions"])
                    with self.assertRaises(HTTPError):post("/exam-import",packet)
                    mapped=post("/class",{"name":"6-B","students":[{"number":"007","name":"Deneme","cardId":42},{"number":"008","name":"Deneme","cardId":17}]})
                    mt=post("/session",{"class_id":mapped["class_id"],"title":"Kontrol","opts":["Evet","Hayır"],"correct":"B"})["token"]
                    self.assertEqual(json.loads(get("/packet/"+mt))["cards"],[42,17])
                    with self.assertRaises(HTTPError):post("/import",{"token":mt,"answers":{"1":"A"}})
                    post("/import",{"token":mt,"answers":{"17":"B"}})
                    self.assertEqual(json.loads(get("/result/"+mt)),[[42,"Deneme","",None],[17,"Deneme","B",1]])
                    mapped_book=load_workbook(BytesIO(urlopen(base+"/xlsx/"+mt).read()))
                    self.assertEqual(mapped_book.worksheets[0]["A3"].value,17)
                    self.assertEqual(mapped_book.worksheets[0]["D3"].value,1)
                    post("/transfer",{"class_id":mapped["class_id"],"number":"008","student":{"number":"009","name":"Yeni","cardId":17}})
                    next_token=post("/session",{"class_id":mapped["class_id"],"title":"Sonraki soru","exam":"Sonraki","opts":["Evet","Hayır"],"correct":"A"})["token"]
                    post("/import",{"token":next_token,"answers":{"17":"A"}})
                    self.assertEqual(json.loads(get("/result/"+mt))[1],[17,"Deneme","B",1])
                    self.assertEqual(json.loads(get("/result/"+next_token))[1],[17,"Yeni","A",1])
                    old_again=load_workbook(BytesIO(urlopen(base+"/xlsx/"+mt).read()))
                    self.assertEqual(old_again.worksheets[0]["B3"].value,"Deneme")
                    mixed=post("/session",{"class_id":mapped["class_id"],"title":"Aynı sınav sonraki soru","exam":"Genel","opts":["Evet","Hayır"],"correct":"A"})["token"]
                    post("/import",{"token":mixed,"answers":{"17":"A"}})
                    historic=load_workbook(BytesIO(urlopen(base+"/xlsx/"+mt).read())).worksheets[0]
                    rows={historic.cell(i,2).value:[historic.cell(i,3).value,historic.cell(i,4).value] for i in range(2,historic.max_row+1)}
                    self.assertEqual(rows["Deneme"],["B",None])
                    self.assertEqual(rows["Yeni"],[None,"A"])
                    post("/archive",{"class_id":mapped["class_id"]})
                    with self.assertRaises(HTTPError):post("/session",{"class_id":mapped["class_id"],"title":"Yasak","opts":["a","b"],"correct":"A"})
                    self.assertEqual(json.loads(get("/result/"+mt))[1][1],"Deneme")
                    with self.assertRaises(HTTPError) as ex:post("/class",{},origin="http://other.local")
                    self.assertEqual(ex.exception.code,403)
                finally:
                    http.shutdown()
                    thread.join()
                    http.server_close()

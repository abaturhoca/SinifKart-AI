"""SınıfKart AI local teacher service. Python 3.9+, standard library."""
from engine_build import engine
from reports import report, excel, printable
import csv
import io
import json
import os
import secrets
import sqlite3
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = Path(os.environ.get("SINIFKART_DATA", Path.home() / "SinifKart-Hibrit-Veri"))
PORT = int(os.environ.get("SINIFKART_PORT", "8765"))


def connect():
    DATA.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATA / "sinifkart.sqlite", timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    return db


def init():
    with closing(connect()) as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY,name TEXT NOT NULL,roster TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS class_cards(class_id INTEGER PRIMARY KEY REFERENCES classes(id),students TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS class_archive(class_id INTEGER PRIMARY KEY REFERENCES classes(id),archived INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,class_id INTEGER NOT NULL REFERENCES classes(id),title TEXT NOT NULL,opts TEXT NOT NULL,correct TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS session_cards(token TEXT PRIMARY KEY REFERENCES sessions(token),students TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS meta(token TEXT PRIMARY KEY REFERENCES sessions(token),exam TEXT NOT NULL,outcome TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS votes(token TEXT REFERENCES sessions(token),card INTEGER,answer TEXT NOT NULL,PRIMARY KEY(token,card));
        INSERT OR IGNORE INTO meta SELECT token,'Genel','' FROM sessions;
        INSERT OR IGNORE INTO session_cards SELECT sessions.token,COALESCE(class_cards.students,'') FROM sessions
            LEFT JOIN class_cards ON class_cards.class_id=sessions.class_id;
        """)


def label(s, limit):
    if not isinstance(s, str) or not 0 < len(s.strip()) <= limit:
        raise ValueError("Metin boş veya çok uzun.")
    return s.strip()


def change(db, path, data):
    if not isinstance(data, dict):
        raise ValueError("Veri biçimi geçersiz.")
    if path == "/draft":
        from assist import draft
        return draft(label(data.get("topic"),180))
    if path == "/archive":
        cid=data.get("class_id")
        if type(cid) is not int or not db.execute("SELECT 1 FROM classes WHERE id=?",(cid,)).fetchone():
            raise ValueError("Sınıf bulunamadı.")
        db.execute("INSERT INTO class_archive VALUES(?,1) ON CONFLICT(class_id) DO UPDATE SET archived=1",(cid,))
        return {"ok":True}
    if path == "/transfer":
        cid=data.get("class_id")
        if type(cid) is not int or db.execute("SELECT archived FROM class_archive WHERE class_id=?",(cid,)).fetchone():
            raise ValueError("Sınıf bulunamadı veya arşivlendi.")
        row=db.execute("SELECT students FROM class_cards WHERE class_id=?",(cid,)).fetchone()
        if row is None: raise ValueError("Kart atamalı bir sınıf seçin.")
        students=json.loads(row[0])
        number=label(data.get("number"),40)
        replacement=data.get("student")
        if not isinstance(replacement,dict) or type(replacement.get("cardId")) is not int:
            raise ValueError("Yeni öğrenci bilgileri geçersiz.")
        card=replacement["cardId"]
        if card not in range(1,101) or any(s["cardId"]==card and s["number"]!=number for s in students):
            raise ValueError("Kart başka öğrenciye atanmış.")
        if any(s["number"]==replacement.get("number") and s["number"]!=number for s in students):
            raise ValueError("Öğrenci numarası başka öğrenciye atanmış.")
        new={"cardId":card,"number":label(replacement.get("number"),40),"name":label(replacement.get("name"),100)}
        index=next((i for i,s in enumerate(students) if s["number"]==number),None)
        if index is None:raise ValueError("Nakledilecek öğrenci bulunamadı.")
        students[index]=new
        db.execute("UPDATE class_cards SET students=? WHERE class_id=?",(json.dumps(students),cid))
        db.execute("UPDATE classes SET roster=? WHERE id=?",(json.dumps([s["name"] for s in students]),cid))
        return {"ok":True}
    if path == "/exam-import":
        items = data.get("questions")
        if data.get("format") != "sinifkart-exam-1" or not isinstance(items,list) or not 1 <= len(items) <= 100:
            raise ValueError("Sınav dosyasında 1–100 soru bulunmalıdır.")
        exam = label(data.get("exam"),100)
        cid = data.get("class_id")
        db.execute("BEGIN IMMEDIATE")
        if db.execute("SELECT 1 FROM sessions JOIN meta USING(token) WHERE class_id=? AND exam=?", (cid,exam)).fetchone():
            raise ValueError("Bu sınıfta aynı adlı sınav var. Yeni bir sınav adı girin.")
        tokens = []
        for item in items:
            if not isinstance(item,dict):
                raise ValueError("Soru biçimi geçersiz.")
            tokens.append(change(db,"/session",{**item,"class_id":cid,"exam":exam})["token"])
        return {"tokens":tokens}
    if path == "/class":
        students=data.get("students")
        if students is not None:
            if not isinstance(students,list) or not 1<=len(students)<=100:
                raise ValueError("Sınıf mevcudu 1–100 olmalıdır.")
            records=[]
            for student in students:
                if not isinstance(student,dict) or type(student.get("cardId")) is not int or not 1<=student["cardId"]<=100:
                    raise ValueError("Kart numarası geçersiz.")
                records.append({"cardId":student["cardId"],"number":label(student.get("number"),40),"name":label(student.get("name"),100)})
            if any(len({r[key] for r in records})!=len(records) for key in ("cardId","number")):
                raise ValueError("Kart numarası ve okul numarası sınıf içinde tekil olmalıdır.")
            names=[r["name"] for r in records]
        else:
            names = data.get("names")
        if not isinstance(names,list) or not 1 <= len(names) <= 100:
            raise ValueError("1–100 öğrenci girin.")
        roster = [label(n,100) for n in names]
        cid=db.execute("INSERT INTO classes(name,roster) VALUES(?,?)",(label(data.get("name"),80),json.dumps(roster))).lastrowid
        if students is not None:
            db.execute("INSERT INTO class_cards VALUES(?,?)",(cid,json.dumps(records)))
        return {"ok":True,"class_id":cid}
    elif path == "/session":
        opts = data.get("opts")
        if not isinstance(opts,list) or not 2<=len(opts)<=4 or data.get("correct") not in list("ABCD"[:len(opts)]):
            raise ValueError("Dört seçenek ve cevap anahtarı gerekiyor.")
        token = secrets.token_hex(16)
        cid=data.get("class_id")
        if type(cid) is not int or not db.execute("SELECT 1 FROM classes WHERE id=?",(cid,)).fetchone():
            raise ValueError("Sınıfı seçin.")
        if db.execute("SELECT archived FROM class_archive WHERE class_id=?",(cid,)).fetchone():
            raise ValueError("Arşivlenen sınıfta yeni soru açılamaz.")
        db.execute("INSERT INTO sessions VALUES(?,?,?,?,?)",(token,cid,label(data.get("title"),600),json.dumps([label(x,250) for x in opts]),data["correct"]))
        current=db.execute("SELECT students FROM class_cards WHERE class_id=?",(cid,)).fetchone()
        db.execute("INSERT INTO session_cards VALUES(?,?)",(token,current[0] if current else ""))
        db.execute("INSERT INTO meta VALUES(?,?,?)",(token,label(data.get("exam") or "Genel",100),label(data["outcome"],180) if data.get("outcome") else ""))
        return {"token":token}
    elif path == "/import":
        if "responses" in data:
            if type(data.get("version")) is not int or data["version"]!=1 or data.get("sessionId")!=data.get("questionId"):
                raise ValueError("Dosya sürümü veya soru kimliği geçersiz.")
            responses=data["responses"]
            if not isinstance(responses,list) or len(responses)>100:
                raise ValueError("Cevap listesi geçersiz.")
            answers={}
            for item in responses:
                if not isinstance(item,dict) or type(item.get("cardId")) is not int or str(item["cardId"]) in answers:
                    raise ValueError("Tekrarlı veya geçersiz kart.")
                answers[str(item["cardId"])]=item.get("answer")
            data={"token":data.get("sessionId"),"answers":answers}
        token=label(data.get("token"),32)
        row=db.execute("SELECT roster,opts FROM sessions JOIN classes ON classes.id=class_id WHERE token=?",(token,)).fetchone()
        answers=data.get("answers")
        if not row or not isinstance(answers,dict) or not answers:
            raise ValueError("Oturum veya cevap listesi geçersiz.")
        stored=db.execute("SELECT students FROM session_cards WHERE token=?",(token,)).fetchone()
        allowed={str(s["cardId"]) for s in json.loads(stored[0])} if stored and stored[0] else {str(i+1) for i in range(len(json.loads(row[0])))}
        db.execute("BEGIN IMMEDIATE")
        for k,a in answers.items():
            if k not in allowed or a not in list("ABCD"[:len(json.loads(row[1]))]):
                raise ValueError("Kart veya cevap geçersiz.")
            old=db.execute("SELECT answer FROM votes WHERE token=? AND card=?",(token,int(k))).fetchone()
            if old and old[0]!=a:
                raise ValueError("Kart "+k+" için farklı kayıt var. Aktarım geri alındı.")
            db.execute("INSERT OR IGNORE INTO votes VALUES(?,?,?)",(token,int(k),a))
    else:
        raise ValueError("Bilinmeyen işlem.")
    return {"ok":True}


class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):
        pass

    def send(self,body,kind="application/json",status=200,filename=None):
        if not isinstance(body,bytes):
            body=(body if isinstance(body,str) else json.dumps(body,ensure_ascii=False)).encode()
        self.send_response(status)
        self.send_header("Content-Type",kind+"; charset=utf-8")
        self.send_header("Content-Length",str(len(body)))
        self.send_header("Cache-Control","no-store")
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Referrer-Policy","no-referrer")
        self.send_header("X-Frame-Options","DENY")
        if filename:self.send_header("Content-Disposition",'attachment; filename="'+filename+'"')
        self.end_headers()
        self.wfile.write(body)

    def allowed(self):
        host=self.headers.get("Host","")
        return host in (f"localhost:{PORT}",f"127.0.0.1:{PORT}") and self.headers.get("Origin","http://"+host)=="http://"+host

    def do_POST(self):
        if not self.allowed() or self.headers.get_content_type()!="application/json":
            return self.send({"error":"Erişim reddedildi."},status=403)
        try:
            size=int(self.headers.get("Content-Length","0"))
            if not 0<size<=100000:raise ValueError("Geçersiz veri boyutu.")
            data=json.loads(self.rfile.read(size))
            with closing(connect()) as db, db:
                result=change(db,self.path,data)
            self.send(result)
        except (ValueError,TypeError) as e:self.send({"error":str(e)},status=400)
        except sqlite3.Error:self.send({"error":"Veritabanına yazılamadı. Dosyanızı saklayıp tekrar deneyin."},status=503)

    def do_GET(self):
        if not self.allowed():return self.send({},status=403)
        path=self.path.split("?")[0]
        dist=ROOT.parent/"web"/"dist"
        if path in ("/roster.js","/session.js"):
            return self.send((ROOT.parent/"web"/"src"/path[1:]).read_bytes(),"text/javascript")
        if path=="/web/" and (dist/"index.html").is_file():
            return self.send((dist/"index.html").read_bytes(),"text/html")
        static={"/index.html":"text/html","/curriculum.json":"application/json",
                "/sourced-questions.json":"application/json","/sw.js":"text/javascript"}
        if path in static:
            file=dist/path[1:]
            return self.send(file.read_bytes(),static[path]) if file.is_file() else self.send({},status=404)
        if path.startswith("/assets/"):
            name=path[len("/assets/"):]
            if not name.isascii() or not all(c.isalnum() or c in "-_." for c in name) or name.startswith("."):
                return self.send({},status=404)
            file=dist/"assets"/name
            if file.suffix not in (".js",".css",".wasm") or not file.is_file():return self.send({},status=404)
            return self.send(file.read_bytes(),{".js":"text/javascript",".css":"text/css",".wasm":"application/wasm"}[file.suffix])
        if path in ("/","/engine.js"):
            return self.send(((ROOT/"panel.html").read_bytes() if path=="/" else engine()),"text/html" if path=="/" else "text/javascript")
        with closing(connect()) as db:
            if path=="/state":
                return self.send({"classes":[dict(r) for r in db.execute("SELECT classes.*,class_cards.students,COALESCE(class_archive.archived,0) AS archived FROM classes LEFT JOIN class_cards ON class_cards.class_id=classes.id LEFT JOIN class_archive ON class_archive.class_id=classes.id ORDER BY id DESC")],
                                  "sessions":[dict(r) for r in db.execute("SELECT sessions.*,meta.exam,meta.outcome FROM sessions LEFT JOIN meta USING(token) ORDER BY sessions.rowid DESC")]})
            action,_,token=path.strip("/").partition("/")
            row=db.execute("SELECT sessions.*,roster FROM sessions JOIN classes ON classes.id=class_id WHERE token=?",(token,)).fetchone()
            if not row:return self.send({},status=404)
            names=json.loads(row["roster"])
            stored=db.execute("SELECT students FROM session_cards WHERE token=?",(token,)).fetchone()
            cards=[r["cardId"] for r in json.loads(stored[0])] if stored and stored[0] else list(range(1,len(names)+1))
            if stored and stored[0]:names=[r["name"] for r in json.loads(stored[0])]
            if action=="exam-export":
                exam=db.execute("SELECT exam FROM meta WHERE token=?",(token,)).fetchone()[0]
                questions=[dict(q) for q in db.execute("""SELECT title,opts,correct,outcome FROM sessions
                    JOIN meta USING(token) WHERE class_id=? AND exam=? ORDER BY sessions.rowid""",(row["class_id"],exam))]
                for q in questions:q["opts"]=json.loads(q["opts"])
                return self.send({"format":"sinifkart-exam-1","exam":exam,"questions":questions},filename="Sinav-sorulari.json")
            if action=="projection":
                from html import escape
                options="".join("<li>"+escape(o)+"</li>" for o in json.loads(row["opts"]))
                return self.send("<!doctype html><html lang=tr><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Sınıf tahtası</title><style>body{margin:6vw;font:clamp(20px,4vw,56px)/1.4 system-ui;color:#173e37}h1{font-size:1.25em}li{margin:.4em}output{font-size:.6em}</style><h1>"+escape(row["title"])+"</h1><ol type=A>"+options+"</ol><output aria-live=polite></output><script>async function refresh(){try{const r=await fetch(location.pathname.replace('/projection/','/participation/'));if(!r.ok)throw Error();const v=await r.json();document.querySelector('output').textContent=v.count+' / '+v.size+' kart yanıtladı'}catch{document.querySelector('output').textContent='Bağlantı bekleniyor'}finally{setTimeout(refresh,1500)}}refresh()</script></html>","text/html")
            if action=="participation":
                count=db.execute("SELECT count(*) FROM votes WHERE token=?",(token,)).fetchone()[0]
                return self.send({"count":count,"size":len(names)})
            if action=="packet":
                fields={"cards":cards} if stored and stored[0] else {}
                return self.send({"sessionId":token,"questionId":token,"classSize":len(names),"options":"ABCD"[:len(json.loads(row["opts"]))],**fields},"application/json",filename="Oturum-"+token[:8]+".json")
            if action in ("xlsx","print-report"):
                group=db.execute("SELECT exam FROM meta WHERE token=?",(token,)).fetchone()
                if not group:return self.send({"error":"Sınav grubu bulunamadı."},status=404)
                tables=report(db,row["class_id"],group[0])
                if action=="print-report":return self.send(printable(tables),"text/html")
                try:return self.send(excel(tables),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",filename="Sinav.xlsx")
                except ImportError:return self.send({"error":"Excel çıktısı için openpyxl kurulmalıdır."},status=503)
            if action=="scan":
                packet={"token":token,"title":row["title"],"cards":cards,"options":"ABCD"[:len(json.loads(row["opts"]))]}
                html=(ROOT/"scanner.html").read_text(encoding="utf-8-sig").replace("__ENGINE__",engine()).replace("__PACKET__",json.dumps(packet).replace("<",r"\u003c"))
                return self.send(html,"text/html",filename="Tarama-"+token[:8]+".html")
            votes=dict(db.execute("SELECT card,answer FROM votes WHERE token=?",(token,)))
            results=[[i,name,votes.get(i,""),int(votes[i]==row["correct"]) if i in votes else None] for i,name in zip(cards,names)]
            if action=="result":return self.send(results)
            if action=="csv":
                out=io.StringIO(); writer=csv.writer(out,delimiter=";");writer.writerow(["Kart","Öğrenci","Yanıt","Puan (1 üzerinden)"])
                for i,name,a,p in results:
                    writer.writerow([i,("'"+name) if name.lstrip().startswith(("=","+","-","@")) else name,a,p])
                return self.send("\ufeff"+out.getvalue(),"text/csv",filename="Sonuc-"+token[:8]+".csv")
            self.send({},status=404)


if __name__=="__main__":
    init()
    print(f"SınıfKart AI: http://127.0.0.1:{PORT}",flush=True)
    with ThreadingHTTPServer(("127.0.0.1",PORT),Handler) as http:
        import webbrowser
        webbrowser.open(f"http://127.0.0.1:{PORT}")
        http.serve_forever()

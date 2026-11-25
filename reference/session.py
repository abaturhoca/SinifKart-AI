import csv
import json
import sqlite3
from collections import Counter


class Session:
    def __init__(self, database, session_id, question_id, count):
        if not 1<=count<=100:
            raise ValueError("Sınıf mevcudu 1–100 olmalı.")
        self.key=(session_id,question_id)
        self.count=count
        self.streak={}
        self.db=sqlite3.connect(database)
        self.db.execute("create table if not exists answers(s text,q text,card integer,answer text,primary key(s,q,card))")
        self.db.execute("create table if not exists history(s text,q text,card integer,answer text,source text,stamp text default current_timestamp)")

    def answers(self):
        return dict(self.db.execute("select card,answer from answers where s=? and q=? order by card",self.key))

    def record(self,card,answer,source):
        if card not in range(1,self.count+1) or answer not in ('A','B','C','D'):
            raise ValueError("Geçersiz kart veya cevap")
        with self.db:
            args=(*self.key,card,answer)
            self.db.execute("insert into answers values(?,?,?,?) on conflict(s,q,card) do update set answer=excluded.answer",args)
            self.db.execute("insert into history(s,q,card,answer,source) values(?,?,?,?,?)",(*args,source))

    def observe(self,rows):
        current=self.answers()
        duplicates=Counter(row['cardId'] for row in rows)
        next_frame={}
        for row in rows:
            card,answer=row['cardId'],row['answer']
            if duplicates[card]>1 or row['status']!='ok' or not 1<=card<=self.count:
                continue
            previous,runs=self.streak.get(card,(None,0))
            runs=runs+1 if previous==answer else 1
            next_frame[card]=(answer,runs)
            if runs>=3 and current.get(card)!=answer:
                self.record(card,answer,'scan')
        self.streak=next_frame

    def export(self,base):
        values=self.answers()
        rows=[dict(cardId=k,answer=v) for k,v in values.items()]
        packet=dict(version=1,sessionId=self.key[0],questionId=self.key[1],responses=rows)
        base.with_suffix('.json').write_text(json.dumps(packet,indent=2),encoding='utf8')
        with base.with_suffix('.csv').open('w',encoding='utf-8-sig',newline='') as stream:
            writer=csv.writer(stream)
            writer.writerow(['Kart','Cevap'])
            writer.writerows((i,values.get(i,'')) for i in range(1,self.count+1))

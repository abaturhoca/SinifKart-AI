import json
import statistics
from pathlib import Path
from tempfile import TemporaryDirectory
from detect_image import detect
from session import Session
from test_detection import OUT, scene


def run():
    elapsed=[]
    answer_key='ABCD'+'A'
    correct_ids=wrong=missing=manual=0
    with TemporaryDirectory() as directory:
        database=Path(directory)/'pilot.sqlite'
        for q,key in enumerate(answer_key):
            store=Session(database,'class-40',str(q+1),40)
            expected={}
            for first in [0,10,20,30]:
                frame,batch=scene(10,q,first)
                expected.update(batch)
                for _ in range(3):
                    result=detect(frame)[1]
                    elapsed.append(result['elapsedMs'])
                    store.observe(result['cards'])
                if first==10:
                    store.db.close()
                    store=Session(database,'class-40',str(q+1),40)
            answers=store.answers()
            missing+=len(expected.keys()-answers.keys())
            wrong+=sum(answers.get(k)!=v for k,v in expected.items())
            correct_ids+=len(answers.keys()&expected.keys())
            assert expected==answers
            store.record(1,'B' if answers[1]=='A' else 'A','manual')
            store.record(1,expected[1],'manual')
            manual+=2
            assert store.answers()==expected
            store.export(OUT/f'sinif-soru-{q+1}')
            assert sum(v==key for v in answers.values())==10
            store.db.close()
    result=dict(students=40,questions=5,synthetic=True,correctRecords=correct_ids,wrongAnswers=wrong,
                missing=missing,manualEvents=manual,meanMs=round(statistics.mean(elapsed),3),maxMs=max(elapsed))
    (OUT/'sinif-simulasyonu.json').write_text(json.dumps(result,indent=2))
    print(result)


if __name__=='__main__':
    run()

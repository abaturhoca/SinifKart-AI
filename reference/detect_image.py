"""Read cards from an image. Normalize mirror and upright correction before detection."""
import argparse
from pathlib import Path
import json
import time
import cv2 as cv
import numpy as np

CONFIG=json.loads((Path(__file__).resolve().parents[1]/'contracts/cards.json').read_text())
DICTIONARY=cv.aruco.getPredefinedDictionary(getattr(cv.aruco,CONFIG['dictionary']))
DETECTOR=cv.aruco.ArucoDetector(DICTIONARY)


def detect(frame, clockwise=0, mirrored=False):
    if mirrored:
        frame=cv.flip(frame,1)
    frame=np.ascontiguousarray(np.rot90(frame,-clockwise//90))
    start=time.perf_counter()
    corners, ids, _=DETECTOR.detectMarkers(frame)
    rows=[]
    numbers=[] if ids is None else ids.flatten().tolist()
    for number, polygon in zip(numbers,corners):
        points=polygon.reshape(4,2)
        dx,dy=points[1]-points[0]
        angle=float(np.degrees(np.arctan2(dy,dx)))%360
        quarter=round(angle/90)
        ambiguous=abs(angle-quarter*90)>=45-CONFIG['boundaryMarginDegrees']
        status='ambiguous' if ambiguous else 'ok'
        if number>=CONFIG['count']:
            status='unknown'
        if numbers.count(number)>1:
            status='duplicate'
        rows.append(dict(cardId=number+1,answer=CONFIG['clockwiseAnswers'][quarter%4] if status=='ok' else None,
                         corners=points.tolist(),rotation=round(angle,2),status=status,
                         areaPx2=round(cv.contourArea(points),1)))
    return frame,dict(cards=rows,elapsedMs=round((time.perf_counter()-start)*1000,3))


def annotate(frame, rows):
    view=cv.cvtColor(frame,cv.COLOR_GRAY2BGR) if frame.ndim==2 else frame.copy()
    for row in rows:
        corners=np.rint(row['corners']).astype(np.int32)
        cv.polylines(view,[corners],True,(0,140,60),2)
        label=f"{row['cardId']:03d} {row['answer'] or row['status']}"
        cv.putText(view,label,tuple(corners[0]),cv.FONT_HERSHEY_SIMPLEX,.55,(10,60,215),2)
    return view


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('image',type=Path)
    parser.add_argument('--clockwise',type=int,choices=[0,90,180,270],default=0)
    parser.add_argument('--mirrored',action='store_true')
    parser.add_argument('--annotated',type=Path)
    args=parser.parse_args()
    image=cv.imdecode(np.fromfile(args.image,np.uint8),cv.IMREAD_COLOR)
    if image is None:
        parser.error('Görüntü açılamadı')
    frame,result=detect(image,args.clockwise,args.mirrored)
    if args.annotated:
        cv.imencode('.png',annotate(frame,result['cards']))[1].tofile(args.annotated)
    print(json.dumps(result))

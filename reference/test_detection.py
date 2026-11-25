from pathlib import Path
import json
import cv2 as cv
import numpy as np
from detect_image import detect, annotate, DICTIONARY

OUT=Path(__file__).resolve().parent/'output'
FIX=OUT/'fixtures'


def scene(count,question=0,first=0):
    image=np.full((int(np.ceil(count/8))*100,min(count,8)*100),245,np.uint8)
    expected={}
    for i in range(count):
        marker=i+first
        turn=(marker+question)%4
        tile=np.rot90(cv.aruco.generateImageMarker(DICTIONARY,marker,60),-turn)
        y,x=(i//8)*100+20,(i%8)*100+20
        image[y:y+60,x:x+60]=tile
        expected[marker+1]='ABCD'[turn]
    return image,expected


def measure(title,image,expected,**settings):
    frame,result=detect(image,**settings)
    got={r['cardId']:r['answer'] for r in result['cards'] if r['status']=='ok'}
    metrics=dict(correct=sum(got.get(k)==v for k,v in expected.items()),missed=len(expected.keys()-got.keys()),
                 wrongId=len(got.keys()-expected.keys()),wrongAnswer=sum(got[k]!=expected[k] for k in got.keys()&expected.keys()),
                 elapsedMs=result['elapsedMs'])
    cv.imencode('.png',image)[1].tofile(FIX/(title+'.png'))
    cv.imencode('.png',annotate(frame,result['cards']))[1].tofile(FIX/(title+'-annotated.png'))
    return dict(expected=expected,**metrics,cards=result['cards'])


if __name__=='__main__':
    FIX.mkdir(parents=True,exist_ok=True)
    results={}
    for count in (1,5,10,20,40):
        image,expected=scene(count)
        clean=measure('clean-'+str(count),image,expected)
        assert clean['correct']==count and clean['wrongId']==0
        results[str(count)]=clean
    image,expected=scene(20)
    h,w=image.shape
    transform=cv.getPerspectiveTransform(np.float32([[0,0],[w,0],[w,h],[0,h]]),np.float32([[20,10],[w-20,0],[w-50,h-10],[0,h-30]]))
    noisy=image.copy()
    mask=noisy==245
    noisy[mask]=np.random.default_rng(42).integers(130,255,mask.sum(),dtype=np.uint8)
    occluded=image.copy()
    occluded[20:50,20:80]=245
    for label,frame in [('perspective',cv.warpPerspective(image,transform,(w,h),borderValue=245)),('small',cv.resize(image,None,fx=.32,fy=.32)),('dark',image//3),('blur',cv.GaussianBlur(image,(7,7),2)),('occluded',occluded),('background',noisy)]:
        results[label]=measure(label,frame,expected)
    results['mirror']=measure('mirror',cv.flip(image,1),expected,mirrored=True)
    results['sensor']=measure('sensor',np.rot90(image),expected,clockwise=90)
    for name in ('sensor','mirror'):
        assert results[name]['correct']==20
    repeated=np.concatenate([image,image],axis=1)
    assert all(r['status']=='duplicate' for r in detect(repeated)[1]['cards'])
    clean_rotations=0
    for number in range(100):
        for turn in range(4):
            marker=np.rot90(cv.aruco.generateImageMarker(DICTIONARY,number,90),-turn)
            frame=np.pad(marker,20,constant_values=255)
            rows=detect(frame)[1]['cards']
            assert [(r['cardId'],r['answer']) for r in rows]==[(number+1,'ABCD'[turn])]
            clean_rotations+=1
    (OUT/'H3.json').write_text(json.dumps(dict(cleanRotations=clean_rotations,tests=results),indent=2))
    print(clean_rotations,{key:(v['correct'],v['missed'],v['wrongId'],v['wrongAnswer']) for key,v in results.items()})

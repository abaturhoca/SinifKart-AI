"""Compare the browser's JS detector against OpenCV-generated, labeled RGBA pixels."""
import json
from pathlib import Path
import subprocess
import tempfile
import time
import cv2 as cv
import numpy as np
from engine_build import engine

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'reference/output'


def main():
    with tempfile.TemporaryDirectory() as tmp:
        folder=Path(tmp)
        cases=[]
        def sample(title, grey, expected):
            raw=folder/(title+'.rgba')
            cv.cvtColor(grey,cv.COLOR_GRAY2RGBA).tofile(raw)
            cases.append(dict(file=str(raw),width=grey.shape[1],height=grey.shape[0],expected=expected,title=title))
        dictionary=cv.aruco.getPredefinedDictionary(cv.aruco.DICT_4X4_250)
        for number in range(100):
            for rotation in range(4):
                marker=cv.aruco.generateImageMarker(dictionary,number,48)
                sample(f'card-{number}-{rotation}',np.pad(np.rot90(marker,-rotation),12,constant_values=255),{number+1:'ABCD'[rotation]})
        h3=json.loads((OUT/'H3.json').read_text())['tests']
        for count in [1,5,10,20,40]:
            title=f'clean-{count}'
            image=cv.imdecode(np.fromfile(OUT/'fixtures'/(title+'.png'),np.uint8),0)
            sample(title,image,h3[str(count)]['expected'])
        (folder/'cases.json').write_text(json.dumps(cases))
        script=engine()+'''
const fs=require('node:fs');
const cases=JSON.parse(fs.readFileSync(process.argv[2]));
let correct=0;
const timings={};
for(const c of cases){
 const bytes=fs.readFileSync(c.file);
 const start=performance.now();
 const rows=Kart.detect(bytes,c.width,c.height);
 timings[c.title]=performance.now()-start;
 const actual=Object.fromEntries(rows.map(r=>[r.id,r.answer]));
 if(rows.length!==Object.keys(c.expected).length || JSON.stringify(actual)!==JSON.stringify(c.expected))throw Error(c.title+': '+JSON.stringify(actual));
 correct+=rows.length;
}
console.log(JSON.stringify({cases:cases.length,correct,clean20ms:timings['clean-20'],clean40ms:timings['clean-40']}));
'''
        program=folder/'run.cjs'
        program.write_text(script,encoding='utf8')
        result=subprocess.run(['node',str(program),str(folder/'cases.json')],capture_output=True,check=True,text=True)
        print(result.stdout)
        (OUT/'web-pixels.json').write_text(result.stdout)


if __name__=='__main__':
    main()

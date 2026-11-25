"""Adapt the original pilot's pixel detector to this release's OpenCV dictionary."""
from pathlib import Path
import json
import cv2

ROOT=Path(__file__).resolve().parent
CONFIG=json.loads((ROOT.parent/'contracts/cards.json').read_text())
dictionary=cv2.aruco.getPredefinedDictionary(getattr(cv2.aruco,CONFIG['dictionary']))
patterns=[]
for number in range(CONFIG['count']):
    modules=cv2.aruco.generateImageMarker(dictionary,number,6)[1:-1,1:-1]
    patterns.append(''.join('1' if value else '0' for value in modules.flat))
(ROOT/'dictionary.js').write_text('const cardDictionary = '+json.dumps(dict(patterns=patterns,answers=CONFIG['clockwiseAnswers'],margin=CONFIG['boundaryMarginDegrees']))+';',encoding='utf8')

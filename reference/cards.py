"""Generate print masters, then read each rasterized PDF marker with OpenCV."""
from pathlib import Path
import json
import cv2 as cv
import numpy as np
import pypdfium2 as pdfium
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, String, Group
from reportlab.graphics import renderPDF, renderSVG
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT.parent / 'contracts/cards.json').read_text())
OUT = ROOT / 'output'
DICT = cv.aruco.getPredefinedDictionary(getattr(cv.aruco, CONFIG['dictionary']))
ANSWERS = CONFIG['clockwiseAnswers']


def card(number, size):
    edge = size * mm
    symbol = cv.aruco.generateImageMarker(DICT, number - 1, 6)
    drawing = Drawing(edge, edge)
    drawing.add(Rect(0, 0, edge, edge, fillColor=colors.white, strokeColor=colors.grey, strokeWidth=.4))
    step = edge * .64 / 6
    # Row zero in a marker image is at the top of the printed page.
    drawing.add(Rect(edge*.18, edge*.18, 6*step, 6*step, fillColor=colors.black, strokeColor=None))
    for r, c in zip(*np.where(symbol == 255)):
        drawing.add(Rect(edge*.18+c*step, edge*.18+(5-r)*step, step, step, fillColor=colors.white, strokeColor=None))
    for index, label in enumerate(ANSWERS):
        group = Group()
        group.translate(edge/2, edge/2)
        group.rotate(index*90)
        group.add(String(0, edge*.39, label, textAnchor='middle', fontName='Helvetica-Bold', fontSize=edge*.065))
        drawing.add(group)
    drawing.add(String(edge*.04,edge*.04,f'{number:03d}',fontName='Helvetica',fontSize=edge*.055))
    return drawing


def write_pdf(size, count):
    cols, rows = int(194//size), int(270//size)
    name = OUT / f'kart-{count}-{size}mm.pdf'
    canvas = Canvas(str(name), pagesize=A4)
    origins = []
    for offset in range(count):
        slot = offset % (rows*cols)
        if slot == 0:
            if offset:
                canvas.showPage()
            canvas.setFont('Helvetica',9)
            canvas.drawCentredString(A4[0]/2, 9*mm, 'A4 | %100 / Gercek boyut | Kesim: ince gri cizgi')
        x = (210-cols*size)/2 + (slot%cols)*size
        y = 283 - (slot//cols+1)*size
        drawing = card(offset+1,size)
        renderPDF.draw(drawing,canvas,x*mm,y*mm)
        if count==100 and size==90:
            renderSVG.drawToFile(drawing,str(OUT / 'svg' / f'{offset+1:03d}.svg'))
        origins.append((offset//(cols*rows),x,y))
    canvas.save()
    return name, origins


def verify_pdf(name, origins, size):
    detector = cv.aruco.ArucoDetector(DICT)
    correct = 0
    with pdfium.PdfDocument(str(name)) as doc:
        page_index = -1
        for offset,(index,x,y) in enumerate(origins):
            if index != page_index:
                page = doc[index]
                assert np.allclose(page.get_size(), A4, atol=.1)
                bitmap = page.render(scale=1.5)
                pixels = np.asarray(bitmap.to_pil().convert('L')).copy()
                bitmap.close()
                page.close()
                page_index = index
            unit = mm*1.5
            row = round((297-y-size)*unit)
            col = round(x*unit)
            crop = pixels[row:row+round(size*unit),col:col+round(size*unit)]
            if offset<10 and size==90:
                cv.imencode('.png',crop)[1].tofile(OUT / f'kart-{offset+1:03d}.png')
            for rot in range(4):
                rotated = np.ascontiguousarray(np.rot90(crop,-rot))
                corners, ids, _ = detector.detectMarkers(rotated)
                assert ids is not None and ids.flatten().tolist()==[offset], (name,offset,rot)
                dx,dy=corners[0][0][1]-corners[0][0][0]
                angle=np.degrees(np.arctan2(dy,dx)) % 360
                assert round(angle/90)%4==rot
                side=np.hypot(dx,dy)/unit
                assert abs(side-size*.64)<1.0
                correct+=1
    return correct


def compare():
    results={}
    for family in ('DICT_4X4_250','DICT_5X5_250'):
        dictionary=cv.aruco.getPredefinedDictionary(getattr(cv.aruco,family))
        detector=cv.aruco.ArucoDetector(dictionary)
        results[family]={}
        for side in [14,20,30,60]:
            hits=0
            for i in range(100):
                marker=cv.aruco.generateImageMarker(dictionary,i,side)
                scene=np.pad(marker,20,constant_values=255)
                _, ids, _=detector.detectMarkers(cv.GaussianBlur(scene,(3,3),.8))
                hits+=int(ids is not None and ids.flatten().tolist()==[i])
            results[family][side]=hits
    return results


if __name__=='__main__':
    (OUT/'svg').mkdir(parents=True,exist_ok=True)
    results={'comparison':compare(),'pdfChecks':{}}
    for size,count in [(70,100),(90,100),(110,100),(90,10)]:
        name, positions=write_pdf(size,count)
        results['pdfChecks'][name.name]=verify_pdf(name,positions,size)
    (OUT/'H2.json').write_text(json.dumps(results,indent=2))
    print(results)

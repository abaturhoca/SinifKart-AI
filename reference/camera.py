"""Desktop camera pilot. Example: python camera.py --session deneme --question 1"""
import argparse
from pathlib import Path
from queue import Empty, Full, Queue
from threading import Thread, Event
from time import monotonic
import tkinter as tk
from tkinter import filedialog, messagebox
import cv2 as cv
from PIL import Image, ImageTk
from detect_image import detect, annotate
from session import Session


def worker(events,stop):
    camera=cv.VideoCapture(0)
    try:
        if not camera.isOpened():
            events.put(('error','Kamera açılamadı. Kamera ve izinleri kontrol edin.'))
            return
        while not stop.is_set():
            ok,frame=camera.read()
            if not ok:
                events.put(('error','Kamera karesi alınamadı.'))
                break
            normalized,result=detect(frame)
            preview=annotate(normalized,result['cards'])
            try:
                events.put_nowait(('frame',(preview,result)))
            except Full:
                pass
    finally:
        camera.release()


def run(args):
    root=tk.Tk()
    root.title('SınıfKart · Kamera')
    status=tk.StringVar(value='Taramaya hazır')
    canvas=tk.Label(root)
    canvas.pack()
    tk.Label(root,textvariable=status).pack()
    session=Session(args.database,args.session,args.question,args.count)
    events=Queue(2)
    stop=Event()
    thread=None
    last=monotonic()

    def start():
        nonlocal thread
        if thread and thread.is_alive():
            return
        while not events.empty():
            events.get_nowait()
        stop.clear()
        session.streak.clear()
        thread=Thread(target=worker,args=(events,stop),daemon=True)
        thread.start()

    def pause():
        stop.set()
        session.streak.clear()
        status.set(f'Tarama durdu · {len(session.answers())} kayıtlı cevap')

    def tick():
        nonlocal last
        try:
            tag,data=events.get_nowait()
            if tag=='error':
                pause()
                status.set(data)
            elif not stop.is_set():
                frame,result=data
                session.observe(result['cards'])
                photo=ImageTk.PhotoImage(Image.fromarray(cv.cvtColor(frame,cv.COLOR_BGR2RGB)))
                canvas.configure(image=photo)
                canvas.image=photo
                count=len(session.answers())
                now=monotonic()
                status.set(f"Onaylı {count} · Eksik {args.count-count} · {result['elapsedMs']} ms · {1/max(.001,now-last):.1f} FPS")
                last=now
        except Empty:
            pass
        except Exception as exc:
            pause()
            messagebox.showerror('Tarama durdu',str(exc))
        root.after(25,tick)

    def export():
        path=filedialog.asksaveasfilename(defaultextension='.json')
        if path:
            session.export(Path(path))

    def close():
        pause()
        session.db.close()
        root.destroy()

    for title,command in [('Başlat',start),('Durdur',pause),('JSON ve CSV kaydet',export)]:
        tk.Button(root,text=title,command=command).pack(side=tk.LEFT)
    root.protocol('WM_DELETE_WINDOW',close)
    root.after(25,tick)
    root.mainloop()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--session',required=True)
    parser.add_argument('--question',required=True)
    parser.add_argument('--count',type=int,default=40)
    parser.add_argument('--database',default='sinifkart-camera.sqlite')
    run(parser.parse_args())

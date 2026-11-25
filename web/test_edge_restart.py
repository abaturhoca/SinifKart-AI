"""Exercise the shipped web UI twice in an isolated Edge profile, including a process restart."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json, os, queue, subprocess, tempfile, threading
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
EDGE=Path(os.environ.get("PROGRAMFILES(X86)", "C:/Program Files (x86)"))/"Microsoft/Edge/Application/msedge.exe"
results=queue.Queue()
finished=threading.Event()
PAGE="""<script>
const stage=location.search.slice(1);
async function until(test){
  const start=Date.now();
  while(Date.now()-start<15000){if(test())return;await new Promise(r=>setTimeout(r,100))}
  throw Error(document.body.innerText);
}
async function run(){
 const w=window,d=document;
 await until(()=>d.querySelectorAll('input').length===2);
 if(stage==='write'){
  const f=new w.File(['number,name,cardId\\n007,Deneme,17\\n008,Deneme,42'], 'test.csv',{type:'text/csv'});
  const dt=new w.DataTransfer();dt.items.add(f);const input=d.querySelector('input');input.files=dt.files;
  input.dispatchEvent(new w.Event('change',{bubbles:true}));
  await until(()=>d.body.innerText.includes('2 öğrenci doğrulandı'));
 }else{
  await until(()=>d.body.innerText.includes('2 öğrenci cihazda kayıtlı'));
  const students=await new Promise((resolve,reject)=>{
   const r=w.indexedDB.open('sinifkart-hibrit');r.onsuccess=()=>{
     const q=r.result.transaction('class').objectStore('class').get('students');
     q.onsuccess=()=>{r.result.close();resolve(q.result)};q.onerror=()=>reject(q.error)
   };r.onerror=()=>reject(r.error)
  });
  if(students.map(s=>s.number+':'+s.cardId).join(',')!=='007:17,008:42')throw Error('Card mapping changed');
  const blob=await (await fetch('/fixture.png')).blob();
  const dt=new w.DataTransfer();dt.items.add(new w.File([blob],'fixture.png',{type:'image/png'}));
  const input=d.querySelector('input[accept="image/*"]');input.files=dt.files;
  input.dispatchEvent(new w.Event('change',{bubbles:true}));
  await until(()=>/001: A/.test(d.body.innerText));
 }
}
run().then(()=>send('ok'),e=>send(String(e)));
function send(result){fetch('/receipt',{method:'POST',body:JSON.stringify({stage,result})})}
</script><img src="/hold" alt="">"""

class Harness(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        path=urlsplit(self.path).path
        if path=="/hold":
            finished.wait(45);self.send_response(204);self.end_headers();return
        if path=="/test":
            index=(ROOT/"web/dist/index.html").read_text("utf8")
            body=index.replace("</body>",PAGE[PAGE.index("<script>"):]+"</body>").encode();kind="text/html; charset=utf-8"
        elif path=="/fixture.png":body=(ROOT/"reference/output/kart-001.png").read_bytes();kind="image/png"
        else:return super().do_GET()
        self.send_response(200);self.send_header("Content-Type",kind);self.end_headers();self.wfile.write(body)
    def do_POST(self):
        if self.path!="/receipt":return self.send_error(404)
        results.put(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
        finished.set()
        self.send_response(204);self.end_headers()

def main():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as folder, ThreadingHTTPServer(("127.0.0.1",0),partial(Harness,directory=str(ROOT/"web/dist"))) as http:
        threading.Thread(target=http.serve_forever,daemon=True).start()
        for stage in ("write","read"):
            finished.clear()
            args=[str(EDGE),"--headless","--disable-gpu","--no-first-run","--no-proxy-server","--disable-background-timer-throttling","--dump-dom","--user-data-dir="+folder,f"http://127.0.0.1:{http.server_port}/test?{stage}"]
            process=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=55)
            if results.empty():
                raise RuntimeError("No browser receipt: "+str(process.returncode)+" "+repr(process.stdout[-400:]))
            result=results.get_nowait()
            print(ascii(result),flush=True)
            assert result=={"stage":stage,"result":"ok"}
        http.shutdown()

if __name__=="__main__":main()

"""Aynı tarayıcı profilinde iki ayrı başlatmayla IndexedDB kalıcılığını sınar."""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Event, Thread
import argparse
import re
import subprocess

from yerel_panel import PanelHandler, ROOT

ready = Event()


class TestHandler(PanelHandler):
    def do_GET(self):
        if self.path == '/test':
            page = (ROOT / 'yerel.html').read_text(encoding='utf-8')
            observer = '''<img src="/hold" alt="">
<script>
const status = document.querySelector('[role=status]');
const observer = new MutationObserver(() => {
  if (status.querySelector('time')) {
    observer.disconnect();
    fetch('/receipt', {method: 'POST'});
  }
});
observer.observe(status, {childList: true, subtree: true});
</script>'''
            body = page.replace('</body>', observer + '</body>').encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == '/hold':
            ready.wait(30)
            self.send_response(204)
            self.end_headers()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != '/receipt':
            return self.send_error(404)
        ready.set()
        self.send_response(204)
        self.end_headers()


def read_started_at(browser, profile, port):
    ready.clear()
    command = [browser, "--headless", "--disable-gpu", "--no-first-run",
               "--disable-extensions", "--disable-background-networking",
               "--user-data-dir=" + profile, "--virtual-time-budget=10000",
               "--dump-dom", f"http://127.0.0.1:{port}/test"]
    run = subprocess.run(command, capture_output=True, timeout=45, check=True)
    if not ready.is_set():
        raise AssertionError('Browser did not finish the IndexedDB transaction')
    match = re.search(rb'<time datetime="([^"]+)">', run.stdout)
    if not match:
        raise AssertionError("Panel did not display the saved session timestamp: " +
                             run.stdout.decode("utf-8", errors="replace")[-2000:])
    return match.group(1).decode("ascii")


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("browser", help="Chrome veya Edge çalıştırıcı yolu")
    browser = args.parse_args().browser
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(TestHandler, directory=str(ROOT))) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        try:
            with TemporaryDirectory(prefix="sinifkart-h1-") as profile:
                first = read_started_at(browser, profile, server.server_port)
                second = read_started_at(browser, profile, server.server_port)
                assert first == second, (first, second)
                print(f"PASS: same IndexedDB session across browser restarts: {second}")
        finally:
            server.shutdown()

"""SınıfKart H1 çevrimdışı paneli: python yerel_panel.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

ROOT = Path(__file__).resolve().parent
URL = "http://127.0.0.1:8766/yerel.html"


class PanelHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] not in ("/yerel.html", "/src/style.css", "/src/session.js", "/src/backup.js"):
            self.send_error(404)
            return
        super().do_GET()

    do_HEAD = lambda self: self.send_error(405)


if __name__ == "__main__":
    handler = partial(PanelHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", 8766), handler) as server:
        print(URL, flush=True)
        webbrowser.open(URL)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass

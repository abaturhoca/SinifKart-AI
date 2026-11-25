"""Aynı tarayıcı profilinde iki ayrı başlatmayla IndexedDB kalıcılığını sınar."""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
import argparse
import re
import subprocess

from yerel_panel import PanelHandler, ROOT


def read_started_at(browser, profile, port):
    command = [browser, "--headless", "--disable-gpu", "--no-first-run",
               "--disable-extensions", "--disable-background-networking",
               "--user-data-dir=" + profile, "--virtual-time-budget=10000",
               "--dump-dom", f"http://127.0.0.1:{port}/yerel.html"]
    run = subprocess.run(command, capture_output=True, timeout=45, check=True)
    match = re.search(rb'<time datetime="([^"]+)">', run.stdout)
    if not match:
        raise AssertionError("Panel did not display the saved session timestamp: " +
                             run.stdout.decode("utf-8", errors="replace")[-2000:])
    return match.group(1).decode("ascii")


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("browser", help="Chrome veya Edge çalıştırıcı yolu")
    browser = args.parse_args().browser
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(PanelHandler, directory=str(ROOT))) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        try:
            with TemporaryDirectory(prefix="sinifkart-h1-") as profile:
                first = read_started_at(browser, profile, server.server_port)
                second = read_started_at(browser, profile, server.server_port)
                assert first == second, (first, second)
                print(f"PASS: same IndexedDB session across browser restarts: {second}")
        finally:
            server.shutdown()

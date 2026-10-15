"""Local static reading QA with all page scripts blocked by CSP.
Build first; visit http://localhost:4183/UCAS-intelligent-sensing/ .
This is a QA server, not the production hosting configuration.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1] / 'docs/.vitepress/dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        path = urlparse(path).path
        if path.startswith('/UCAS-intelligent-sensing/'):
            path = path[len('/UCAS-intelligent-sensing'):]
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Content-Security-Policy', "script-src 'none'")
        super().end_headers()

if __name__ == '__main__':
    if not ROOT.is_dir():
        raise SystemExit('Run npm run build first.')
    print('No-JS QA: http://localhost:4183/UCAS-intelligent-sensing/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4183), Handler).serve_forever()

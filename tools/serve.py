"""Локальный сервер для разработки без кеша: python tools/serve.py [порт]"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
print(f'http://localhost:{port}  (Ctrl+C для остановки)')
ThreadingHTTPServer(('0.0.0.0', port), NoCache).serve_forever()

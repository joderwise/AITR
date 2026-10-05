#!/usr/bin/env python3
"""Static server for the mockup with caching disabled (python -m http.server lets browsers keep stale CSS/JS)."""
import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8110
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('', port), H) as s:
    s.serve_forever()

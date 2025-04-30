#!/usr/bin/env python3
"""
Simple HTTP server that serves the fake Wikipedia page at localhost:6969/wiki/Sandbox
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import os

PORT = 6969
HTML_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fake-wikipedia.html")

class WikiRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Check if the path matches what we want to serve
        if self.path == "/wiki/Sandbox" or self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            
            # Read and serve the HTML file
            with open(HTML_FILE, "rb") as file:
                self.wfile.write(file.read())
        else:
            # Redirect any other path to /wiki/Sandbox
            self.send_response(302)
            self.send_header("Location", "/wiki/Sandbox")
            self.end_headers()

if __name__ == "__main__":
    if not os.path.exists(HTML_FILE):
        print(f"Error: Could not find {HTML_FILE}")
        exit(1)
        
    server = HTTPServer(("localhost", PORT), WikiRequestHandler)
    print(f"Server started at http://localhost:{PORT}")
    print(f"Access your Wikipedia page at: http://localhost:{PORT}/wiki/Sandbox")
    print("Press Ctrl+C to stop the server")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

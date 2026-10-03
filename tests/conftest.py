import base64
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app  # noqa: E402

VALID_BODY = {"title": "The Moon Garden", "storyType": "space", "length": "short", "tone": "magical"}


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for name in (
        "GEMINI_API_KEY",
        "GEMINI_TEXT_MODEL",
        "GEMINI_IMAGE_MODEL",
        "GEMINI_TTS_MODEL",
        "GEMINI_TTS_VOICE",
        "GEMINI_TIMEOUT",
        "GEMINI_BASE_URL",
    ):
        monkeypatch.delenv(name, raising=False)


@pytest.fixture
def client():
    return create_app().test_client()


def model_output(*contents):
    """Body of a successful Interactions API response."""
    return {"id": "i1", "status": "completed", "model": "m", "steps": [{"type": "model_output", "content": list(contents)}]}


def text_part(text):
    return {"type": "text", "text": text}


def image_part(raw=b"PNGDATA", mime="image/png"):
    return {"type": "image", "data": base64.b64encode(raw).decode(), "mime_type": mime}


def audio_part(raw, mime="audio/wav", rate=24000):
    return {"type": "audio", "data": base64.b64encode(raw).decode(), "mime_type": mime, "sample_rate": rate, "channels": 1}


class FakeGemini:
    """A local HTTP server that speaks just enough of the Gemini API for the real SDK.

    `reply` is a (status, json_body) tuple; every request is recorded in `requests`.
    """

    def __init__(self):
        self.requests = []
        self.reply = (200, model_output(text_part("A story.")))
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("content-length", 0)))
                outer.requests.append({"path": self.path, "headers": dict(self.headers), "body": json.loads(body or b"{}")})
                status, payload = outer.reply
                data = json.dumps(payload).encode()
                self.send_response(status)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

        self.server = HTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=self.server.serve_forever, kwargs={"poll_interval": 0.02}, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"

    def close(self):
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture
def gemini(monkeypatch):
    """Point the real google-genai SDK at a local fake server and set a key."""
    fake = FakeGemini()
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_BASE_URL", fake.url)
    yield fake
    fake.close()

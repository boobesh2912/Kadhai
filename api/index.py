"""Vercel entrypoint. Vercel's Python runtime serves the WSGI object named `app`.

vercel.json rewrites every /api/* request to this file; Flask then routes by the
original path (see backend/app.py).
"""
import os
import sys

# Make the top-level `backend` package importable regardless of Vercel's working directory.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app  # noqa: E402

app = create_app()

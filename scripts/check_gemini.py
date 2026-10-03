"""Check that your GEMINI_API_KEY works with the three models KADHAI uses.

Run from the project root (reads GEMINI_API_KEY from the environment or .env):

    python scripts/check_gemini.py

It makes one tiny request per model, so it uses a little of your free quota.
A "rate limit or free-tier quota" failure on one model usually means that model
has no free tier for your account; set GEMINI_*_MODEL to another model (see .env.example).
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import config  # noqa: E402  (also loads .env)
from backend.errors import ApiError  # noqa: E402
from backend.services.audio import generate_audio  # noqa: E402
from backend.services.image import generate_image  # noqa: E402
from backend.services.story import generate_story  # noqa: E402

CHECKS = [
    ("text ", config.text_model, lambda: generate_story("The Tiny Star", "space", "short", "gentle")),
    ("image", config.image_model, lambda: generate_image("The Tiny Star", "space", "gentle")),
    ("audio", config.tts_model, lambda: generate_audio("Once upon a time, a tiny star learned to shine.")),
]


def main():
    if not config.gemini_api_key():
        print("GEMINI_API_KEY is not set. Put it in .env or export it, then run again.")
        return 2
    failed = 0
    for label, model, run in CHECKS:
        started = time.time()
        try:
            run()
            print(f"OK    {label}  {model()}  ({time.time() - started:.1f}s)")
        except ApiError as err:
            failed += 1
            print(f"FAIL  {label}  {model()}  [{err.code}] {err.message}")
    print("\nAll three work." if not failed else f"\n{failed} of {len(CHECKS)} failed (see messages above).")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

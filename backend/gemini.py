"""Single entry point for every Gemini call (text, image and speech)."""
import sys

from google import genai
from google.genai import types

from . import config
from .errors import ApiError, map_gemini_error


def get_client():
    api_key = config.gemini_api_key()
    if not api_key:
        raise ApiError("Gemini is not configured on the server.", "missing_api_key", 503)
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            base_url=config.gemini_base_url(),
            # The SDK default retries 429/5xx three times with backoff, which would eat
            # the serverless time limit (and free-tier quota). One retry is enough.
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )


def interact(**kwargs):
    """Call the Gemini Interactions API and convert SDK failures into ApiError."""
    client = get_client()
    try:
        return client.interactions.create(timeout=config.gemini_timeout(), **kwargs)
    except Exception as exc:
        print(f"Gemini call failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise map_gemini_error(exc)

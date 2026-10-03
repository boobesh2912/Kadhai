"""Runtime configuration, read from environment variables.

Values are read lazily (on every call) so that tests and the Vercel dashboard
can change them without re-importing the module.
"""
import os

try:  # Local development convenience: load a .env file if python-dotenv is installed.
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # pragma: no cover - dotenv is optional in production
    pass

# One Gemini API key powers all three features. Model IDs below come from Google's
# official cookbook / SDK docs; every one can be overridden with an env variable
# (see .env.example) in case Google renames a model or changes its free tier.
DEFAULT_TEXT_MODEL = "gemini-flash-latest"
DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-lite-image"
DEFAULT_TTS_MODEL = "gemini-3.8-flash-tts"
DEFAULT_TTS_VOICE = "Kore"

# Allowed values for the user choices (also used to build the LLM prompt).
STORY_TYPES = ("adventure", "animal", "friendship", "fairy-tale", "space", "ocean")
LENGTHS = ("short", "medium", "long")
TONES = ("fun", "exciting", "gentle", "funny", "magical")

# Rough word targets sent to the LLM for each length.
LENGTH_WORDS = {"short": "about 150-250", "medium": "about 300-450", "long": "about 500-700"}

MAX_TITLE_CHARS = 100
MAX_TTS_CHARS = 5000


def _env(name, default=""):
    return os.getenv(name, "").strip() or default


def gemini_api_key():
    return _env("GEMINI_API_KEY")


def text_model():
    return _env("GEMINI_TEXT_MODEL", DEFAULT_TEXT_MODEL)


def image_model():
    return _env("GEMINI_IMAGE_MODEL", DEFAULT_IMAGE_MODEL)


def tts_model():
    return _env("GEMINI_TTS_MODEL", DEFAULT_TTS_MODEL)


def tts_voice():
    return _env("GEMINI_TTS_VOICE", DEFAULT_TTS_VOICE)


def gemini_timeout():
    """Seconds to wait for one Gemini call (must stay below the Vercel function limit)."""
    return float(_env("GEMINI_TIMEOUT", "55"))


def gemini_base_url():
    """Only for tests/proxies; empty means the real Gemini API."""
    return _env("GEMINI_BASE_URL") or None

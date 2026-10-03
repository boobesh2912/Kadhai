"""Request validation. Every user-supplied value is checked before it reaches a provider."""
from . import config
from .errors import ApiError


def _bad(message):
    return ApiError(message, "invalid_request", 400)


def _choice(data, key, allowed, default):
    value = data.get(key, default)
    if value not in allowed:
        raise _bad(f"'{key}' must be one of: {', '.join(allowed)}.")
    return value


def parse_story_options(data):
    """Validate the body shared by /api/story and /api/image."""
    if not isinstance(data, dict):
        raise _bad("Request body must be a JSON object.")
    title = data.get("title")
    title = title.strip() if isinstance(title, str) else ""
    if not title:
        raise _bad("Title is required.")
    if len(title) > config.MAX_TITLE_CHARS:
        raise _bad(f"Title must be at most {config.MAX_TITLE_CHARS} characters.")
    return {
        "title": title,
        "story_type": _choice(data, "storyType", config.STORY_TYPES, "adventure"),
        "length": _choice(data, "length", config.LENGTHS, "short"),
        "tone": _choice(data, "tone", config.TONES, "fun"),
    }


def parse_audio_text(data):
    """Validate the body of /api/audio."""
    if not isinstance(data, dict):
        raise _bad("Request body must be a JSON object.")
    text = data.get("text")
    text = text.strip() if isinstance(text, str) else ""
    if not text:
        raise _bad("Text is required.")
    if len(text) > config.MAX_TTS_CHARS:
        raise _bad(f"Text must be at most {config.MAX_TTS_CHARS} characters.")
    return text

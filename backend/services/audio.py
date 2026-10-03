"""Narration generation with a Gemini text-to-speech model."""
import base64
import io
import re
import wave

from .. import config
from ..errors import ApiError
from ..gemini import interact

_MARKDOWN_CHARS = re.compile(r"[*_#`>~]+")


def clean_for_speech(text):
    """Drop markdown symbols so the voice does not read them out."""
    return _MARKDOWN_CHARS.sub("", text).strip()


def pcm_to_wav(pcm, sample_rate=24000, channels=1, sample_width=2):
    """Wrap raw 16-bit PCM in a WAV container."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(channels)
        wav.setsampwidth(sample_width)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm)
    return buffer.getvalue()


def generate_audio(text):
    """Return (wav_bytes, content_type) for `text`."""
    text = clean_for_speech(text)
    if not text:
        raise ApiError("Nothing to narrate.", "invalid_request", 400)

    interaction = interact(
        model=config.tts_model(),
        input=text,
        response_format={"type": "audio"},
        generation_config={"speech_config": [{"voice": config.tts_voice()}]},
    )
    audio = interaction.output_audio
    if audio is None or not audio.data:
        raise ApiError("The speech model did not return audio. Please try again.", "empty_audio", 502)

    data = base64.b64decode(audio.data)
    # Non-streaming Gemini TTS already returns a complete WAV (starts with "RIFF");
    # raw PCM (24 kHz, mono, 16-bit) is wrapped here so browsers can play it.
    if data[:4] != b"RIFF":
        data = pcm_to_wav(data, sample_rate=audio.sample_rate or 24000)
    return data, "audio/wav"

import io
import wave

from backend.services.audio import clean_for_speech, pcm_to_wav
from conftest import VALID_BODY, audio_part, image_part, model_output


# ---- image -----------------------------------------------------------------


def test_image_success_returns_decoded_bytes(client, gemini):
    gemini.reply = (200, model_output(image_part(b"\x89PNGfake", "image/png")))
    res = client.post("/api/image", json=VALID_BODY)

    assert res.status_code == 200
    assert res.mimetype == "image/png"
    assert res.data == b"\x89PNGfake"

    body = gemini.requests[0]["body"]
    assert body["model"] == "gemini-3.1-flash-lite-image"
    assert body["response_modalities"] == ["image"]
    assert "The Moon Garden" in body["input"] and "space" in body["input"]


def test_image_model_can_be_overridden(client, gemini, monkeypatch):
    monkeypatch.setenv("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")
    gemini.reply = (200, model_output(image_part()))
    client.post("/api/image", json=VALID_BODY)
    assert gemini.requests[0]["body"]["model"] == "gemini-3.1-flash-image"


def test_image_missing_in_response_is_an_error(client, gemini):
    gemini.reply = (200, model_output({"type": "text", "text": "I cannot draw that."}))
    res = client.post("/api/image", json=VALID_BODY)
    assert res.status_code == 502 and res.get_json()["code"] == "empty_image"


# ---- audio -----------------------------------------------------------------


def make_pcm(samples=2400):
    return b"\x00\x01" * samples


def test_audio_riff_wav_is_passed_through(client, gemini):
    wav = pcm_to_wav(make_pcm())
    gemini.reply = (200, model_output(audio_part(wav)))
    res = client.post("/api/audio", json={"text": "Hello **world**"})

    assert res.status_code == 200 and res.mimetype == "audio/wav"
    assert res.data == wav

    body = gemini.requests[0]["body"]
    assert body["model"] == "gemini-3.8-flash-tts"
    assert body["input"] == "Hello world"  # markdown symbols removed
    assert body["response_format"] == {"type": "audio"}
    assert body["generation_config"]["speech_config"] == [{"voice": "Kore"}]


def test_audio_raw_pcm_is_wrapped_as_wav(client, gemini):
    pcm = make_pcm()
    gemini.reply = (200, model_output(audio_part(pcm, mime="audio/L16;rate=24000")))
    res = client.post("/api/audio", json={"text": "Hi there."})

    assert res.data[:4] == b"RIFF"
    with wave.open(io.BytesIO(res.data)) as wav:
        assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) == (1, 2, 24000)
        assert wav.readframes(wav.getnframes()) == pcm


def test_audio_voice_and_model_can_be_overridden(client, gemini, monkeypatch):
    monkeypatch.setenv("GEMINI_TTS_VOICE", "Puck")
    monkeypatch.setenv("GEMINI_TTS_MODEL", "gemini-3.8-flash-lite-tts")
    gemini.reply = (200, model_output(audio_part(pcm_to_wav(make_pcm()))))
    client.post("/api/audio", json={"text": "Hi."})
    body = gemini.requests[0]["body"]
    assert body["model"] == "gemini-3.8-flash-lite-tts"
    assert body["generation_config"]["speech_config"] == [{"voice": "Puck"}]


def test_audio_missing_in_response_is_an_error(client, gemini):
    gemini.reply = (200, model_output({"type": "text", "text": "no audio"}))
    res = client.post("/api/audio", json={"text": "Hi."})
    assert res.status_code == 502 and res.get_json()["code"] == "empty_audio"


def test_audio_text_that_is_only_markdown_is_rejected(client, gemini):
    assert client.post("/api/audio", json={"text": "***"}).status_code == 400
    assert gemini.requests == []


def test_clean_for_speech():
    assert clean_for_speech("**Hello** _world_ # Title") == "Hello world  Title"


# ---- missing key -------------------------------------------------------------


def test_image_and_audio_without_key_return_503(client):
    assert client.post("/api/image", json=VALID_BODY).get_json()["code"] == "missing_api_key"
    assert client.post("/api/audio", json={"text": "Hi."}).get_json()["code"] == "missing_api_key"

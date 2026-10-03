from conftest import VALID_BODY, model_output, text_part


def test_story_success_sends_expected_request(client, gemini):
    gemini.reply = (200, model_output(text_part("  Once upon a time.\n")))
    res = client.post("/api/story", json=VALID_BODY)

    assert res.status_code == 200
    assert res.get_json() == {"title": "The Moon Garden", "text": "Once upon a time."}

    sent = gemini.requests[0]
    assert sent["path"].endswith("/interactions")
    assert sent["headers"]["x-goog-api-key"] == "test-key"
    assert sent["body"]["model"] == "gemini-flash-latest"
    assert "storyteller" in sent["body"]["system_instruction"]
    for fragment in ("short space story", "magical", "The Moon Garden"):
        assert fragment in sent["body"]["input"]


def test_text_model_can_be_overridden(client, gemini, monkeypatch):
    monkeypatch.setenv("GEMINI_TEXT_MODEL", "gemini-custom")
    client.post("/api/story", json=VALID_BODY)
    assert gemini.requests[0]["body"]["model"] == "gemini-custom"


def test_missing_api_key_returns_503(client):
    res = client.post("/api/story", json=VALID_BODY)
    assert res.status_code == 503
    assert res.get_json()["code"] == "missing_api_key"


def test_empty_story_is_an_error(client, gemini):
    gemini.reply = (200, model_output(text_part("   ")))
    res = client.post("/api/story", json=VALID_BODY)
    assert res.status_code == 502 and res.get_json()["code"] == "empty_story"

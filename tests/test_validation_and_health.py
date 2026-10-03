import pytest

from conftest import VALID_BODY


def test_health_reports_whether_key_is_set(client, monkeypatch):
    assert client.get("/api/health").get_json() == {"status": "ok", "gemini_key_set": False, "demo_mode": True}
    monkeypatch.setenv("GEMINI_API_KEY", "secret-value")
    body = client.get("/api/health").get_json()
    assert body["gemini_key_set"] is True
    assert body["demo_mode"] is False
    assert "secret-value" not in str(body)


def test_demo_mode_can_be_forced_even_with_a_key(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "k")
    monkeypatch.setenv("DEMO_MODE", "true")
    assert client.get("/api/health").get_json()["demo_mode"] is True
    monkeypatch.setenv("DEMO_MODE", "false")
    assert client.get("/api/health").get_json()["demo_mode"] is False


@pytest.mark.parametrize("path", ["/api/story", "/api/image"])
class TestStoryOptionsValidation:
    def test_missing_title(self, client, path):
        res = client.post(path, json={**VALID_BODY, "title": "   "})
        assert res.status_code == 400 and res.get_json()["code"] == "invalid_request"

    def test_title_too_long(self, client, path):
        assert client.post(path, json={**VALID_BODY, "title": "x" * 101}).status_code == 400

    @pytest.mark.parametrize("field", ["storyType", "length", "tone"])
    def test_choice_not_allowed(self, client, path, field):
        assert client.post(path, json={**VALID_BODY, field: "nope"}).status_code == 400

    def test_not_json(self, client, path):
        res = client.post(path, data="hello", content_type="text/plain")
        assert res.status_code == 400

    def test_json_but_not_object(self, client, path):
        assert client.post(path, json=["a"]).status_code == 400


def test_audio_validation(client):
    assert client.post("/api/audio", json={"text": ""}).status_code == 400
    assert client.post("/api/audio", json={"text": "a" * 5001}).status_code == 400
    assert client.post("/api/audio", json={}).status_code == 400


def test_unknown_route_and_method_return_json(client):
    assert client.get("/api/nope").get_json()["code"] == "not_found"
    assert client.get("/api/story").status_code == 405


def test_oversized_body_rejected(client):
    res = client.post("/api/story", data="x" * (70 * 1024), content_type="application/json")
    assert res.status_code == 413


def test_responses_are_not_cached(client):
    assert client.get("/api/health").headers["Cache-Control"] == "no-store"

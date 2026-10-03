"""Error mapping, checked end to end through the real SDK against the fake server."""
import pytest

from backend.errors import map_gemini_error
from conftest import VALID_BODY


def error_body(status, message, code):
    return {"error": {"code": status, "message": message, "status": code}}


@pytest.mark.parametrize(
    "upstream_status, message, code, status, http",
    [
        (429, "quota exceeded", "RESOURCE_EXHAUSTED", "provider_rate_limited", 503),
        (400, "API key not valid. Please pass a valid API key.", "INVALID_ARGUMENT", "provider_auth", 502),
        (403, "permission denied", "PERMISSION_DENIED", "provider_auth", 502),
        (404, "model not found", "NOT_FOUND", "provider_model", 502),
        (500, "internal", "INTERNAL", "provider_error", 502),
    ],
)
def test_upstream_errors_are_mapped(client, gemini, upstream_status, message, code, status, http):
    gemini.reply = (upstream_status, error_body(upstream_status, message, code))
    res = client.post("/api/story", json=VALID_BODY)
    assert res.status_code == http
    assert res.get_json()["code"] == status


def test_error_messages_never_contain_the_api_key(client, gemini):
    gemini.reply = (400, error_body(400, "API key not valid", "INVALID_ARGUMENT"))
    assert "test-key" not in client.post("/api/story", json=VALID_BODY).get_data(as_text=True)


def test_timeout_is_mapped(client, gemini, monkeypatch):
    class APITimeoutError(Exception):
        pass

    mapped = map_gemini_error(APITimeoutError("slow"))
    assert (mapped.code, mapped.status) == ("timeout", 504)


def test_connection_error_is_mapped():
    class APIConnectionError(Exception):
        pass

    mapped = map_gemini_error(APIConnectionError("down"))
    assert (mapped.code, mapped.status) == ("provider_unreachable", 502)

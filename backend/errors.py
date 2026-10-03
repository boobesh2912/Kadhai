"""Errors raised by the service layer and turned into JSON responses by the app."""


class ApiError(Exception):
    """An error that is safe to show to the user.

    `code` is a stable machine-readable string the frontend can branch on.
    """

    def __init__(self, message, code="error", status=500):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def map_gemini_error(exc):
    """Translate an exception from the google-genai SDK into a user-safe ApiError.

    The SDK's error classes live in a private module, so they are recognised by
    class name and by their `status_code` attribute instead of being imported.
    """
    name = type(exc).__name__
    if name == "APITimeoutError":
        return ApiError("Gemini took too long to answer. Please try again.", "timeout", 504)
    if name == "APIConnectionError":
        return ApiError("Could not reach Gemini.", "provider_unreachable", 502)

    status = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    text = str(exc).lower()
    # An invalid key is reported by Gemini as HTTP 400 ("API key not valid"), not 401.
    if status in (401, 403) or "api key not valid" in text or "api_key_invalid" in text:
        return ApiError("Gemini rejected the API key.", "provider_auth", 502)
    if status == 429:
        return ApiError(
            "Gemini rate limit or free-tier quota reached for this model. Try again shortly.",
            "provider_rate_limited",
            503,
        )
    if status == 404:
        return ApiError("The configured Gemini model was not found.", "provider_model", 502)
    return ApiError(f"Gemini returned an error{f' (HTTP {status})' if status else ''}.", "provider_error", 502)

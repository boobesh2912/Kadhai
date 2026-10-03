"""Flask application factory: JSON/binary API under /api.

On Vercel the app is exposed through api/index.py. For local development run:
    python -m backend.app
"""
import os

from flask import Flask, Response, jsonify, request

from . import config
from .errors import ApiError
from .services.audio import generate_audio
from .services.image import generate_image
from .services.story import generate_story
from .validation import parse_audio_text, parse_story_options


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 64 * 1024  # request bodies are tiny JSON

    @app.after_request
    def no_store(response):
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return jsonify({"error": err.message, "code": err.code}), err.status

    @app.errorhandler(413)
    def too_large(_err):
        return jsonify({"error": "Request body is too large.", "code": "invalid_request"}), 413

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Not found.", "code": "not_found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return jsonify({"error": "Method not allowed.", "code": "method_not_allowed"}), 405

    @app.errorhandler(500)
    def server_error(_err):
        return jsonify({"error": "Unexpected server error.", "code": "server_error"}), 500

    def json_body():
        data = request.get_json(silent=True)
        if data is None:
            raise ApiError("Invalid or missing JSON body.", "invalid_request", 400)
        return data

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "gemini_key_set": bool(config.gemini_api_key()),
            }
        )

    @app.post("/api/story")
    def story():
        opts = parse_story_options(json_body())
        text = generate_story(opts["title"], opts["story_type"], opts["length"], opts["tone"])
        return jsonify({"title": opts["title"], "text": text})

    @app.post("/api/image")
    def image():
        opts = parse_story_options(json_body())
        data, content_type = generate_image(opts["title"], opts["story_type"], opts["tone"])
        return Response(data, mimetype=content_type)

    @app.post("/api/audio")
    def audio():
        text = parse_audio_text(json_body())
        data, content_type = generate_audio(text)
        return Response(data, mimetype=content_type)

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=int(os.getenv("PORT", "5001")))

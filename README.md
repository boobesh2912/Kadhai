# KADHAI - AI Story Generator

KADHAI is a Flask + React (CDN) web app that generates:
- A custom story text
- A matching AI image
- A narrated audio file

The user enters a title and preferences (type, length, tone), and the backend calls external AI services to produce story assets.

## What This Product Is About

This project is a lightweight storytelling generator for kids/creative use-cases.

Core idea:
1. User selects story settings in the browser.
2. Backend generates story text using OpenRouter (LLM).
3. Backend generates an image using Pollinations.
4. Backend generates narration using gTTS.
5. UI displays the story and allows audio playback.

## How It Is Built

## Tech Stack
- Backend: Python, Flask, Flask-CORS
- Frontend: React 18 + ReactDOM + Babel (via CDN, inside `index.html`)
- HTTP client: `requests`
- Text-to-Speech: `gTTS`
- Image generation API: Pollinations
- Story generation API: OpenRouter

## Architecture
- Single Flask server (`app.py`) serves:
  - API endpoint (`/create-story`)
  - Static generated assets (`/static/<path>`)
  - Frontend (`/` serving `index.html`)
- Frontend is a multi-step form implemented in inline React code.
- Generated files are stored temporarily in `static/`.

## File-by-File Documentation

`app.py`
- Main Flask app.
- Implements story/image/audio generation and API endpoints.
- Uses `OPENROUTER_API_KEY` from environment.

`index.html`
- Frontend UI and React logic.
- Handles form steps and API calls.
- Uses `window.location.origin` for API base.

`static/`
- Runtime output folder for generated images/audio.
- Files are created dynamically (e.g., `ai_image_*.png`, `audio_*.mp3`).

`test.html`
- Separate standalone demo file for a Product Management UI.
- Not connected to KADHAI backend flow.

`package.json`
- Contains Tailwind/PostCSS dev dependencies.
- Currently not used by `index.html` runtime (frontend is CDN-based, not build-based).

`requirements.txt`
- Python runtime dependencies for backend.

`.gitignore`
- Prevents committing virtual envs, generated assets, cache, and secrets.

## API Usage and Connectivity

## 1) Story Generation API (OpenRouter)
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Auth: Bearer token in `OPENROUTER_API_KEY`
- Model configured in code: `deepseek/deepseek-r1-0528:free`
- Input: Prompt built from title/type/length/tone
- Output used: `choices[0].message.content`

## 2) Image Generation API (Pollinations)
- Endpoint pattern: `https://image.pollinations.ai/prompt/{prompt}?width=...&height=...&nologo=true`
- Auth: none
- Output: image bytes saved in `static/`

## 3) Text-to-Speech (gTTS)
- Library: `gtts`
- Uses Google TTS service through the library
- Output: MP3 saved in `static/`

## Internal API

### `POST /create-story`
Request JSON:
```json
{
  "title": "The Moon Garden",
  "storyType": "adventure",
  "length": "short",
  "tone": "fun"
}
```

Success response:
```json
{
  "text": "...generated story...",
  "image": "static/ai_image_123456.png",
  "audio": "static/audio_123456.mp3"
}
```

Possible errors:
- `400`: invalid JSON or missing title
- `500`: generation failure (missing API key/provider issue)

## Setup and Run

## Prerequisites
- Python 3.10+
- Internet access (required for all AI services)
- OpenRouter API key

## Installation
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Environment
Set your key before running:

Windows PowerShell:
```powershell
$env:OPENROUTER_API_KEY="your_openrouter_key"
```

macOS/Linux:
```bash
export OPENROUTER_API_KEY="your_openrouter_key"
```

## Run
```bash
python app.py
```
Open: `http://localhost:5000`

## Is Everything Proper? (Codebase Audit)

## What is good
- End-to-end flow works with a simple architecture.
- Clear separation between generation steps (story/image/audio).
- Basic error handling exists.
- Frontend is responsive and easy to use.

## Risks and gaps to address
1. No automated tests are present.
2. `test.html` is unrelated to the main product and can confuse maintainers.
3. Generated assets are deleted when `/` is loaded; this can remove files still in use by open sessions.
4. Open CORS (`CORS(app)`) is permissive; restrict origins for production.
5. No rate limiting or auth on `/create-story`.
6. No lockfile/environment pinning for Python beyond `requirements.txt`.

## Suggested Next Improvements
1. Move frontend code into a dedicated `templates/` + static JS structure (or a real React build).
2. Add unit/integration tests for API endpoint and service wrappers.
3. Add request validation schema and rate limiting.
4. Add structured logging and better failure messages for third-party API outages.
5. Remove or archive `test.html` if not needed.

## Recommended Repository Structure

```text
KADHAI/
  app.py
  index.html
  static/
  requirements.txt
  package.json
  test.html
  README.md
  .gitignore
```

## License
Add a `LICENSE` file before publishing publicly.

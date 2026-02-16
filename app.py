import requests
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
from gtts import gTTS
import glob
from urllib.parse import quote

app = Flask(__name__)
CORS(app)

# Create static folder if it doesn't exist
if not os.path.exists('static'):
    os.makedirs('static')

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_story(title, story_type, length, tone):
    try:
        if not OPENROUTER_API_KEY:
            print("OPENROUTER_API_KEY is not set.")
            return None
        prompt = f"Create a {length} {story_type} story with a {tone} tone. The title is '{title}'."
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1-0528:free",
                "messages": [{"role": "user", "content": prompt}]
            }),
            timeout=60,
        )
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        return None
    except Exception as e:
        print(f"Error generating story: {e}")
        return None

def generate_image_pollinations(prompt, width=512, height=512):
    try:
        print(f"Generating image for: '{prompt}'")
        clean_prompt = quote(prompt, safe="")
        url = f"https://image.pollinations.ai/prompt/{clean_prompt}?width={width}&height={height}&nologo=true"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=60)
        if response.status_code == 200:
            timestamp = int(time.time())
            filename = f"static/ai_image_{timestamp}.png"
            with open(filename, 'wb') as f:
                f.write(response.content)
            return filename
        return None
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def generate_audio(text):
    try:
        tts = gTTS(text=text, lang='en')
        timestamp = int(time.time())
        filename = f"static/audio_{timestamp}.mp3"
        tts.save(filename)
        return filename
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

def cleanup_files():
    for file in glob.glob("static/*"):
        if os.path.isfile(file):
            os.remove(file)
            print(f"Deleted file: {file}")

@app.route('/create-story', methods=['POST'])
def create_story():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    title = (data.get('title') or "").strip()
    story_type = data.get('storyType', 'adventure')
    length = data.get('length', 'short')
    tone = data.get('tone', 'fun')

    if not title:
        return jsonify({"error": "Title is required"}), 400
    
    story_text = generate_story(title, story_type, length, tone)
    if not story_text:
        return jsonify({"error": "Failed to create story. Check API key and provider availability."}), 500
    
    image_filename = generate_image_pollinations(title)
    audio_filename = generate_audio(story_text)
    
    return jsonify({
        "text": story_text,
        "image": image_filename if image_filename else None,
        "audio": audio_filename if audio_filename else None
    }), 200

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/')
def index():
    # Clean up files on page load/refresh
    cleanup_files()
    return send_from_directory('.', 'index.html')

if __name__ == "__main__":
    app.run(debug=True, port=5000)

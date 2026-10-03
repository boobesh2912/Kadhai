// Thin client for the Flask API. Same-origin: /api/* is served by the Python backend
// (Vite proxy in development, Vercel rewrite in production).

export class ApiRequestError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

async function post(path, body, signal) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiRequestError('Could not reach the server. Check your connection.', 'network', 0);
  }

  if (!response.ok) {
    let message = `Request failed (HTTP ${response.status}).`;
    let code = 'http_error';
    try {
      const data = await response.json();
      if (data.error) message = data.error;
      if (data.code) code = data.code;
    } catch {
      // Non-JSON error (e.g. a platform timeout page): keep the generic message.
      if (response.status === 504) message = 'The server took too long to answer. Please try again.';
    }
    throw new ApiRequestError(message, code, response.status);
  }
  return response;
}

export async function createStory(options, signal) {
  const response = await post('/api/story', options, signal);
  return response.json();
}

// Image and audio come back as binary; turn them into object URLs for <img>/<audio>.
// The caller must URL.revokeObjectURL() them when done.
export async function createImage(options, signal) {
  const response = await post('/api/image', options, signal);
  return URL.createObjectURL(await response.blob());
}

export async function createAudio(text, signal) {
  const response = await post('/api/audio', { text }, signal);
  return URL.createObjectURL(await response.blob());
}

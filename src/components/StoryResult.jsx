import { useCallback, useEffect, useState } from 'react';
import { createAudio, createImage } from '../api.js';

// Loads one binary asset (image or audio) and exposes its status, so a failure in
// one of them never hides the story text or the other asset.
function useAsset(loader) {
  const [state, setState] = useState({ status: 'loading', url: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = null;
    setState({ status: 'loading', url: null, error: '' });
    loader(controller.signal)
      .then((url) => {
        objectUrl = url;
        setState({ status: 'ready', url, error: '' });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', url: null, error: err.message });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

function Unavailable({ what, message, onRetry }) {
  return (
    <div className="asset-note" role="status">
      <span>
        {what} unavailable: {message}
      </span>
      <button type="button" className="btn btn-small" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export default function StoryResult({ story, options, onReset }) {
  const imageLoader = useCallback((signal) => createImage(options, signal), [options]);
  const audioLoader = useCallback((signal) => createAudio(story.text, signal), [story.text]);
  const image = useAsset(imageLoader);
  const audio = useAsset(audioLoader);

  const paragraphs = story.text.split(/\n{1,}/).filter((p) => p.trim());

  return (
    <div>
      <h2 className="title">&ldquo;{story.title}&rdquo;</h2>

      <div className="story-text">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {image.status === 'loading' && <p className="asset-note">Painting the illustration&hellip;</p>}
      {image.status === 'ready' && <img src={image.url} alt={`Illustration for ${story.title}`} className="story-image" />}
      {image.status === 'error' && <Unavailable what="Illustration" message={image.error} onRetry={image.retry} />}

      {audio.status === 'loading' && <p className="asset-note">Recording the narration&hellip;</p>}
      {audio.status === 'ready' && (
        <div className="audio-controls">
          <audio controls src={audio.url} aria-label="Story narration" />
        </div>
      )}
      {audio.status === 'error' && <Unavailable what="Narration" message={audio.error} onRetry={audio.retry} />}

      <button type="button" onClick={onReset} className="btn">
        New Story
      </button>
    </div>
  );
}

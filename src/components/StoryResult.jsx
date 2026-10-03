import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAudio, createImage } from '../api.js';
import { paginate } from '../demo/demoStory.js';
import Illustration from '../demo/Illustrations.jsx';
import { LENGTHS, STORY_TYPES, TONES } from '../constants.js';
import ReadAloud from './ReadAloud.jsx';
import StoryBook from './StoryBook.jsx';

const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;

// Loads one binary asset (image or audio) and exposes its status, so a failure in
// one of them never hides the story text or the other asset.
function useAsset(loader, enabled) {
  const [state, setState] = useState({ status: 'loading', url: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
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
  }, [loader, attempt, enabled]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

function Unavailable({ what, message, onRetry }) {
  return (
    <div className="asset-note" role="status">
      <span>
        {what} unavailable: {message}
      </span>
      <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function CoverImage({ image, title }) {
  if (image.status === 'ready') return <img src={image.url} alt={`Illustration for ${title}`} className="illustration" />;
  return (
    <div className="art-placeholder">
      {image.status === 'loading' ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <p>Painting the illustration&hellip;</p>
        </>
      ) : (
        <Unavailable what="Illustration" message={image.error} onRetry={image.retry} />
      )}
    </div>
  );
}

export default function StoryResult({ story, options, demo, onReset }) {
  const imageLoader = useCallback((signal) => createImage(options, signal), [options]);
  const audioLoader = useCallback((signal) => createAudio(story.text, signal), [story.text]);
  const image = useAsset(imageLoader, !demo);
  const audio = useAsset(audioLoader, !demo);

  const chips = [labelOf(TONES, options.tone), labelOf(LENGTHS, options.length), labelOf(STORY_TYPES, options.storyType)];

  const pages = useMemo(
    () =>
      demo
        ? story.pages.map((page, i) => ({
            text: page.text,
            art: <Illustration scene={page.scene} label={`Illustration for page ${i + 1}`} />,
          }))
        : paginate(story.text),
    [demo, story],
  );

  const coverArt = demo ? (
    <Illustration scene="street" label={`Cover illustration for ${story.title}`} />
  ) : (
    <CoverImage image={image} title={story.title} />
  );

  return (
    <div>
      <div className="result-head">
        <div>
          <h1>Your story is ready</h1>
          <p className="muted">Turn the pages with the buttons or the arrow keys.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          New story
        </button>
      </div>

      <StoryBook title={story.title} pages={pages} coverArt={coverArt} chips={chips} animate={demo} onReset={onReset} />

      <div className="narration card">
        <div>
          <strong>Narration</strong>
        </div>
        {demo && <ReadAloud text={story.text} />}
        {!demo && audio.status === 'loading' && <span className="muted">Recording the narration&hellip;</span>}
        {!demo && audio.status === 'ready' && <audio controls src={audio.url} aria-label="Story narration" />}
        {!demo && audio.status === 'error' && <Unavailable what="Narration" message={audio.error} onRetry={audio.retry} />}
      </div>
    </div>
  );
}

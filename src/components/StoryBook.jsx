import { useEffect, useRef, useState } from 'react';
import { useTypewriter } from '../useTypewriter.js';

function PageText({ page, number, total, animate, onDone }) {
  const { shown, rest, done, finish } = useTypewriter(page.text, animate, { onDone });
  return (
    <div className="page page-text" onClick={animate && !done ? finish : undefined}>
      <p className="story-copy">
        {shown}
        {!done && <span className="caret" aria-hidden="true" />}
        <span className="ghost" aria-hidden="true">{rest}</span>
      </p>
      <div className="page-foot">
        <span>
          Page {number} of {total}
        </span>
        {animate && !done && <span className="skip">Click to skip</span>}
      </div>
    </div>
  );
}

// A two-page-spread storybook: cover, text/illustration spreads, and an end page.
export default function StoryBook({ title, pages, coverArt, chips = [], animate = false, onReset }) {
  const [index, setIndex] = useState(0); // 0 = cover, 1..n = pages, n + 1 = end
  const seen = useRef(new Set());
  const total = pages.length;
  const last = total + 1;

  const go = (next) => setIndex(Math.max(0, Math.min(last, next)));

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'AUDIO'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(last, i + 1));
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last]);

  const page = index >= 1 && index <= total ? pages[index - 1] : null;

  return (
    <section className="book-wrap" aria-label={`Storybook: ${title}`}>
      <div className={`book ${page && !page.art ? 'single' : ''} ${index === last ? 'single' : ''}`}>
        {index === 0 && (
          <>
            <div className="page page-art">{coverArt}</div>
            <div className="page page-cover">
              <span className="eyebrow">A Kadhai story</span>
              <h2 className="book-title">{title}</h2>
              <div className="chips">
                {chips.map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                  </span>
                ))}
              </div>
              <button type="button" className="btn" onClick={() => go(1)}>
                Open the book
              </button>
            </div>
          </>
        )}

        {page && (
          <>
            {page.art && <div className="page page-art">{page.art}</div>}
            <PageText
              key={index}
              page={page}
              number={index}
              total={total}
              animate={animate && !seen.current.has(index)}
              onDone={() => seen.current.add(index)}
            />
          </>
        )}

        {index === last && (
          <div className="page page-end">
            <span className="ornament" aria-hidden="true">✦</span>
            <h2 className="book-title">The End</h2>
            <p className="muted">Thanks for reading &ldquo;{title}&rdquo;.</p>
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={() => go(0)}>
                Read again
              </button>
              <button type="button" className="btn" onClick={onReset}>
                Create a new story
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="book-controls">
        <button type="button" className="btn btn-secondary" onClick={() => go(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <div className="dots" role="group" aria-label="Pages">
          {Array.from({ length: total + 2 }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === index ? 'on' : ''}`}
              aria-label={i === 0 ? 'Cover' : i === last ? 'The end' : `Page ${i}`}
              aria-current={i === index}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => go(index + 1)} disabled={index === last}>
          Next →
        </button>
      </div>
    </section>
  );
}

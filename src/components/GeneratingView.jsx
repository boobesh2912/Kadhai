import { useEffect, useState } from 'react';

const DEMO_STEPS = ['Reading your idea', 'Writing the story', 'Painting the illustrations', 'Binding the book'];

export default function GeneratingView({ demo }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!demo) return undefined;
    const id = setInterval(() => setActive((n) => Math.min(n + 1, DEMO_STEPS.length - 1)), 750);
    return () => clearInterval(id);
  }, [demo]);

  return (
    <div className="card generating" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <h2>Creating your story</h2>
      {demo ? (
        <ul className="steps">
          {DEMO_STEPS.map((label, i) => (
            <li key={label} className={i < active ? 'done' : i === active ? 'active' : ''}>
              <span className="tick" aria-hidden="true">{i < active ? '✓' : ''}</span>
              {label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Writing your story. This can take up to a minute.</p>
      )}
    </div>
  );
}

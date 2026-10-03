import { useEffect, useState } from 'react';

// Demo-mode narration: uses the browser's built-in voice (no API key, no network).
export default function ReadAloud({ text }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);

  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
    },
    [supported],
  );

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={toggle} aria-pressed={speaking}>
      {speaking ? '■ Stop reading' : '▶ Read aloud'}
    </button>
  );
}

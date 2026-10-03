import { useEffect, useState } from 'react';
import { getHealth } from './api.js';

// 'checking' | 'demo' | 'live'
//
// Demo mode (built-in sample story, no AI calls) is used when:
//  - the build sets VITE_DEMO_MODE=true, or
//  - the server reports demo_mode (no GEMINI_API_KEY, or DEMO_MODE=true), or
//  - the server cannot be reached at all (so a presentation never dead-ends).
export function useDemoMode() {
  const forced = import.meta.env.VITE_DEMO_MODE === 'true';
  const [mode, setMode] = useState(forced ? 'demo' : 'checking');

  useEffect(() => {
    if (forced) return undefined;
    const controller = new AbortController();
    getHealth(controller.signal)
      .then((health) => setMode(health.demo_mode ? 'demo' : 'live'))
      .catch((err) => {
        if (err.name !== 'AbortError') setMode('demo');
      });
    return () => controller.abort();
  }, [forced]);

  return mode;
}

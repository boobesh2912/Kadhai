// MOCK authentication for demo purposes.
//
// Any username/password (or the Google button) signs the visitor in. Nothing is
// verified and nothing is sent to a server: only a display name is kept in the
// browser's localStorage so a refresh keeps you signed in. Passwords are never stored.

const STORAGE_KEY = 'kadhai.user';

export function displayNameFrom(identifier) {
  const text = (identifier || '').trim();
  const base = text.includes('@') ? text.split('@')[0] : text;
  const cleaned = base.replace(/[._-]+/g, ' ').trim() || 'Guest';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function createSession({ provider, identifier = '', name = '' }) {
  const trimmedIdentifier = identifier.trim();
  const isEmail = trimmedIdentifier.includes('@');
  return {
    provider, // 'google' | 'email'
    name: name.trim() || displayNameFrom(trimmedIdentifier),
    email: isEmail ? trimmedIdentifier : null,
    signedInAt: new Date().toISOString(),
  };
}

export const googleSession = () => createSession({ provider: 'google', name: 'Google User' });

export function loadSession(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return user && typeof user.name === 'string' ? user : null;
  } catch {
    return null;
  }
}

export function saveSession(storage, user) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (private mode); the session then lasts until reload.
  }
}

export function clearSession(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// localStorage if the browser allows it, otherwise a throwaway in-memory store.
export function getStorage() {
  try {
    const probe = '__kadhai_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const memory = new Map();
    return {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k),
    };
  }
}

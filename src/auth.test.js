import { describe, expect, it } from 'vitest';
import {
  clearSession,
  createSession,
  displayNameFrom,
  googleSession,
  loadSession,
  saveSession,
} from './auth.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    dump: () => [...map.values()].join(''),
  };
}

describe('mock login accepts anything', () => {
  it.each([
    ['alice', 'Alice', null],
    ['bob@example.com', 'Bob', 'bob@example.com'],
    ['  random.user_99  ', 'Random user 99', null],
    ['@@@', 'Guest', '@@@'],
    ['', 'Guest', null],
  ])('identifier %j signs in as %j', (identifier, name, email) => {
    const user = createSession({ provider: 'email', identifier });
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.provider).toBe('email');
  });

  it('sign-up uses the typed name', () => {
    const user = createSession({ provider: 'email', identifier: 'x@y.z', name: ' Priya ' });
    expect(user).toMatchObject({ name: 'Priya', email: 'x@y.z' });
  });

  it('the Google button signs in without any input', () => {
    expect(googleSession()).toMatchObject({ provider: 'google', name: 'Google User', email: null });
  });

  it('displayNameFrom handles odd input', () => {
    expect(displayNameFrom(undefined)).toBe('Guest');
    expect(displayNameFrom('jane.doe@corp.io')).toBe('Jane doe');
  });
});

describe('session persistence', () => {
  it('round-trips and clears a session', () => {
    const storage = memoryStorage();
    expect(loadSession(storage)).toBeNull();
    const user = createSession({ provider: 'email', identifier: 'sam' });
    saveSession(storage, user);
    expect(loadSession(storage)).toEqual(user);
    clearSession(storage);
    expect(loadSession(storage)).toBeNull();
  });

  it('never stores a password (it is not part of the session at all)', () => {
    const storage = memoryStorage();
    saveSession(storage, createSession({ provider: 'email', identifier: 'sam', password: 'hunter2' }));
    expect(storage.dump()).not.toContain('hunter2');
  });

  it('ignores corrupt stored data', () => {
    const storage = memoryStorage();
    storage.setItem('kadhai.user', '{not json');
    expect(loadSession(storage)).toBeNull();
    storage.setItem('kadhai.user', JSON.stringify({ foo: 1 }));
    expect(loadSession(storage)).toBeNull();
  });

  it('survives a storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadSession(broken)).toBeNull();
    expect(() => saveSession(broken, { name: 'x' })).not.toThrow();
    expect(() => clearSession(broken)).not.toThrow();
  });
});

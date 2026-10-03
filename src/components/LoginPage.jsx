import { useState } from 'react';
import { createSession, googleSession } from '../auth.js';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const signingUp = mode === 'signup';

  // Short pause so the mock feels like a real sign-in; then accept anything.
  const finish = (user) => {
    setBusy(true);
    setTimeout(() => onLogin(user), 400);
  };

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    finish(createSession({ provider: 'email', identifier, name: signingUp ? name : '' }));
  };

  return (
    <div className="auth-card card">
      <h1 className="title auth-title">KADHAI</h1>
      <p className="auth-subtitle">{signingUp ? 'Create your account' : 'Sign in to start your story'}</p>

      <button type="button" className="google-btn" disabled={busy} onClick={() => finish(googleSession())}>
        <GoogleLogo />
        <span>Continue with Google</span>
      </button>

      <div className="divider">
        <span>or</span>
      </div>

      <form onSubmit={submit} className="auth-form">
        {signingUp && (
          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </label>
        )}
        <label>
          {signingUp ? 'Email' : 'Email or username'}
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            placeholder={signingUp ? 'you@example.com' : 'Email or username'}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            placeholder="Password"
            required
          />
        </label>
        <button type="submit" className="btn auth-submit" disabled={busy}>
          {busy ? 'Signing in…' : signingUp ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        {signingUp ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" className="link-btn" onClick={() => setMode(signingUp ? 'signin' : 'signup')}>
          {signingUp ? 'Sign in' : 'Create an account'}
        </button>
      </p>

      <p className="demo-note" role="note">
        Demo login: any username and password works. Nothing is verified or sent to a server.
      </p>
    </div>
  );
}

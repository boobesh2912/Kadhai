import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiRequestError, createStory } from './api.js';
import { clearSession, getStorage, loadSession, saveSession } from './auth.js';
import { LENGTHS, MAX_TITLE_CHARS, STORY_TYPES, TONES } from './constants.js';
import ChoiceStep from './components/ChoiceStep.jsx';
import LoginPage from './components/LoginPage.jsx';
import StoryResult from './components/StoryResult.jsx';

const LAST_FORM_STEP = 4;
const RESULT_STEP = 5;

export default function App() {
  const storage = useMemo(getStorage, []);
  const [user, setUser] = useState(() => loadSession(storage));

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [storyType, setStoryType] = useState('adventure');
  const [length, setLength] = useState('short');
  const [tone, setTone] = useState('fun');
  const [result, setResult] = useState(null); // { story, options }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleLogin = (nextUser) => {
    saveSession(storage, nextUser);
    setUser(nextUser);
  };

  const resetForm = () => {
    controllerRef.current?.abort();
    setTitle('');
    setStoryType('adventure');
    setLength('short');
    setTone('fun');
    setResult(null);
    setError('');
    setIsLoading(false);
    setStep(1);
  };

  const handleLogout = () => {
    clearSession(storage);
    resetForm();
    setUser(null);
  };

  const handleSubmit = async () => {
    const options = { title: title.trim(), storyType, length, tone };
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoading(true);
    setError('');
    try {
      const story = await createStory(options, controller.signal);
      setResult({ story, options });
      setStep(RESULT_STEP);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      if (controllerRef.current === controller) setIsLoading(false);
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const nav = (isLast = false) => (
    <div className="nav-row">
      {step > 1 && (
        <button type="button" className="btn btn-secondary" onClick={back}>
          Back
        </button>
      )}
      <button type="button" className="btn" onClick={isLast ? handleSubmit : next} disabled={step === 1 && !title.trim()}>
        {isLast ? 'Generate' : 'Next'}
      </button>
    </div>
  );

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="text-center" role="status">
          <h2 className="title">Generating&hellip;</h2>
          <p>Writing your story, please wait. This can take up to a minute.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center" role="alert">
          <h2 className="title">Error</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setError('')} className="btn">
            Try again
          </button>
        </div>
      );
    }
    switch (step) {
      case 1:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) next();
            }}
          >
            <h2 className="title">Story Title</h2>
            <input
              type="text"
              value={title}
              maxLength={MAX_TITLE_CHARS}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              aria-label="Story title"
              className="input-field"
              autoFocus
            />
            <div className="nav-row">
              <button type="submit" className="btn" disabled={!title.trim()}>
                Next
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <div>
            <h2 className="title">Story Type</h2>
            <ChoiceStep title="Story type" options={STORY_TYPES} value={storyType} onChange={setStoryType} />
            {nav()}
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="title">Length</h2>
            <ChoiceStep title="Length" options={LENGTHS} value={length} onChange={setLength} columns={3} />
            {nav()}
          </div>
        );
      case LAST_FORM_STEP:
        return (
          <div>
            <h2 className="title">Tone</h2>
            <ChoiceStep title="Tone" options={TONES} value={tone} onChange={setTone} />
            {nav(true)}
          </div>
        );
      case RESULT_STEP:
        return <StoryResult story={result.story} options={result.options} onReset={resetForm} />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="topbar">
        <span className="brand">KADHAI</span>
        <span className="user-chip">
          <span className="avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="user-name">{user.name}</span>
          <button type="button" className="link-btn" onClick={handleLogout}>
            Log out
          </button>
        </span>
      </header>
      {step <= LAST_FORM_STEP && !isLoading && !error && (
        <p className="step-indicator">
          Step {step} of {LAST_FORM_STEP}
        </p>
      )}
      <main>{renderStep()}</main>
    </div>
  );
}

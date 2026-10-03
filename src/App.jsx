import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiRequestError, createStory } from './api.js';
import { clearSession, getStorage, loadSession, saveSession } from './auth.js';
import { LENGTHS, MAX_TITLE_CHARS, STORY_TYPES, TONES } from './constants.js';
import ChoiceStep from './components/ChoiceStep.jsx';
import GeneratingView from './components/GeneratingView.jsx';
import LoginPage from './components/LoginPage.jsx';
import StoryResult from './components/StoryResult.jsx';
import { DEMO_TITLE, createDemoStory } from './demo/demoStory.js';
import { useDemoMode } from './useDemoMode.js';

const STEP_LABELS = ['Title', 'Story type', 'Length', 'Tone'];
const LAST_FORM_STEP = STEP_LABELS.length;
const RESULT_STEP = LAST_FORM_STEP + 1;

function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark" aria-hidden="true">K</span>
      Kadhai
    </span>
  );
}

export default function App() {
  const storage = useMemo(getStorage, []);
  const mode = useDemoMode();
  const demo = mode !== 'live';
  const [user, setUser] = useState(() => loadSession(storage));

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [storyType, setStoryType] = useState('adventure');
  const [length, setLength] = useState('short');
  const [tone, setTone] = useState('fun');
  const [result, setResult] = useState(null); // { story, options, demo }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

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
      const story = demo ? await createDemoStory(options, controller.signal) : await createStory(options, controller.signal);
      setResult({ story, options, demo });
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

  const actions = (isLast = false) => (
    <div className="actions">
      {step > 1 ? (
        <button type="button" className="btn btn-secondary" onClick={back}>
          Back
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="btn" onClick={isLast ? handleSubmit : next} disabled={step === 1 && !title.trim()}>
        {isLast ? 'Generate story' : 'Continue'}
      </button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) next();
            }}
          >
            <h2>What is your story called?</h2>
            <p className="muted">Give it a title. The rest is up to us.</p>
            <input
              type="text"
              value={title}
              maxLength={MAX_TITLE_CHARS}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={demo ? `e.g. ${DEMO_TITLE}` : 'e.g. The Moon Garden'}
              aria-label="Story title"
              className="input-field"
              autoFocus
            />
            <div className="actions">
              <span />
              <button type="submit" className="btn" disabled={!title.trim()}>
                Continue
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <div>
            <h2>Pick a story type</h2>
            <ChoiceStep title="Story type" options={STORY_TYPES} value={storyType} onChange={setStoryType} />
            {actions()}
          </div>
        );
      case 3:
        return (
          <div>
            <h2>How long should it be?</h2>
            <ChoiceStep title="Length" options={LENGTHS} value={length} onChange={setLength} columns={3} />
            {actions()}
          </div>
        );
      case LAST_FORM_STEP:
        return (
          <div>
            <h2>Choose the tone</h2>
            <ChoiceStep title="Tone" options={TONES} value={tone} onChange={setTone} />
            {actions(true)}
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const showWizard = !isLoading && !error && step <= LAST_FORM_STEP;

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <Logo />
          <span className="spacer" />
          <span className="user-chip">
            <span className="avatar" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{user.name}</span>
            <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
              Log out
            </button>
          </span>
        </div>
      </header>

      <main className={`container ${step === RESULT_STEP && !isLoading ? 'wide' : ''}`}>
        {isLoading && <GeneratingView demo={demo} />}

        {error && !isLoading && (
          <div className="card message" role="alert">
            <h2>We couldn&rsquo;t create your story</h2>
            <p className="muted">{error}</p>
            <button type="button" onClick={() => setError('')} className="btn">
              Try again
            </button>
          </div>
        )}

        {showWizard && (
          <div className="card wizard">
            <div className="wizard-head">
              <h1>Create a story</h1>
              <span className="muted">
                Step {step} of {LAST_FORM_STEP} &middot; {STEP_LABELS[step - 1]}
              </span>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={LAST_FORM_STEP}
              aria-valuenow={step}
              aria-label="Progress"
            >
              <span style={{ width: `${(step / LAST_FORM_STEP) * 100}%` }} />
            </div>
            {renderStep()}
          </div>
        )}

        {step === RESULT_STEP && !isLoading && !error && result && (
          <StoryResult story={result.story} options={result.options} demo={result.demo} onReset={resetForm} />
        )}
      </main>
    </div>
  );
}

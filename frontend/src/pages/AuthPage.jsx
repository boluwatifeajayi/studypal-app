import { useState } from 'react';
import { HiArrowPath } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth.js';

const QUOTE = 'Study hard — what you do now can improve all the days of your life.';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="auth-quote">&ldquo;{QUOTE}&rdquo;</p>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1 className="auth-title">StudyPal</h1>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Sign up
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handle}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handle}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 16px' }}
              disabled={loading}
            >
              {loading && <HiArrowPath style={{ fontSize: 18, marginRight: 8 }} className="spin" />}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch" style={{ marginTop: 24 }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); setError(''); }}>Sign up</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>Sign in</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

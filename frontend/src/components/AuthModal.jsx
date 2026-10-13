import { useState, useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AuthModal({ mode, setMode, onClose, onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { name, email, password } : { email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      onAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sw-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sw-modal" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Sign in' : 'Create account'}>
        <button className="sw-close" aria-label="Close" onClick={onClose}>×</button>
        <h2 style={{ margin: '0 0 4px' }}>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
        <p className="sw-muted" style={{ margin: '0 0 20px' }}>
          {mode === 'login' ? 'Sign in to see your favorites and history.' : 'Save products and revisit your searches.'}
        </p>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <label className="sw-field">Name
              <input type="text" value={name} autoComplete="name" onChange={e => setName(e.target.value)} required autoFocus />
            </label>
          )}
          <label className="sw-field">Email
            <input type="email" value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} required autoFocus={mode === 'login'} />
          </label>
          <label className="sw-field sw-pw">Password
            <input type={showPw ? 'text' : 'password'} value={password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onChange={e => setPassword(e.target.value)} required minLength={8} />
            <button type="button" onClick={() => setShowPw(s => !s)}>{showPw ? 'Hide' : 'Show'}</button>
          </label>
          {mode === 'register' && <small className="sw-muted" style={{ display: 'block', margin: '-6px 0 14px' }}>At least 8 characters.</small>}
          {error && <div className="sw-error" role="alert">{error}</div>}
          <button type="submit" className="sw-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginBottom: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" className="sw-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
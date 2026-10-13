import React, { useState } from 'react';

export default function History({ history, setHistory, token, onSearch, setView, onSignIn }) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [error, setError] = useState('');

  const clearHistory = async () => {
    if (!token) return;
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setHistory([]);
    } catch {
      setError('Could not clear your history. Please try again.');
    }
  };

  const handleSearch = (e, query) => {
    e.preventDefault();
    setView('home');
    onSearch(e, query);
  };

  if (!token) {
    return <main className="sw-page"><div className="sw-wrap"><div className="sw-empty">
      <p style={{ margin: '0 0 16px' }}>Sign in to see your search history.</p>
      {onSignIn && <button type="button" className="sw-btn" onClick={onSignIn}>Sign in</button>}
    </div></div></main>;
  }

  return (
    <main className="sw-page">
      <div className="sw-wrap sw-narrow">
        <div className="sw-head">
          <div>
            <h1 className="sw-h1">Search History</h1>
            <p className="sw-muted" style={{ margin: 0 }}>Your past searches, ready to compare again.</p>
          </div>
          {history.length > 0 && <button type="button" className="sw-btn sw-btn-danger" onClick={clearHistory}>Clear all</button>}
        </div>
        {error && <div className="sw-error" role="alert">{error}</div>}

        <ul className="sw-list">
          {history.map(h => (
            <li key={h._id} tabIndex={0} onClick={e => handleSearch(e, h.query)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(e, h.query)}>
              <span className="sw-muted" aria-hidden="true">⌕</span>
              <b>{h.query}</b>
              <small className="sw-muted">{new Date(h.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
        {!history.length && <div className="sw-empty">No recent searches to display.</div>}
      </div>
    </main>
  );
}
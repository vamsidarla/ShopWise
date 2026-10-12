import React from 'react';

export default function History({ history, setHistory, token, onSearch, setView }) {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const clearHistory = async () => {
    if (!token) return;
    try {
      await fetch(`${apiBase}/api/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e, query) => {
    e.preventDefault();
    setView('home');
    onSearch(e, query);
  };

  if (!token) {
    return (
      <main className="page">
        <div className="empty">Please sign in to view your search history.</div>
      </main>
    );
  }

  return (
    <main className="page" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Search History</h1>
          <p style={{ color: '#84908a', margin: 0 }}>Your past searches, ready to compare again.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            style={{ padding: '8px 16px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
          >
            Clear all
          </button>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map(h => (
          <li 
            key={h._id} 
            onClick={(e) => handleSearch(e, h.query)}
            style={{ 
              display: 'flex', alignItems: 'center', padding: '16px 20px', background: 'var(--surface)', 
              borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', gap: '16px' 
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ color: 'var(--text-muted)' }}>⌕</span>
            <b style={{ flex: 1 }}>{h.query}</b>
            <small style={{ color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
      
      {!history.length && (
        <div className="empty">No recent searches to display.</div>
      )}
    </main>
  );
}

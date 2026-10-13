import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function Favorites({ token, saved, toggleFavorite, onCardClick, onSignIn }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    setError('');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const groupMap = new Map();
          for (const p of data) {
            const gId = p.groupId || p.id;
            if (!groupMap.has(gId)) groupMap.set(gId, { ...p, id: gId, items: [p] });
            else groupMap.get(gId).items.push(p);
          }
          setFavorites(Array.from(groupMap.values()));
        }
        setLoading(false);
      })
      .catch(() => { setError('Could not load your saved items. Please try again.'); setLoading(false); });
  }, [token, saved]);

  if (!token) {
    return <main className="sw-page"><div className="sw-wrap"><div className="sw-empty">
      <p style={{ margin: '0 0 16px' }}>Sign in to see your saved products.</p>
      {onSignIn && <button type="button" className="sw-btn" onClick={onSignIn}>Sign in</button>}
    </div></div></main>;
  }

  if (loading) {
    return (
      <main className="sw-page"><div className="sw-wrap">
        <div className="sw-grid" aria-busy="true">{Array.from({ length: 4 }, (_, i) => <div key={i} className="sw-skel" />)}</div>
      </div></main>
    );
  }

  return (
    <main className="sw-page">
      <div className="sw-wrap">
        <h1 className="sw-h1">My List</h1>
        <p className="sw-muted" style={{ margin: '0 0 28px' }}>Products you've saved for later.</p>
        {error && <div className="sw-error" role="alert">{error}</div>}
        <div className="sw-grid">
          {favorites.map((group, i) => (
            <ProductCard key={group.id} index={i} product={group} favorite={true}
              onFavorite={() => toggleFavorite(group)} onClick={() => onCardClick(group)} />
          ))}
        </div>
        {!favorites.length && !error && (
          <div className="sw-empty">You haven't saved any items yet. Start searching to find the best deals!</div>
        )}
      </div>
    </main>
  );
}
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function Favorites({ token, saved, toggleFavorite, onCardClick }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
            // Group favorites to maintain unified format
            const groupMap = new Map();
            for (const p of data) {
              const gId = p.groupId || p.id;
              if (!groupMap.has(gId)) {
                groupMap.set(gId, { ...p, id: gId, items: [p] });
              } else {
                groupMap.get(gId).items.push(p);
              }
            }
            setFavorites(Array.from(groupMap.values()));
         }
         setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [token, saved]);

  if (!token) {
    return (
      <main className="page">
        <div className="empty">Please sign in to view your favorites.</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="empty">Loading your saved items...</div>
      </main>
    );
  }
  
  return (
    <main className="page" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>My List</h1>
        <p style={{ color: '#84908a', margin: 0 }}>Products you've saved for later.</p>
      </div>
      
      <div className="grid">
        {favorites.map(group => (
          <ProductCard 
            key={group.id} 
            product={group} 
            favorite={true} 
            onFavorite={() => toggleFavorite(group)} 
            onClick={() => onCardClick(group)}
          />
        ))}
      </div>
      
      {!favorites.length && (
        <div className="empty">You haven't saved any items yet. Start searching to find the best deals!</div>
      )}
    </main>
  );
}

import React, { useEffect } from 'react';

const money = v => `₹${Number(v).toLocaleString('en-IN')}`;

export default function ComparisonModal({ group, onClose, favorite, onFavorite }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!group || !group.items) return null;

  const amazon = group.items.find(i => i.store === 'amazon');
  const flipkart = group.items.find(i => i.store === 'flipkart');
  const both = amazon && flipkart && Number(amazon.price) !== Number(flipkart.price);
  const lowest = both ? (Number(amazon.price) < Number(flipkart.price) ? 'amazon' : 'flipkart') : null;
  const cell = (store, item, render) => (
    <td className={store === lowest ? 'best' : ''}>{item ? render(item) : '—'}</td>
  );

  return (
    <div className="sw-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sw-modal wide" role="dialog" aria-modal="true" aria-label={group.name}>
        <button className="sw-close" aria-label="Close" onClick={onClose}>×</button>
        <div style={{ textAlign: 'center' }}>
          {group.image && <img src={group.image} alt={group.name} style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }} />}
          <h2 style={{ margin: '12px 0 4px', fontSize: 20 }}>{group.name}</h2>
          {group.smartScore && <span className="sw-badge"><b>{group.smartScore}</b> / 100 Smart Score</span>}
          {onFavorite && (
            <div style={{ marginTop: 14 }}>
              <button type="button" className={`sw-btn sw-btn-ghost sw-savebtn ${favorite ? 'saved' : ''}`} aria-pressed={!!favorite} onClick={onFavorite}>
                {favorite ? '♥ Saved to My list' : '♡ Save to My list'}
              </button>
            </div>
          )}
        </div>

        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead>
              <tr><th></th><th><span className="sw-badge amazon">Amazon</span></th><th><span className="sw-badge flipkart">Flipkart</span></th></tr>
            </thead>
            <tbody>
              <tr><td>Price</td>
                {cell('amazon', amazon, i => <>{money(i.price)}{lowest === 'amazon' && <span className="sw-best">Lowest listed</span>}</>)}
                {cell('flipkart', flipkart, i => <>{money(i.price)}{lowest === 'flipkart' && <span className="sw-best">Lowest listed</span>}</>)}
              </tr>
              <tr><td>Rating</td>{cell('', amazon, i => i.rating ? `${i.rating}★` : '—')}{cell('', flipkart, i => i.rating ? `${i.rating}★` : '—')}</tr>
              <tr><td>Reviews</td>{cell('', amazon, i => i.reviews || '—')}{cell('', flipkart, i => i.reviews || '—')}</tr>
              <tr><td>Delivery</td>{cell('', amazon, i => <small>{i.delivery || '—'}</small>)}{cell('', flipkart, i => <small>{i.delivery || '—'}</small>)}</tr>
            </tbody>
          </table>
        </div>
        {both && <p className="sw-muted" style={{ fontSize: 12 }}>Lowest among the listings currently shown, not across the whole internet.</p>}

        <div className="sw-actions">
          {amazon && <a className="sw-btn" style={{ textAlign: 'center', textDecoration: 'none' }} href={amazon.url} target="_blank" rel="noopener noreferrer">View Amazon Deal ↗</a>}
          {flipkart && <a className="sw-btn" style={{ textAlign: 'center', textDecoration: 'none' }} href={flipkart.url} target="_blank" rel="noopener noreferrer">View Flipkart Deal ↗</a>}
        </div>
      </div>
    </div>
  );
}
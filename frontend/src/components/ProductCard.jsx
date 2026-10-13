import { useState } from 'react';

const money = v => `₹${Number(v).toLocaleString('en-IN')}`;

export default function ProductCard({ product, favorite, onFavorite, onClick, index = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const discount = product.original > product.price ? Math.round((1 - product.price / product.original) * 100) : 0;
  const hasMultiple = product.items && product.items.length > 1;
  const isUnified = hasMultiple && new Set(product.items.map(i => i.store)).size > 1;
  const score = product.smartScore;
  const rating = `★ ${product.rating || '—'}${product.reviews ? ` (${product.reviews})` : ''}`;

  return (
    <article
      className="sw-card"
      style={{ '--i': Math.min(index, 12), cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => onClick && e.key === 'Enter' && onClick()}
    >
      <div className="sw-img">
        {product.tag && <span className="sw-tag">{product.tag}</span>}
        {score && <span className={`sw-score ${score >= 90 ? '' : score >= 80 ? 'good' : 'average'}`}>{score} Score</span>}
        <button
          className={favorite ? 'sw-heart saved' : 'sw-heart'}
          aria-label={favorite ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={!!favorite}
          onClick={e => { e.stopPropagation(); onFavorite(); }}
        >
          <span aria-hidden="true">{favorite ? '♥' : '♡'}</span> {favorite ? 'Saved' : 'Save'}
        </button>
        {product.image && !imgFailed ? (
          <img src={product.image} alt={product.name} loading="lazy" onError={() => setImgFailed(true)} />
        ) : (
          <span className="sw-muted" aria-hidden="true">No image</span>
        )}
      </div>
      <div className="sw-body">
        <div className="sw-row">
          {isUnified ? (
            <span><span className="sw-badge amazon">amazon</span> <span className="sw-badge flipkart">Flipkart</span></span>
          ) : (
            <span className={`sw-badge ${product.store}`}>{product.store}</span>
          )}
          <span>{rating}</span>
        </div>
        <h3 title={product.name}>{product.name}</h3>
        <div className="sw-price">
          <strong>{money(product.price)}</strong>
          {discount > 0 && (<><s>{money(product.original)}</s><em>{discount}% off</em></>)}
        </div>
        <small className="sw-muted">{isUnified ? 'Available on multiple platforms' : product.delivery}</small>
        <button className="sw-btn" type="button">{isUnified ? 'Compare deals →' : 'View deal ↗'}</button>
      </div>
    </article>
  );
}
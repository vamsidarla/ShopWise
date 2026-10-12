export default function ProductCard({ product, favorite, onFavorite, onClick }) {
  const discount = product.original > product.price ? Math.round((1 - product.price / product.original) * 100) : 0;
  
  const hasMultiple = product.items && product.items.length > 1;
  const isUnified = hasMultiple && new Set(product.items.map(i => i.store)).size > 1;
  
  return (
    <article className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="image">
        {product.tag && <span className="tag">{product.tag}</span>}
        {product.smartScore && (
          <div className={`smart-score ${product.smartScore >= 90 ? 'excellent' : product.smartScore >= 80 ? 'good' : 'average'}`}>
            <strong>{product.smartScore}</strong>
            <span>Score</span>
          </div>
        )}
        <button className={favorite ? 'heart saved' : 'heart'} onClick={(e) => { e.stopPropagation(); onFavorite(); }}>
          {favorite ? '♥' : '♡'}
        </button>
        {product.image ? <img src={product.image} alt="" /> : <div className="headphones">◖ ◗</div>}
      </div>
      <div className="card-body">
        {isUnified ? (
          <div className="store-group">
            <span className="store amazon">amazon</span>
            <span className="store flipkart">Flipkart</span>
            <span className="rating-badge float-right">★ {product.rating || '—'} {product.reviews && `(${product.reviews})`}</span>
          </div>
        ) : (
          <div className={'store ' + product.store}>
            {product.store === 'amazon' ? 'amazon' : 'Flipkart'}
            <span>★ {product.rating || '—'} {product.reviews && `(${product.reviews})`}</span>
          </div>
        )}
        
        <h3>{product.name}</h3>
        <p>{isUnified ? 'Available on multiple platforms' : product.description || `Live listing from ${product.store}`}</p>
        
        <div className="price-row">
          <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>{' '}
          {product.original > product.price && (
            <>
              <s>₹{Number(product.original).toLocaleString('en-IN')}</s>
              <em>{discount}% off</em>
            </>
          )}
        </div>
        
        <small>{isUnified ? 'Compare delivery options' : product.delivery}</small>
        
        <button className="deal">
          {isUnified ? 'Compare deals →' : 'View deal ↗'}
        </button>
      </div>
    </article>
  );
}

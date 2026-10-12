import React from 'react';
import ProductCard from './ProductCard';
import InsightCard from './InsightCard';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function Home({
  query, setQuery, search, searching,
  minPrice, setMinPrice, maxPrice, setMaxPrice, minimumRating, setMinimumRating,
  platforms, setPlatforms, sort, setSort,
  visible, notice, setNotice, insights,
  saved, toggleFavorite, onCardClick
}) {
  return (
    <main id="top">
      <section className="hero" id="discover">
        <span className="eyebrow">● COMPARE. DECIDE. SAVE.</span>
        <h1>Find the best deal.<br /><em>Not just the lowest price.</em></h1>
        <p>ShopWise compares price, delivery, offers and seller trust so you can buy with confidence.</p>
        <form className="search" onSubmit={e => search(e, query)}>
          <span>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="What are you looking for?" />
          <button disabled={searching}>{searching ? 'Searching stores…' : 'Compare prices →'}</button>
        </form>
        
        <div className="search-options">
          <div className="option-group">
            <label>
              Min Price: 
              <input type="number" min="0" max="150000" step="500" value={minPrice} onChange={e => setMinPrice(+e.target.value)} style={{ width: '80px', marginLeft: '8px', padding: '2px 4px' }} />
            </label>
            <input type="range" min="0" max="150000" step="500" value={minPrice} onChange={e => setMinPrice(+e.target.value)} />
          </div>
          <div className="option-group">
            <label>
              Max Price: 
              <input type="number" min="0" max="150000" step="500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ width: '80px', marginLeft: '8px', padding: '2px 4px' }} />
            </label>
            <input type="range" min="0" max="150000" step="500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
          </div>
          <div className="option-group">
            <label>Minimum Rating</label>
            <select value={minimumRating} onChange={e => setMinimumRating(+e.target.value)}>
              <option value={0}>Any rating</option>
              <option value={3}>3.0 & up</option>
              <option value={4}>4.0 & up</option>
            </select>
          </div>
        </div>
        <div className="quick">
          <span>Trending:</span>
          {['iPhone 15','AirPods Pro','PS5','Samsung S24'].map(item => (
            <button key={item} onClick={(e) => search(e, item)} type="button">{item}</button>
          ))}
        </div>
        <p className="stores">Comparing across <b>amazon</b> and <b className="flipkart">Flipkart</b></p>
      </section>

      <section className="content" id="results">
        <aside>
          <div className="side-title">
            <h2>Filter results</h2>
            <button onClick={() => { setPlatforms({ amazon: true, flipkart: true }); setMinPrice(0); setMaxPrice(150000); setMinimumRating(0); }}>
              Clear all
            </button>
          </div>
          <fieldset>
            <legend>Platform</legend>
            {['amazon','flipkart'].map(store => (
              <label key={store}>
                <input type="checkbox" checked={platforms[store]} onChange={() => setPlatforms(p => ({ ...p, [store]: !p[store] }))} />
                {store === 'amazon' ? 'Amazon' : 'Flipkart'}
              </label>
            ))}
          </fieldset>
        </aside>

        <div className="results">
          <div className="result-head">
            <div>
              <small>RESULTS FOR</small>
              <h2>{query} <span>({visible.length})</span></h2>
            </div>
            <label>
              Sort by{' '}
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="recommended">Most relevant</option>
                <option value="price">Lowest price</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>

          {notice && (
            <div className="insight">
              <b>✦</b>
              <p>{notice}</p>
              <button onClick={() => setNotice('')}>×</button>
            </div>
          )}

          {insights && (
            <div className="insight-cards">
              <InsightCard title="Best value" item={insights.bestValue} detail="Rating, review confidence, offer & price" icon="✦" />
              <InsightCard title="Cheapest" item={insights.cheapest} detail="Lowest current listed price" icon="↓" />
              <InsightCard title="Top rated" item={insights.bestRated} detail={`${insights.bestRated?.rating || '—'}★ weighted by reviews`} icon="★" />
            </div>
          )}

          <div className="grid">
            {visible.map(group => (
              <ProductCard 
                key={group.id} 
                product={group} 
                favorite={saved.includes(group.id)} 
                onFavorite={() => toggleFavorite(group)} 
                onClick={() => onCardClick(group)}
              />
            ))}
          </div>

          {!visible.length && (
            <div className="empty">
              {searching ? 'Finding the best matches…' : 'No products match this search. Try different words or broader filters.'}
            </div>
          )}
        </div>
      </section>

      <section id="how" className="how">
        <div>
          <small>SHOP SMARTER</small>
          <h2>A little more clarity<br />before you click buy.</h2>
        </div>
        <div>
          <p><b>01</b> Compare the true cost, including offers and delivery.</p>
          <p><b>02</b> See which store better fits your priorities.</p>
          <p><b>03</b> Save favourites and revisit deals when ready.</p>
        </div>
      </section>
    </main>
  );
}

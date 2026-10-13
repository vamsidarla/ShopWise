import React, { useState } from 'react';
import ProductCard from './ProductCard';
import InsightCard from './InsightCard';
import HeroScene from './HeroScene';

const TRENDING = ['iPhone 15', 'AirPods Pro', 'PS5', 'Samsung S24'];

export default function Home({
  query, setQuery, search, searching,
  minPrice, setMinPrice, maxPrice, setMaxPrice, minimumRating, setMinimumRating,
  platforms, setPlatforms, sort, setSort,
  visible, notice, setNotice, insights,
  saved, toggleFavorite, onCardClick
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = (platforms.amazon ? 0 : 1) + (platforms.flipkart ? 0 : 1) + (minPrice > 0 ? 1 : 0) + (maxPrice < 150000 ? 1 : 0) + (minimumRating > 0 ? 1 : 0);
  const showEmpty = !searching && !visible.length;
  const serverDown = /failed to fetch|networkerror|load failed/i.test(notice);
  const resetFilters = () => { setPlatforms({ amazon: true, flipkart: true }); setMinPrice(0); setMaxPrice(150000); setMinimumRating(0); };

  return (
    <main id="top" className="sw-page">
      <section className="sw-hero" id="discover">
        <div className="sw-hero-in">
          <div className="sw-hero-copy">
            <span className="sw-eyebrow">COMPARE · DECIDE · SAVE</span>
            <h1>Compare Smarter.<br /><span className="sw-grad">Shop Better.</span></h1>
            <p>ShopWise helps you discover and compare products across multiple shopping platforms — price, ratings and delivery, side by side.</p>
            <form className="sw-search" role="search" onSubmit={e => search(e, query)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="What are you looking for?" aria-label="Search products" />
              {query && <button type="button" className="sw-clear" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}
              <button className="sw-btn" disabled={searching}>{searching ? 'Searching…' : 'Compare prices →'}</button>
            </form>
            <div className="sw-chips">
              <span>Trending:</span>
              {TRENDING.map(item => (
                <button key={item} type="button" className="sw-chip" disabled={searching} onClick={e => search(e, item)}>{item}</button>
              ))}
            </div>
            <p className="sw-stores">Comparing across <b>Amazon</b> and <b>Flipkart</b></p>
          </div>
          <HeroScene products={visible} />
        </div>
      </section>

      <section className="sw-content" id="results">
        <div>
          <button type="button" className="sw-btn sw-btn-ghost sw-filter-toggle" onClick={() => setFiltersOpen(o => !o)} aria-expanded={filtersOpen}>
            {filtersOpen ? 'Hide filters' : `Filters${activeFilters ? ` (${activeFilters})` : ''}`}
          </button>
          <div role="complementary" className={`sw-filters ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
            <div className="sw-fhead">
              <h2>Filters {activeFilters > 0 && <span className="sw-count">{activeFilters}</span>}</h2>
              <button type="button" className="sw-link" onClick={resetFilters}>Reset</button>
            </div>

            <div className="sw-fgroup">
              <span className="sw-flabel">Platform</span>
              <div className="sw-toggles">
                {['amazon', 'flipkart'].map(store => (
                  <button key={store} type="button" aria-pressed={platforms[store]}
                    className={`sw-toggle ${platforms[store] ? 'on' : ''}`}
                    onClick={() => setPlatforms(p => ({ ...p, [store]: !p[store] }))}>
                    <span className="dot" />{store === 'amazon' ? 'Amazon' : 'Flipkart'}
                  </button>
                ))}
              </div>
            </div>

            <div className="sw-fgroup">
              <span className="sw-flabel">Price range</span>
              <div className="sw-pricebox">
                <label><small>Min</small>
                  <div className="sw-money"><span>₹</span><input type="number" min="0" max="150000" step="500" value={minPrice} onChange={e => setMinPrice(+e.target.value)} /></div>
                </label>
                <label><small>Max</small>
                  <div className="sw-money"><span>₹</span><input type="number" min="0" max="150000" step="500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} /></div>
                </label>
              </div>
              <input type="range" aria-label="Minimum price" min="0" max="150000" step="500" value={minPrice} onChange={e => setMinPrice(+e.target.value)} />
              <input type="range" aria-label="Maximum price" min="0" max="150000" step="500" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
            </div>

            <div className="sw-fgroup">
              <span className="sw-flabel">Minimum rating</span>
              <div className="sw-pills">
                {[[0, 'Any'], [3, '3.0 ★ & up'], [4, '4.0 ★ & up']].map(([v, label]) => (
                  <button key={v} type="button" aria-pressed={minimumRating === v}
                    className={`sw-pill ${minimumRating === v ? 'on' : ''}`} onClick={() => setMinimumRating(v)}>{label}</button>
                ))}
              </div>
            </div>

            <div className="sw-fsummary">
              <b>{searching ? '…' : visible.length}</b>
              <span>{searching ? 'searching' : visible.length === 1 ? 'product matches' : 'products match'}</span>
              {activeFilters > 0 && <button type="button" className="sw-link" onClick={resetFilters}>Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}</button>}
            </div>
          </div>
        </div>

        <div>
          <div className="sw-head">
            <div>
              <small className="sw-muted">RESULTS FOR</small>
              <h2><span className="sw-grad">{query || 'Your search'}</span>
                <span className="sw-countpill">{searching ? 'searching…' : `${visible.length} found`}</span></h2>
            </div>
            <div className="sw-seg" role="group" aria-label="Sort results">
              {[['recommended', 'Most relevant'], ['price', 'Lowest price'], ['rating', 'Top rated']].map(([v, label]) => (
                <button key={v} type="button" className={sort === v ? 'on' : ''} aria-pressed={sort === v} onClick={() => setSort(v)}>{label}</button>
              ))}
            </div>
          </div>

          {notice && !showEmpty && (
            <div className={`sw-notice ${searching ? 'loading' : ''}`} role="status">
              {searching ? <span className="sw-spinner" /> : <b>✦</b>}<p>{notice}</p>
              {!searching && <button type="button" aria-label="Dismiss" onClick={() => setNotice('')}>×</button>}
            </div>
          )}

          {insights && !searching && (
            <div className="sw-insights">
              <InsightCard title="Best value" item={insights.bestValue} detail="Rating, review confidence, offer & price" icon="✦" />
              <InsightCard title="Cheapest" item={insights.cheapest} detail="Lowest listed price in these results" icon="↓" />
              <InsightCard title="Top rated" item={insights.bestRated} detail={`${insights.bestRated?.rating || '—'}★ weighted by reviews`} icon="★" />
            </div>
          )}

          {searching && !visible.length ? (
            <div className="sw-grid" aria-busy="true" aria-label="Loading results">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="sw-skel" />)}
            </div>
          ) : (
            <div className="sw-grid">
              {visible.map((group, i) => (
                <ProductCard key={group.id} index={i} product={group}
                  favorite={saved.includes(group.id)}
                  onFavorite={() => toggleFavorite(group)}
                  onClick={() => onCardClick(group)} />
              ))}
            </div>
          )}

          {showEmpty && (
            <div className={`sw-emptystate ${serverDown ? 'err' : ''}`} role="status">
              <div className="sw-eorb" />
              <h3>{serverDown ? "Can't reach the ShopWise server" : 'No matching products'}</h3>
              <p>
                {serverDown
                  ? 'The search request never reached the backend. Make sure it is running, then try again.'
                  : (notice || 'Try different words, or loosen your filters.')}
              </p>
              <div className="sw-eactions">
                <button type="button" className="sw-btn" onClick={e => search(e, query)}>Try again</button>
                {activeFilters > 0 && <button type="button" className="sw-btn sw-btn-ghost" onClick={resetFilters}>Reset filters</button>}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="how" className="sw-wrap">
        <small className="sw-muted">WHY SHOPWISE</small>
        <h2 className="sw-h1">A little more clarity before you click buy.</h2>
        <div className="sw-features">
          <div className="sw-feature"><span className="sw-num">1</span><h3>Compare side by side</h3><p className="sw-muted">See price, rating and delivery for each platform together.</p></div>
          <div className="sw-feature"><span className="sw-num">2</span><h3>Transparent prices</h3><p className="sw-muted">We show listed prices from each store, and mark the lowest among current results.</p></div>
          <div className="sw-feature"><span className="sw-num">3</span><h3>Save time</h3><p className="sw-muted">Save favourites and re-run past searches instead of juggling tabs.</p></div>
        </div>
      </section>
    </main>
  );
}
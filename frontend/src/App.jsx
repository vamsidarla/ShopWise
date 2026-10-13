import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import AuthModal from './components/AuthModal';
import Home from './components/Home';
import Favorites from './components/Favorites';
import History from './components/History';
import HowItWorks from './components/HowItWorks';
import ComparisonModal from './components/ComparisonModal';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

export default function App() {
  const [query, setQuery] = useState('wireless headphones');
  // Real data only: the old hardcoded sampleProducts and its fixed "save up to ₹1,401" notice were removed.
  const [products, setProducts] = useState([]);
  const [platforms, setPlatforms] = useState({ amazon: true, flipkart: true });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [minimumRating, setMinimumRating] = useState(0);
  const [sort, setSort] = useState('recommended');

  const [user, setUser] = useState(() => readJSON('user'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authModal, setAuthModal] = useState(null);

  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home');
  const [activeGroup, setActiveGroup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [searching, setSearching] = useState(true);
  const [notice, setNotice] = useState('');
  const [insights, setInsights] = useState(null);
  const [topN] = useState(12);

  const debounceRef = useRef(null);
  const firstRun = useRef(true);
  const lastSearched = useRef(null);
  const requestId = useRef(0);

  /* ---------- theme ---------- */
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* ---------- toasts ---------- */
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); setMenuOpen(false); }, [view]);

  /* ---------- search ---------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    // Skip when this query was already searched (chip click / submit), so we don't fire a duplicate request.
    if (query === lastSearched.current) return;
    const delay = firstRun.current ? 0 : 800;
    firstRun.current = false;
    debounceRef.current = setTimeout(() => search(null, query), delay);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const visible = useMemo(() => {
    const filtered = products
      .filter(p => platforms[p.store] && p.price >= minPrice && p.price <= maxPrice && (!minimumRating || (p.rating || 0) >= minimumRating))
      .sort((a, b) =>
        sort === 'price' ? a.price - b.price
        : sort === 'rating' ? (b.rating || 0) - (a.rating || 0)
        : (b.relevance || 0) - (a.relevance || 0));

    const groupMap = new Map();
    for (const p of filtered) {
      const gId = p.groupId || p.id;
      if (!groupMap.has(gId)) groupMap.set(gId, { ...p, id: gId, items: [p] });
      else groupMap.get(gId).items.push(p);
    }
    return Array.from(groupMap.values()).slice(0, topN);
  }, [products, platforms, minPrice, maxPrice, minimumRating, sort, topN]);

  useEffect(() => {
    if (token) {
      fetch(`${apiBase}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setSaved(data.map(d => d.productId)))
        .catch(console.error);
      fetch(`${apiBase}/api/history`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setHistory(data))
        .catch(console.error);
    } else {
      setSaved([]);
      setHistory([]);
    }
  }, [token]);

  async function search(event, searchStr = query) {
    event?.preventDefault();
    if (!searchStr.trim()) return;
    clearTimeout(debounceRef.current);
    lastSearched.current = searchStr;
    const myId = ++requestId.current;
    setQuery(searchStr);
    setProducts([]);
    setInsights(null);
    setNotice('Searching Amazon and Flipkart for the most relevant products…');
    setSearching(true);

    if (token && event) { // only log searches the user actually ran (submit / chip / history click), not automatic ones
      fetch(`${apiBase}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: searchStr })
      }).then(() => fetch(`${apiBase}/api/history`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setHistory(data))
      ).catch(console.error);
    }

    try {
      const response = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(searchStr)}&minPrice=${minPrice}&maxPrice=${maxPrice}&minRating=${minimumRating}`);
      const data = await response.json();
      if (myId !== requestId.current) return; // a newer search superseded this one
      if (!response.ok) throw new Error(data.error);
      if (!data.products.length) throw new Error('No live listings found. Try a more specific product.');
      setProducts(data.products);
      setInsights(data.insights);

      if (data.errors && data.errors.length > 0) {
        setNotice(`Partial results: Failed to fetch from ${data.errors.map(e => e.store).join(' and ')}.`);
      } else {
        const best = data.insights?.bestValue;
        const cheap = data.insights?.cheapest;
        setNotice(best && cheap
          ? `Best value: ${best.name.slice(0, 52)} on ${best.store} at ${money(best.price)}. Cheapest: ${cheap.name.slice(0, 42)} on ${cheap.store} at ${money(cheap.price)}.`
          : `Showing ${data.products.length} relevant live listings.`);
      }
    } catch (error) {
      if (myId !== requestId.current) return;
      setProducts([]);
      setInsights(null);
      setNotice(error.message || 'Live search is temporarily unavailable.');
    } finally {
      if (myId === requestId.current) setSearching(false);
    }
  }

  async function toggleFavorite(product) {
    if (!token) { showToast('Sign in to save products', 'error'); setActiveGroup(null); return setAuthModal('login'); }
    const isSaved = saved.includes(product.id);
    setSaved(current => isSaved ? current.filter(id => id !== product.id) : [...current, product.id]);
    try {
      const res = await fetch(`${apiBase}/api/favorites`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isSaved ? { productId: product.id } : product)
      });
      if (!res.ok) throw new Error();
      showToast(isSaved ? 'Removed from My list' : 'Saved to My list');
    } catch (e) {
      setSaved(current => isSaved ? [...current, product.id] : current.filter(id => id !== product.id)); // roll back
      showToast('Could not update your list. Please try again.', 'error');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast('Signed out');
  }

  const nav = [['home', 'Discover'], ['how', 'How it works'],
    ['history', token ? `History (${history.length})` : 'History'],
    ['favorites', `My list (${saved.length})`]];

  return (
    <>
      <div className="sw-announce">✦ The smartest way to shop across India</div>

      <div className="sw-header" role="banner">
        <button className="sw-brand" onClick={() => setView('home')} aria-label="ShopWise home"><i>S</i> shopwise</button>
        <nav className={`sw-nav ${menuOpen ? 'open' : ''}`} aria-label="Main">
          {nav.map(([key, label]) => (
            <button key={key} className={view === key ? 'active' : ''} aria-current={view === key ? 'page' : undefined}
              onClick={() => setView(key)}>{label}</button>
          ))}
        </nav>
        <div className="sw-header-end">
          <button className="sw-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button>
          {user ? (
            <>
              <span className="sw-username">{user.name}</span>
              <button className="sw-avatar" onClick={logout} title="Log out" aria-label="Log out">{user.name.charAt(0).toUpperCase()}</button>
            </>
          ) : (
            <button className="sw-btn" style={{ padding: '9px 18px' }} onClick={() => setAuthModal('login')}>Sign In</button>
          )}
          <button className="sw-icon-btn sw-burger" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '×' : '☰'}</button>
        </div>
      </div>

      {authModal && (
        <AuthModal
          mode={authModal}
          setMode={setAuthModal}
          onClose={() => setAuthModal(null)}
          onAuth={(u, t) => {
            setUser(u);
            setToken(t);
            localStorage.setItem('user', JSON.stringify(u));
            localStorage.setItem('token', t);
            setAuthModal(null);
            showToast(`Welcome, ${u.name}`);
          }}
        />
      )}

      {activeGroup && <ComparisonModal group={activeGroup} onClose={() => setActiveGroup(null)}
          favorite={saved.includes(activeGroup.id)} onFavorite={() => toggleFavorite(activeGroup)} />}

      <div className="sw-view" key={view}>
        {view === 'home' && (
          <Home
            query={query} setQuery={setQuery} search={search} searching={searching}
            minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            minimumRating={minimumRating} setMinimumRating={setMinimumRating}
            platforms={platforms} setPlatforms={setPlatforms} sort={sort} setSort={setSort}
            visible={visible} notice={notice} setNotice={setNotice} insights={insights}
            saved={saved} toggleFavorite={toggleFavorite} onCardClick={setActiveGroup}
          />
        )}
        {view === 'favorites' && <Favorites token={token} saved={saved} toggleFavorite={toggleFavorite} onCardClick={setActiveGroup} onSignIn={() => setAuthModal('login')} />}
        {view === 'history' && <History history={history} setHistory={setHistory} token={token} onSearch={search} setView={setView} onSignIn={() => setAuthModal('login')} />}
        {view === 'how' && <HowItWorks onStart={() => setView('home')} />}
      </div>

      <div className="sw-footer" role="contentinfo">
        <div className="sw-footer-in">
          <div>
            <button className="sw-brand" onClick={() => setView('home')}><i>S</i> shopwise</button>
            <p>Compare listings from Amazon and Flipkart in one place. Prices shown are the listed prices at search time.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <button className="sw-flink" onClick={() => setView('home')}>Discover</button>
            <button className="sw-flink" onClick={() => setView('how')}>How it works</button>
            <button className="sw-flink" onClick={() => setView('favorites')}>My list</button>
          </div>
          <div>
            <h4>Project</h4>
            <p style={{ margin: 0 }}>Made for smarter shopping.<br />A college project.</p>
          </div>
        </div>
        <div className="sw-copy">© 2026 ShopWise</div>
      </div>

      <div className="sw-toasts" aria-live="polite">
        {toasts.map(t => <div key={t.id} className={`sw-toast ${t.type}`}>{t.message}</div>)}
      </div>
    </>
  );
}
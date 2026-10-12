import { useMemo, useState, useEffect, useRef } from 'react';
import AuthModal from './components/AuthModal';
import Home from './components/Home';
import Favorites from './components/Favorites';
import History from './components/History';
import HowItWorks from './components/HowItWorks';
import ComparisonModal from './components/ComparisonModal';

const sampleProducts = [
  { id: 'sample-1', name: 'Sony WH-CH720N Wireless Headphones', description: 'Active noise cancellation · 35h battery', store: 'amazon', rating: 4.4, reviews: '12,318', price: 7990, original: 9990, delivery: 'Free delivery · Arrives tomorrow', tag: 'BEST VALUE' },
  { id: 'sample-2', name: 'JBL Tune 770NC Wireless Headphones', description: 'Adaptive noise cancelling · 70h battery', store: 'flipkart', rating: 4.3, reviews: '4,921', price: 6499, original: 8499, delivery: 'Free delivery · Arrives in 2 days', tag: 'LOWEST PRICE' },
  { id: 'sample-3', name: 'boAt Nirvana 751 ANC Headphones', description: 'Hybrid ANC · 65h playback', store: 'amazon', rating: 4.2, reviews: '8,052', price: 3299, original: 7990, delivery: 'Free delivery · Arrives tomorrow', tag: 'BUDGET PICK' },
  { id: 'sample-4', name: 'Sony WH-CH720N Wireless Headphones', description: 'Active noise cancellation · 35h battery', store: 'flipkart', rating: 4.4, reviews: '12,318', price: 8391, original: 9990, delivery: 'Free delivery · Arrives in 2 days' },
  { id: 'sample-5', name: 'JBL Live 660NC Wireless Headphones', description: 'Signature sound · 50h battery', store: 'amazon', rating: 4.3, reviews: '2,139', price: 5499, original: 8999, delivery: 'Free delivery · Arrives tomorrow' },
  { id: 'sample-6', name: 'Soundcore Q20i Headphones', description: 'Hybrid ANC · Hi-Res audio', store: 'flipkart', rating: 4.5, reviews: '1,782', price: 4499, original: 6999, delivery: 'Free delivery · Arrives in 3 days' }
];

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [query, setQuery] = useState('wireless headphones');
  const [products, setProducts] = useState(sampleProducts);
  const [platforms, setPlatforms] = useState({ amazon: true, flipkart: true });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [minimumRating, setMinimumRating] = useState(0);
  const [sort, setSort] = useState('recommended');
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [authModal, setAuthModal] = useState(null);
  
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home');
  const [activeGroup, setActiveGroup] = useState(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);
  
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState('Amazon has the best overall value for wireless headphones right now — save up to ₹1,401.');
  const [insights, setInsights] = useState(null);
  const [topN, setTopN] = useState(12);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    
    // Don't auto-search if we are already searching or if the query hasn't really changed from the results
    debounceRef.current = setTimeout(() => {
      search(null, query);
    }, 800);
    
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const visible = useMemo(() => {
    const filtered = products
      .filter(p => platforms[p.store] && p.price <= maxPrice && (!minimumRating || (p.rating || 0) >= minimumRating))
      .sort((a, b) => 
        sort === 'price' ? a.price - b.price 
        : sort === 'rating' ? (b.rating || 0) - (a.rating || 0) 
        : (b.relevance || 0) - (a.relevance || 0)
      );

    const groupMap = new Map();
    for (const p of filtered) {
      const gId = p.groupId || p.id;
      if (!groupMap.has(gId)) {
        groupMap.set(gId, { ...p, id: gId, items: [p] });
      } else {
        groupMap.get(gId).items.push(p);
      }
    }
    return Array.from(groupMap.values()).slice(0, topN);
  }, [products, platforms, maxPrice, minimumRating, sort, topN]);

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
    setQuery(searchStr);
    setProducts([]);
    setInsights(null);
    setNotice('Searching Amazon and Flipkart for the most relevant products…');
    setSearching(true);
    
    if (token) {
       fetch(`${apiBase}/api/history`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({ query: searchStr })
       }).then(() => {
          fetch(`${apiBase}/api/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => Array.isArray(data) && setHistory(data));
       }).catch(console.error);
    }

    try {
      const response = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(searchStr)}&minPrice=${minPrice}&maxPrice=${maxPrice}&minRating=${minimumRating}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (!data.products.length) throw new Error('No live listings found. Try a more specific product.');
      setProducts(data.products);
      setInsights(data.insights);
      
      if (data.errors && data.errors.length > 0) {
        setNotice(`Partial results: Failed to fetch from ${data.errors.map(e => e.store).join(' and ')}.`);
      } else {
        const best = data.insights?.bestValue;
        const cheap = data.insights?.cheapest;
        setNotice(best && cheap ? `Best value: ${best.name.slice(0, 52)} on ${best.store} at ${money(best.price)}. Cheapest: ${cheap.name.slice(0, 42)} on ${cheap.store} at ${money(cheap.price)}.` : `Showing ${data.products.length} relevant live listings.`);
      }
    } catch (error) { 
      setProducts([]); 
      setInsights(null); 
      setNotice(error.message || 'Live search is temporarily unavailable.'); 
    } finally { 
      setSearching(false); 
    }
  }
  
  async function toggleFavorite(product) {
    if (!token) return setAuthModal('login');
    const isSaved = saved.includes(product.id);
    setSaved(current => isSaved ? current.filter(id => id !== product.id) : [...current, product.id]);
    try {
      if (isSaved) {
        await fetch(`${apiBase}/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id })
        });
      } else {
        await fetch(`${apiBase}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(product)
        });
      }
    } catch (e) { 
      console.error(e); 
    }
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <>
      <div className="announcement">✦ The smartest way to shop across India</div>
      
      <header>
        <a className="brand" href="#top"><i>S</i> shopwise</a>
        <nav>
          <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }}>Discover</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setView('how'); }}>How it works</a>
          {token && (
            <a href="#" onClick={(e) => { e.preventDefault(); setView('history'); }}>
              History ({history.length})
            </a>
          )}
          <a href="#" onClick={(e) => { e.preventDefault(); setView('favorites'); }}>My list ({saved.length})</a>
        </nav>
        {user ? (
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
             <span style={{fontSize:'13px', fontWeight:'600', color:'#4b5952'}}>{user.name}</span>
             <button className="avatar" onClick={logout} title="Log out" style={{cursor: 'pointer'}}>
               {user.name.charAt(0).toUpperCase()}
             </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setAuthModal('login')}>Sign In</button>
        )}
      </header>

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
          }} 
        />
      )}

      {activeGroup && (
        <ComparisonModal group={activeGroup} onClose={() => setActiveGroup(null)} />
      )}

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

      {view === 'favorites' && (
        <Favorites token={token} saved={saved} toggleFavorite={toggleFavorite} onCardClick={setActiveGroup} />
      )}

      {view === 'history' && (
        <History history={history} setHistory={setHistory} token={token} onSearch={search} setView={setView} />
      )}

      {view === 'how' && <HowItWorks />}

      <footer>
        <a className="brand" href="#top"><i>S</i> shopwise</a>
        <span>Made for smarter shopping.</span>
        <span>© 2026 ShopWise</span>
      </footer>
    </>
  );
}

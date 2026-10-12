import React from 'react';

export default function HowItWorks() {
  return (
    <main className="page" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>How ShopWise Works</h1>
        <p style={{ fontSize: '18px', color: '#607268' }}>We built ShopWise to give you clarity and confidence before you buy.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#cdf36d', color: '#3b4741', padding: '4px 10px', borderRadius: '8px', fontSize: '16px' }}>01</span>
            Live Scraping
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            When you search, ShopWise doesn't look at an outdated database. We instantly scrape live data from top e-commerce platforms like Amazon and Flipkart to ensure you see the exact current price, stock, and delivery estimates.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#cdf36d', color: '#3b4741', padding: '4px 10px', borderRadius: '8px', fontSize: '16px' }}>02</span>
            Smart Filtering & Ranking
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            We fetch a large pool of results and immediately filter out any items that don't meet your budget or rating criteria. Our algorithm then ranks the remaining products based on a combination of price, average rating, and review volume.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#cdf36d', color: '#3b4741', padding: '4px 10px', borderRadius: '8px', fontSize: '16px' }}>03</span>
            AI Insights
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            ShopWise analyzes the top results to automatically highlight the "Best Value" (weighing price against quality), the "Cheapest" option, and the "Top Rated" product, saving you the hassle of comparing dozens of tabs.
          </p>
        </div>
      </div>
    </main>
  );
}

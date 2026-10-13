import React from 'react';

const STEPS = [
  ['Live Scraping', "When you search, ShopWise doesn't look at an outdated database. We instantly scrape live data from top e-commerce platforms like Amazon and Flipkart to ensure you see the exact current price, stock, and delivery estimates."],
  ['Smart Filtering & Ranking', 'We fetch a large pool of results and immediately filter out any items that don\'t meet your budget or rating criteria. Our algorithm then ranks the remaining products based on a combination of price, average rating, and review volume.'],
  ['AI Insights', 'ShopWise analyzes the top results to automatically highlight the "Best Value" (weighing price against quality), the "Cheapest" option, and the "Top Rated" product, saving you the hassle of comparing dozens of tabs.'],
];

export default function HowItWorks() {
  return (
    <main className="sw-page">
      <div className="sw-wrap sw-narrow">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="sw-h1">How <span className="sw-grad">ShopWise</span> Works</h1>
          <p className="sw-muted" style={{ fontSize: 18 }}>We built ShopWise to give you clarity and confidence before you buy.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {STEPS.map(([title, text], i) => (
            <div key={title} className="sw-feature" style={{ animation: 'sw-rise .35s both', animationDelay: `${i * 80}ms` }}>
              <span className="sw-num">{i + 1}</span>
              <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h2>
              <p className="sw-muted" style={{ margin: 0, lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
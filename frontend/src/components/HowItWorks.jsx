import React from 'react';

const STEPS = [
  ['Live Scraping', "When you search, ShopWise doesn't look at an outdated database. We instantly scrape live data from top e-commerce platforms like Amazon and Flipkart to ensure you see the exact current price, stock, and delivery estimates.", ['Amazon', 'Flipkart', 'Live data']],
  ['Smart Filtering & Ranking', "We fetch a large pool of results and immediately filter out any items that don't meet your budget or rating criteria. Our algorithm then ranks the remaining products based on a combination of price, average rating, and review volume.", ['Price', 'Rating', 'Reviews']],
  ['AI Insights', 'ShopWise analyzes the top results to automatically highlight the "Best Value" (weighing price against quality), the "Cheapest" option, and the "Top Rated" product, saving you the hassle of comparing dozens of tabs.', ['Best value', 'Cheapest', 'Top rated']],
];

export default function HowItWorks({ onStart }) {
  return (
    <main className="sw-page">
      <div className="sw-wrap sw-narrow">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="sw-eyebrow sw-eyebrow-soft">HOW IT WORKS</span>
          <h1 className="sw-h1" style={{ fontSize: 'clamp(34px,5vw,54px)', margin: '14px 0 10px', fontWeight: 800 }}>
            Clarity before you <span className="sw-grad">click buy</span>
          </h1>
          <p className="sw-muted" style={{ fontSize: 18, margin: 0 }}>We built ShopWise to give you clarity and confidence before you buy.</p>
        </div>

        <ol className="sw-steps">
          {STEPS.map(([title, text, tags], i) => (
            <li key={title} className="sw-step" style={{ '--i': i }}>
              <span className="sw-stepnum">{i + 1}</span>
              <div className="sw-feature">
                <h2 style={{ margin: '0 0 8px', fontSize: 22, color: 'inherit' }}>{title}</h2>
                <p className="sw-muted" style={{ margin: '0 0 14px', lineHeight: 1.7 }}>{text}</p>
                <div className="sw-tags">{tags.map(t => <span key={t} className="sw-countpill">{t}</span>)}</div>
              </div>
            </li>
          ))}
        </ol>

        {onStart && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button type="button" className="sw-btn" style={{ padding: '14px 28px', fontSize: 16 }} onClick={onStart}>Start comparing →</button>
          </div>
        )}
      </div>
    </main>
  );
}
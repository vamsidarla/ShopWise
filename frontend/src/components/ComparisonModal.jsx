import React from 'react';

export default function ComparisonModal({ group, onClose }) {
  if (!group || !group.items) return null;

  const amazon = group.items.find(i => i.store === 'amazon');
  const flipkart = group.items.find(i => i.store === 'flipkart');

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal comparison-modal">
        <button className="close" onClick={onClose}>×</button>
        <div className="comp-header">
          <div className="comp-image-container">
             {group.image ? <img src={group.image} alt={group.name} /> : <div className="headphones">◖ ◗</div>}
          </div>
          <h2>{group.name}</h2>
          {group.smartScore && (
            <div className={`smart-score-badge ${group.smartScore >= 90 ? 'excellent' : group.smartScore >= 80 ? 'good' : 'average'}`}>
              <strong>{group.smartScore}</strong> / 100 Smart Score
            </div>
          )}
        </div>
        
        <div className="comp-table-container">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Specs</th>
                <th className="store amazon">Amazon</th>
                <th className="store flipkart">Flipkart</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                <td>{amazon ? <strong className="price">₹{Number(amazon.price).toLocaleString('en-IN')}</strong> : '—'}</td>
                <td>{flipkart ? <strong className="price">₹{Number(flipkart.price).toLocaleString('en-IN')}</strong> : '—'}</td>
              </tr>
              <tr>
                <td>Rating</td>
                <td>{amazon?.rating ? `${amazon.rating}★` : '—'}</td>
                <td>{flipkart?.rating ? `${flipkart.rating}★` : '—'}</td>
              </tr>
              <tr>
                <td>Reviews</td>
                <td>{amazon?.reviews || '—'}</td>
                <td>{flipkart?.reviews || '—'}</td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td><small>{amazon?.delivery || '—'}</small></td>
                <td><small>{flipkart?.delivery || '—'}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="comp-actions">
           {amazon ? (
              <button className="buy-btn amazon" onClick={() => window.open(amazon.url, '_blank', 'noopener')}>View Amazon Deal</button>
           ) : <div />}
           {flipkart ? (
              <button className="buy-btn flipkart" onClick={() => window.open(flipkart.url, '_blank', 'noopener')}>View Flipkart Deal</button>
           ) : <div />}
        </div>
      </div>
    </div>
  );
}

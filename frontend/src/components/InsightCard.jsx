export default function InsightCard({ title, item, detail, icon }) {
  if (!item) return null;
  return (
    <article className="sw-insight">
      {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span className="sw-insight-icon">{icon}</span>}
      <div>
        <small>{title}</small>
        <h3>{item.name}</h3>
        <p>{detail}</p>
      </div>
      <div className="sw-insight-end">
        <b>{item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : `${item.rating}★`}</b>
        <span className={`sw-badge ${item.store}`}>{item.store}</span>
        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">View deal ↗</a>}
      </div>
    </article>
  );
}
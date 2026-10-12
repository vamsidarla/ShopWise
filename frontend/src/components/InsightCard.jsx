export default function InsightCard({ title, item, detail, icon }) {
  if (!item) return null;
  return (
    <article className="recommendation">
      {item.image ? (
        <img className="recommendation-image" src={item.image} alt="" />
      ) : (
        <span className="recommendation-icon">{icon}</span>
      )}
      <div>
        <small>{title}</small>
        <h3>{item.name}</h3>
        <p>{detail}</p>
      </div>
      <div className="recommendation-price">
        <b>{item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : `${item.rating}★`}</b>
        <span className={item.store}>{item.store}</span>
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer">
            View deal ↗
          </a>
        )}
      </div>
    </article>
  );
}

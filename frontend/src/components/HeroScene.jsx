const faces = [0, 1, 2, 3, 4, 5];

function Cube({ cls }) {
  return (
    <div className={`sw-float ${cls}`}>
      <div className="sw-cube">{faces.map(f => <i key={f} />)}</div>
    </div>
  );
}

// Decorative only. Product tiles use real images from the current search results (none shown until results exist).
export default function HeroScene({ products = [] }) {
  const imgs = [...new Set(products.map(p => p.image).filter(Boolean))].slice(0, 4);
  return (
    <div className="sw-scene" aria-hidden="true">
      <div className="sw-disk" />
      <div className="sw-ring" />
      <Cube cls="c1" />
      <Cube cls="c2" />
      <Cube cls="c3" />
      <Cube cls="c4" />
      <div className="sw-float sw-orb o1" />
      <div className="sw-float sw-orb o2" />
      <div className="sw-float sw-orb o3" />
      <div className="sw-float sw-orb o4" />
      {imgs.map((src, i) => (
        <div key={src} className={`sw-float sw-ptile p${i + 1}`}>
          <img src={src} alt="" loading="lazy" onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
        </div>
      ))}
    </div>
  );
}
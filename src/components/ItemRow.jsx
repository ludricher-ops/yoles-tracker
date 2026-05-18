export default function ItemRow({ item, people, claims, currentPerson, dayId, onSetClaim }) {
  const total = claims.reduce((sum, c) => sum + c.qty, 0);
  const myClaim = claims.find(c => c.person_id === currentPerson.id);
  const myQty = myClaim ? myClaim.qty : 0;
  const pct = Math.min(100, Math.round((total / item.target_qty) * 100));
  const done = total >= item.target_qty;
  const unit = item.unit ? ` ${item.unit}` : '';

  const nameOf = (id) => people.find(p => p.id === id)?.name ?? '?';
  const change = (delta) => onSetClaim(item.id, currentPerson.id, dayId, Math.max(0, myQty + delta));

  return (
    <div className={done ? 'item done' : 'item'}>
      <div className="item-top">
        <span className="item-name">{item.name}</span>
        <span className="item-count">
          {total}/{item.target_qty}{unit}{done && ' ✓'}
        </span>
      </div>

      <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>

      {claims.length > 0 && (
        <div className="claim-detail">
          {claims.map(c => (
            <span key={c.person_id} className={c.person_id === currentPerson.id ? 'chip me' : 'chip'}>
              {nameOf(c.person_id)} · {c.qty}{unit}
            </span>
          ))}
        </div>
      )}

      <div className="qty-control">
        <span className="qty-label">Ma part :</span>
        <button className="qty-btn" onClick={() => change(-1)} disabled={myQty === 0}>−</button>
        <span className="qty-value">{myQty}</span>
        <button className="qty-btn" onClick={() => change(1)}>+</button>
      </div>
    </div>
  );
}

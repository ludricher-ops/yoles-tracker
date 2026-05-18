import { useState } from 'react';
import { useEventContext } from '../context/EventContext.js';
import { formatDate } from '../utils/format.js';

export default function RecapPage() {
  const ev = useEventContext();
  const [collapsed, setCollapsed] = useState({});

  if (ev.days.length === 0) {
    return <div className="empty">Aucun jour créé.</div>;
  }

  const toggle = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="page">
      <h1 className="page-title">Récapitulatif</h1>

      {ev.days.map(day => {
        const presentPeople = ev.people.filter(p =>
          ev.presence.some(pr => pr.day_id === day.id && pr.person_id === p.id)
        );
        const headCount = presentPeople.reduce((s, p) => s + (p.is_couple ? 2 : 1), 0);

        const itemRows = ev.items.map(item => {
          const dayClaims = ev.claims.filter(c => c.item_id === item.id && c.day_id === day.id);
          const total = dayClaims.reduce((s, c) => s + c.qty, 0);
          const missing = Math.max(0, item.target_qty - total);
          const unit = item.unit ? ` ${item.unit}` : '';
          const contributors = dayClaims
            .map(c => `${ev.people.find(p => p.id === c.person_id)?.name ?? '?'} (${c.qty}${unit})`)
            .join(', ');
          return { item, total, missing, unit, contributors, done: missing === 0 };
        });

        const missingCount = itemRows.filter(r => r.missing > 0).length;
        const isCollapsed = !!collapsed[day.id];

        return (
          <section key={day.id} className="panel recap-day">
            <div
              className="recap-day-head"
              onClick={() => toggle(day.id)}
              role="button"
              aria-expanded={!isCollapsed}
            >
              <div className="recap-day-head-left">
                <h2>{day.label}</h2>
                {day.event_date && <span className="day-date">{formatDate(day.event_date)}</span>}
              </div>
              <div className="recap-day-head-right">
                {headCount > 0 && (
                  <span className="recap-headcount">{headCount} à bord</span>
                )}
                <span className="recap-collapse-icon">{isCollapsed ? '▸' : '▾'}</span>
              </div>
            </div>

            {!isCollapsed && (
              <>
                {/* Présents */}
                <div className="recap-presence">
                  {presentPeople.length === 0 ? (
                    <span className="muted">Personne d'inscrit</span>
                  ) : (
                    <div className="present-names">
                      {presentPeople.map(p => (
                        <span key={p.id} className="chip">
                          {p.name}
                          {p.is_couple && <span className="couple-badge">×2</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* État de la liste */}
                {ev.items.length > 0 && (
                  <>
                    <div className="recap-summary">
                      {missingCount === 0
                        ? <span className="recap-ok">✓ Tout est couvert !</span>
                        : <span className="recap-missing-count">{missingCount} élément{missingCount > 1 ? 's' : ''} à compléter</span>}
                    </div>
                    <div className="recap-items">
                      {itemRows.map(({ item, total, missing, unit, contributors, done }) => (
                        <div key={item.id} className={done ? 'recap-item done' : 'recap-item missing'}>
                          <div className="recap-item-top">
                            <span className="recap-item-name">{item.name}</span>
                            <span className="recap-item-count">
                              {total}/{item.target_qty}{unit}
                              {done ? ' ✓' : <span className="manque"> — manque {missing}{unit}</span>}
                            </span>
                          </div>
                          {contributors && (
                            <span className="recap-contributors muted">{contributors}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

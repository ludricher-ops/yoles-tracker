import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEventContext } from '../context/EventContext.js';
import { formatDate } from '../utils/format.js';
import ItemRow from '../components/ItemRow.jsx';

export default function HomePage({ currentPerson }) {
  const ev = useEventContext();
  const [selectedDayId, setSelectedDayId] = useState(null);

  useEffect(() => {
    if (selectedDayId === null && ev.days.length > 0) {
      setSelectedDayId(ev.days[0].id);
    }
  }, [ev.days, selectedDayId]);

  if (ev.days.length === 0) {
    return (
      <div className="empty">
        Aucun jour créé. <Link to="/jours">Ajouter des jours →</Link>
      </div>
    );
  }

  const selectedDay = ev.days.find(d => d.id === selectedDayId) ?? ev.days[0];
  const iAmPresent = ev.presence.some(
    p => p.day_id === selectedDay.id && p.person_id === currentPerson.id
  );
  const presentPeople = ev.people.filter(p =>
    ev.presence.some(pr => pr.day_id === selectedDay.id && pr.person_id === p.id)
  );

  return (
    <div className="page">
      {/* Sélecteur de jour */}
      <div className="day-selector">
        {ev.days.map(d => (
          <button
            key={d.id}
            className={d.id === selectedDay.id ? 'day-btn active' : 'day-btn'}
            onClick={() => setSelectedDayId(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {selectedDay.event_date && (
        <p className="day-date-sub">{formatDate(selectedDay.event_date)}</p>
      )}

      {/* Présence */}
      <div className="presence-section">
        <button
          className={iAmPresent ? 'btn-present on' : 'btn-present'}
          onClick={() => ev.setPresence(selectedDay.id, currentPerson.id, !iAmPresent)}
        >
          {iAmPresent ? '✓ Je suis à bord ce jour-là' : 'Je serai à bord ce jour-là'}
        </button>
        <div className="present-names">
          {presentPeople.length === 0
            ? <span className="muted">Personne d'inscrit pour l'instant</span>
            : presentPeople.map(p => (
                <span key={p.id} className={p.id === currentPerson.id ? 'chip me' : 'chip'}>
                  {p.name}
                </span>
              ))}
        </div>
      </div>

      {/* Liste de courses */}
      <h2 className="section-title">Ce que j'apporte</h2>
      {ev.items.length === 0 ? (
        <div className="empty">
          Pas encore de liste de courses. <Link to="/courses">Gérer les courses →</Link>
        </div>
      ) : (
        ev.items.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            people={ev.people}
            claims={ev.claims.filter(c => c.item_id === item.id && c.day_id === selectedDay.id)}
            currentPerson={currentPerson}
            dayId={selectedDay.id}
            onSetClaim={ev.setClaim}
          />
        ))
      )}
    </div>
  );
}

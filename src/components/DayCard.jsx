import ItemRow from './ItemRow.jsx';
import AddItemForm from './AddItemForm.jsx';

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const txt = date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export default function DayCard({
  day, people, presence, items, claims, currentPerson,
  onSetPresence, onAddItem, onDeleteItem, onSetClaim,
}) {
  const dayItems = items.filter(i => i.day_id === day.id);
  const presentIds = presence.filter(p => p.day_id === day.id).map(p => p.person_id);
  const presentPeople = people.filter(p => presentIds.includes(p.id));
  const iAmPresent = presentIds.includes(currentPerson.id);
  const dateLabel = formatDate(day.event_date);

  return (
    <section className="panel day-card">
      <div className="day-head">
        <h2>{day.label}</h2>
        {dateLabel && <span className="day-date">{dateLabel}</span>}
      </div>

      <div className="presence">
        <button
          className={iAmPresent ? 'btn-present on' : 'btn-present'}
          onClick={() => onSetPresence(day.id, currentPerson.id, !iAmPresent)}
        >
          {iAmPresent ? '✓ Je suis à bord' : 'Je suis à bord ce jour-là'}
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

      <div className="items">
        <h3>À apporter</h3>
        {dayItems.length === 0 && <p className="muted">Aucun élément. Ajoute le premier ci-dessous.</p>}
        {dayItems.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            people={people}
            claims={claims.filter(c => c.item_id === item.id)}
            currentPerson={currentPerson}
            onDelete={onDeleteItem}
            onSetClaim={onSetClaim}
          />
        ))}
        <AddItemForm dayId={day.id} onAdd={onAddItem} />
      </div>
    </section>
  );
}

import { useState } from 'react';
import { useEvent } from './hooks/useEvent.js';
import NamePicker from './components/NamePicker.jsx';
import DayManager from './components/DayManager.jsx';
import DayCard from './components/DayCard.jsx';

const STORAGE_KEY = 'yoles_person_id';

export default function App() {
  const ev = useEvent();
  const [personId, setPersonId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });
  const [showDayManager, setShowDayManager] = useState(false);

  const choosePerson = (id) => {
    localStorage.setItem(STORAGE_KEY, String(id));
    setPersonId(id);
  };
  const forgetPerson = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPersonId(null);
  };

  if (ev.loading) return <div className="screen-msg">Chargement…</div>;
  if (ev.error) return <div className="screen-msg error">Erreur : {ev.error}</div>;

  const currentPerson = ev.people.find(p => p.id === personId) || null;

  if (!currentPerson) {
    return (
      <NamePicker
        people={ev.people}
        onPick={choosePerson}
        onAdd={async (name) => {
          const person = await ev.addPerson(name);
          choosePerson(person.id);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>⛵ Tour des Yoles</h1>
          <p className="subtitle">
            Salut <strong>{currentPerson.name}</strong> ·{' '}
            <button className="link" onClick={forgetPerson}>changer</button>
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setShowDayManager(v => !v)}>
          {showDayManager ? 'Fermer' : 'Gérer les jours'}
        </button>
      </header>

      {showDayManager && (
        <DayManager
          days={ev.days}
          onAdd={ev.addDay}
          onUpdate={ev.updateDay}
          onDelete={ev.deleteDay}
        />
      )}

      {ev.days.length === 0 ? (
        <div className="empty">
          Aucun jour pour l'instant. Ouvre <strong>« Gérer les jours »</strong> pour créer les
          étapes de la semaine.
        </div>
      ) : (
        <div className="days">
          {ev.days.map(day => (
            <DayCard
              key={day.id}
              day={day}
              people={ev.people}
              presence={ev.presence}
              items={ev.items}
              claims={ev.claims}
              currentPerson={currentPerson}
              onSetPresence={ev.setPresence}
              onAddItem={ev.addItem}
              onDeleteItem={ev.deleteItem}
              onSetClaim={ev.setClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext.js';

function PersonRow({ person, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(person.name);

  useEffect(() => { setName(person.name); }, [person.name]);

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (n !== person.name) onUpdate(person.id, n);
    setEditing(false);
  };
  const cancel = () => { setName(person.name); setEditing(false); };

  if (editing) {
    return (
      <div className="person-row editing">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          onBlur={save}
          autoFocus
          maxLength={60}
        />
        <button className="btn-ghost sm" onClick={cancel}>✕</button>
      </div>
    );
  }

  return (
    <div className="person-row">
      <span className="person-name">{person.name}</span>
      <button className="btn-ghost sm" onClick={() => setEditing(true)} title="Renommer">✎</button>
      <button
        className="btn-danger sm"
        title="Supprimer"
        onClick={() => {
          if (window.confirm(`Supprimer « ${person.name} » et toutes ses présences / participations ?`))
            onDelete(person.id);
        }}
      >✕</button>
    </div>
  );
}

export default function PeoplePage() {
  const { people, addPerson, updatePerson, deletePerson } = useEventContext();
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const n = newName.trim();
    if (!n || busy) return;
    setBusy(true);
    try {
      await addPerson(n);
      setNewName('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="page-title">Équipe</h2>
      <p className="page-sub">{people.length} membre{people.length !== 1 ? 's' : ''}</p>

      <div className="person-list">
        {people.map(p => (
          <PersonRow
            key={p.id}
            person={p}
            onUpdate={updatePerson}
            onDelete={deletePerson}
          />
        ))}
        {people.length === 0 && (
          <p className="muted">Aucun membre pour l'instant.</p>
        )}
      </div>

      <form className="person-add" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Ajouter un membre…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          maxLength={60}
        />
        <button type="submit" className="btn-primary sm" disabled={busy || !newName.trim()}>+</button>
      </form>
    </section>
  );
}

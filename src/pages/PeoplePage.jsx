import { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext.js';

function PersonRow({ person, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(person.name);
  const pax = person.passenger_count ?? 1;

  useEffect(() => { setName(person.name); }, [person.name]);

  // Always send the full fields to keep server in sync
  const fields = (overrides) => ({
    name: person.name,
    passenger_count: pax,
    is_admin: person.is_admin ?? false,
    ...overrides,
  });

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (n !== person.name) onUpdate(person.id, fields({ name: n }));
    setEditing(false);
  };
  const cancel = () => { setName(person.name); setEditing(false); };
  const setPax = (n) => onUpdate(person.id, fields({ passenger_count: n }));
  const toggleAdmin = () => onUpdate(person.id, fields({ is_admin: !person.is_admin }));

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
      <span className="person-name">
        {person.name}
        {pax > 1 && <span className="pax-badge">×{pax}</span>}
        {person.is_admin && <span className="admin-badge">Admin</span>}
      </span>
      <div className="pax-stepper">
        <button className="pax-btn" onClick={() => setPax(Math.max(1, pax - 1))} disabled={pax <= 1} aria-label="Moins">−</button>
        <span className="pax-value">{pax}</span>
        <button className="pax-btn" onClick={() => setPax(Math.min(20, pax + 1))} aria-label="Plus">+</button>
      </div>
      <button
        className={person.is_admin ? 'btn-admin sm on' : 'btn-admin sm'}
        onClick={toggleAdmin}
        title={person.is_admin ? 'Retirer les droits admin' : 'Donner les droits admin'}
      >
        {person.is_admin ? '🔑 Admin' : '🔑'}
      </button>
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

  const totalPax = people.reduce((s, p) => s + (p.passenger_count ?? 1), 0);

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
      <p className="page-sub">
        {people.length} fiche{people.length !== 1 ? 's' : ''}
        {totalPax !== people.length && ` · ${totalPax} passagers au total`}
      </p>

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

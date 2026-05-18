import { useState } from 'react';

export default function NamePicker({ people, onPick, onAdd }) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      await onAdd(name);
    } catch {
      setAdding(false);
    }
  };

  return (
    <div className="app namepicker">
      <h1>⛵ Tour des Yoles</h1>
      <p className="subtitle">Qui es-tu ?</p>

      {people.length > 0 && (
        <div className="people-list">
          {people.map(p => (
            <button key={p.id} className="person-btn" onClick={() => onPick(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <form className="add-name" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Ton prénom"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          maxLength={40}
        />
        <button type="submit" className="btn-primary" disabled={adding || !newName.trim()}>
          {adding ? '…' : 'Ajouter mon nom'}
        </button>
      </form>
    </div>
  );
}

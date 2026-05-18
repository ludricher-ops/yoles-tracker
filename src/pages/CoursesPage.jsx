import { useState } from 'react';
import { useEventContext } from '../context/EventContext.js';
import AddItemForm from '../components/AddItemForm.jsx';

function ItemEditRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.target_qty));
  const [unit, setUnit] = useState(item.unit || '');

  const save = () => {
    const n = name.trim();
    if (!n) return;
    onUpdate(item.id, { name: n, target_qty: Math.max(1, parseInt(qty, 10) || 1), unit: unit.trim() });
    setEditing(false);
  };

  const cancel = () => {
    setName(item.name);
    setQty(String(item.target_qty));
    setUnit(item.unit || '');
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Supprimer « ${item.name} » de la liste ?`)) onDelete(item.id);
  };

  if (editing) {
    return (
      <div className="course-row editing">
        <input
          className="course-input-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom"
        />
        <input
          className="course-input-qty"
          type="number"
          min="1"
          value={qty}
          onChange={e => setQty(e.target.value)}
        />
        <input
          className="course-input-unit"
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="unité"
        />
        <button className="btn-primary sm" onClick={save}>✓</button>
        <button className="btn-ghost sm" onClick={cancel}>✕</button>
      </div>
    );
  }

  return (
    <div className="course-row">
      <span className="course-name">{item.name}</span>
      <span className="course-target muted">{item.target_qty}{item.unit ? ` ${item.unit}` : ''}</span>
      <button className="btn-ghost sm" onClick={() => setEditing(true)} title="Modifier">✏</button>
      <button className="btn-danger sm" onClick={handleDelete} title="Supprimer">✕</button>
    </div>
  );
}

export default function CoursesPage() {
  const ev = useEventContext();

  return (
    <div className="page">
      <h1 className="page-title">Liste de courses</h1>
      <p className="page-sub muted">
        Cette liste est identique pour tous les jours. Les invités indiquent ce qu'ils apportent
        depuis la page d'accueil.
      </p>

      <div className="course-list">
        {ev.items.length === 0
          ? <p className="muted">Aucun élément. Ajoute le premier ci-dessous.</p>
          : ev.items.map(item => (
              <ItemEditRow
                key={item.id}
                item={item}
                onUpdate={ev.updateItem}
                onDelete={ev.deleteItem}
              />
            ))}
      </div>

      <div className="course-add">
        <AddItemForm onAdd={ev.addItem} />
      </div>
    </div>
  );
}

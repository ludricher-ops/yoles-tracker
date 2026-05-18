import { useState } from 'react';

export default function DayManager({ days, onAdd, onUpdate, onDelete }) {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    const l = label.trim();
    if (!l || busy) return;
    setBusy(true);
    try {
      await onAdd({ label: l, event_date: date || null, sort_order: days.length });
      setLabel('');
      setDate('');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (day) => {
    if (window.confirm(`Supprimer « ${day.label} » et tout ce qui y est rattaché ?`)) {
      onDelete(day.id);
    }
  };

  return (
    <section className="panel day-manager">
      <h2>Gérer les jours</h2>

      {days.map(day => (
        <div key={day.id} className="day-edit-row">
          <input
            type="date"
            value={day.event_date || ''}
            onChange={e => onUpdate(day.id, {
              label: day.label, event_date: e.target.value || null, sort_order: day.sort_order,
            })}
          />
          <input
            type="text"
            value={day.label}
            onChange={e => onUpdate(day.id, {
              label: e.target.value, event_date: day.event_date, sort_order: day.sort_order,
            })}
          />
          <button className="btn-danger" onClick={() => handleDelete(day)} title="Supprimer">✕</button>
        </div>
      ))}

      <form className="day-edit-row add" onSubmit={handleAdd}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input
          type="text"
          placeholder="Étape / journée (ex: Lundi — Le Robert)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          maxLength={80}
        />
        <button type="submit" className="btn-primary" disabled={busy || !label.trim()}>+</button>
      </form>
    </section>
  );
}

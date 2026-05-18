import { useState, useEffect } from 'react';

// Local-state row — syncs from props, fires onUpdate only on blur (not every keystroke)
function DayRow({ day, onUpdate, onDelete }) {
  const [label, setLabel] = useState(day.label);
  const [date,  setDate]  = useState(day.event_date || '');

  useEffect(() => { setLabel(day.label); },           [day.label]);
  useEffect(() => { setDate(day.event_date || ''); }, [day.event_date]);

  const save = () => {
    const l = label.trim();
    if (!l) return;
    onUpdate(day.id, { label: l, event_date: date || null, sort_order: day.sort_order });
  };

  return (
    <div className="day-edit-row">
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        onBlur={save}
      />
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onBlur={save}
        maxLength={100}
      />
      <button
        className="btn-danger"
        title="Supprimer"
        onClick={() => {
          if (window.confirm(`Supprimer « ${day.label} » et tout ce qui y est rattaché ?`))
            onDelete(day.id);
        }}
      >✕</button>
    </div>
  );
}

export default function DayManager({ days, onAdd, onUpdate, onDelete }) {
  const [label, setLabel] = useState('');
  const [date,  setDate]  = useState('');
  const [busy,  setBusy]  = useState(false);

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

  return (
    <section className="panel day-manager">
      <h2>Gérer les jours</h2>

      {days.map(day => (
        <DayRow key={day.id} day={day} onUpdate={onUpdate} onDelete={onDelete} />
      ))}

      <form className="day-edit-row add" onSubmit={handleAdd}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input
          type="text"
          placeholder="Étape / journée (ex : Lundi — Le Robert)"
          value={label}
          onChange={e => setLabel(e.target.value)}
          maxLength={100}
        />
        <button type="submit" className="btn-primary" disabled={busy || !label.trim()}>+</button>
      </form>
    </section>
  );
}

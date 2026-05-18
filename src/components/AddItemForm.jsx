import { useState } from 'react';

export default function AddItemForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => { setName(''); setQty('1'); setUnit(''); setOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    try {
      await onAdd({ name: n, target_qty: Math.max(1, parseInt(qty, 10) || 1), unit: unit.trim() });
      reset();
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-ghost add-item-btn" onClick={() => setOpen(true)}>
        + Ajouter un élément
      </button>
    );
  }

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ex : Glaçons, Rhum, Accras…"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={80}
        autoFocus
      />
      <div className="add-item-row">
        <label>
          Quantité
          <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
        </label>
        <label>
          Unité (optionnel)
          <input type="text" placeholder="packs, kg…" value={unit} onChange={e => setUnit(e.target.value)} maxLength={20} />
        </label>
      </div>
      <div className="add-item-actions">
        <button type="button" className="btn-ghost" onClick={reset}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={busy || !name.trim()}>
          {busy ? '…' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

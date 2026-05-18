import { useState, useEffect, useRef, useCallback } from 'react';

const EMPTY = { people: [], days: [], presence: [], items: [], claims: [] };

async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export function useEvent() {
  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    fetch('/api/state')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setState(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // --- Personnes ---
  const addPerson = useCallback(async (name) => {
    const person = await api('/api/people', 'POST', { name });
    setState(prev => ({
      ...prev,
      people: [...prev.people, person].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    return person;
  }, []);

  // --- Jours ---
  const addDay = useCallback(async ({ event_date, label, sort_order }) => {
    const day = await api('/api/days', 'POST', { event_date, label, sort_order });
    setState(prev => ({ ...prev, days: [...prev.days, day] }));
    return day;
  }, []);

  const updateDay = useCallback(async (id, fields) => {
    setState(prev => ({
      ...prev,
      days: prev.days.map(d => (d.id === id ? { ...d, ...fields } : d)),
    }));
    try {
      await api(`/api/days/${id}`, 'PUT', fields);
    } catch (err) { console.error('Erreur updateDay :', err); }
  }, []);

  const deleteDay = useCallback(async (id) => {
    setState(prev => {
      const itemIds = new Set(prev.items.map(i => i.id));
      return {
        ...prev,
        days: prev.days.filter(d => d.id !== id),
        presence: prev.presence.filter(p => p.day_id !== id),
        claims: prev.claims.filter(c => c.day_id !== id),
      };
    });
    try {
      await api(`/api/days/${id}`, 'DELETE');
    } catch (err) { console.error('Erreur deleteDay :', err); }
  }, []);

  // --- Présence ---
  const setPresence = useCallback(async (day_id, person_id, present) => {
    setState(prev => ({
      ...prev,
      presence: present
        ? [...prev.presence.filter(p => !(p.day_id === day_id && p.person_id === person_id)),
           { day_id, person_id }]
        : prev.presence.filter(p => !(p.day_id === day_id && p.person_id === person_id)),
    }));
    try {
      await api('/api/presence', 'PUT', { day_id, person_id, present });
    } catch (err) { console.error('Erreur setPresence :', err); }
  }, []);

  // --- Éléments (catalogue global) ---
  const addItem = useCallback(async ({ name, target_qty, unit }) => {
    const item = await api('/api/items', 'POST', { name, target_qty, unit });
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
    return item;
  }, []);

  const updateItem = useCallback(async (id, fields) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => (i.id === id ? { ...i, ...fields } : i)),
    }));
    try {
      await api(`/api/items/${id}`, 'PUT', fields);
    } catch (err) { console.error('Erreur updateItem :', err); }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
      claims: prev.claims.filter(c => c.item_id !== id),
    }));
    try {
      await api(`/api/items/${id}`, 'DELETE');
    } catch (err) { console.error('Erreur deleteItem :', err); }
  }, []);

  // --- Participations (par item + personne + jour) ---
  const setClaim = useCallback(async (item_id, person_id, day_id, qty) => {
    setState(prev => {
      const others = prev.claims.filter(
        c => !(c.item_id === item_id && c.person_id === person_id && c.day_id === day_id)
      );
      return {
        ...prev,
        claims: qty > 0 ? [...others, { item_id, person_id, day_id, qty }] : others,
      };
    });
    try {
      await api('/api/claims', 'PUT', { item_id, person_id, day_id, qty });
    } catch (err) { console.error('Erreur setClaim :', err); }
  }, []);

  return {
    ...state, loading, error,
    addPerson, addDay, updateDay, deleteDay,
    setPresence,
    addItem, updateItem, deleteItem,
    setClaim,
  };
}

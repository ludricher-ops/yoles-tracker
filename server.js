import express from 'express';
import pg from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProd = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/yoles_tracker',
  // rejectUnauthorized: false is required for Railway / Heroku managed Postgres
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

// --- Schema (fresh install) ---
await pool.query(`
  CREATE TABLE IF NOT EXISTS people (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS days (
    id         SERIAL PRIMARY KEY,
    event_date DATE,
    label      TEXT NOT NULL,
    sort_order INT DEFAULT 0
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS presence (
    day_id    INT REFERENCES days(id)   ON DELETE CASCADE,
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    PRIMARY KEY (day_id, person_id)
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS items (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    target_qty INT NOT NULL DEFAULT 1,
    unit       TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS claims (
    id        SERIAL PRIMARY KEY,
    item_id   INT REFERENCES items(id)  ON DELETE CASCADE,
    person_id INT REFERENCES people(id) ON DELETE CASCADE,
    day_id    INT REFERENCES days(id)   ON DELETE CASCADE,
    qty       INT NOT NULL DEFAULT 1
  )
`);

// --- Migration for existing DBs ---
await pool.query(`ALTER TABLE items  DROP COLUMN IF EXISTS day_id`);
await pool.query(`ALTER TABLE claims ADD  COLUMN IF NOT EXISTS day_id INT REFERENCES days(id) ON DELETE CASCADE`);
await pool.query(`ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_item_id_person_id_key`);
await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS claims_unique_idx ON claims (item_id, person_id, day_id)`);

// --- Migration for is_couple ---
await pool.query(`ALTER TABLE people ADD COLUMN IF NOT EXISTS is_couple BOOLEAN DEFAULT FALSE`);

// --- Performance indexes ---
await pool.query(`CREATE INDEX IF NOT EXISTS idx_presence_day    ON presence (day_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_claims_day      ON claims   (day_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_claims_item_day ON claims   (item_id, day_id)`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Return a safe error message in production (don't leak PG internals)
const serverError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: isProd ? 'Erreur interne du serveur' : err.message });
};

// Validate and parse an integer :id param; send 400 and return null on failure
const parseId = (res, raw) => {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0) { res.status(400).json({ error: 'id invalide' }); return null; }
  return n;
};

// Clamp a quantity value between 0 and 9999
const clampQty = (v) => Math.min(9999, Math.max(0, parseInt(v, 10) || 0));

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();

// Security headers (CSP allows same-origin scripts; inline styles needed for React's style prop)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// Rate-limit all API endpoints: 120 requests / minute / IP
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessaie dans une minute.' },
});
app.use('/api', apiLimiter);

// Body parser — limit to 10 kb (all payloads in this app are a few bytes)
app.use(express.json({ limit: '10kb' }));
app.use(express.static(join(__dirname, 'dist')));

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/state
app.get('/api/state', async (_req, res) => {
  try {
    const [people, days, presence, items, claims] = await Promise.all([
      pool.query('SELECT id, name, is_couple FROM people ORDER BY name'),
      pool.query(`SELECT id, to_char(event_date, 'YYYY-MM-DD') AS event_date, label, sort_order
                    FROM days ORDER BY sort_order, event_date, id`),
      pool.query('SELECT day_id, person_id FROM presence'),
      pool.query('SELECT id, name, target_qty, unit FROM items ORDER BY id'),
      pool.query('SELECT id, item_id, person_id, day_id, qty FROM claims'),
    ]);
    res.json({
      people: people.rows,
      days: days.rows,
      presence: presence.rows,
      items: items.rows,
      claims: claims.rows,
    });
  } catch (err) { serverError(res, err); }
});

// POST /api/people
app.post('/api/people', async (req, res) => {
  try {
    const name = (req.body.name || '').trim().slice(0, 60);
    if (!name) return res.status(400).json({ error: 'name requis' });
    const is_couple = !!req.body.is_couple;
    const { rows } = await pool.query(
      'INSERT INTO people (name, is_couple) VALUES ($1, $2) RETURNING id, name, is_couple',
      [name, is_couple]
    );
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// PUT /api/people/:id
app.put('/api/people/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    const name = (req.body.name || '').trim().slice(0, 60);
    if (!name) return res.status(400).json({ error: 'name requis' });
    const is_couple = !!req.body.is_couple;
    const { rows } = await pool.query(
      'UPDATE people SET name = $1, is_couple = $2 WHERE id = $3 RETURNING id, name, is_couple',
      [name, is_couple, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'personne introuvable' });
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// DELETE /api/people/:id
app.delete('/api/people/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    await pool.query('DELETE FROM people WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) { serverError(res, err); }
});

// POST /api/days
app.post('/api/days', async (req, res) => {
  try {
    const label = (req.body.label || '').trim().slice(0, 100);
    if (!label) return res.status(400).json({ error: 'label requis' });
    const { event_date, sort_order } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO days (event_date, label, sort_order) VALUES ($1, $2, $3)
       RETURNING id, to_char(event_date, 'YYYY-MM-DD') AS event_date, label, sort_order`,
      [event_date || null, label, clampQty(sort_order)]
    );
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// PUT /api/days/:id
app.put('/api/days/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    const label = (req.body.label || '').trim().slice(0, 100);
    if (!label) return res.status(400).json({ error: 'label requis' });
    const { event_date, sort_order } = req.body;
    const { rows } = await pool.query(
      `UPDATE days SET event_date = $1, label = $2, sort_order = $3 WHERE id = $4
       RETURNING id, to_char(event_date, 'YYYY-MM-DD') AS event_date, label, sort_order`,
      [event_date || null, label, clampQty(sort_order), id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'jour introuvable' });
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// DELETE /api/days/:id
app.delete('/api/days/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    await pool.query('DELETE FROM days WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) { serverError(res, err); }
});

// PUT /api/presence
app.put('/api/presence', async (req, res) => {
  try {
    const { present } = req.body;
    const day_id    = parseInt(req.body.day_id,    10);
    const person_id = parseInt(req.body.person_id, 10);
    if (!day_id || !person_id) return res.status(400).json({ error: 'day_id et person_id requis' });
    if (present) {
      await pool.query(
        'INSERT INTO presence (day_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [day_id, person_id]
      );
    } else {
      await pool.query('DELETE FROM presence WHERE day_id = $1 AND person_id = $2', [day_id, person_id]);
    }
    res.json({ ok: true });
  } catch (err) { serverError(res, err); }
});

// POST /api/items
app.post('/api/items', async (req, res) => {
  try {
    const name = (req.body.name || '').trim().slice(0, 100);
    if (!name) return res.status(400).json({ error: 'name requis' });
    const target_qty = Math.min(9999, Math.max(1, parseInt(req.body.target_qty, 10) || 1));
    const unit = (req.body.unit || '').trim().slice(0, 30) || null;
    const { rows } = await pool.query(
      `INSERT INTO items (name, target_qty, unit) VALUES ($1, $2, $3)
       RETURNING id, name, target_qty, unit`,
      [name, target_qty, unit]
    );
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// PUT /api/items/:id
app.put('/api/items/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    const name = (req.body.name || '').trim().slice(0, 100);
    if (!name) return res.status(400).json({ error: 'name requis' });
    const target_qty = Math.min(9999, Math.max(1, parseInt(req.body.target_qty, 10) || 1));
    const unit = (req.body.unit || '').trim().slice(0, 30) || null;
    const { rows } = await pool.query(
      `UPDATE items SET name = $1, target_qty = $2, unit = $3 WHERE id = $4
       RETURNING id, name, target_qty, unit`,
      [name, target_qty, unit, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'élément introuvable' });
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', async (req, res) => {
  try {
    const id = parseId(res, req.params.id); if (!id) return;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) { serverError(res, err); }
});

// PUT /api/claims  body: { item_id, person_id, day_id, qty }
app.put('/api/claims', async (req, res) => {
  try {
    const item_id   = parseInt(req.body.item_id,   10);
    const person_id = parseInt(req.body.person_id, 10);
    const day_id    = parseInt(req.body.day_id,    10);
    if (!item_id || !person_id || !day_id)
      return res.status(400).json({ error: 'item_id, person_id et day_id requis' });
    const qty = clampQty(req.body.qty);
    if (qty === 0) {
      await pool.query(
        'DELETE FROM claims WHERE item_id = $1 AND person_id = $2 AND day_id = $3',
        [item_id, person_id, day_id]
      );
      res.json({ ok: true, removed: true });
    } else {
      const { rows } = await pool.query(
        `INSERT INTO claims (item_id, person_id, day_id, qty) VALUES ($1, $2, $3, $4)
         ON CONFLICT (item_id, person_id, day_id) DO UPDATE SET qty = EXCLUDED.qty
         RETURNING id, item_id, person_id, day_id, qty`,
        [item_id, person_id, day_id, qty]
      );
      res.json(rows[0]);
    }
  } catch (err) { serverError(res, err); }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tour des Yoles running on port ${PORT}`));

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objet

Site web partagé pour organiser une semaine sur le bateau pendant le Tour des Yoles.
Chaque invité ouvre un lien unique (sans mot de passe), choisit son nom, indique sa
présence jour par jour et se positionne — avec des quantités — sur la liste des choses
à apporter, propre à chaque jour.

## Workflow

**Pas de serveur de dev local pour la validation prod.** Pour chaque modification :

```bash
npm run build   # valide la compilation Vite/JSX
git add .
git commit -m "..."
git push        # Railway redéploie automatiquement
```

## Stack

- **Frontend** : React 18 + Vite, `"type": "module"` — `import`/`export` partout
- **Backend** : Express dans `server.js` — sert l'API REST **et** les statiques `dist/`
- **Base de données** : PostgreSQL via `pg` (sans ORM)
- **Déploiement** : Dockerfile multi-stage → Railway

## Architecture

- `src/hooks/useEvent.js` — charge `/api/state` au montage, expose données + actions.
  Toutes les mises à jour sont **optimistes** (`setState` avant le `fetch`) ; `stateRef`
  (useRef) donne l'état courant aux callbacks de cascade (suppression jour/élément).
  Les créations (`addPerson`, `addDay`, `addItem`) attendent l'`id` du serveur.
- `src/App.jsx` — gère l'identité courante (`localStorage` clé `yoles_person_id`).
  Sans identité → `NamePicker`. Sinon : entête + `DayManager` pliable + une `DayCard` par jour.
- Composants : `NamePicker`, `DayManager`, `DayCard`, `ItemRow`, `AddItemForm`.

## Modèle de données

5 tables créées au démarrage (`CREATE TABLE IF NOT EXISTS`, une requête `pool.query` chacune) :
`people`, `days`, `presence` (jonction day↔person), `items` (par jour, avec `target_qty`/`unit`),
`claims` (participation person↔item avec `qty`, unique par couple). Les `FOREIGN KEY`
sont en `ON DELETE CASCADE` : supprimer un jour purge présence + éléments + participations.

## API

| Méthode | Route | Corps |
|---------|-------|-------|
| GET | `/api/state` | — (renvoie tout) |
| POST | `/api/people` | `{ name }` |
| POST | `/api/days` | `{ event_date, label, sort_order }` |
| PUT | `/api/days/:id` | `{ event_date, label, sort_order }` |
| DELETE | `/api/days/:id` | — |
| PUT | `/api/presence` | `{ day_id, person_id, present }` |
| POST | `/api/items` | `{ day_id, name, target_qty, unit }` |
| DELETE | `/api/items/:id` | — |
| PUT | `/api/claims` | `{ item_id, person_id, qty }` — `qty<=0` supprime la participation |

Routes spécifiques avant le fallback SPA `app.get('*')`.

## Base de données

SSL activé automatiquement si `DATABASE_URL` ne contient pas `localhost`.
En local : copier `.env.example` → `.env`. Railway injecte `DATABASE_URL` via le plugin PostgreSQL.

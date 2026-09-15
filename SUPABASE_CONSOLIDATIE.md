# Migratie: Neon + Redis → één Supabase-project

## Wat verandert

| Oud | Nieuw |
|-----|--------|
| Neon `DATABASE_URL` | Supabase Database URI (zelfde project als CMS) |
| Redis `REDIS_URL` | Tabellen `game_highscores` + `game_stats` |
| `ioredis` dependency | verwijderd |

CMS (`VITE_SUPABASE_*`) blijft ongewijzigd.

## Stappen (Kortrijk productie)

1. In je bestaande Supabase-project: voer `APP_SCHEMA.sql` uit (SQL Editor), **of** tijdelijk `DATABASE_URL` op Supabase zetten en `npm run db:push`.
2. Migreer data van Neon → Supabase (optioneel):
   - `pg_dump` van Neon-tabellen `users`, `logbook_entries`, `spinal_logs`, `marketplace`
   - restore in Supabase
3. Vercel env:
   - `DATABASE_URL` = Supabase pooled URI (poort 6543)
   - **verwijder** `REDIS_URL`
4. Redeploy.
5. Flappy-scores starten leeg tenzij je Redis-data handmatig overzet (meestal niet nodig).
6. Test: `/logbook`, `/smash`, `/marketplace`, `/game`.

## Lokaal

Zie `HANDLEIDING.md` (skeleton) of zet in `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
DATABASE_URL=postgresql://...@db.<ref>.supabase.co:6543/postgres
```

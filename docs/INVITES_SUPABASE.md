# Allowlist beheren via Supabase

De login-allowlist staat in Postgres-tabel **`invited_users`** (zelfde project als `DATABASE_URL`).  
OTP mag alleen als er een rij is met dat **email** en **`active = true`**.

Je hoeft **geen** TypeScript meer te wijzigen om iemand toe te voegen.

## Via Table Editor (aanbevolen)

1. [Supabase Dashboard](https://supabase.com/dashboard) → jouw project  
2. **Table Editor** → tabel **`invited_users`**  
3. **Insert row** / **Add row**:

| Kolom | Voorbeeld | Verplicht |
|-------|-----------|-----------|
| `email` | `naam@azgroeninge.be` | ja (lowercase aanbevolen) |
| `name` | `Voornaam Achternaam` | ja |
| `role` | `aso` \| `staff` \| `supervisor` \| `admin` \| `kiosk` | ja |
| `username` | `kortenaam` (optioneel, uniek in `users`) | nee |
| `active` | `true` | ja — `false` = geen login meer |

4. Opslaan. De gebruiker kan meteen een OTP aanvragen (geen redeploy).

Iemand deactiveren: zet `active` op `false` (rij mag blijven staan).

## Via SQL Editor

Zie [`scripts/supabase-invites-example.sql`](../scripts/supabase-invites-example.sql) — plak in Supabase → **SQL** → Run.

## Optionele code-seed

`npm run auth:seed` vult alleen nog vanuit `DEFAULT_INVITES` als:

```env
AUTH_SEED_FROM_CODE=1
```

Zonder die flag doet seed **niets** (Supabase blijft bron van waarheid).

## Rollen

| `role` | Betekenis |
|--------|-----------|
| `aso` | ASO-logboek (eigen entries) |
| `staff` / `supervisor` | Staf + supervisor-overzicht |
| `admin` | Alles + (later) beheer |
| `kiosk` | Alleen CDS lezen, geen schrijven |

# Auth production cutover

Voer dit uit **nadat** de checklist in [AUTH_PREVIEW.md](./AUTH_PREVIEW.md) groen is.  
Soft launch (kleine allowlist) en rollback staan daar uitgelegd.

## 1. Productie-env (Vercel Production)

| Variabele | Waarde |
|-----------|--------|
| `DATABASE_URL` | Productie Postgres (Supabase) |
| `BETTER_AUTH_SECRET` | Lange random secret (**niet** delen met preview) |
| `BETTER_AUTH_URL` | Live app-URL, bv. `https://anesthesie-kortrijk.be` |
| `RESEND_API_KEY` | Resend key |
| `AUTH_FROM_EMAIL` | `Anesthesie Kortrijk <noreply@anesthesie-kortrijk.be>` |

Verwijder of negeer `VITE_APP_PIN` — PIN-AuthGuard is vervangen door e-mail OTP.

## 2. Schema + invites (Production-DB)

In Supabase SQL Editor (productieproject):

1. [`APP_SCHEMA.sql`](../APP_SCHEMA.sql) indien auth/users nog ontbreken  
2. [`scripts/sql/user-features-tables.sql`](../scripts/sql/user-features-tables.sql) voor bookmarks/notes/audit  
3. Soft launch: alleen pilot in `invited_users` (`active = true`) — zie [INVITES_SUPABASE.md](./INVITES_SUPABASE.md)

Optioneel: `DATABASE_URL=<prod> npm run db:push` (kan interactieve prompts geven; SQL is veiliger).

## 3. Merge & deploy

1. Op `User-login`: `git merge origin/main` (conflicts oplossen).
2. PR `User-login` → `main`, review, merge.
3. Vercel Production deploy afwachten.
4. Smoke op **live domein**: OTP → heropen zonder OTP → logboek → notitie → (staf) edit → uitloggen.

## 4. Soft launch → hele dienst

- Eerste 48–72 u: alleen pilot-allowlist.
- Daarna overige mails in `invited_users` (geen redeploy).
- Rollback: Vercel → vorige Production-deploy **Promote** — details in [AUTH_PREVIEW.md](./AUTH_PREVIEW.md).

## 5. Na volledige cutover

- Deel geen gedeelde PIN meer.
- PIN-endpoint `/api/logbook/auth/login` geeft `410`.
- Kolommen `users.pin` / `password` zijn legacy.

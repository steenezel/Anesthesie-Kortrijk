# Auth production cutover

Voer dit uit **nadat** de Vercel Preview-checklist in [AUTH_PREVIEW.md](./AUTH_PREVIEW.md) groen is.

## 1. Productie-env (Vercel Production)

| Variabele | Waarde |
|-----------|--------|
| `DATABASE_URL` | Productie Postgres (Supabase/Neon) |
| `BETTER_AUTH_SECRET` | Lange random secret (niet delen met preview) |
| `BETTER_AUTH_URL` | `https://anesthesie-kortrijk.vercel.app` |
| `RESEND_API_KEY` | Resend productie-key |
| `AUTH_FROM_EMAIL` | Geverifieerd afzenderadres |
| `AUTH_SEED_ADMIN_EMAIL` | Optioneel, jouw mail voor admin-invite |

Verwijder of negeer `VITE_APP_PIN` — PIN-AuthGuard is vervangen door e-mail OTP.

## 2. Schema + invites

```bash
npm run db:push
AUTH_SEED_ADMIN_EMAIL=jij@azgroeninge.be npm run auth:seed
```

Vervang placeholder-emails in `server/logbook-users.ts` (`DEFAULT_INVITES`) door echte staf/ASO-adressen vóór seed, of voeg rijen toe in `invited_users`.

## 3. Merge

1. Op `User-login`: `git merge origin/main` (conflictvrij houden).
2. PR `User-login` → `main`, review, merge.
3. Vercel production deploy.
4. Smoke-test: OTP → heropen app → logboek → settings uitloggen.

## 4. Na cutover

- Deel geen gedeelde PIN meer.
- PIN-endpoint `/api/logbook/auth/login` geeft `410`.
- Kolommen `users.pin` / `password` zijn legacy; niet meer gebruiken voor login.

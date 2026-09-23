# Auth production cutover

**Gekozen pad: B — big-bang invite** (hele dienst in allowlist vóór OTP Production-deploy).  
Geen soft launch / geen dual PIN. Rollback: [AUTH_PREVIEW.md](./AUTH_PREVIEW.md).

Voer dit uit **nadat** de Preview-checklist in [AUTH_PREVIEW.md](./AUTH_PREVIEW.md) groen is.

## 1. Productie-env (Vercel Production)

| Variabele | Waarde |
|-----------|--------|
| `DATABASE_URL` | Productie Postgres (Supabase) |
| `BETTER_AUTH_SECRET` | Lange random secret (**niet** delen met preview) |
| `BETTER_AUTH_URL` | Live app-URL, bv. `https://anesthesie-kortrijk.be` |
| `RESEND_API_KEY` | Resend key |
| `AUTH_FROM_EMAIL` | `Anesthesie Kortrijk <noreply@anesthesie-kortrijk.be>` |

**Verwijder op Production:** `AUTH_DEV_OTP_LOG`, `VITE_APP_PIN`, `OAUTH_CLIENT_ID` (legacy).  
`AUTH_DEV_OTP_LOG` mag alleen Preview/local blijven.

## 2. Schema + invites (Production-DB)

1. [`APP_SCHEMA.sql`](../APP_SCHEMA.sql) indien auth/users nog ontbreken  
2. [`scripts/sql/user-features-tables.sql`](../scripts/sql/user-features-tables.sql) voor bookmarks/notes/audit  
3. **Volledige dienst** in `invited_users` (`active = true`, lowercase email, juiste `role` + kortenaam) — [INVITES_SUPABASE.md](./INVITES_SUPABASE.md)

Controle vóór merge:

```sql
select role, count(*) from public.invited_users where active group by role;
select email from public.invited_users where email <> lower(email);
```

## 3. Merge & deploy

1. Op `User-login`: `git merge origin/main` (conflicts oplossen).
2. PR `User-login` → `main`, review, merge.
3. Vercel Production deploy afwachten.
4. Smoke op **live domein**: OTP → heropen zonder OTP → logboek → notitie → (staf) edit → uitloggen.
5. Rollback paraat: Instant Rollback naar pre-OTP Production.

## 4. Na cutover

- Deel de gedeelde PIN niet meer (endpoint blijft `410`).
- Extra collega’s: nieuwe rij in `invited_users` (geen redeploy).
- Kolommen `users.pin` / `password` zijn legacy.

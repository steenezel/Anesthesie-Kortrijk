# Auth: preview vs production (parallel werken)

Login leeft op branch **`User-login`**. Productie (`main` → `anesthesie-kortrijk.vercel.app`) blijft de PIN-app tot cutover.

## Preview

1. Push/`gh pr create` vanaf `User-login` → Vercel geeft een Preview-URL.
2. Zet in Vercel **Preview** environment (niet Production):
   - `DATABASE_URL` → aparte preview/branch-database (niet productie)
   - `BETTER_AUTH_SECRET` → lange random string
   - `BETTER_AUTH_URL` → de preview-origin (of laat leeg en gebruik request host)
   - `RESEND_API_KEY` + `AUTH_FROM_EMAIL`
   - Optioneel: `AUTH_DEV_OTP_LOG=1` om OTP in server logs te zien als mail faalt
3. Seed invites: `npm run auth:seed` met preview `DATABASE_URL`.
4. Checklist: OTP ontvangen → inloggen → app heropenen zonder OTP → logout → tweede browser → logboek/SMASH → API zonder cookie = 401.

## Parallel: kleinere changes live

- Korte fixes/content: PR’s naar **`main`** zoals gewoonlijk.
- Op `User-login` regelmatig: `git fetch origin && git merge origin/main`.
- Geen auth-breaking changes op `main` tot cutover.

## Cutover

Zie [AUTH_CUTOVER.md](./AUTH_CUTOVER.md).

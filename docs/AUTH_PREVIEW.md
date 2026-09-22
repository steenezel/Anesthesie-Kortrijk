# Auth: preview vs production (parallel werken)

Login leeft op branch **`User-login`**. Productie (`main`) blijft de PIN-app tot cutover.

## Preview-env in Vercel

| Variabele | Preview | Production |
|-----------|---------|------------|
| `DATABASE_URL` | Zelfde Supabase OK als auth-tabellen bestaan, of aparte DB | Productie-DB |
| `BETTER_AUTH_SECRET` | Ja (mag apart van prod) | Ja |
| `BETTER_AUTH_URL` | **Niet zetten / leeg** — code gebruikt `VERCEL_URL` | `https://anesthesie-kortrijk.be` |
| `RESEND_API_KEY` | Ja | Ja |
| `AUTH_FROM_EMAIL` | `Anesthesie Kortrijk <noreply@anesthesie-kortrijk.be>` | Idem |

Belangrijk: als `BETTER_AUTH_URL` op Preview op het **productiedomein** staat, faalt OTP/sessie op de `*.vercel.app`-URL. De code negeert die waarde nu op `VERCEL_ENV=preview`.

Optioneel Preview: `AUTH_DEV_OTP_LOG=1` → OTP in Vercel Function logs.

## Checklist

OTP ontvangen → inloggen → app heropenen zonder OTP → logout → tweede browser → logboek/SMASH → API zonder cookie = 401.

## Cutover

Zie [AUTH_CUTOVER.md](./AUTH_CUTOVER.md).

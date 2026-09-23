# Environment variables (auth)

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5000
RESEND_API_KEY=
AUTH_FROM_EMAIL=Anesthesie Kortrijk <onboarding@resend.dev>
# Preview/local only — never set on Production (code ignores it in production anyway)
# AUTH_DEV_OTP_LOG=1
AUTH_SEED_ADMIN_EMAIL=you@example.com
# Alleen 1 als je bewust vanuit code wilt seed'en — default: beheer via Supabase invited_users
# AUTH_SEED_FROM_CODE=1

# Legacy — unused after email login (safe to remove)
# VITE_APP_PIN=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

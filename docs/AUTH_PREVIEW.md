# Auth: preview & go-live checklist (zonder dienst-downtime)

Login leeft op branch **`User-login`**. Productie (`main`) blijft de **PIN-app** tot je merget/deploy’t.

**Soft launch (OTP-only + kleine allowlist) is geen optie:** op één Production-domein vervangt die deploy de PIN volledig; wie niet in `invited_users` staat, kan de app niet meer openen. Dat is downtime voor de dienst.

---

## Preview-env (Vercel Preview)

| Variabele | Preview | Production |
|-----------|---------|------------|
| `DATABASE_URL` | Preview-DB of gedeelde Supabase | **Productie**-Postgres |
| `BETTER_AUTH_SECRET` | Ja (mag apart) | Ja (**apart** van preview) |
| `BETTER_AUTH_URL` | **Leeg / niet zetten** → code gebruikt `VERCEL_URL` | Live domein, bv. `https://anesthesie-kortrijk.be` |
| `RESEND_API_KEY` | Ja | Ja |
| `AUTH_FROM_EMAIL` | `Anesthesie Kortrijk <noreply@anesthesie-kortrijk.be>` | Idem |

Belangrijk: `BETTER_AUTH_URL` op Preview **niet** op het productiedomein zetten. Optioneel Preview: `AUTH_DEV_OTP_LOG=1`.

---

## Checklist Preview (vóór soft launch)

Vink af met minstens **1 ASO + 1 staf**, bij voorkeur GSM + desktop.

### Login & sessie
- [ ] OTP-mail komt aan (&lt; ~1 min)
- [ ] Inloggen lukt
- [ ] App heropenen / force-quit → **geen** nieuwe OTP
- [ ] Uitloggen → opnieuw OTP nodig
- [ ] Tweede browser / ander toestel → aparte sessie OK
- [ ] Niet-uitgenodigde mail → geweigerd
- [ ] API zonder cookie → `401`

### Rollen
- [ ] ASO: **geen** CMS Edit/Add, **geen** ASO-overzicht
- [ ] Staf: CMS edit OK; logboek **Registreren** + **ASO-overzicht**
- [ ] Staf ziet in overzicht **alleen ASO’s** (geen andere staf)
- [ ] Beide: eigen logboek-techniek registreren

### Favorieten / notities / games
- [ ] Favoriet toggelen → zichtbaar op Home (onder de modules)
- [ ] Notitie typen → autosave zonder tekstverlies; status “Opgeslagen”
- [ ] Elkaars notities/favorieten **onzichtbaar**
- [ ] Flappy: score onder **kortenaam** (zonder initialen-veld)

### CMS (staf)
- [ ] Protocol/block opslaan lukt
- [ ] Historiek-drawer toont wie/wanneer

### Offline (kort)
- [ ] Na login: vliegtuigmodus → app opent nog (sessiesnapshot)
- [ ] Favoriet/notitie offline → na online weer sync

### Kiosk (optioneel)
- [ ] Kiosk-rol: CDS lezen, geen logboek/notities-schrijven

**Preview groen?** → kies een **zero-downtime cutover** (onder) + [AUTH_CUTOVER.md](./AUTH_CUTOVER.md).

---

## Production-DB in orde krijgen

De app-auth/user-tabellen zitten in de Postgres van **`DATABASE_URL`** (Supabase project van Production), niet “automatisch” via de CMS-anon-key.

### Stappen (jij in Supabase Dashboard)

1. Open het **productie**-Supabase project (zelfde als Vercel Production `DATABASE_URL`).
2. **SQL Editor** → plak en Run, in deze volgorde indien nodig:
   - Bestaande app/auth-schema: [`APP_SCHEMA.sql`](../APP_SCHEMA.sql) (idempotent `IF NOT EXISTS`)
   - User-features (bookmarks/notes/audit): [`scripts/sql/user-features-tables.sql`](../scripts/sql/user-features-tables.sql)
3. Controleer in **Table Editor** dat o.a. bestaan:
   - `user`, `session`, `account`, `verification` (Better Auth)
   - `users`, `invited_users`, `user_preferences`
   - `user_bookmarks`, `user_notes`, `content_audit_logs`
   - logboek / highscores / … (zoals in `APP_SCHEMA.sql`)
4. **Allowlist vóór cutover:** zie zero-downtime opties hieronder (niet “alleen pilot”).
5. Optioneel lokaal tegen **prod**-URL (voorzichtig):  
   `DATABASE_URL=<prod> npm run db:push`  
   (drizzle-kit kan interactieve prompts geven; SQL hierboven is veiliger.)

Zie ook [INVITES_SUPABASE.md](./INVITES_SUPABASE.md).

### Heeft de AI toegang tot jouw Supabase?

**Nee — niet zonder jouw actie.** De Supabase-koppeling in Cursor vraagt eerst authenticatie (`mcp_auth`). Zonder die login kan de agent je Production-DB niet inzien of migreren. Jij (of een eenmalige auth in Cursor) moet dat doen; daarna kan de agent wél tabellen/SQL helpen controleren.

---

## Cutover zonder dienst-downtime

Op `https://anesthesie-kortrijk.be` draait **altijd één** Production-deploy. Huidige `User-login`-code is **OTP-only** (PIN-endpoint → `410`). Kies daarom vóór merge één pad:

| Optie | Wat | Wanneer |
|-------|-----|---------|
| **A. Dual auth (tijdelijk)** | Feature flag: gedeelde PIN **of** e-mail OTP tot iedereen op OTP zit; daarna PIN uit | Je wilt geleidelijk migreren zonder dat iemand buitensluit |
| **B. Big-bang invite** | Zet **alle** actieve staf/ASO in `invited_users` (`active = true`) **vóór** Production OTP-deploy | **Gekozen** — lijst compleet; één overstapmoment |
| **C. PIN blijft live** | `main` = PIN; OTP alleen op Preview tot A of B klaar is | Veiligste default tot cutover |

**Niet doen:** OTP-only deployen met een kleine pilot-allowlist — niet-uitgenodigden kunnen de live app dan niet meer openen.

Preview (`*.vercel.app`) blijft bruikbaar om OTP/RBAC te testen zonder Production te raken.

Aanbevolen volgorde zonder downtime:

1. Preview-checklist groen (boven).
2. Production-DB + env klaar ([AUTH_CUTOVER.md](./AUTH_CUTOVER.md)).
3. **Of** dual-auth gebouwd + getest (**A**), **of** volledige `invited_users` geverifieerd in prod (**B**).
4. Merge `User-login` → `main` → Production deploy.
5. Smoke op live domein; Instant Rollback paraat (onder).

---

## Rollback bij failure (terug naar status praesens)

Doel: live site weer de **vorige PIN-app** (laatste goede `main` vóór OTP-merge).

### Snelste (aanbevolen): Vercel Instant Rollback

1. Vercel → project → **Deployments**.
2. Zoek de laatste **Production**-deploy **vóór** de OTP-merge.
3. **⋯ → Promote to Production** / Rollback.
4. Smoke: site opent met PIN-flow zoals voorheen.

Geen git-gedoe; seconden tot minuten.

### Alternatief: git revert op `main`

```bash
git checkout main
git pull
git log --oneline -5          # noteer merge-commit van User-login
git revert -m 1 <merge-commit>   # of reset alleen als je force-push beleid toelaat
git push origin main
```

Vercel herdeploy’t automatisch.

### Wat met de database na rollback?

- Auth/user-feature-tabellen mogen blijven staan; PIN-app negeert ze grotendeels.
- Je hoeft die tabellen **niet** te droppen voor een werkende rollback.
- OTP-sessiecookies worden irrelevant zodra de oude app terug is.

### Na rollback

- Preview/`User-login` blijft beschikbaar om te fixen.
- Opnieuw cutoveren pas als Preview opnieuw groen is én pad A of B opnieuw klopt.

---

## Cutover (live)

Zie [AUTH_CUTOVER.md](./AUTH_CUTOVER.md): env, schema, zero-downtime pad, merge, post-cutover.

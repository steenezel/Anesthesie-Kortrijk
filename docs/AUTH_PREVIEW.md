# Auth: preview, soft launch & go-live checklist

Login leeft op branch **`User-login`**. Productie (`main`) blijft de **PIN-app** tot je merget/deploy’t.

Er is **geen** tweede simultane Production-app op hetzelfde domein. Soft launch = **één** live OTP-deploy + **kleine allowlist** (zie hieronder).

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

**Preview groen?** → Production-DB + soft launch (onder). Volledige cutover: [AUTH_CUTOVER.md](./AUTH_CUTOVER.md).

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
4. **Allowlist soft launch:** in `invited_users` alleen de pilotgroep (`active = true`, juiste `role` + `username`/kortenaam).  
   Rest van de dienst: ofwel nog **geen** rij, ofwel `active = false`.
5. Optioneel lokaal tegen **prod**-URL (voorzichtig):  
   `DATABASE_URL=<prod> npm run db:push`  
   (drizzle-kit kan interactieve prompts geven; SQL hierboven is veiliger.)

Zie ook [INVITES_SUPABASE.md](./INVITES_SUPABASE.md).

### Heeft de AI toegang tot jouw Supabase?

**Nee — niet zonder jouw actie.** De Supabase-koppeling in Cursor vraagt eerst authenticatie (`mcp_auth`). Zonder die login kan de agent je Production-DB niet inzien of migreren. Jij (of een eenmalige auth in Cursor) moet dat doen; daarna kan de agent wél tabellen/SQL helpen controleren.

---

## Soft launch — wat het wél en niet is

### Niet: twee Production-versies naast elkaar

Op `https://anesthesie-kortrijk.be` (of je Vercel-productiedomein) draait **altijd één** deploy van `main`.

| Fase | Wat bezoekers zien |
|------|-------------------|
| Nu | PIN-app (`main` oud) |
| Soft launch | OTP-app voor **iedereen** die de site opent; inloggen kan **alleen** met allowlist |
| Volledige launch | Zelfde OTP-app; allowlist uitgebreid naar hele dienst |

Soft launch ≠ Preview + Production tegelijk als “twee prod-apps”. Preview (`*.vercel.app`) mag blijven bestaan voor experimenten, maar is **niet** de dienst-URL.

### Wel: beperkte toegang via allowlist

1. Preview-checklist groen.
2. Production-DB + env klaar ([AUTH_CUTOVER.md](./AUTH_CUTOVER.md) §1–2).
3. `invited_users`: **alleen** jij + 2 staf + 3 ASO (pilot).
4. Merge `User-login` → `main` → Vercel Production deploy.
5. Pilot test **48–72 u** op het **live domein**.
6. Daarna: overige collega’s toevoegen in `invited_users` (geen nieuwe deploy nodig).

**Let op:** vanaf soft-launch-deploy werkt de **oude PIN niet meer** op Production. Wie niet uitgenodigd is, kan de app **niet** gebruiken tot je hen invite’t. Plant de soft launch dus kort, of nodig meteen de hele dienst uit als downtime onaanvaardbaar is.

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
- Pas opnieuw soft-launchen als Preview opnieuw groen is.

---

## Cutover (volledige dienst)

Zie [AUTH_CUTOVER.md](./AUTH_CUTOVER.md): env, schema, merge, post-cutover.

# Development handbook — Anesthesie Kortrijk

Praktische howto voor wie **aan de code of content** werkt.

| Document | Rol |
|----------|-----|
| **[README.md](./README.md)** | Productoverzicht, stack, lokaal starten, deploy |
| **[STATUS.md](./STATUS.md)** | Actuele modules, API, auth, Drizzle, PWA-status |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Ecosysteem GitHub / Vercel / Supabase |
| **[docs/AUTH_*.md](./docs/)** | OTP, env, invites, cutover |
| **Dit bestand** | Markdown-conventies, PWA-details, veelvoorkomende taken |

Bij conflict over “wat is de huidige architectuur?” → **STATUS.md / ARCHITECTURE.md winnen**.

---

## 1. Lokaal draaien (kort)

Zie README voor de volledige env-lijst ([docs/AUTH_ENV.md](./docs/AUTH_ENV.md)).

```bash
npm install
npm run dev          # http://localhost:5000
npm run check        # tsc
npm run db:push      # schema → Postgres
npm run auth:seed    # optioneel invites
```

Featurebranches → Vercel Preview. Production = merge naar `main` → [anesthesie-kortrijk.be](https://anesthesie-kortrijk.be).

---

## 2. Content toevoegen / bewerken

### Productie (aanbevolen)
`/admin` — schrijft naar Supabase (`protocols`, `blocks`, `pocus`, `journal_club`). Vereist CMS-rol (`canEditCms`).

### Lokale markdown (fallback / migratie)

```
client/src/content/
├── protocols/{discipline}/*.md   # merge met cloud via import.meta.glob
├── onboarding.md                 # /onboarding/staf
├── onboarding-aso.md             # /onboarding/aso
├── blocks/                       # leeg na KARA-migratie — niet opnieuw vullen tenzij migratie
└── pocus/                        # UI is cloud-only; lokale MD is restant
```

Nieuwe protocol-`.md` onder een discipline-map → verschijnt automatisch in de lijst (na merge met cloud).

### Frontmatter (voorbeeld)

```markdown
---
title: "Sectio caesarea"
---

## Inductie
...
```

### Media & embeds

| Type | Syntax / pad |
|------|----------------|
| Afbeelding | `![Alt](/images/protocols/bestand.png)` — zoom via `MarkdownRenderer` |
| Video | `video:/videos/blocks/demo.mp4` (niet in PWA-precache) |
| Callouts (onboarding) | blockquotes met `[!WARNING]` / `[!INFO]` / `[!TIP]` |
| Caudal calculator in block | shortcode `[CAUDAL_CALC]` in block-markdown |

Plaats bestanden in `public/images/` of `public/videos/`.

---

## 3. PWA

- Config: `vite.config.ts` → `VitePWA({ manifest: …, workbox: … })`
- Build-output manifest: **`/manifest.webmanifest`** (geïnjecteerd door de plugin)
- Registratie: `client/src/pwa-register.ts` (`injectRegister: false`)
- Update-UX: event `pwa-update-available` → `PwaUpdateListener`
- **Geen** statisch `public/manifest.json` meer — dat conflicteerde met VitePWA

Cloud-content vernieuwen bij tab-focus: `client/src/lib/cloudContentRefresh.ts`.

---

## 4. Veelvoorkomende taken

### Nieuwe calculator-pagina
1. Component/page onder `client/src/pages/` of `components/calculators/`
2. Route in `client/src/App.tsx`
3. Tile in `client/src/pages/calculator-list.tsx`

### Nieuwe API-route (serverdata)
1. Tabel/types in `shared/schema.ts` (+ Zod indien nodig)
2. `npm run db:push`
3. Handler in `server/routes.ts` met `requireAuth` / `rejectKioskWrites` waar gepast
4. Client: `apiRequest` + TanStack Query

### CMS-content (geen Drizzle)
Supabase-client in de browser; schema/SQL vaak via dashboard of SQL-scripts — niet alles zit in `shared/schema.ts`. Zie ARCHITECTURE.md (“twee wegen”).

### Invite toevoegen
Rij in `invited_users` (Supabase) of `npm run auth:seed` — [docs/INVITES_SUPABASE.md](./docs/INVITES_SUPABASE.md).

---

## 5. Auth & security (pointers)

- Login: Better Auth e-mail OTP (Resend), httpOnly cookie
- Allowlist: `invited_users`
- Rollen: `aso` | `staff` | `supervisor` | `kiosk` | `admin`
- Permissions: `shared/permissions.ts` + middleware in `server/auth-middleware.ts`
- Legacy PIN (`VITE_APP_PIN`, logboek PIN-login) is **uitgefaseerd**

Details: [docs/AUTH_ENV.md](./docs/AUTH_ENV.md), [STATUS.md](./STATUS.md) §1 / §4 / §8.

---

## 6. Wat dit bestand *niet* meer doet

Oudere versies van DEVELOPMENT.md bevatten lange, deels verouderde secties (voorbeeld-cardiac-protocols, hypothetische testsetup, duplicate stack-tabellen, roadmap). Die rol is overgenomen door:

- **README** — onboarding voor mensen én GitHub-frontpage  
- **STATUS** — “wat bestaat er nu technisch?”  
- **docs/** — auth-cutover en architectuurdiagrammen  

Dit handbook blijft bewust **kort** en taakgericht. Als je een howto mist (bv. quizbank, offline queue), voeg hier een korte sectie toe i.p.v. STATUS te verdubbelen.

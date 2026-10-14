# Anesthesie Kortrijk (AZ Groeninge) — Technische status

**Type:** Clinical Decision Support Progressive Web App (PWA)  
**Live:** [anesthesie-kortrijk.be](https://anesthesie-kortrijk.be) (domein via Vimexx)  
**Documentstatus:** oktober 2026 (afgeleid van huidige codebase + recente merges)

---

## 1. Architectuur & tech stack

### Core


| Laag          | Technologie                                           | Notitie                                                         |
| ------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| UI            | React **19.2** + TypeScript **5.6**                   | Strict client SPA                                               |
| Build         | Vite **7.1**                                          | Root `vite.config.ts`; output `dist/public`                     |
| Styling       | Tailwind CSS **4** + Radix UI / shadcn                | Utility-first, mobile-first OR-gebruik                          |
| Routing       | **Wouter** `^3.3.5`                                   | Lichte SPA-routing; alle routes in `client/src/App.tsx`         |
| Data fetching | TanStack React Query **5**                            | Cloud content + API-queries                                     |
| Markdown      | `react-markdown` + remark-gfm/math + rehype-katex/raw | Gedeelde `MarkdownRenderer`                                     |
| Backend       | Express **5** + `tsx`                                 | Dev: Vite middleware; prod: static + API                        |
| Deploy        | Vercel                                                | Rewrites: `/api/*` → serverless; SPA fallback naar `index.html` |


### Belangrijke dependencies (`package.json`)

- **ORM / DB:** `drizzle-orm` + `drizzle-kit` + `postgres` / `pg` + `drizzle-zod` / `zod` — zie §4 (Drizzle)
- **Auth:** `better-auth` + `@better-auth/drizzle-adapter` + `resend` (e-mail OTP)
- **Cloud CMS:** `@supabase/supabase-js` (browser anon-key → contenttabellen)
- **Game-scores:** Postgres-tabellen `game_highscores` / `game_stats` (via Drizzle/`DATABASE_URL`)
- **PWA:** `vite-plugin-pwa` (Workbox)
- **Images:** `vite-plugin-image-optimizer`, `browser-image-compression`, `sharp`
- **Analytics:** `@vercel/analytics`
- Legacy packages (`express-session`, `passport`, …) kunnen nog in `package.json` staan maar zijn **geen** actieve auth-laag meer

### Authenticatie (app-toegang)

- Globale `**AuthGuard**` in `App.tsx`: **e-mail OTP** via Better Auth + Resend (geen gedeelde PIN meer op deze branch).
- Sessies: httpOnly cookie, **90 dagen** (sliding); OTP alleen bij eerste login per toestel / na logout.
- Allowlist: tabel `invited_users` — seed via `npm run auth:seed`.
- App-profiel: `users` (rol `aso` | `staff` | `supervisor` | `kiosk` | `admin`); kiosk = read-only CDS.
- Docs: `docs/AUTH_PREVIEW.md`, `docs/AUTH_CUTOVER.md`, `docs/AUTH_ENV.md`.
- Legacy: `VITE_APP_PIN` / logboek-PIN zijn uitgefaseerd (`POST /api/logbook/auth/login` → 410).

### Routing (Wouter) — hoofdmodules


| Pad                                                                     | Module                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `/`                                                                     | Home (dashboard + easter-egg “koffiekot”)                    |
| `/protocols`, `/protocols/:id`                                          | Protocollen (lokaal + Supabase merge)                        |
| `/blocks`, `/blocks/:id`                                                | KARA LRA (atlas + detail)                                    |
| `/blocks/referentie/*`                                                  | KARA Referentie (dermatomen, osteotomen, innervatie, plexus) |
| `/pocus`, `/pocus/:id`                                                  | POCUS (Supabase-first)                                       |
| `/calculator` / `/calculators`                                          | Calculator-hub                                               |
| `/calculator/last|apfel|peds|dantroleen|painpump|sedation-peds|caprini` | Calculators                                                  |
| `/logbook`                                                              | ASO-logboek                                                  |
| `/smash` (+ aliases `/calculator(s)/spinal-logbook`)                    | SMASH spinale logboek                                        |
| `/journalclub`, `/journalclub/:id`                                      | Journal Club                                                 |
| `/onboarding`, `/onboarding/:type`                                      | Onboarding staf/ASO                                          |
| `/marketplace`                                                          | Verlof-marktplaats                                           |
| `/search`                                                               | Globale zoek (Supabase RPC `global_search`)                  |
| `/admin`                                                                | Markdown CMS-editor                                          |
| `/game`, `/wordle`, `/chasse-patate`                                    | Minigames (easter eggs)                                      |
| `/contacts`, `/checklist`, `/info`                                      | Ondersteunende pagina’s                                      |


### PWA / Service Worker / Workbox

Config in `vite.config.ts` via `VitePWA`:

- `registerType: "autoUpdate"`
- `injectRegister: false` — registratie via `client/src/pwa-register.ts` (`virtual:pwa-register`)
- Workbox: `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`
- Manifest via VitePWA-plugin (build-time): `/manifest.webmanifest` — naam *Anesthesie Kortrijk*, theme `#0d9488`, icons 192/512
- Update-UX: polling elke **5 min** + bij `visibilitychange`; event `pwa-update-available` → toast via `PwaUpdateListener`; bij `controllerchange` hard reload
- Image-optimizer in build (PNG/JPEG/WebP/AVIF quality-presets)

---

## 2. Content & bestandsstructuur

### Hybride contentmodel

De app werkt **dual-source**:

1. **Lokale markdown** (build-time, offline-vriendelijk) via `import.meta.glob(..., { query: 'raw', eager: true })`
2. **Supabase-tabellen** (runtime CMS) — protocollen, blocks, journal club, POCUS

Bij protocollen, blocks en journal club: **merge** van lokaal + cloud (cloud-items naast of bovenop lokale entries).  
POCUS UI is **cloud-only** (`pocus`-tabel); lokale `.md` onder `content/pocus/` bestaan nog als bron/migratie-restanten.

Cloudqueries worden bij focus/zichtbaarheid vernieuwd (`cloudContentRefresh.ts`).

### Lokale contentboom

```
client/src/content/
├── protocols/          # 35+ .md, per discipline-map
│   ├── abdominale/
│   ├── buitendiensten/
│   ├── neurochirurgie/
│   ├── nko/
│   ├── obstetrie-epidurale/
│   ├── orthopedie/
│   ├── pijnkliniek/
│   ├── reanimatie/
│   ├── thorax-vaat/
│   └── urologie/
├── blocks/             # lokale .md verwijderd (migratie naar Supabase/KARA)
├── pocus/              # gastric.md, tcd.md, vci.md (niet meer UI-primary)
├── journal-club/       # glob aanwezig; inhoud primair via Supabase
├── onboarding.md       # staf
└── onboarding-aso.md   # ASO
```

**Protocol-disciplines (canoniek in UI):** Abdominale, Buitendiensten, Neurochirurgie, NKO, Obstetrie-epidurale, Orthopedie, Pijnkliniek, Reanimatie, Thorax-vaat, Urologie (+ Pediatrie/Algemeen als normalisatie-targets).

### `import.meta.glob` — automatische inleesstructuur


| Locatie                                     | Glob                           | Gebruik                                                  |
| ------------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `protocol-list.tsx` / `protocol-detail.tsx` | `../content/protocols/**/*.md` | Lijst + detail, merge met Supabase `protocols`           |
| `blocks.tsx` / `block-detail.tsx`           | `../content/blocks/*.md`       | Fallback/migratie; productie-content = Supabase `blocks` |
| `journal-list.tsx` / `journal-detail.tsx`   | `../content/journal-club/*.md` | Merge met `journal_club`                                 |
| `onboarding.tsx`                            | `../content/*.md`              | `onboarding.md` vs `onboarding-aso.md` via route-param   |
| `admin-editor.tsx`                          | protocols glob                 | One-click migratie lokaal → Supabase                     |


Frontmatter-conventie: YAML-achtige `title: "..."`, optioneel `date`, `disciplines`, enz. Body na `---` wordt gerenderd.

### KARA (Kortrijk Academy of Regional Anesthesia)

- Blocks hernoemd/gerebrand als **KARA**.
- **Interactieve body-map atlas** (`InteractiveBodyMap`) met `body_regions` tagging in Supabase.
- **Referentiemodule** (`/blocks/referentie`): dermatomen, osteotomen, zenuwfunctietesten/innervatie, plexuslijsten met gerelateerde blocks.
- Shortcode `[CAUDAL_CALC]` in block-markdown → inline `CaudalCalculator`.

### Admin CMS (`/admin`)

- Split-pane markdown editor voor protocols / blocks / pocus / journal.
- Image compressie client-side vóór Supabase-upload; PDF-upload ondersteund.
- Body-region selector voor LRA-atlas tagging.

---

## 3. Modules & features

### 3.1 Calculators (`/calculator`)


| Calculator             | Route                       | Functie                                                                                                                                                                                     |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LAST**               | `/calculator/last`          | Cumulatieve toxiciteitsscore lokale anesthetica; max doses; Intralipid; patiënt-risicofactoren; follow-up dosing info                                                                       |
| **Apfel**              | `/calculator/apfel`         | PONV-risico 4 factoren → % (10/21/39/61/79); waarschuwing bij score ≥ 3                                                                                                                     |
| **Pediatrische doses** | `/calculator/peds`          | Leeftijd/gewicht/lengte; **Eck**-tube diameter; **Cole** (cuffed/uncuffed); LMA; orale/nasale diepte; medicatietabellen uit `pediatric-config.ts`; safety lock < 1 jaar (gewicht verplicht) |
| **Dantroleen**         | `/calculator/dantroleen`    | MH: 2.5 / 1 / 10 mg/kg → flacons + Aqua; stock-waarschuwing AZG                                                                                                                             |
| **Peds Sedatie MRI**   | `/calculator/sedation-peds` | Dexdor + Atropine; IBW/AjBW bij obesitas                                                                                                                                                    |
| **Painpump**           | `/calculator/painpump`      | Looptijd, einddatum, bijvulling KLAC                                                                                                                                                        |
| **Caprini**            | `/calculator/caprini`       | DVT-risicoscore chirurgische patiënt                                                                                                                                                        |


Alle calculators zijn **client-side**; geen backend vereist.

### 3.2 Minigames / easter eggs

Toegang: **3× tikken** op de home-titel → dialoog **“Het koffiekot”**.


| Spel                   | Route            | Details                                                                                                     |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Flappy Anesthesist** | `/game`          | Canvas-achtige Flappy-clone; Web Audio; highscores via Postgres `game_highscores`; globale pogingen-counter |
| **Anesthesiedle**      | `/wordle`        | Dagelijks 5-letterwoord (dag-van-jaar % wordlist); AZERTY; share emoji-grid                                 |
| **Chasse Patate**      | `/chasse-patate` | Wieler-thema galgje                                                                                         |


### 3.3 ASO-logboek (`/logbook`)

- Registratie van procedures: **LRA**, **Arterieel**, **Centraal** (boom in `logbook-tree.ts`).
- Rollen via Better Auth-profiel: o.a. `aso` | `supervisor` | `staff` | `admin` (kiosk: geen schrijven).
- Velden: categorie → subcategorie → techniek, status `pass`/`fail`, supervisieniveau, supervisornaam, notities, datum.
- Auth: **geen aparte PIN meer** — gebruikt de globale Better Auth-sessie (`requireAuth` op API).
- Views: eigen entries; supervisor-overzicht met filters; exportmogelijkheid in UI.

### 3.4 SMASH-module (`/smash`)

**SMASH** = *Scandicaine versus Marcaine: Anesthesia Spinal Hip* — prospectief spinale logboek (THP-trial context).

- Agenten: **Scandicaine** | **Isobare Marcaine**
- Dosis 1–5 ml (comma/punt-tolerant)
- Outcomes: time-to-surgery, surgical success, failure reasons (duur / motor / sensorisch), PACU-duur, urine retentie, opioïden PACU, notities
- Auth: Better Auth-sessie + RBAC (`requireAuth` / `rejectKioskWrites`); geen PIN-headers meer
- Routes: `/smash`, `/calculators/spinal-logbook`, `/calculator/spinal-logbook`

### 3.5 Journal Club & Onboarding

- **Journal Club:** disciplines Anesthesie / Intensieve / Urgentie / Pijn; cloud-tabel `journal_club` + optionele lokale `.md`.
- **Onboarding:** keuze staf (`/onboarding/staf` → `onboarding.md`) of ASO (`/onboarding/aso` → `onboarding-aso.md`); rich markdown met WARNING/INFO/TIP callouts en zoom-afbeeldingen.

### 3.6 Overige productmodules

- **Marktplaats:** verlof aanbieden/overnemen (`marketplace` tabel + CRUD API)
- **Telefoonlijst:** interne nummers, one-tap dial (+32 56 63… prefixing)
- **Zoeken:** Supabase RPC `global_search` over pocus/blocks/protocols/journal
- **Externe link:** E17 Bridginglink bloedverdunners

---

## 4. Database & backend

### Wat doet Drizzle?

**Drizzle ORM** is de TypeScript-laag tussen de Express-server en Postgres (Supabase). In de praktijk:

1. **Schema in code** (`shared/schema.ts`) — tabellen als TypeScript (`pgTable`, kolomtypes, foreign keys).
2. **Type-safe queries** (`server/db.ts` + `drizzle-orm`) — `db.select().from(users).where(...)` i.p.v. ruwe SQL-strings; types volgen uit het schema.
3. **Validatie** via `drizzle-zod` + Zod — insert/update payloads (logboek, SMASH, …) worden gecheckt vóór schrijven.
4. **Schema sync** via `drizzle-kit` (`npm run db:push`) — past de echte Postgres-tabellen aan aan het codeschema (mits `DATABASE_URL`).
5. **Better Auth-adapter** — Better Auth bewaart `user` / `session` / `account` / `verification` óók via Drizzle in dezelfde database.

**Niet** via Drizzle: de CDS-contenttabellen (`protocols`, `blocks`, `pocus`, `journal_club`) die de browser rechtstreeks via de Supabase JS-client leest/schrijft. Zelfde Postgres-project, twee toegangswegen (zie `docs/ARCHITECTURE.md`).

### PostgreSQL + Drizzle (serverpad)

- Schema: `shared/schema.ts`
- Config: `drizzle.config.ts` → dialect `postgresql`
- Connectie: `server/db.ts` via `postgres` + `DATABASE_URL` (Supabase pooled URI)

#### Belangrijkste Drizzle-tabellen


| Tabel | Doel |
| ----- | ---- |
| `invited_users` | Allowlist e-mails die OTP mogen aanvragen |
| `user` / `session` / `account` / `verification` | Better Auth-kern |
| `users` | App-profiel (rol, username, link `authUserId`) |
| `logbook_entries` | ASO-procedurelogboek |
| `spinal_logs` | SMASH |
| `marketplace` | Verlof-aanbiedingen |
| `user_preferences`, `user_bookmarks`, `user_notes` | Persoonlijke sync |
| `quiz_progress`, `content_audit_logs` | Quiz SRS + CMS-audit |
| `game_highscores`, `game_stats` | Flappy scores / counters |


### Supabase (content CMS — clientpad)

Client: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

Tabellen/RPC (o.a.): `protocols`, `blocks` (+ `body_regions`), `pocus`, `journal_club`, RPC `global_search`.

### Express API (samenvatting)

- Better Auth mount: `/api/auth/*`
- Beschermde routes: `requireAuth` (+ `rejectKioskWrites` waar nodig)
- Modules: preferences, bookmarks, notes, content-audit, quiz, marketplace, logboek, spinal-logs, highscores, game-stats
- Legacy: `POST /api/logbook/auth/login` → **410 Gone** (PIN uitgefaseerd)

Serverless entry: `api/index.js` → Express voor Vercel.

### Sessiebeheer — huidige praktijk


| Context | Mechanisme |
| ------- | ---------- |
| App-toegang | Better Auth e-mail OTP → **httpOnly cookie** (~90 dagen, sliding) |
| Logboek / SMASH / games / marketplace | Zelfde sessiecookie; server leest sessie via `auth.api.getSession` |
| Kiosk | Rol `kiosk`: CDS lezen, schrijf-API’s geweigerd |
| Legacy localStorage PIN-keys | Worden bij logout opgeruimd; niet meer de bron van waarheid |


---

## 5. Omgevingsvariabelen (productie-relevant)


| Variabele | Rol |
| --------- | --- |
| `DATABASE_URL` | Supabase Postgres (Drizzle + Better Auth) |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | Auth-config |
| `RESEND_API_KEY` / `AUTH_FROM_EMAIL` | OTP-mail |
| `AUTH_SEED_ADMIN_EMAIL` | Optionele admin-seed |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | CMS + search in de browser |
| `PORT` | Server listen (default 5000) |

Legacy (niet meer gebruiken): `VITE_APP_PIN`. Details: `docs/AUTH_ENV.md`.

CMS + server-tabellen zitten in **één** Supabase-Postgres (geen apart Neon/Redis meer).

---

## 6. Recente ontwikkelingen (git-highlights)

Chronologisch recent (samengevat):

1. **Better Auth e-mail OTP** — allowlist `invited_users`, rollen, kiosk, cookie-sessies; PIN uitgefaseerd
2. **SMASH spinal logbook** — Scandicaine vs Isobare Marcaine, failure reasons, dosis 1–5 ml
3. **ASO-logboek** — LRA + invasieve lijnen, supervisor-overzicht (sessie-based)
4. **Persoonlijke sync** — bookmarks, notes, preferences, quiz SRS
5. **KARA** — LRA atlas, referentie (dermatomen/osteotomen/plexus), EDRA-quiz
6. **PWA auto-update** via Vite Workbox
7. **CMS/Supabase** — split-pane editors, migratie, image compression, PDF upload
8. **Games** — Flappy (Postgres highscores), Anesthesiedle, Chasse Patate

---

## 7. Projectstructuur (compact)

```
Anesthesie-Kortrijk/
├── client/src/
│   ├── App.tsx              # AuthGuard + Wouter routes
│   ├── pages/               # Feature-pagina’s
│   ├── components/          # UI, calculators, KARA, games
│   ├── content/             # Lokale markdown
│   ├── data/                # logbook-tree, reference, quotes
│   ├── lib/                 # supabase, drugs, pediatric-config, …
│   └── pwa-register.ts
├── server/                  # Express + routes + db + vite middleware
├── shared/schema.ts         # Drizzle + Zod
├── api/                     # Vercel serverless bridge
├── public/                  # Icons, images, videos, manifest
├── vite.config.ts           # PWA + image optimizer
├── drizzle.config.ts
└── package.json
```

---

## 8. Bekende architectuurkeuzes / aandachtspunten

- **Content:** productie LRA/POCUS/Journal is **Supabase-gedreven**; lokale protocol-markdown blijft nuttig voor offline fallback en admin-migratie.
- **Blocks-map lokaal leeg:** bewust (migratie naar KARA/Supabase); `import.meta.glob` blijft voor backward-compat/migratie in admin.
- **Auth:** Better Auth e-mail OTP + allowlist + RBAC (`aso` / `staff` / `supervisor` / `kiosk` / `admin`). Geen gedeelde app-PIN meer. Details: `docs/AUTH_*.md`, `docs/ARCHITECTURE.md`.
- **PWA-manifest:** één bron — `VitePWA({ manifest: … })` in `vite.config.ts` → build genereert `/manifest.webmanifest` en injecteert de `<link rel="manifest">`. Het oude `public/manifest.json` is verwijderd (conflictte met andere naam/theme/icons).
- **Docs-rollen:** `README.md` (product + start), dit bestand (technische status), `docs/ARCHITECTURE.md` (ecosysteem), `DEVELOPMENT.md` (kort howto: markdown/PWA/taken — geen tweede STATUS).

---

*Statusdocument voor externe technische deling. Bron: repository state Anesthesie-Kortrijk (o.a. branch met Better Auth).*
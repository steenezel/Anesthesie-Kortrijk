# Anesthesie Kortrijk (AZ Groeninge) — Technische status

**Type:** Clinical Decision Support Progressive Web App (PWA)  
**Live:** [anesthesie-kortrijk.vercel.app](https://anesthesie-kortrijk.vercel.app)  
**Documentstatus:** augustus 2026 (afgeleid van huidige codebase + recente merges)

---

## 1. Architectuur & tech stack

### Core

| Laag | Technologie | Notitie |
|------|-------------|---------|
| UI | React **19.2** + TypeScript **5.6** | Strict client SPA |
| Build | Vite **7.1** | Root `vite.config.ts`; output `dist/public` |
| Styling | Tailwind CSS **4** + Radix UI / shadcn | Utility-first, mobile-first OR-gebruik |
| Routing | **Wouter** `^3.3.5` | Lichte SPA-routing; alle routes in `client/src/App.tsx` |
| Data fetching | TanStack React Query **5** | Cloud content + API-queries |
| Markdown | `react-markdown` + remark-gfm/math + rehype-katex/raw | Gedeelde `MarkdownRenderer` |
| Backend | Express **5** + `tsx` | Dev: Vite middleware; prod: static + API |
| Deploy | Vercel | Rewrites: `/api/*` → serverless; SPA fallback naar `index.html` |

### Belangrijke dependencies (`package.json`)

- **ORM / DB:** `drizzle-orm` `^0.39.3`, `drizzle-kit` `^0.31.4`, `postgres` / `pg`, `drizzle-zod` + `zod`
- **Cloud CMS:** `@supabase/supabase-js` `^2.49.1`
- **Realtime game-scores:** Postgres-tabellen `game_highscores` / `game_stats` (via Supabase/`DATABASE_URL`)
- **PWA:** `vite-plugin-pwa` `^0.21.1` (Workbox)
- **Images:** `vite-plugin-image-optimizer`, `browser-image-compression`, `sharp`
- **Sessies (package aanwezig):** `express-session`, `passport` / `passport-local`, `connect-pg-simple`, `memorystore` — **niet actief bedraad** in de huidige logboek-/SMASH-auth (zie §4)
- **Analytics:** `@vercel/analytics`

### Authenticatie (app-toegang)

- Globale **`AuthGuard`** in `App.tsx` wrapt de volledige router.
- PIN via `import.meta.env.VITE_APP_PIN`.
- Persistente unlock: `localStorage` key `ane_kortrijk_auth === "true"`.
- Foutieve PIN: shake + optionele `navigator.vibrate`.
- Dit is **geen** server-side sessie; het is client-side toegangsbescherming voor de CDS-app.

### Routing (Wouter) — hoofdmodules

| Pad | Module |
|-----|--------|
| `/` | Home (dashboard + easter-egg “koffiekot”) |
| `/protocols`, `/protocols/:id` | Protocollen (lokaal + Supabase merge) |
| `/blocks`, `/blocks/:id` | KARA LRA (atlas + detail) |
| `/blocks/referentie/*` | KARA Referentie (dermatomen, osteotomen, innervatie, plexus) |
| `/pocus`, `/pocus/:id` | POCUS (Supabase-first) |
| `/calculator` / `/calculators` | Calculator-hub |
| `/calculator/last\|apfel\|peds\|dantroleen\|painpump\|sedation-peds\|caprini` | Calculators |
| `/logbook` | ASO-logboek |
| `/smash` (+ aliases `/calculator(s)/spinal-logbook`) | SMASH spinale logboek |
| `/journalclub`, `/journalclub/:id` | Journal Club |
| `/onboarding`, `/onboarding/:type` | Onboarding staf/ASO |
| `/marketplace` | Verlof-marktplaats |
| `/search` | Globale zoek (Supabase RPC `global_search`) |
| `/admin` | Markdown CMS-editor |
| `/game`, `/wordle`, `/chasse-patate` | Minigames (easter eggs) |
| `/contacts`, `/checklist`, `/info` | Ondersteunende pagina’s |

### PWA / Service Worker / Workbox

Config in `vite.config.ts` via `VitePWA`:

- `registerType: "autoUpdate"`
- `injectRegister: false` — registratie via `client/src/pwa-register.ts` (`virtual:pwa-register`)
- Workbox: `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`
- Manifest (plugin): naam *Anesthesie Kortrijk*, theme `#0d9488`, icons 192/512
- Extra: `public/manifest.json` (standalone, portrait) — legacy/parallel aanwezig
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

| Locatie | Glob | Gebruik |
|---------|------|---------|
| `protocol-list.tsx` / `protocol-detail.tsx` | `../content/protocols/**/*.md` | Lijst + detail, merge met Supabase `protocols` |
| `blocks.tsx` / `block-detail.tsx` | `../content/blocks/*.md` | Fallback/migratie; productie-content = Supabase `blocks` |
| `journal-list.tsx` / `journal-detail.tsx` | `../content/journal-club/*.md` | Merge met `journal_club` |
| `onboarding.tsx` | `../content/*.md` | `onboarding.md` vs `onboarding-aso.md` via route-param |
| `admin-editor.tsx` | protocols glob | One-click migratie lokaal → Supabase |

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

| Calculator | Route | Functie |
|------------|-------|---------|
| **LAST** | `/calculator/last` | Cumulatieve toxiciteitsscore lokale anesthetica; max doses; Intralipid; patiënt-risicofactoren; follow-up dosing info |
| **Apfel** | `/calculator/apfel` | PONV-risico 4 factoren → % (10/21/39/61/79); waarschuwing bij score ≥ 3 |
| **Pediatrische doses** | `/calculator/peds` | Leeftijd/gewicht/lengte; **Eck**-tube diameter; **Cole** (cuffed/uncuffed); LMA; orale/nasale diepte; medicatietabellen uit `pediatric-config.ts`; safety lock &lt; 1 jaar (gewicht verplicht) |
| **Dantroleen** | `/calculator/dantroleen` | MH: 2.5 / 1 / 10 mg/kg → flacons + Aqua; stock-waarschuwing AZG |
| **Peds Sedatie MRI** | `/calculator/sedation-peds` | Dexdor + Atropine; IBW/AjBW bij obesitas |
| **Painpump** | `/calculator/painpump` | Looptijd, einddatum, bijvulling KLAC |
| **Caprini** | `/calculator/caprini` | DVT-risicoscore chirurgische patiënt |

Alle calculators zijn **client-side**; geen backend vereist.

### 3.2 Minigames / easter eggs

Toegang: **3× tikken** op de home-titel → dialoog **“Het koffiekot”**.

| Spel | Route | Details |
|------|-------|---------|
| **Flappy Anesthesist** | `/game` | Canvas-achtige Flappy-clone; Web Audio; highscores via Postgres `game_highscores`; globale pogingen-counter |
| **Anesthesiedle** | `/wordle` | Dagelijks 5-letterwoord (dag-van-jaar % wordlist); AZERTY; share emoji-grid |
| **Chasse Patate** | `/chasse-patate` | Wieler-thema galgje |

### 3.3 ASO-logboek (`/logbook`)

- Registratie van procedures: **LRA**, **Arterieel**, **Centraal** (boom in `logbook-tree.ts`).
- Rollen: `aso` | `supervisor`.
- Velden: categorie → subcategorie → techniek, status `pass`/`fail`, supervisieniveau, supervisornaam, notities, datum.
- Auth: PIN per gebruiker via `POST /api/logbook/auth/login`; sessie in `localStorage` (`ane_logbook_session`).
- Seeded users (server `DEFAULT_LOGBOOK_USERS`): zichtbare ASO’s + supervisor; testaccount gemarkeerd `hidden`.
- Views: eigen entries; supervisor-overzicht met filters; exportmogelijkheid in UI.

### 3.4 SMASH-module (`/smash`)

**SMASH** = *Scandicaine versus Marcaine: Anesthesia Spinal Hip* — prospectief spinale logboek (THP-trial context).

- Agenten: **Scandicaine** | **Isobare Marcaine**
- Dosis 1–5 ml (comma/punt-tolerant)
- Outcomes: time-to-surgery, surgical success, failure reasons (duur / motor / sensorisch), PACU-duur, urine retentie, opioïden PACU, notities
- Auth: hergebruik logboek-users + PIN; sessie in **`sessionStorage`** (`ane_spinal_log_session`); API headers `x-logbook-user-id` / `x-logbook-pin`
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

### PostgreSQL + Drizzle

- Schema: `shared/schema.ts`
- Config: `drizzle.config.ts` → dialect `postgresql`, migrations out `./migrations`
- Scripts: `db:push` / `postinstall` (`drizzle-kit push` indien `DATABASE_URL` gezet)
- Connectie: `server/db.ts` via `postgres` + `DATABASE_URL` (**Supabase** pooled URI)

#### Tabellen (Drizzle-schema)

| Tabel | Doel |
|-------|------|
| `users` | Logboek/SMASH-accounts (`username`, `password`, `pin`, `role` aso/supervisor) |
| `logbook_entries` | ASO-procedurelogboek |
| `spinal_logs` | SMASH spinale entries (serial PK, reals/booleans/timestamps) |
| `marketplace` | Verlof-aanbiedingen |

Validatie: Zod-schemas (`insertLogbookEntrySchema`, `insertSpinalLogSchema` met dose-preprocess, enz.).

### Supabase (content CMS — naast Drizzle)

Client: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

Gebruikte tabellen/RPC (o.a.): `protocols`, `blocks` (+ `body_regions`), `pocus` (gesplitste contentvelden), `journal_club`, RPC `global_search`.

### Game-scores (Postgres in Supabase)

Flappy-highscores en de globale pogingen-teller: tabellen game_highscores / game_stats via DATABASE_URL. Geen Redis meer.

### Express API-endpoints (`server/routes.ts`)

| Methode | Pad | Functie |
|---------|-----|---------|
| GET/POST/DELETE | `/api/marketplace` | Marktplaats CRUD |
| POST | `/api/logbook/auth/login` | PIN-login |
| POST | `/api/logbook/entries` | Nieuwe logboekregel |
| GET | `/api/logbook/my-entries` | Entries per userId |
| GET | `/api/logbook/supervisor/all` | Gefilterd overzicht |
| GET | `/api/logbook/users` | Gepubliceerde users (seed-whitelist) |
| GET/POST | `/api/spinal-logs` | SMASH lezen/schrijven (auth headers) |
| GET/POST | `/api/highscores` | Flappy leaderboard |
| GET/POST | `/api/game-stats` (+ `/increment`) | Globale pogingen |

Serverless entry: `api/index.js` exporteert de Express-app voor Vercel.

### Sessiebeheer — huidige praktijk

| Context | Mechanisme |
|---------|------------|
| App-toegang | `localStorage` `ane_kortrijk_auth` + env PIN |
| ASO-logboek | `localStorage` `ane_logbook_session` (public user object) |
| SMASH | `sessionStorage` `ane_spinal_log_session` (user + PIN voor API-headers) |
| Express-session / Passport | In dependencies & build-externalisatie, **niet** als actieve auth-laag voor bovenstaande modules |

---

## 5. Omgevingsvariabelen (productie-relevant)

| Variabele | Rol |
|-----------|-----|
| `VITE_APP_PIN` | Globale AuthGuard PIN |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | CMS + search |
| `DATABASE_URL` | Zelfde Supabase-project (Drizzle: logboek, SMASH, marketplace, games) |
| `PORT` | Server listen (default 5000) |

Neon en Redis zijn niet meer nodig: CMS + server-tabellen in één Supabase-Postgres.

---

## 6. Recente ontwikkelingen (git-highlights)

Chronologisch recent (samengevat):

1. **SMASH spinal logbook** — schema, API, UI, agenten Scandicaine/Isobare Marcaine, failure reasons, dosis 1–5 ml  
2. **ASO-logboek** — LRA + invasieve lijnen, rollen, seed-users, supervisor filters  
3. **Cloud content refresh** + markdown layout-verbeteringen  
4. **KARA Referentie** — dermatomen, osteotomen, zenuwfunctie, plexus  
5. **KARA LRA atlas** — body map, region markers, Supabase `body_regions`  
6. **PWA auto-update** via Vite Workbox (legacy SW vervangen)  
7. **CMS/Supabase** — split-pane editors, migratie tools, image compression, PDF upload, unified markdown renderer  
8. **Chasse Patate**, caudal shortcode, calculator route-fixes  

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

- **Content:** productie LRA/POCUS/Journal sterk **Supabase-gedreven**; lokale protocol-markdown blijft relevant voor offline + migratie.
- **Blocks-map lokaal leeg:** bewust; glob blijft voor backward-compat/migratiepaden in admin.
- **Dubbele manifesten:** VitePWA-manifest + `public/manifest.json` — bij brandingwijzigingen beide afstemmen.
- **Auth:** PIN-modellen zijn pragmatisch voor interne OR-tooling; geen OAuth/RBAC op app-niveau.
- **README/DEVELOPMENT.md** beschrijven deels oudere POCUS/blocks-flow; dit `STATUS.md` volgt de **huidige** code.

---

*Gegenereerd als statusdocument voor externe technische deling. Bron: repository state Anesthesie-Kortrijk.*

# Anesthesie Kortrijk

Clinical Decision Support **Progressive Web App** voor anesthesisten, ASO’s en OR-personeel van **AZ Groeninge, Kortrijk**.

Gebouwd voor snelle, betrouwbare toegang in de operatiezaal: protocollen, KARA (regionale anesthesie), POCUS, klinische calculators, logboeken en meer — met e-mail-OTP-login en offline PWA-ondersteuning.

**Live:** [anesthesie-kortrijk.be](https://anesthesie-kortrijk.be)  
Domein via Vimexx · hosting & deploys op [Vercel](https://vercel.com) · broncode op GitHub

| Document | Inhoud |
|----------|--------|
| **[STATUS.md](./STATUS.md)** | Actuele technische status (modules, API, auth, PWA) |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Ecosysteem: GitHub → Vercel → Supabase |
| **[docs/AUTH_ENV.md](./docs/AUTH_ENV.md)** | Omgevingsvariabelen voor login |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Kort howto: markdown, PWA, veelvoorkomende taken |

---

## Wat zit erin?

### Klinische content
- **Protocollen** per discipline (markdown + Supabase CMS, met lokale fallback)
- **KARA** — Kortrijk Academy of Regional Anesthesia: LRA-atlas (body map), block-guides, referentie (dermatomen, osteotomen, innervatie, plexus), EDRA-quiz
- **POCUS** — point-of-care echo (indicaties / techniek / interpretatie)
- **Journal Club** — literatuur per discipline
- **Onboarding** staf & ASO
- **Telefoonlijst** — one-tap bellen (intern AZG)
- **Globale zoek** over protocollen, blocks, POCUS en journal

### Calculators
| Calculator | Doel |
|------------|------|
| LAST | Toxiciteit lokale anesthetica + Intralipid |
| Pediatrische doses | Tubes (Eck & Cole), LMA, noodmedicatie; safety lock &lt; 1 jaar |
| Apfel | PONV-risico |
| Caprini | DVT-risico bij chirurgie |
| Dantroleen | Maligne hyperthermie (mg/kg → flacons) |
| Painpump | Looptijd / bijvulling KLAC |
| Peds sedatie MRI | Dexdor & Atropine (IBW / AjBW) |
| Acid-base | Zuur-base analyse |

### Logboeken & account
- **ASO-logboek** — registratie LRA & invasieve lijnen (pass/fail, supervisieniveau)
- **SMASH** — spinale trial-log (*Scandicaine versus Marcaine: Anesthesia Spinal Hip*)
- **Better Auth** — e-mail OTP via Resend; allowlist (`invited_users`); rollen `aso` · `staff` · `supervisor` · `kiosk` · `admin`
- **Kiosk-modus** — read-only CDS (geen schrijven naar logboek/CMS)
- Favorieten, notities, voorkeuren (gesynchroniseerd per gebruiker)
- Instellingen + marktplaats (verlof)

### PWA
- Installeerbaar op iOS/Android
- Workbox-cache + auto-update toast
- Manifest: één bron via `vite-plugin-pwa` → `/manifest.webmanifest`

---

## Tech stack

| Laag | Technologie |
|------|-------------|
| UI | React 19, Vite 7, TypeScript, Tailwind 4, Radix / shadcn |
| Routing | Wouter |
| Data fetching | TanStack Query |
| Auth | Better Auth (e-mail OTP) + Resend |
| API | Express 5 op Vercel (`/api/*`) |
| Server-DB | **Drizzle ORM** → Postgres (`DATABASE_URL`, zelfde Supabase-project) |
| CMS | Supabase JS (anon-key) → `protocols`, `blocks`, `pocus`, `journal_club` |
| PWA | vite-plugin-pwa (Workbox) |
| Deploy | Vercel Production → `anesthesie-kortrijk.be` |

### Twee wegen naar één database
1. **Server (Drizzle + Better Auth)** — login, sessies, allowlist, logboek, SMASH, favorieten, notities, gamescores  
2. **Client (Supabase anon)** — CDS-content lezen/schrijven via `/admin`

Details: [STATUS.md §4](./STATUS.md) · [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## Repository-structuur

```
Anesthesie-Kortrijk/
├── client/src/           # React PWA (pages, components, content/*.md)
├── server/               # Express, Better Auth, Drizzle-routes
├── shared/               # schema.ts + permissions (client + server)
├── api/                  # Vercel serverless entry → Express
├── docs/                 # Architectuur, auth cutover, invites
├── public/               # Icons, images, videos
├── vite.config.ts        # Vite + PWA-manifest
├── STATUS.md             # Actuele technische status
└── package.json
```

---

## Lokaal starten

**Vereisten:** Node.js 18+, npm 9+

```bash
git clone https://github.com/steenezel/Anesthesie-Kortrijk.git
cd Anesthesie-Kortrijk
npm install
```

Maak een `.env` in de projectroot (volledig overzicht: [docs/AUTH_ENV.md](./docs/AUTH_ENV.md)):

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:5000
RESEND_API_KEY=
AUTH_FROM_EMAIL=Anesthesie Kortrijk <onboarding@resend.dev>
AUTH_SEED_ADMIN_EMAIL=you@example.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

```bash
npm run dev          # http://localhost:5000  (Express + Vite)
npm run build        # productiebuild
npm run db:push      # Drizzle-schema → Postgres (indien DATABASE_URL)
npm run auth:seed    # optioneel: invites seed’en
npm run check        # TypeScript
```

**Allowlist:** alleen e-mails in `invited_users` mogen een OTP aanvragen. Beheer: [docs/INVITES_SUPABASE.md](./docs/INVITES_SUPABASE.md).

> Legacy `VITE_APP_PIN` en logboek-PIN-login zijn uitgefaseerd — gebruik e-mail OTP.

---

## Content beheren

### Productie (aanbevolen)
Ingelogde editors met CMS-rechten: **`/admin`** → schrijft naar Supabase (`protocols`, `blocks`, `pocus`, `journal_club`). Split-pane markdown, image-compressie, PDF-upload.

### Lokale markdown (fallback / migratie)
| Pad | Gebruik |
|-----|---------|
| `client/src/content/protocols/{discipline}/*.md` | Protocollen (merge met cloud) |
| `client/src/content/onboarding.md` | Onboarding staf |
| `client/src/content/onboarding-aso.md` | Onboarding ASO |
| `client/src/content/blocks/` | Leeg na migratie naar KARA/Supabase |

Media: `public/images/`, `public/videos/`. Markdown ondersteunt zoom-afbeeldingen en `video:`-embeds. Nieuwe lokale protocollen worden automatisch gevonden via `import.meta.glob`.

---

## Deploy & branches

| Branch | Effect |
|--------|--------|
| Featurebranch push | Vercel **Preview** (`*.vercel.app`) — veilig OTP/testen |
| Merge naar `main` | Vercel **Production** → [anesthesie-kortrijk.be](https://anesthesie-kortrijk.be) |

Auth cutover / zero-downtime: [docs/AUTH_CUTOVER.md](./docs/AUTH_CUTOVER.md) · [docs/AUTH_PREVIEW.md](./docs/AUTH_PREVIEW.md).

---

## Contributing

1. Branch vanaf `main`: `git checkout -b feature/…`
2. Commit & push → Preview-deploy controleren
3. Pull request → review → merge naar `main`

**Conventies:** TypeScript strict, ESLint, mobile-first UI voor 5–6″ schermen in de OK.

---

## Intended users

- Anesthesisten & staf — protocollen, calculators, KARA, SMASH  
- ASO’s — logboek, onboarding, quiz  
- OR / IZ — snelle naslag, telefoonlijst, LAST/MH  
- Kiosk — gedeeld toestel, alleen lezen  

---

## License

Proprietary software voor AZ Groeninge, Kortrijk. Alle rechten voorbehouden.

**Laatst bijgewerkt:** oktober 2026

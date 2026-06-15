# KARA Referentie — Technisch ontwerp

> **Doel:** een academische anatomie-atlas (Referentie) naast de klinische block-atlas, die uitgroeit tot een interactieve zenuwkaart met koppeling naar LRA-technieken.

**Status:** v1.0 — juni 2026  
**Eigenaar:** Dienst Anesthesie AZ Groeninge Kortrijk

---

## 1. Visie en scope

### 1.1 Twee werelden in KARA

| Module | Route | Doel | Gebruiker |
|--------|-------|------|-----------|
| **Atlas** | `/blocks` | Welk block wanneer? | Klinisch, OK |
| **Lijst** | `/blocks` (tab) | Zoeken op techniek | Klinisch |
| **Referentie** | `/blocks/referentie/*` | Anatomie bestuderen | Opleiding, naslag |

Referentie en Atlas delen **geen content**, wel **koppelingen** (zenuw → blocks).

### 1.2 Eindbeeld (“de droom”)

Interactieve, gelaagde anatomie-atlas:

1. **Dermatomen** — sensorische huidzones (C2–S5)
2. **Plexus-schema's** — logische diagrammen (brachiaal, lumbaal, sacraal)
3. **Motorische innervatie** — myotomen + klinische testen
4. **Regionale zenuwkaarten** — per lichaamsregio, drill-down
5. **Zenuwmonografieën** — bij elke structuur: herkomst, verloop, sensorisch/motorisch, uitvalbeeld, gekoppelde blocks

> **Belangrijk:** één platte kaart voor het hele lichaam op detailniveau is niet realistisch. De atlas werkt met **meerdere views + drill-down**.

---

## 2. Architectuur

### 2.1 Route-structuur

```
/blocks                          → Atlas (default) + Lijst
/blocks/referentie               → Referentie-hub
/blocks/referentie/dermatomen    → Dermatoomkaart (fase 1) ✓
/blocks/referentie/plexus        → Plexus-overzicht (fase 2)
/blocks/referentie/plexus/:id     → bv. brachiaal (fase 2)
/blocks/referentie/innervatie    → Motorische kaart (fase 3)
/blocks/referentie/zenuw/:id     → Zenuwmonografie (fase 3–4)
/blocks/referentie/regio/:id     → Regionale kaart UE/LE/trunk (fase 4)
```

### 2.2 Componentstructuur

```
client/src/
├── components/
│   ├── kara/
│   │   └── KaraShell.tsx              # Gedeelde KARA-header + tabnav
│   └── reference/
│       ├── ReferenceHub.tsx           # Overzicht modules
│       ├── InteractiveMapView.tsx     # Generieke kaart + hotspots + pan/zoom
│       ├── AnatomyDetailDrawer.tsx    # Detailpaneel (herbruikbaar)
│       ├── DermatomeMap.tsx           # Dermatoom-specifiek
│       ├── PlexusSchematic.tsx        # (fase 2) SVG-schema
│       └── RelatedBlocksList.tsx      # Links naar /blocks/:id
├── data/reference/
│   ├── types.ts                       # Gedeelde TypeScript-types
│   ├── dermatomes.ts                  # Fase 1: statische config
│   ├── plexus/                        # (fase 2)
│   └── nerves/                        # (fase 3+)
└── pages/
    ├── blocks.tsx
    ├── reference-hub.tsx
    └── reference-dermatomes.tsx
```

### 2.3 Data-evolutie

| Fase | Opslag | Reden |
|------|--------|-------|
| **1 — Dermatomen** | TypeScript-config (`dermatomes.ts`) | Snel, offline, weinig entries (~30) |
| **2 — Plexus** | TypeScript + SVG assets | Schema's zijn stabiel |
| **3+ — Zenuwen** | Supabase `reference_structures` | Veel entries, CMS, review-workflow |

Migratiepad: TS-config → Supabase via admin-editor, zonder UI-breaking changes.

---

## 3. Datamodel

### 3.1 Gedeeld type: `ReferenceStructure`

```typescript
interface ReferenceStructure {
  id: string;                    // "c6", "n-medianus", "truncus-superior"
  kind: "dermatome" | "plexus" | "nerve" | "root" | "trunk" | "division" | "cord" | "branch";
  label: string;                 // "C6"
  label_full?: string;             // "Dermatoom C6"
  parent_id?: string;              // hiërarchie

  origin?: string;                 // markdown — herkomst
  course?: string;                 // markdown — verloop
  sensory?: string;                // markdown
  motor?: string;                  // markdown
  clinical_deficit?: string;       // markdown — uitvalbeeld
  notes?: string;                  // markdown — pearls

  block_ids?: string[];            // UUID's uit blocks-tabel
  related_ids?: string[];          // gerelateerde structuren

  published: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
}
```

### 3.2 Kaart / hotspot: `MapView` + `Hotspot`

```typescript
interface MapView {
  id: string;                      // "dermatomes-front"
  label: string;                   // "Vooraanzicht"
  image_src: string;               // /images/reference/...
  image_width: number;             // intrinsic px (voor SVG-coördinaten)
  image_height: number;
  svg_viewbox?: string;            // optioneel voor native SVG
}

interface Hotspot {
  structure_id: string;            // → ReferenceStructure.id
  map_view_id: string;
  shape: "circle" | "polygon" | "svg-path";
  // circle (percentage van image, 0–100):
  x?: number;
  y?: number;
  r?: number;
  // polygon:
  points?: string;                 // "x1,y1 x2,y2 ..."
  // svg-path (preferred voor SVG-bron):
  svg_path_id?: string;            // id in SVG <path id="c6">
}
```

### 3.3 Supabase-schema (fase 3+)

```sql
-- docs/KARA-REFERENTIE-SCHEMA.sql

CREATE TABLE reference_structures (
  id text PRIMARY KEY,
  kind text NOT NULL,
  label text NOT NULL,
  label_full text,
  parent_id text REFERENCES reference_structures(id),
  origin text,
  course text,
  sensory text,
  motor text,
  clinical_deficit text,
  notes text,
  related_ids text[] DEFAULT '{}',
  published boolean DEFAULT false,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE reference_map_views (
  id text PRIMARY KEY,
  module text NOT NULL,            -- 'dermatomes' | 'plexus-brachial' | ...
  label text NOT NULL,
  image_src text NOT NULL,
  image_width int,
  image_height int,
  sort_order int DEFAULT 0
);

CREATE TABLE reference_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id text REFERENCES reference_structures(id),
  map_view_id text REFERENCES reference_map_views(id),
  shape text NOT NULL,
  geometry jsonb NOT NULL,           -- {x,y,r} of {points} of {svg_path_id}
  UNIQUE(structure_id, map_view_id)
);

CREATE TABLE reference_block_links (
  structure_id text REFERENCES reference_structures(id),
  block_id uuid REFERENCES blocks(id),
  PRIMARY KEY (structure_id, block_id)
);
```

---

## 4. UI-patronen

### 4.1 Interactieve kaart (`InteractiveMapView`)

- Achtergrondafbeelding (PNG of SVG)
- Hotspot-markers of SVG-paden met hover/active state
- Pinch-to-zoom + pan (touch-first, OK-gebruik)
- Legenda + optionele structuurlijst (toegankelijkheid)
- Tap → `AnatomyDetailDrawer`

### 4.2 Detailpaneel (`AnatomyDetailDrawer`)

Secties (vaste volgorde):

1. Titel + type-badge
2. Herkomst
3. Verloop
4. Sensorisch
5. Motorisch
6. Klinisch beeld bij uitval
7. **Gekoppelde LRA-technieken** → `RelatedBlocksList`
8. Gerelateerde structuren (links)

### 4.3 KARA-shell (`KaraShell`)

Gedeelde header voor Atlas, Lijst en Referentie — actieve tab op basis van route.

---

## 5. Faseringsplan

### Fase 1 — Dermatoomkaart (nu) 🍎

**Doel:** collega's opwarmen; bewijs dat Referentie werkt.

| Item | Detail |
|------|--------|
| Routes | `/blocks/referentie`, `/blocks/referentie/dermatomen` |
| Data | `dermatomes.ts` (~30 zones) |
| Afbeeldingen | **Door dienst aangeleverd** — front + back |
| Hotspots | Percentage-coördinaten; later SVG path-id's |
| Koppeling blocks | `block_ids` (optioneel, handmatig) |

**Definition of done:**
- [ ] Tab Referentie zichtbaar in KARA
- [ ] Interactieve kaart voor + achter
- [ ] Detailpaneel per dermatoom
- [ ] Minstens C2–T1 volledig ingevuld door dienst
- [ ] Werkt offline (PWA)

### Fase 2 — Plexus-schema's (4–6 weken)

| Item | Detail |
|------|--------|
| Routes | `/blocks/referentie/plexus`, `/blocks/referentie/plexus/:id` |
| Views | Brachiaal (eerst), daarna lumbaal/sacraal |
| Visualisatie | SVG met benoemde paden (geen body-silhouet) |
| Interactie | Hiërarchische boom: wortel → trunk → divisie → cord → tak |
| Drill-down | Tap op cord → highlight kind-takken |

### Fase 3 — Motorische innervatie (4 weken)

| Item | Detail |
|------|--------|
| Route | `/blocks/referentie/innervatie` |
| Data | Myotoom per niveau + klinische test |
| UI | Overlay op dermatoomkaart OF aparte kaart |
| Koppeling | `related_ids` naar dermatomen en zenuwen |

### Fase 4 — Regionale zenuwkaarten (6–8 weken)

| Item | Detail |
|------|--------|
| Routes | `/blocks/referentie/regio/upper-extremity`, etc. |
| Scope | ~80–120 LRA-relevante structuren |
| Navigatie | Hub → regio → kaart → zenuwmonografie |
| CMS | Supabase + admin-editor uitbreiding |

### Fase 5 — Volledige droom (doorlopend)

- Zoeken over alle structuren
- Cross-links dermatoom ↔ zenuw ↔ block
- Spaced-repetition / quiz (aparte module Opleiding)
- Portfolio-koppeling (toekomst)

---

## 6. Content-aanlevering (door dienst)

### 6.1 Dermatoomkaart — checklist

#### Afbeeldingen

| Bestand | Formaat | Specificatie |
|---------|---------|--------------|
| `dermatomes-front.png` of `.svg` | SVG preferred | Vooraanzicht, dermatoomgrenzen zichtbaar |
| `dermatomes-back.png` of `.svg` | SVG preferred | Achteraanzicht |

**SVG-eisen (ideaal):**
- Elke dermatoomzone = apart `<path>` met `id="c6"` (kleine letters)
- Geen tekst in SVG (labels via app)
- ViewBox vast, geen embedded raster

**PNG-eisen (alternatief):**
- Min. 1200px breed
- Witte/neutrale achtergrond
- Wij plaatsen hotspots via coördinaten (jij markeert zones desnoods in Figma)

#### Tekst per dermatoom (C2 t/m S5)

Per niveau, in markdown of Word:

```
Niveau: C6
Sensorisch gebied: ...
Bijbehorend myotoom / motoriek: ...
Klinisch beeld bij uitval: ...
Relevante wortels/zenuwen: ...
Gekoppelde LRA-technieken: ISB, interscalene, ... (namen volstaan)
Opmerkingen/pearls: ...
```

### 6.2 Plexus (fase 2)

- SVG per plexus, benoemde lagen per structuur
- Zelfde tekstvelden als `ReferenceStructure`

### 6.3 Review-workflow

1. Auteur schrijft / levert aan
2. Tweede anesthesist reviewt
3. `published: true` + `reviewed_by` in CMS
4. Errata via admin-editor

---

## 7. Technische keuzes

| Beslissing | Keuze | Motivatie |
|------------|-------|-----------|
| Kaart-rendering | HTML overlay op `<img>` of inline SVG | Past bij bestaande `BodyMapOverlay` |
| Zoom/pan | CSS transform + touch events (fase 1); library fase 4 | Geen extra dependency voor MVP |
| Content fase 1 | TypeScript config | Offline, git-versioned, reviewbaar |
| Content fase 3+ | Supabase | CMS, niet-dev auteurs |
| Anatomie-afbeeldingen | **Altijd door dienst** | Geen AI-generatie |
| Block-koppeling | `block_ids` UUID | Bestaande blocks-tabel |

---

## 8. PWA & performance

- Anatomy assets in `/public/images/reference/` — lazy load per route
- SVG's niet comprimeren (`compress-image.ts` slaat SVG over ✓)
- Richtlijn totale reference-bundle: < 5 MB
- Service worker: cache reference routes on first visit

---

## 9. Toegankelijkheid

- Hotspots: `aria-label` per zone
- Lijstweergave naast kaart (keyboard/talkback)
- Contrast markers ≥ WCAG AA op medische afbeeldingen
- Detailpaneel: semantische headings

---

## 10. Open punten

- [ ] Definitieve dermatoomkaart-bron (licentie documenteren)
- [ ] Wie reviewt content vóór publicatie?
- [ ] Nederlands vs. Latijn in labels (beide velden voorzien)
- [ ] Hotspot-editor in admin (fase 2–3)

---

## Bijlage A — Afbeeldingen aanleveren

**Ja — bezorg de inhoud.** Zonder jouw gevalideerde afbeeldingen en teksten publiceren we geen anatomische zones.

Minimaal voor live dermatoomkaart:
1. Twee afbeeldingen (voor + achter) — SVG met path-id's is het beste
2. Tekst per dermatoomniveau (template §6.1)
3. Optioneel: lijst welke blocks bij welk niveau horen

Hotspot-coördinaten kalibreren wij op basis van jouw definitieve afbeeldingen.

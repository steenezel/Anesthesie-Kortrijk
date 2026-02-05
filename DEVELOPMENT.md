Anesthesie Kortrijk - Development Dossier v0.8
1. Project-identiteit
• Naam: Anesthesie Kortrijk (AZ Groeninge)

• Type: Clinical Decision Support (CDS) PWA

• Doel: Snelle raadpleging van protocollen, loco-regionale technieken (Blocks) en klinische calculators voor anesthesisten en IZ-medewerkers.

2. Tech Stack
• Framework: React 19 + Vite 7 (TypeScript Strict Mode)

• Routing: `wouter` (lichtgewicht routing)

• Styling: Tailwind CSS v4

• UI Componenten: Radix UI, Shadcn UI, Lucide-React icons

• Content: Markdown-gestuurd (`react-markdown`)

• Interactie: Framer Motion (animaties), `react-medium-image-zoom` (voor klinische diagrammen)

• Build/PWA: `vite-plugin-pwa` (Workbox)

3. Architectuur & Navigatie
De app gebruikt een dynamische scan-architectuur voor content via `import.meta.glob`. Dit betekent dat bestanden in specifieke mappen automatisch in de navigatiemenu's verschijnen.

Belangrijke Pagina's:

• `Home.tsx`: De centrale hub.

• `ProtocolsPage.tsx` (`index.tsx`): Lijst van disciplines, gescand uit `client/src/content/protocols/`.

• `DisciplineDetail.tsx`: Lijst van ingrepen binnen een discipline.

• `Blocks.tsx`: Verticale lijst van LRA-technieken uit `client/src/content/blocks/`.

• `ProtocolDetail.tsx` & `BlockDetail.tsx`: De viewers voor de eigenlijke content.

4. Content Management (The Flat System)
Om de app schaalbaar te houden, gebruiken we een "platte" mappenstructuur.

Mappenstructuur:

• Protocollen: `client/src/content/protocols/{discipline}/{ingreep}.md`

• Blocks: `client/src/content/blocks/{block-naam}.md`

• Media:

  • Afbeeldingen: `public/images/protocols/`

  • Video's (MP4): `public/videos/blocks/`

Markdown Features:

• Images: `![Beschrijving](/images/protocols/beeld.png)` (automatisch zoombaar).

• Video: `video:/videos/blocks/demo.mp4` (wordt geparsed naar een inline videospeler).

5. PWA & Deployment (Vercel)
De app is geconfigureerd als een Progressive Web App voor offline gebruik in het OK.

Build Config (`vite.config.ts`):

• Workbox Limiet: Verhoogd naar 15-50MB om grote JavaScript-chunks (met alle protocollen) te ondersteunen.

• Exclusion: Video's worden nooit gecached in de PWA (`globIgnores`) om build-errors en trage laadtijden te voorkomen.

• Build Target: `dist/public`.

6. Design System (Kortrijkse Stijl)
De UI volgt een strakke, klinische esthetiek:

• Typografie: `font-black`, `uppercase`, `tracking-tighter` voor koppen. `tracking-widest` voor secundaire info.

• Kleuren: Slate/Teal basis.

• Interactie: `active:scale-[0.98]` op alle knoppen voor haptische feedback.

7. Bekende issues & Technical Debt
• Linting: Er zijn ongebruikte imports die de build niet blokkeren maar ooit opgekuist moeten worden.

• PWA Cache: Bij zeer veel afbeeldingen moet de `maximumFileSizeToCacheInBytes` in `vite.config.ts` mogelijk verder verhoogd worden.

• Video Compressie: Video's moeten handmatig gecomprimeerd worden (<15MB) voor ze gepusht worden.

---

Laatste Update: 2026-02-04
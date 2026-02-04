Anesthesie Kortrijk - Development Dossier v2.0
1. Project-identiteit
Naam: Anesthesie Kortrijk (AZ Groeninge)

Type: Clinical Decision Support (CDS) PWA

Doel: Snelle raadpleging van protocollen, loco-regionale technieken (Blocks) en klinische calculators.

2. Tech Stack
Framework: React 19 + Vite 7 (TypeScript Strict Mode)

Routing: wouter (lichtgewicht routing)

Styling: Tailwind CSS v4

UI Componenten: Radix UI, Shadcn UI, Lucide-React icons

Content: Markdown-gestuurd (react-markdown)

Interactie: Framer Motion (animaties), react-medium-image-zoom (voor klinische diagrammen)

Build/PWA: vite-plugin-pwa (Workbox)

3. Architectuur & Navigatie
De app gebruikt een dynamische scan-architectuur voor content via import.meta.glob. Bestanden in specifieke mappen verschijnen automatisch in de menu's.

Belangrijke Pagina's:
Home.tsx: De centrale hub.

ProtocolsPage.tsx: Lijst van disciplines, gescand uit client/src/content/protocols/.

DisciplineDetail.tsx: Lijst van ingrepen binnen een geselecteerde discipline.

Blocks.tsx: Verticale lijst van LRA-technieken uit client/src/content/blocks/.

ProtocolDetail.tsx & BlockDetail.tsx: De viewers voor de Markdown-content.

4. Content Management (The Flat System)
Er wordt gewerkt met een "platte" mappenstructuur om navigatie-fouten te voorkomen.

Mappenstructuur:
Protocollen: client/src/content/protocols/{discipline}/{ingreep}.md

Blocks: client/src/content/blocks/{block-naam}.md

Media:

Afbeeldingen: public/images/protocols/

Video's (MP4): public/videos/blocks/

Markdown Features:
Images: ![Beschrijving](/images/protocols/beeld.png) (automatisch zoombaar via de img component override).

Video: video:/videos/blocks/demo.mp4 (wordt geparsed naar een inline videospeler via de p tag override).

5. PWA & Deployment (Vercel)
De app is geoptimaliseerd voor offline gebruik in het operatiekwartier.

Build Config (vite.config.ts):
Workbox Limiet: De cache-limiet is verhoogd naar 15-50MB om de gecombineerde JavaScript-chunks te ondersteunen.

Exclusion: Video's worden uitgesloten van de PWA-precache (globIgnores) om build-crashes te vermijden.

Build Target: De plugin scant enkel de dist/public map na de build.

6. Design System (Kortrijkse Stijl)
De UI volgt een strakke, klinische esthetiek:

Typografie: font-black, uppercase, tracking-tighter voor koppen. tracking-widest voor secundaire info.

Kleuren: Slate/Teal basis met kleur-gecodeerde iconen per categorie op de homepagina.

Interactie: active:scale-[0.98] op alle knoppen voor directe haptische feedback.

7. Bekende issues & Technical Debt
PWA Cache: Bij een sterke toename van afbeeldingen moet de maximumFileSizeToCacheInBytes mogelijk verder verhoogd worden.

Video Compressie: Video's moeten gecomprimeerd worden (<15MB) voor optimale laadtijden op ziekenhuis-Wi-Fi.

Laatste Update: 4 februari 2026
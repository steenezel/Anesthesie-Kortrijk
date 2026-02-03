Project: Anesthesie Kortrijk (CDS Tool)
Doel: Clinical Decision Support voor anesthesisten in AZ Groeninge.

🛠️ Technische Architectuur
Frontend: React 19 met Vite 7.

Styling: Tailwind CSS v4 (Modernste engine, geconfigureerd via @import in index.css).

Database & Server: Express server met Drizzle ORM en PostgreSQL (beheerd via drizzle-kit).

PWA: Geconfigureerd voor offline gebruik via vite-plugin-pwa. Iconen bevinden zich in /public/icon-192.png en /public/icon-512.png.

📂 Content Management & Routing
Locatie: Alle protocollen staan in client/src/content/protocols/.

Routing: Gebruikt een platte URL-structuur via wouter.

Pad: /protocols/:id (waarbij :id de exacte bestandsnaam is).

Matching: ProtocolDetail.tsx scant de volledige content-map en matcht bestanden op basis van de bestandsnaam, ongeacht de submap (orthopedie, urologie, etc.).

⚙️ Build & Optimalisatie
Vercel: Gebruikt vercel.json met een "catch-all rewrite" naar index.html om 404-fouten bij diepe links (SPA-routing) te voorkomen.

Images: ViteImageOptimizer zorgt voor automatische .webp conversie (kwaliteit 75%) van alle klinische afbeeldingen.

Plugins: Bevat metaImagesPlugin (voor automatische generatie van metadata/social images).

⚠️ Belangrijk bij aanpassingen
Nieuwe Protocollen: Voeg een .md bestand toe aan een submap in content/protocols/. Gebruik unieke bestandsnamen.

Links: Gebruik altijd /protocols/bestandsnaam (zonder de mapnaam in de URL).

Cross-links: Gebruik de ?from= parameter voor terugkeer-logica (bijv. /blocks/tap?from=/protocols/cystectomie).
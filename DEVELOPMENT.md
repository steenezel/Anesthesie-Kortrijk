# Anesthesie Kortrijk - Development Dossier v1.0

A comprehensive technical guide for developers working on the Anesthesie Kortrijk Clinical Decision Support PWA.

---

## 1. Project Identity

**Project Name**: Anesthesie Kortrijk (AZ Groeninge)

**Type**: Clinical Decision Support (CDS) Progressive Web App

**Purpose**: Enable rapid access to clinical protocols, regional anesthesia techniques (blocks), and dosing calculators for anesthesiologists, OR nurses, and ICU staff at AZ Groeninge Kortrijk hospital.

**Target Environment**: 
- iOS/Android devices (5-6" screens)
- Operating Theater (OR) - high-stress, time-critical
- Offline capability mandatory
- Real-time protocol & calculation access

**Live Deployment**: [anesthesie-kortrijk.vercel.app](https://anesthesie-kortrijk.vercel.app)

---

## 2. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | UI framework with hooks |
| **Vite** | 7.x | Lightning-fast build tool & dev server |
| **TypeScript** | 5.x | Strict mode - no `any` types |
| **Node.js** | 18+ | Runtime & package management |

### Styling & Components
| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Radix UI** | Unstyled, accessible components (Dialog, Dropdown, etc.) |
| **shadcn/ui** | Pre-built, customizable Radix-based components |
| **Lucide React** | Lightweight icon library (~300 icons) |

### State & Routing
| Technology | Purpose |
|-----------|---------|
| **wouter** | Minimalist client-side routing (< 2KB) |
| **React Context** | State management (if needed for global state) |

### Content & Media
| Technology | Purpose |
|-----------|---------|
| **react-markdown** | Parse & render markdown protocols |
| **react-medium-image-zoom** | Click-to-zoom medical diagrams |
| **Framer Motion** | Smooth page transitions & animations |
| **Custom Video Parser** | Inline video player for `video://` syntax |

### Build & Deployment
| Technology | Purpose |
|-----------|---------|
| **vite-plugin-pwa** | PWA manifest, service worker (Workbox) |
| **Vercel** | Deployment platform with automatic builds |
| **ESLint** | Code quality enforcement |
| **Prettier** | Code formatting (optional) |

---

## 3. Architecture & Navigation

### Dynamic Content Scanning

The app uses **`import.meta.glob`** to automatically discover and load markdown files:

```typescript
// Example: Dynamic protocol discovery
const protocols = import.meta.glob('/src/content/protocols/**/*.md', { eager: true });
// → Automatically finds: Cardiac.md, Neuro.md, Pediatric.md, etc.
```

**Benefit**: Add a new protocol file → it appears in menus instantly. No hardcoded lists.

### Key Pages

#### **Home.tsx** (Landing)
- Welcome screen
- Quick-access buttons to main modules
- App info & hospital branding
- PWA install prompt

#### **ProtocolsPage.tsx** (Protocol Hub)
- Lists all **disciplines** (Cardiac, Neuro, Pediatric, etc.)
- Scans `client/src/content/protocols/{discipline}/`
- Dynamic folder structure = dynamic menu

#### **DisciplineDetail.tsx** (Procedures)
- Lists all procedures under a discipline
- Example: Cardiac → "Coronary Surgery", "CABG", "Valve Replacement"
- Filters protocols by selected discipline

#### **ProtocolDetail.tsx** (Viewer)
- Renders markdown-driven protocol content
- Auto-zoomable images
- Embedded videos via `video://` syntax
- Responsive typography & tables

#### **Blocks.tsx** (Regional Anesthesia)
- Lists all regional anesthesia techniques (nerve blocks, neuraxial)
- Alphabetically sorted or by body region
- Links to detailed block guides

#### **BlockDetail.tsx** (Block Viewer)
- Step-by-step technique instructions
- Anatomy diagrams (auto-zoomable)
- Video demonstrations
- Safety considerations & complications

#### **pocus-list.tsx** (POCUS hub)
- Lists all POCUS exams
- Scans client/src/content/pocus/{pocus}/
- Dynamic menu

#### **pocus-detail.tsx** (POCUS procedures)
- Indications and anatomy
- Techniques for acquisition
- Interpretation of images, algorithms

#### **Calculators/**
- **PediatricCalculator.tsx**: Eck & Cole formula-based dosing
- **LASTCalculator.tsx**: Toxicity scoring for local anesthetics
- Self-contained, no external API calls

#### **Contacts.tsx** (Phone Directory)
- Hospital extension list
- One-tap dialing
- Auto-prefixes: `+325663xxxx` (Belgian format)

---

## 4. Content Management System

### Directory Structure

```
client/src/content/
├── protocols/
│   ├── Cardiac/
│   │   ├── CABG.md
│   │   ├── Valve-Replacement.md
│   │   └── ACS.md
│   ├── Neuro/
│   │   ├── Craniotomy.md
│   │   └── Spine-Surgery.md
│   ├── Pediatric/
│   │   └── Neonatal-Surgery.md
│   └── Trauma/
│       └── Massive-Transfusion.md
└── blocks/
|   ├── Interscalene-Block.md
|    ├── Femoral-Block.md
|   ├── TAP-Block.md
|   └── Spinal-Anesthesia.md
|__ pocus/
    |- Gastric
    |- TCD
    |- IVC    

public/
├── images/
│   ├── protocols/
│   │   ├── cardiac-anatomy.png
│   │   └── ultrasound-guidance.jpg
│   └── blocks/
│       ├── interscalene-anatomy.png
│       └── landmark-palpation.jpg
└── videos/
    ├── blocks/
    │   ├── femoral-block-demo.mp4
    │   └── spinal-technique.mp4
    └── calculators/
        └── pediatric-formula-explanation.mp4
```

### Protocol Markdown Format

#### Basic Structure
```
# CABG (Coronary Artery Bypass Grafting)

## Overview
Brief clinical context...

## Pre-operative Assessment
- Lab requirements
- Imaging
- Patient counseling

## Anesthetic Technique
### Induction
- Pre-oxygenation
- Drug selection & dosing

### Maintenance
- Volatile vs TIVA
- Monitoring requirements

## Special Considerations
- CPB involvement
- Coagulation management
- Post-operative management

## References
- Article title (Year)
- Guidelines link
```

#### Markdown Features

**Images** (auto-zoomable):
```
![Coronary Anatomy - LAD, LCx, RCA](/images/protocols/cardiac-anatomy.png)
```

**Videos** (inline player):
```
## Video Demonstration
video:/videos/blocks/femoral-block-demo.mp4
```

**Tables**:
```
| Drug | Dose (mg/kg) | Max Dose | Duration |
|------|-------------|----------|----------|
| Propofol | 2-3 | 200mg | 5-15 min |
| Etomidate | 0.2-0.3 | 20mg | 5-10 min |
```

**Lists & Formatting**:
- Use standard markdown: `**bold**`, `_italic_`, `code`
- Headings: `#`, `##`, `###` (no H1 in protocols)
- Blockquotes: `>` (for clinical pearls)

### Block Markdown Format

```
## Femoral Nerve Block (FNB)

### Anatomy
- Femoral nerve origin & course
- Anatomical landmarks
- Fascial planes diagram

### Indications
- Femoral fracture analgesia
- Knee surgery
- Thigh procedures

### Technique

#### Landmarks
1. Locate inguinal ligament
2. Palpate femoral pulse
3. Needle insertion 1cm lateral to pulse

#### Ultrasound Approach
- Probe placement description
- Needle guidance (in-plane vs out-of-plane)
- Target nerve appearance on US

#### Video Tutorial
video:/videos/blocks/femoral-block-demo.mp4

### Complications & Management
- Femoral artery puncture → Direct pressure, monitor for expanding hematoma
- Nerve injury → Ultrasound verification, avoid paresthesia

### Safety Pearls
> Never inject without clear visualization of needle placement on ultrasound
```

---

## 5. PWA & Offline Architecture

### Progressive Web App Configuration

#### manifest.json
```
{
  "name": "Anesthesie Kortrijk",
  "short_name": "AK",
  "description": "Clinical Decision Support for OR staff",
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#1f2937",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

#### Service Worker (Workbox)

**vite.config.ts Configuration**:
```
typescript
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/*.mp4', '**/videos/**'],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg)$/,  
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      },
      manifest: { /* ... */ }
    })
  ]
});
```

**Key Points**:
- **Videos excluded**: `globIgnores: ['**/*.mp4']` → Videos NOT cached locally
- **Max cache size**: 50MB → Accommodates all protocols + images
- **Cache strategy**: CacheFirst for images, Network-first for API calls
- **Auto-update**: Service worker updates silently in background

#### Offline Capability

Users can:
1. **Install as native app**: "Add to Home Screen" on iOS/Android
2. **Work offline**: All protocols, calculators, blocks available without internet
3. **Sync on reconnect**: Videos load when network returns

#### Cache Invalidation

When deploying new content:
```
# Vercel auto-handles cache busting with unique commit SHA
npm run build
# → dist/ files get new hashes
# → Old service worker versions are retired
```

---

## 6. State Management

### Current Approach: Minimal State

**No Redux/Zustand by default** — Keep it simple:

```
typescript
// Example: Using Context for calculator state
import { createContext, useState } from 'react';

const CalculatorContext = createContext();

export function CalculatorProvider({ children }) {
  const [patientWeight, setPatientWeight] = useState(0);
  const [selectedDrug, setSelectedDrug] = useState('propofol');

  return (
    <CalculatorContext.Provider value={{ patientWeight, setPatientWeight, selectedDrug, setSelectedDrug }}>
      {children}
    </CalculatorContext.Provider>
  );
}
```

**If more complex state is needed**:
- Consider **Zustand** (~2KB, minimal boilerplate)
- Example: Bookmarked protocols, calculator history

---

## 7. Component Architecture

### Folder Structure
```
client/src/
├── components/
│   ├── ui/                    # Radix + shadcn components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   └── Card.tsx
│   ├── features/              # Domain-specific components
│   │   ├── ProtocolViewer.tsx
│   │   ├── CalculatorForm.tsx
│   │   └── BlockSelector.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
├── pages/
├── hooks/                     # Custom React hooks
│   ├── useProtocols.ts
│   ├── useCalculate.ts
│   └── useOffline.ts
├── utils/
│   ├── markdown-parser.ts
│   ├── dosing-formulas.ts
│   └── format-phone.ts
└── types/
    └── index.ts               # TypeScript interfaces
```

### Component Best Practices

**Functional Components Only**:
```
typescript
export function ProtocolViewer({ protocolId }: { protocolId: string }) {
  const [protocol, setProtocol] = useState(null);
  
  useEffect(() => {
    // Load protocol
  }, [protocolId]);

  return (
    <div className="prose prose-sm">
      {/* Render markdown */}
    </div>
  );
}
```

**Avoid Props Drilling**:
- Use Context for deeply nested state
- Keep component props focused & single-responsibility

**Tailwind Classes**:
```
typescript
// ✅ Good: Organized, responsive
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:text-base text-sm transition-colors">
  Submit
</button>

// ❌ Avoid: String concatenation
const buttonClass = "px-4 py-2 " + colorClass + " rounded-lg";
```

---

## 8. Calculators: Implementation Guide

### Pediatric Dosing Calculator

**Formula**: Weight-based dosing using Eck & Cole

```
typescript
// dosing-formulas.ts
export function calculatePediatricWeight(age: number): number {
  if (age < 1) return (3 + age * 4); // Infant formula
  if (age < 10) return (age * 2 + 8);
  if (age < 14) return (age * 3 + 2);
  return age * 3.5; // Adolescent
}

export function calculateDose(
  weight: number,
  drug: 'propofol' | 'fentanyl' | 'rocuronium',
  category: 'induction' | 'maintenance'
): number {
  const doses = {
    propofol: { induction: 2.5, maintenance: 0.1 },
    fentanyl: { induction: 0.001, maintenance: 0.0005 },
    rocuronium: { induction: 1.2, maintenance: 0 }
  };

  return weight * doses[drug][category];
}
```

**Safety Locks**:
```
typescript
// Prevent overdosing neonates
if (weight < 3.5 && calculatedDose > maxNeonatalDose) {
  setError('⚠️ Dose exceeds neonatal safety limit. Verify weight.');
  return;
}
```

### LAST (Local Anesthetic Systemic Toxicity) Calculator

```
typescript
export function calculateLASTToxicity(
  agent: 'lidocaine' | 'bupivacaine',
  doseUsed: number,
  patientWeight: number
): { toxicityScore: number; risk: string } {
  const maxDoses = {
    lidocaine: 4.5,
    bupivacaine: 2.75
  };

  const maxDose = maxDoses[agent] * patientWeight;
  const toxicityScore = (doseUsed / maxDose) * 100;

  return {
    toxicityScore,
    risk: toxicityScore > 100 ? 'CRITICAL' : toxicityScore > 80 ? 'HIGH' : 'SAFE'
  };
}
}
```

---

## 9. Markdown Parsing & Video Rendering

### Custom Markdown Parser

```
typescript
// markdown-parser.ts
import ReactMarkdown from 'react-markdown';
import ImageZoom from 'react-medium-image-zoom';

export function ProtocolMarkdown({ content }: { content: string }) {
  // Convert video:// syntax to HTML
  const processedContent = content.replace(
    /video:\/\/(.*?\.mp4)/g,
    (_, path) => `<video-embed src="${path}"></video-embed>`
  );

  return (
    <ReactMarkdown
      components={{
        img: ({ src, alt }) => (
          <ImageZoom>
            <img src={src} alt={alt} className="rounded-lg shadow-md" />
          </ImageZoom>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-6 mb-3 border-l-4 border-blue-500 pl-3">
            {children}
          </h2>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              {children}
            </table>
          </div>
        )
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
```

### Video Embed Component

```
typescript
export function VideoEmbed({ src }: { src: string }) {
  return (
    <div className="my-6 rounded-lg overflow-hidden shadow-lg">
      <video
        controls
        className="w-full bg-black"
        controlsList="nodownload"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
```

---

## 10. Deployment & CI/CD

### Vercel Deployment

#### vercel.json
```
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "@anesthesie_api_url"
  }
}
```

#### GitHub Actions (Optional)
```
name: Build & Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run type-check
```

### Environment Variables

Create `.env.local` for development:
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Anesthesie Kortrijk (Dev)
```

Production variables set in Vercel dashboard.

---

## 11. Testing (Recommended Setup)

### Unit Tests (Vitest + React Testing Library)

```
typescript
// __tests__/dosing-formulas.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePediatricWeight } from '../utils/dosing-formulas';

describe('Pediatric Weight Calculation', () => {
  it('calculates weight for 6-month-old infant', () => {
    expect(calculatePediatricWeight(0.5)).toBe(5); // 3 + 0.5*4
  });

  it('calculates weight for 5-year-old', () => {
    expect(calculatePediatricWeight(5)).toBe(18); // 5*2 + 8
  });
});
```

### E2E Tests (Playwright)

```
typescript
// e2e/protocols.spec.ts
import { test, expect } from '@playwright/test';

test('load protocol and zoom image', async ({ page }) => {
  await page.goto('/protocols/cardiac/cabg');
  
  const image = page.locator('img').first();
  await image.click();
  
  const zoomedImage = page.locator('.medium-zoom-image');
  await expect(zoomedImage).toBeVisible();
});
```

---

## 12. Design System & Tailwind Configuration

### Tailwind Config

```
typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: '#0066cc',
          red: '#dc3545',
          green: '#28a745',
          warning: '#ffc107'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            'h2': { marginTop: '1.5em', marginBottom: '0.5em', fontWeight: '700' },
            'code': { backgroundColor: '#f3f4f6', padding: '0.25em 0.5em', borderRadius: '0.25em' }
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
```

### Color Palette

**Clinical Aesthetic**:
- Primary: Blue (`#0066cc`) — Trust, medical authority
- Danger: Red (`#dc3545`) — LAST, toxicity warnings
- Success: Green (`#28a745`) — Safe dosing range
- Warning: Yellow (`#ffc107`) — Check limits, cautions

---

## 13. Common Development Tasks

### Adding a New Protocol

1. Create file: `client/src/content/protocols/Discipline/Protocol-Name.md`
2. Write markdown with standard structure
3. Add images to `public/images/protocols/`
4. Push to GitHub → Vercel auto-deploys
5. File auto-appears in app menu

### Adding a Regional Block

1. Create: `client/src/content/blocks/Block-Name.md`
2. Structure: Anatomy → Indications → Technique → Complications
3. Add ultrasound images & video demo
4. Commit → Auto-deployed

### Updating Dosing Formula

1. Edit `client/src/utils/dosing-formulas.ts`
2. Update calculator component if needed
3. Add unit tests in `__tests__/`
4. Verify with example weights
5. Deploy & verify calculator output

### Optimizing Bundle Size
```
# Analyze bundle
npm run build
npm install -g vite-plugin-visualizer
# Output: dist/stats.html
```

**Common optimizations**:
- Lazy-load video players: `import VideoEmbed from 'react-lazy-load'`
- Tree-shake unused Lucide icons
- Use CSS Grid instead of Tailwind utility overflow

---

## 14. Troubleshooting & Performance

### Development Server Issues

**Issue**: Hot reload not working
```
# Kill port 5173
lsof -i :5173
kill -9 <PID>

# Restart
npm run dev
```

**Issue**: Tailwind classes not applying
```
# Clear cache
rm -rf node_modules/.cache
npm run dev
```

### PWA Caching Issues

**Issue**: Old version cached on user device
- Users: Force refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Deployment: Vercel auto-invalidates on commit SHA change

**Issue**: Video not playing offline
- **Expected**: Videos NOT cached intentionally (too large)
- **Solution**: Only watch demos on WiFi, or reduce video file size

### Performance Monitoring
```
typescript
// Monitor page load
useEffect(() => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log(`Page loaded in ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
}, []);
```

**Target metrics**:
- **FCP** (First Contentful Paint): < 1s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 15. Security & HIPAA Considerations

### Data Protection

⚠️ **Important**: Anesthesie Kortrijk does NOT store patient data locally.

**Current**: All content is educational, no patient information stored.

**If expanding to patient-facing features**:
- Encrypt sensitive data in localStorage: `crypto-js`
- Use HTTPS only (Vercel enforces)
- Implement authentication: OAuth2 via hospital SSO
- Audit logs for compliance

### Content Security Policy
```
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

---

## 16. Resources & Learning

### Official Documentation
- [React 19 Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction)

### PWA & Offline
- [Web Dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Medical Reference
- [Eck & Cole Pediatric Formulas](https://example.com)
- [ASRA Regional Anesthesia Guidelines](https://www.asra.com)
- [LAST Management Protocol](https://example.com)

---

## 17. Git Workflow & Contributing

### Branch Naming
- Feature: `feature/add-cardiac-protocols`
- Bugfix: `fix/calculator-rounding-error`
- Docs: `docs/update-development-guide`

### Commit Messages
```
git commit -m "Add CABG protocol with video demonstration"
git commit -m "Fix: pediatric weight calculation for infants < 3kg"
git commit -m "Docs: update PWA caching configuration"
```

### Pull Request Template
```
## Description
Brief explanation of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Protocol/content update
- [ ] Documentation

## Testing
How was this tested?

## Screenshots (if UI change)
Attach before/after screenshots
```

---

## 18. Roadmap & Future Enhancements

**Planned Features**:
- [ ] User accounts & bookmarked protocols
- [ ] Dark mode toggle
- [ ] Multilingual support (Dutch/French/English)
- [ ] Real-time collaboration on complex cases
- [ ] Integration with hospital EMR (single sign-on)
- [ ] AI-powered protocol search
- [ ] Push notifications for protocol updates

---

## 19. Support & Contact

**Technical Issues**: Open a GitHub issue in the repository  
**Feature Requests**: Discuss with clinical team (hospital)  
**Deployment Questions**: Contact Vercel support or repo maintainer  

---

**Last Updated**: March 2026 | **Version**: 1.0 | **Maintained by**: Steenezel
# Anesthesie App Kortrijk 🏥

A professional, high-performance **Clinical Decision Support (CDS) Progressive Web App** designed for anesthesiologists and OR staff at **AZ Groeninge, Kortrijk**. Optimized for quick access in the Operating Theater (OT), providing essential protocols, regional anesthesia techniques, clinical calculators, and emergency contact information.

**Live Demo**: [anesthesie-kortrijk.vercel.app](https://anesthesie-kortrijk.vercel.app)

---

## ✨ Key Features

### 📊 **Clinical Calculators**
- **Pediatric Dosing Calculator**: Accurate drug dosing and equipment sizing based on Eck and Cole formulas
- **Weight-based Calculations**: LAST toxicity scoring for local anesthetics
- **Safety Locks**: Built-in safeguards for neonates and infants (< 1 year)

### 📚 **Protocol Library**
- Comprehensive markdown-based clinical protocols organized by discipline
- **Image Zoom**: Click to enlarge medical diagrams and reference images
- **Video Support**: Embedded instructional videos for techniques
- **Fast Search**: Quick access to critical information

### 🗺️ **Regional Anesthesia Blocks (LRA Techniques)**
- Step-by-step guidance for peripheral nerve blocks and neuraxial techniques
- Anatomical illustrations and ultrasound-guided approaches
- Video demonstrations and safety considerations

### ☎️ **Smart Phone Directory**
- One-tap dialing for internal hospital extensions
- Automatic Belgian number prefixing (`+325663xxxx`)
- Optimized for rapid contact in emergencies

### 📱 **Offline Capability**
- Works completely offline as a PWA (Progressive Web App)
- Install as native app on iOS/Android
- Full access to all protocols and calculators without internet

---

## 🛠️ Technical Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Routing** | [wouter](https://github.com/molecula-js/wouter) (lightweight SPA routing) |
| **Content** | [React Markdown](https://github.com/remarkjs/react-markdown) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Image Zoom** | [react-medium-image-zoom](https://www.npmjs.com/package/react-medium-image-zoom) |
| **PWA/Caching** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```
steenezel/Anesthesie-Kortrijk/
├── client/
│   └── src/
│       ├── pages/              # Main app pages (Calculators, Protocols, Blocks, Contacts)
│       ├── content/
│       │   ├── protocols/       # Clinical protocols by discipline
│       │   └── blocks/          # Regional anesthesia technique guides
│       ├── components/          # Reusable React components
│       └── styles/              # Tailwind & global styles
├── public/
│   ├── images/                  # Medical reference diagrams & ultrasound guides
│   └── videos/                  # Instructional video files (MP4)
├── server/                      # Backend API (optional)
├── shared/                      # Shared types & utilities
├── script/                      # Utility scripts
├── vite.config.ts              # Vite & PWA configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- Modern browser (Chrome, Safari, Firefox, Edge)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/steenezel/Anesthesie-Kortrijk.git
   cd Anesthesie-Kortrijk
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 💻 Development Environments

This project is optimized for cloud development platforms:

- **[GitHub.dev](https://github.dev/steenezel/Anesthesie-Kortrijk)**: Press `.` on the repository page
- **[StackBlitz](https://stackblitz.com)**: Online VS Code alternative
- **Local Development**: VS Code with recommended extensions (ESLint, Tailwind CSS IntelliSense)

---

## 📝 Content Management

### Adding Clinical Protocols

1. Create a markdown file in `client/src/content/protocols/{discipline}/{procedure}.md`
2. Use standard markdown with support for:
   - **Images**: `![Alt text](/images/protocols/filename.png)` (auto-zoomable)
   - **Videos**: `video:/videos/blocks/demo.mp4` (inline player)
   - **Headings**: Use `##`, `###` for hierarchy
   - **Tables**: Standard markdown tables supported

### Adding Regional Anesthesia Blocks

1. Create a markdown file in `client/src/content/blocks/{block-name}.md`
2. Include anatomy, landmarks, technique steps, and safety notes
3. Add supporting images and videos as needed

### Media Guidelines

- **Images**: Place in `public/images/protocols/` (PNG/JPG, optimized)
- **Videos**: Place in `public/videos/blocks/` (MP4, < 50MB per file)
- **Formats**: Use descriptive filenames in lowercase with hyphens

---

## 🏗️ Architecture Highlights

### Dynamic Content Loading
The app uses `import.meta.glob` to automatically scan content directories, making it infinitely scalable for new protocols and blocks.

### PWA Configuration
- **Offline First**: All assets are cached using Workbox
- **Cache Limits**: 15-50MB JavaScript bundling for comprehensive protocol coverage
- **Video Exclusion**: Videos excluded from PWA cache to optimize performance
- **Install Prompt**: Users can install as a native app

### Design Philosophy
- **Clinical Aesthetic**: Clean, professional UI for high-stress environments
- **Mobile-First**: Optimized for 5-6" phones in the OR
- **Accessibility**: WCAG 2.1 AA compliance (dark mode supported)
- **Performance**: Sub-500ms load times for critical paths

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Anesthesie Kortrijk
```

### Tailwind Customization

Edit `tailwind.config.ts` to adjust:
- Color scheme
- Typography scales
- Spacing values
- Breakpoints

---

## 📖 For Developers

**→ See [DEVELOPMENT.md](./DEVELOPMENT.md)** for detailed technical documentation including:
- Advanced PWA configuration
- Markdown-driven content system
- Component architecture
- Build optimization strategies
- Deployment process

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Standards
- TypeScript strict mode required
- ESLint configuration enforced
- Tailwind CSS for all styling
- Mobile-responsive design mandatory

---

## 📜 License

This project is proprietary software for AZ Groeninge, Kortrijk. All rights reserved.

---

## 👨‍⚕️ Intended Users

- **Anesthesiologists**: Real-time protocol access, dosing calculations
- **OR Nurses**: Regional technique guidance, equipment sizing
- **Residents**: Educational protocols with detailed diagrams
- **ICU Staff**: Emergency protocols and LAST management

---

## 🐛 Troubleshooting

### PWA Not Installing?
- Clear browser cache: Settings > Storage > Clear
- Try incognito/private mode
- Ensure served over HTTPS (production only)

### Offline Issues?
- Check browser storage quota
- Verify videos are in exclusion list (`globIgnores`)
- Test in network tab for failed requests

### Performance Issues?
- Run `npm run build` to check bundle size
- Disable browser extensions
- Test with DevTools throttling (Slow 4G)

---

## 📞 Support

For issues, feature requests, or questions:
- **Email**: steenezel@example.com
- **Internal Wiki**: [AZ Groeninge Wiki](https://example.com)

---

**Last Updated**: March 2026 | **Version**: 1.0.0
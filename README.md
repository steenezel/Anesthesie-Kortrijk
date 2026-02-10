# Anesthesie App Kortrijk 🏥

A professional, high-performance web application designed for anesthesiologists at **AZ Groeninge, Kortrijk**. Optimized for quick access in the Operating Theater (OT), providing essential protocols, calculators, and contact information.

## 🚀 Features

- **Pediatric Calculator**: Accurate dosing and equipment sizing based on the Eck and Cole formulas, with safety locks for infants (< 1 year).
- **LAST Control**: Quick toxicity scoring for Local Anesthetics and immediate access to the Intralipid protocol.
- **Protocol Library**: Markdown-based clinical protocols with image zoom and video support.
- **Smart Phone List**: One-tap dialing for internal hospital extensions with automatic Belgian prefixing (`+325663xxxx`).
- **Responsive UI**: Tailored for mobile use in high-stress medical environments.

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Routing**: [wouter](https://github.com/molecula-js/wouter) (Minimalist SPA routing)
- **Deployment**: [Vercel](https://vercel.com/)

## 📂 Project Structure

- `/client/src/pages`: Individual application modules (Calculators, Contacts, Blocks).
- `/content`: Markdown files for protocols and onboarding.
- `/public/images`: Medical reference images and ultrasound guides.

## ⚙️ Development

This project is optimized for development within **GitHub.dev** or **StackBlitz**.

1. **Install dependencies**:
   ```bash
   npm install

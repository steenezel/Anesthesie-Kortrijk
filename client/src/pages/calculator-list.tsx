import { Link } from "wouter";
import { 
  ShieldAlert, Apple, ChevronRight, ChevronLeft, 
  Baby, ThermometerSun, Atom, Syringe, BadgeCheck, Calculator 
} from "lucide-react";

const calculators = [
  {
    id: "last",
    title: "LAST-Calculator",
    description: "Toxiciteit lokale anesthetica",
    path: "/calculator/last",
    icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
    status: "urgent" // Specifieke status voor functionele kleur
  },
  {
    id: "painpump",
    title: "Painpump",
    description: "Looptijd en bijvulling KLAC",
    path: "/calculator/painpump",
    icon: <Syringe className="h-5 w-5 text-teal-400" />,
  },
  {
    id: "caprini",
    title: "Caprini-Score",
    description: "DVT-risico bij chirurgie",
    path: "/calculator/caprini",
    icon: <BadgeCheck className="h-5 w-5 text-teal-400" />,
  },
  {
    id: "apfel",
    title: "Apfel-Score",
    description: "Risico op PONV",
    path: "/calculator/apfel",
    icon: <Apple className="h-5 w-5 text-teal-400" />,
  },
  {
    id: "peds",
    title: "Pediatrische doses",
    description: "Tubes, noodmedicatie,...",
    path: "/calculator/peds-calculator",
    icon: <Baby className="h-5 w-5 text-teal-400" />,
  },
  {
    id: "dantroleencalc",
    title: "Dantroleen",
    description: "Bij maligne hyperthermie",
    path: "/calculator/dantroleen",
    icon: <ThermometerSun className="h-5 w-5 text-orange-400" />,
    status: "emergency"
  },
  {
    id: "sedation-peds",
    title: "Peds Sedatie MRI",
    description: "Dexdor & Atropine voor MRI",
    path: "/calculator/sedation-peds",
    icon: <Atom className="h-5 w-5 text-teal-400" />,
  },
];

export default function CalculatorList() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-teal-500/30">
      {/* Top Glass Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center text-teal-400 font-bold uppercase text-[10px] tracking-[0.2em] cursor-pointer group">
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
              Terminal
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Calculator className="h-3 w-3 text-teal-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">v1.0.4-active</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-8">
        {/* Sleek Title Section */}
        <header className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white leading-none">
            ENGINE<span className="text-teal-500">.</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Clinical Computing Unit • AZ Groeninge
          </p>
        </header>

        {/* High-Density Grid */}
        <div className="grid gap-2">
          {calculators.map((calc) => (
            <Link key={calc.id} href={calc.path}>
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.98] cursor-pointer">
                
                {/* Functional Status Indicator */}
                {calc.status === 'urgent' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                )}
                {calc.status === 'emergency' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 border border-white/10 shadow-inner group-hover:border-teal-500/50 transition-colors">
                      {calc.icon}
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-sm uppercase tracking-wide">
                        {calc.title}
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        {calc.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* System Info */}
        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-500">System Ready</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Alle berekeningen zijn gevalideerd volgens de lokale protocollen van de vakgroep Anesthesie.
          </p>
        </div>
      </div>
    </div>
  );
}
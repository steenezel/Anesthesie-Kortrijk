import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldAlert, 
  Apple, 
  ChevronRight, 
  ChevronLeft, 
  Baby, 
  ThermometerSun, 
  Atom, 
  Syringe, 
  BadgeCheck,
  Calculator
} from "lucide-react";

const calculators = [
  {
    id: "last",
    title: "LAST-Calculator",
    description: "Toxiciteit lokale anesthetica",
    path: "/calculator/last",
    icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
    color: "bg-red-50/50",
    iconBg: "bg-red-100"
  },
  {
    id: "painpump",
    title: "Painpump",
    description: "Looptijd en bijvulling KLAC",
    path: "/calculator/painpump",
    icon: <Syringe className="h-5 w-5 text-amber-600" />,
    color: "bg-amber-50/50",
    iconBg: "bg-amber-100"
  },
  {
    id: "caprini",
    title: "Caprini-Score",
    description: "DVT-risico bij chirurgie",
    path: "/calculator/caprini",
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    color: "bg-emerald-50/50",
    iconBg: "bg-emerald-100"
  },
  {
    id: "apfel",
    title: "Apfel-Score",
    description: "Risico op PONV",
    path: "/calculator/apfel",
    icon: <Apple className="h-5 w-5 text-blue-600" />,
    color: "bg-blue-50/50",
    iconBg: "bg-blue-100"
  },
  {
    id: "peds",
    title: "Pediatrische doses",
    description: "Tubes, noodmedicatie,...",
    path: "/calculator/peds-calculator",
    icon: <Baby className="h-5 w-5 text-pink-600" />,
    color: "bg-pink-50/50",
    iconBg: "bg-pink-100"
  },
  {
    id: "dantroleencalc",
    title: "Dantroleen",
    description: "Maligne hyperthermie",
    path: "/calculator/dantroleen",
    icon: <ThermometerSun className="h-5 w-5 text-green-600" />,
    color: "bg-green-50/50",
    iconBg: "bg-green-100"
  },
  {
    id: "sedation-peds",
    title: "Peds Sedatie MRI",
    description: "Dexdor & Atropine",
    path: "/calculator/sedation-peds",
    icon: <Atom className="h-5 w-5 text-slate-600" />,
    color: "bg-slate-50/50",
    iconBg: "bg-slate-100"
  },
];

export default function CalculatorList() {
  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Mini Header */}
      <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <Link href="/">
          <div className="flex items-center text-teal-600 font-black uppercase text-[10px] tracking-widest cursor-pointer group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> 
            Home
          </div>
        </Link>
        <div className="flex items-center gap-2">
           <Calculator className="h-4 w-4 text-slate-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculators</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight uppercase text-slate-900 leading-none">
            Beslissingssteun
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">
            AZ Groeninge Kortrijk
          </p>
        </header>

        {/* High Density Grid/List */}
        <div className="grid grid-cols-1 gap-2">
          {calculators.map((calc) => (
            <Link key={calc.id} href={calc.path}>
              <div className={`group flex items-center justify-between p-3 rounded-2xl border border-slate-100 ${calc.color} active:scale-[0.98] transition-all cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <div className={`${calc.iconBg} p-2 rounded-xl shadow-sm group-hover:scale-105 transition-transform`}>
                    {calc.icon}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 uppercase text-xs tracking-tight">
                      {calc.title}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold leading-none mt-0.5 opacity-80">
                      {calc.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tip Footer */}
        <div className="mt-8 p-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Klinische Tip</p>
          <p className="text-xs font-medium leading-relaxed italic">
            "Dubbelcheck altijd de berekende dosis bij pediatrische patiënten en kritieke medicatie."
          </p>
        </div>
      </div>
    </div>
  );
}
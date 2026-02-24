import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  ChevronRight, 
  Syringe, 
  Tablets, 
  Phone, 
  Search,
  GraduationCap,
  Calculator,
  BookOpenCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { quotes } from "@/data/quotes";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

// @ts-expect-error: __BUILD_DATE__ is defined globally by Vite during the build process
const buildDate = __BUILD_DATE__;

const categories = [
  {
    title: "Protocollen",
    description: "Richtlijnen per discipline.",
    icon: BookOpen,
    href: "/protocols",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    isExternal: false
  },
  {
    title: "Blocks",
    description: "LRA tips",
    icon: Syringe,
    href: "/blocks",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    isExternal: false
  },
  {
    title: "Calculators",
    description: "LAST | Apfel | Pediatrie | Dantrium",
    icon: Calculator,
    href: "/calculator",
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    borderColor: "border-teal-200",
    isExternal: false
  },
  {
    title: "Telefoonlijst",
    description: "Interne nummers.",
    icon: Phone,
    href: "/contacts",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    borderColor: "border-orange-200",
    isExternal: false
  },
  {
    title: "Onboarding",
    description: "Info voor assistenten & staf.",
    icon: GraduationCap,
    href: "/onboarding",
    color: "bg-slate-700",
    lightColor: "bg-slate-50",
    borderColor: "border-slate-200"
  },
  {
    title: "E17 Bridginglink",
    description: "Beleid bloedverdunners.",
    icon: Tablets,
    href: "https://e17bridginglinkbloedverdunners.be/",
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    isExternal: true
  },
    {
    title: "Journal Club",
    description: "Evidence, schmevidence.",
    icon: BookOpenCheck,
    href: "/journalclub",
    color: "bg-cyan-700",
    lightColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
];

export default function Home() {
  const [, setLocation] = useLocation() as [string, (to: string) => void];
  const [tapCount, setTapCount] = useState(0);
  const [showEgg, setShowEgg] = useState(false);
  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    // Kies een willekeurige index uit de array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, []);
  const handleLogoTap = () => {
    setTapCount((prev) => prev + 1);
    if (tapCount + 1 >= 3) {
      setShowEgg(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* HEADER */}
      <div 
        className="text-center space-y-2 cursor-pointer select-none" 
        onClick={handleLogoTap}
      >
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
          Anesthesie <span className="text-teal-600">Kortrijk</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          AZ Groeninge • Metiri est Scire
        </p>
      </div>

         <PWAInstallPrompt />

      {/* ZOEKBALK (De Trigger) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-1"
      >
        <div 
          onClick={() => setLocation("/search")}
          className="relative group cursor-pointer"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <div className="w-full bg-white border-2 border-slate-100 h-14 rounded-2xl flex items-center px-12 text-slate-400 font-medium shadow-sm group-hover:border-teal-100 transition-all">
            Zoek protocollen, medicatie of blocks...
          </div>
        </div>
      </motion.div>

{/* EASTER EGG */}
<Dialog open={showEgg} onOpenChange={setShowEgg}>
  <DialogContent className="sm:max-w-2xl bg-orange-50 border-orange-200 p-8 overflow-y-auto max-h-[90vh]">
    <DialogHeader>
      <DialogTitle className="text-3xl font-black text-orange-800 uppercase flex items-center gap-2 tracking-tighter">
        ☕ Het koffiekot
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-2 pt-2">
      {/* QUOTE - Iets subtieler zodat spellen de aandacht krijgen */}
      <div className="p-3 bg-white/60 rounded-3xl border border-orange-100 shadow-sm italic">
        <p className="text-xs text-slate-700 leading-relaxed">
          "{currentQuote.text}"
        </p>
        <p className="text-[10px] text-right mt-3 font-black text-orange-400 uppercase tracking-widest">
          — {currentQuote.author}
        </p>
      </div>

      {/* GRID VOOR DE SPELLEN: Naast elkaar op desktop, onder elkaar op mobiel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        
        {/* ANESTHESIEDLE - Nu met Emerald accenten voor meer kleurkracht */}
        <Link href="/wordle">
          <div 
            className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 to-lime-200 border-2 border-emerald-100 p-6 cursor-pointer shadow-sm hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.98]" 
            onClick={() => setShowEgg(false)}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                  <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none text-slate-900">
                  Anesthesie<span className="text-emerald-500">dle</span>
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Zoek het azg-woord
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* FLAPPY ANESTHETIST */}
        <Link href="/game">
          <div 
            className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 p-6 text-white cursor-pointer shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
            onClick={() => setShowEgg(false)}
          >
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-white/10 w-16 h-16 rounded-full blur-xl"></div>
            <Syringe className="h-8 w-8 mb-4 text-white/80 -rotate-90 group-hover:rotate-0 transition-transform duration-500" />
            <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Flappy Anesthesist</h3>
            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">Navigeer de luchtweg</p>
          </div>
        </Link>
      </div>

      {/* EXTERNE LINKS - Iets compacter onderaan */}
      <div className="grid grid-cols-2 gap-3">
        <a href="https://www.hln.be" target="_blank" rel="noopener noreferrer" 
          className="flex items-center justify-center p-3 bg-red-50 text-red-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-pink-300 hover:bg-red-100 transition-colors"
        >
          HLN.BE
        </a>
        <a href="https://www.websudoku.com" target="_blank" rel="noopener noreferrer" 
          className="flex items-center justify-center p-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-blue-200 hover:bg-slate-200 transition-colors"
        >
          Sudoku
        </a>
      </div>

      <Button 
        variant="ghost" 
        className="w-full text-slate-400 hover:text-orange-700 font-bold uppercase text-[9px] tracking-[0.3em] mt-4"
        onClick={() => setShowEgg(false)}
      >
        Terug naar dossier
      </Button>
    </div>
  </DialogContent>
</Dialog>

      {/* NAVIGATIE GRID */}
      <div className="grid gap-4 max-w-2xl mx-auto">
        {categories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {category.isExternal ? (
              <a href={category.href} target="_blank" rel="noopener noreferrer" className="block">
                <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${category.borderColor} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={`${category.color} w-2`}></div>
                      <div className="flex-1 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl ${category.lightColor} text-primary transition-transform group-hover:scale-110 duration-300`}>
                            <category.icon className={`h-8 w-8 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{category.title}</h2>
                            <p className="text-sm text-slate-500 line-clamp-1 italic">{category.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-slate-500 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ) : (
              <Link href={category.href}>
                <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${category.borderColor} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={`${category.color} w-2`}></div>
                      <div className="flex-1 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl ${category.lightColor} text-primary transition-transform group-hover:scale-110 duration-300`}>
                            <category.icon className={`h-8 w-8 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{category.title}</h2>
                            <p className="text-sm text-slate-500 line-clamp-1 italic">{category.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-slate-500 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-8 text-center border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
          Laatste update: {buildDate}
        </p>
      </div>
    </div>
  );
}
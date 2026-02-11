import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  ChevronRight, 
  Syringe, 
  Tablets, 
  Phone, 
  Calculator
} from "lucide-react";
import { Link } from "wouter";
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
// @ts-expect-error
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
    description: "LAST | Apfel | Pediatrie",
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
    title: "E17 Bridginglink",
    description: "Beleid bloedverdunners.",
    icon: Tablets,
    href: "https://e17bridginglinkbloedverdunners.be/",
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    isExternal: true
  }
];

export default function Home() {
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

      {/* EASTER EGG */}
      <Dialog open={showEgg} onOpenChange={setShowEgg}>
        <DialogContent className="sm:max-w-md bg-orange-50 border-orange-200">
  <DialogHeader>
    <DialogTitle className="text-2xl font-black text-orange-800 uppercase italic flex items-center gap-2">
      ☕ De Koffiekamer
    </DialogTitle>
  </DialogHeader>
  <div className="space-y-6 pt-4">
    <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
  <p className="text-xs italic text-slate-600 leading-relaxed">
    "{currentQuote.text}"
  </p>
  <p className="text-[10px] text-right mt-3 font-black text-orange-400 uppercase tracking-widest">
    — {currentQuote.author}
  </p>
</div>
    
    {/* DE NIEUWE GAME KNOP */}
    <Link href="/game">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 p-6 text-white cursor-pointer shadow-lg shadow-teal-500/20 hover:shadow-xl hover:scale-[1.02] transition-all">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/20 w-24 h-24 rounded-full blur-2xl"></div>
                <Syringe className="h-10 w-10 mb-3 text-white/80 -rotate-90 group-hover:rotate-0 transition-transform duration-500" />
                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Flappy Anesthetist</h3>
                <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mt-1">Red de luchtweg!</p>
              </div>
            </Link>

    <div className="grid grid-cols-2 gap-3 mt-8">
      <a href="https://www.hln.be" target="_blank" rel="noopener noreferrer" 
      className="flex items-center justify-center p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
      >
        HLN.BE
      </a>
      <a href="https://www.websudoku.com" target="_blank" rel="noopener noreferrer" 
      className="flex items-center justify-center p-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
      >
        Sudoku
      </a>
    </div>
    <Button 
      variant="outline" 
      className="w-full border-orange-200 text-orange-700 hover:bg-orange-100 font-bold uppercase text-[10px] tracking-widest"
      onClick={() => setShowEgg(false)}
    >
      Sluiten
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
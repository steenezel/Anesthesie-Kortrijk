import { useState, useEffect, useMemo } from "react";
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
  BookOpenCheck,
  Waves,
  ShoppingBag,
  ClipboardList,
  Bone,
  Settings2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { quotes } from "@/data/quotes";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { useSite } from "@/hooks/use-site";

// @ts-expect-error: __BUILD_DATE__ is defined globally by Vite during the build process
const buildDate = __BUILD_DATE__;

export default function Home() {
  const { site } = useSite();
  const [, setLocation] = useLocation() as [string, (to: string) => void];
  const [tapCount, setTapCount] = useState(0);
  const [showEgg, setShowEgg] = useState(false);
  const [currentQuote, setCurrentQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, []);

  const categories = useMemo(() => {
    const all = [
      {
        id: "protocols" as const,
        title: "Protocollen",
        description: "Richtlijnen per discipline.",
        icon: BookOpen,
        href: "/protocols",
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        borderColor: "border-blue-200",
        isExternal: false,
      },
      {
        id: "blocks" as const,
        title: "Regional Anesthesia",
        description: site.academy.name,
        icon: Syringe,
        href: "/blocks",
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
        borderColor: "border-purple-200",
        isExternal: false,
      },
      {
        id: "logbook" as const,
        title: "Logboek technieken",
        description: "Registratie LRA & invasieve lijnen",
        icon: ClipboardList,
        href: "/logbook",
        color: "bg-teal-600",
        lightColor: "bg-teal-50",
        borderColor: "border-teal-200",
        isExternal: false,
      },
      {
        id: "pocus" as const,
        title: "POCUS",
        description: "Point-of-care echo",
        icon: Waves,
        href: "/pocus",
        color: "bg-fuchsia-700",
        lightColor: "bg-fuchsia-50",
        borderColor: "border-fuchsia-200",
        isExternal: false,
      },
      {
        id: "journal" as const,
        title: "Journal Club",
        description: "Recente studies en literatuur",
        icon: BookOpenCheck,
        href: "/journalclub",
        color: "bg-cyan-700",
        lightColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        isExternal: false,
      },
      {
        id: "calculators" as const,
        title: "Calculators",
        description: "LAST | Pediatrie | Pijnpomp | ... ",
        icon: Calculator,
        href: "/calculator",
        color: "bg-primary",
        lightColor: "bg-accent",
        borderColor: "border-primary/20",
        isExternal: false,
      },
      {
        id: "contacts" as const,
        title: "Telefoonlijst",
        description: "Interne nummers.",
        icon: Phone,
        href: "/contacts",
        color: "bg-orange-500",
        lightColor: "bg-orange-50",
        borderColor: "border-orange-200",
        isExternal: false,
      },
      {
        id: "external" as const,
        title: site.externalHomeLink.title,
        description: site.externalHomeLink.description,
        icon: Tablets,
        href: site.externalHomeLink.href || "#",
        color: "bg-red-500",
        lightColor: "bg-red-50",
        borderColor: "border-red-200",
        isExternal: true,
        show: site.externalHomeLink.enabled && Boolean(site.externalHomeLink.href),
      },
      {
        id: "onboarding" as const,
        title: "Onboarding",
        description: "Info voor assistenten & staf.",
        icon: GraduationCap,
        href: "/onboarding",
        color: "bg-slate-700",
        lightColor: "bg-slate-50",
        borderColor: "border-slate-200",
        isExternal: false,
      },
      {
        id: "marketplace" as const,
        title: "Marktplaats",
        description: "Verlof aanbieden of overnemen",
        icon: ShoppingBag,
        href: "/marketplace",
        color: "bg-amber-400",
        lightColor: "bg-amber-50",
        borderColor: "border-amber-200",
        isExternal: false,
      },
      {
        id: "spinalLogbook" as const,
        title: site.spinalLogbook.title,
        description: site.spinalLogbook.description,
        icon: Bone,
        href: site.spinalLogbook.href,
        color: "bg-cyan-700",
        lightColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        isExternal: false,
      },
    ];

    return all.filter((item) => {
      if (item.id === "external") return Boolean(item.show);
      return site.modules[item.id as keyof typeof site.modules] !== false;
    });
  }, [site]);

  const handleLogoTap = () => {
    if (!site.modules.games) return;
    setTapCount((prev) => prev + 1);
    if (tapCount + 1 >= 3) {
      setShowEgg(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="relative text-center space-y-2 select-none">
        <button
          type="button"
          aria-label="Instellingen"
          onClick={() => setLocation("/settings")}
          className="absolute right-0 top-0 p-2 rounded-xl text-slate-300 hover:text-primary hover:bg-accent transition-colors"
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <div className="cursor-pointer" onClick={handleLogoTap}>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
            {site.shortName} <span className="text-primary">{site.highlightName}</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            {site.hospitalName} • {site.tagline}
          </p>
        </div>
      </div>

      <PWAInstallPrompt />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto px-1"
      >
        <div onClick={() => setLocation("/search")} className="relative group cursor-pointer">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <div className="w-full bg-white border-2 border-slate-100 h-10 rounded-xl flex items-center justify-center px-4 text-xs text-slate-400 font-medium shadow-sm group-hover:border-primary/30 transition-all">
            Zoek protocollen, medicatie of blocks...
          </div>
        </div>
      </motion.div>

      {site.modules.games && (
        <Dialog open={showEgg} onOpenChange={setShowEgg}>
          <DialogContent className="sm:max-w-2xl bg-orange-50 border-orange-200 p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-orange-800 uppercase flex items-center gap-2 tracking-tighter">
                Het koffiekot
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 pt-2">
              <div className="p-3 bg-white/60 rounded-3xl border border-orange-100 shadow-sm italic">
                <p className="text-xs text-slate-700 leading-relaxed">"{currentQuote.text}"</p>
                <p className="text-[10px] text-right mt-3 font-black text-orange-400 uppercase tracking-widest">
                  — {currentQuote.author}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link href="/wordle">
                  <div
                    className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 to-lime-200 border-2 border-emerald-100 p-6 cursor-pointer shadow-sm hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.98]"
                    onClick={() => setShowEgg(false)}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="grid grid-cols-2 gap-0.5 mb-4 w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <div className="w-2 h-2 bg-slate-200 rounded-full" />
                        <div className="w-2 h-2 bg-amber-400 rounded-full" />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter leading-none text-slate-900">
                          Anesthesie<span className="text-emerald-500">dle</span>
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Zoek het woord van de dag
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/chasse-patate">
                  <div
                    className="group relative h-full overflow-hidden rounded-3xl border-2 p-6 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #F5E6C4 0%, #87CEEB 100%)",
                      borderColor: "#D4840A",
                    }}
                    onClick={() => setShowEgg(false)}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-3xl mb-2">🚴</div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter leading-none text-slate-900">
                          Chasse <span className="italic font-normal" style={{ color: "#C44B2B" }}>Patate</span>
                        </h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Wieler-galgje
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/game">
                  <div
                    className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 p-6 text-white cursor-pointer shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
                    onClick={() => setShowEgg(false)}
                  >
                    <Syringe className="h-8 w-8 mb-4 text-white/80 -rotate-90 group-hover:rotate-0 transition-transform duration-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">
                      Flappy Anesthesist
                    </h3>
                    <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-1">
                      Navigeer de luchtweg
                    </p>
                  </div>
                </Link>
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
      )}

      <div className="grid gap-2 max-w-xl mx-auto">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {category.isExternal ? (
              <a href={category.href} target="_blank" rel="noopener noreferrer" className="block">
                <HomeTile category={category} />
              </a>
            ) : (
              <Link href={category.href}>
                <HomeTile category={category} />
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-8 text-center border-t border-slate-100 space-y-2">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
          Laatste update: {buildDate}
        </p>
        <Link href="/settings">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-primary cursor-pointer">
            Instellingen
          </span>
        </Link>
      </div>
    </div>
  );
}

function HomeTile({
  category,
}: {
  category: {
    title: string;
    description: string;
    icon: typeof BookOpen;
    color: string;
    lightColor: string;
    borderColor: string;
  };
}) {
  return (
    <Card
      className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${category.borderColor} overflow-hidden`}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`${category.color} w-2`} />
          <div className="flex-1 p-2 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`p-2 rounded-2xl ${category.lightColor} transition-transform group-hover:scale-110 duration-300`}
              >
                <category.icon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {category.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-2 italic">{category.description}</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-slate-500 transition-all" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

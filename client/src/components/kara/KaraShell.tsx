import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Loader2, Map, List, GraduationCap, Brain } from "lucide-react";
import { AdminAddButton } from "@/components/AdminAddButton";
import { cn } from "@/lib/utils";
import { useSite } from "@/hooks/use-site";
import { useToast } from "@/hooks/use-toast";

export type KaraTab = "atlas" | "list" | "referentie" | "quiz";

interface KaraShellProps {
  activeTab: KaraTab;
  children: ReactNode;
  /** Extra content below tabs (e.g. search bar) */
  headerExtra?: ReactNode;
  isLoading?: boolean;
  showAdminButton?: boolean;
}

const CLASSIC_FLASH_MS = 4500;
const TAP_WINDOW_MS = 900;

export function KaraShell({
  activeTab,
  children,
  headerExtra,
  isLoading,
  showAdminButton = true,
}: KaraShellProps) {
  const { site } = useSite();
  const { toast } = useToast();
  const [location] = useLocation();
  const [showClassic, setShowClassic] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const classicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideAdmin = location.startsWith("/blocks/referentie") || location.startsWith("/blocks/quiz");

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (classicTimerRef.current) clearTimeout(classicTimerRef.current);
    };
  }, []);

  const revealClassic = useCallback(() => {
    setShowClassic(true);
    if (classicTimerRef.current) clearTimeout(classicTimerRef.current);
    classicTimerRef.current = setTimeout(() => setShowClassic(false), CLASSIC_FLASH_MS);
    toast({
      title: <span className="block text-center text-5xl leading-none sm:text-6xl">🍻</span>,
      className: "w-auto min-w-0 justify-center px-6 py-4",
    });
  }, [toast]);

  const handleBannerTap = () => {
    if (showClassic) {
      setShowClassic(false);
      if (classicTimerRef.current) clearTimeout(classicTimerRef.current);
      return;
    }

    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      revealClassic();
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, TAP_WINDOW_MS);
  };

  const bannerSrc = showClassic ? site.academy.bannerClassicSrc : site.academy.bannerSrc;

  const tabClass = (tab: KaraTab) =>
    cn(
      "flex w-full items-center justify-center gap-0 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.06em] transition-all sm:gap-2 sm:py-3.5 sm:text-[11px] sm:tracking-[0.12em]",
      activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400"
    );

  const tabLinkClass = "flex flex-1 min-w-0";
  const tabIconClass = "hidden sm:block shrink-0";

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <Link href="/">
          <button
            type="button"
            className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />{" "}
            Home
          </button>
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900 leading-tight">
              {site.academy.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{site.academy.acronym}</p>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </div>
          </div>
          {showAdminButton && !hideAdmin && (
            <AdminAddButton
              mode="header"
              href="/admin?type=blocks"
              label="Nieuw block"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleBannerTap}
          aria-label={
            showClassic
              ? "Klassieke KARA-banner — tik om terug te gaan"
              : "KARA-banner — tip: tik driemaal voor de klassieker"
          }
          className={cn(
            "group relative mb-6 w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-all",
            "active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            showClassic ? "aspect-[5/1] bg-stone-100 sm:aspect-[6/1]" : "flex items-center justify-center bg-white px-4 py-3 sm:py-4",
          )}
        >
          <img
            key={bannerSrc}
            src={bannerSrc}
            alt={`${site.academy.acronym} — ${site.academy.name}`}
            className={cn(
              "transition-opacity duration-300",
              showClassic
                ? "h-full w-full object-cover object-center animate-in fade-in zoom-in-95 duration-300"
                : "mx-auto h-auto w-1/2 max-w-md",
            )}
          />
          {showClassic && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-700/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
              Klassieker
            </span>
          )}
        </button>

        <div className="mb-4 flex w-full rounded-2xl bg-slate-100 p-1 gap-0.5 sm:p-1.5 sm:gap-1">
          <Link href="/blocks" className={tabLinkClass}>
            <button type="button" className={tabClass("atlas")}>
              <Map size={16} className={tabIconClass} />
              Atlas
            </button>
          </Link>
          <Link href="/blocks?view=list" className={tabLinkClass}>
            <button type="button" className={tabClass("list")}>
              <List size={16} className={tabIconClass} />
              Lijst
            </button>
          </Link>
          <Link href="/blocks/referentie" className={tabLinkClass}>
            <button type="button" className={tabClass("referentie")}>
              <GraduationCap size={16} className={tabIconClass} />
              Referentie
            </button>
          </Link>
          <Link href="/blocks/quiz" className={tabLinkClass}>
            <button type="button" className={tabClass("quiz")}>
              <Brain size={16} className={tabIconClass} />
              Quiz
            </button>
          </Link>
        </div>

        {headerExtra}
      </div>

      {children}

      {showAdminButton && !hideAdmin && (
        <AdminAddButton mode="fab" href="/admin?type=blocks" label="Nieuw block" />
      )}
    </div>
  );
}

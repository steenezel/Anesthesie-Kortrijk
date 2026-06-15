import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Loader2, Map, List, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type KaraTab = "atlas" | "list" | "referentie";

interface KaraShellProps {
  activeTab: KaraTab;
  children: ReactNode;
  /** Extra content below tabs (e.g. search bar) */
  headerExtra?: ReactNode;
  isLoading?: boolean;
  showAdminButton?: boolean;
}

export function KaraShell({
  activeTab,
  children,
  headerExtra,
  isLoading,
  showAdminButton = true,
}: KaraShellProps) {
  const [location] = useLocation();

  const tabClass = (tab: KaraTab) =>
    cn(
      "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all sm:py-4 sm:text-xs sm:tracking-[0.15em]",
      activeTab === tab ? "bg-white text-teal-700 shadow-sm" : "text-slate-400"
    );

  const tabLinkClass = "flex flex-1 min-w-0";

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

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900 leading-tight">
            Kortrijk Academy for{" "}
            <span className="text-teal-600">Regional Anesthesia</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">KARA</p>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
          </div>
        </div>

        <div className="mb-6 aspect-[5/1] w-full overflow-hidden rounded-2xl shadow-sm sm:aspect-[6/1]">
          <img
            src="/images/blocks/kara-banner.png"
            alt="KARA — Kortrijk Academy for Regional Anesthesia"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="mb-4 flex w-full rounded-2xl bg-slate-100 p-1.5 gap-1">
          <Link href="/blocks" className={tabLinkClass}>
            <button type="button" className={tabClass("atlas")}>
              <Map size={16} className="shrink-0" />
              Atlas
            </button>
          </Link>
          <Link href="/blocks?view=list" className={tabLinkClass}>
            <button type="button" className={tabClass("list")}>
              <List size={16} className="shrink-0" />
              Lijst
            </button>
          </Link>
          <Link href="/blocks/referentie" className={tabLinkClass}>
            <button type="button" className={tabClass("referentie")}>
              <GraduationCap size={16} className="shrink-0" />
              Referentie
            </button>
          </Link>
        </div>

        {headerExtra}
      </div>

      {children}

      {showAdminButton && !location.startsWith("/blocks/referentie") && (
        <Link href="/admin?type=blocks">
          <button
            type="button"
            className="fixed bottom-24 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Nieuwe block toevoegen"
          >
            <span className="text-2xl leading-none font-light">+</span>
          </button>
        </Link>
      )}
    </div>
  );
}

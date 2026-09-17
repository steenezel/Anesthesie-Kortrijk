import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Loader2, Map, List, GraduationCap, Brain } from "lucide-react";
import { AdminAddButton } from "@/components/AdminAddButton";
import { cn } from "@/lib/utils";
import { useSite } from "@/hooks/use-site";

export type KaraTab = "atlas" | "list" | "referentie" | "quiz";

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
  const { site } = useSite();
  const [location] = useLocation();

  const hideAdmin = location.startsWith("/blocks/referentie") || location.startsWith("/blocks/quiz");

  const tabClass = (tab: KaraTab) =>
    cn(
      "flex w-full items-center justify-center gap-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.08em] transition-all sm:gap-2 sm:py-3.5 sm:text-[11px] sm:tracking-[0.12em]",
      activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400"
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

        <div className="mb-6 aspect-[5/1] w-full overflow-hidden rounded-2xl shadow-sm sm:aspect-[6/1]">
          <img
            src={site.academy.bannerSrc}
            alt={`${site.academy.acronym} — ${site.academy.name}`}
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
          <Link href="/blocks/quiz" className={tabLinkClass}>
            <button type="button" className={tabClass("quiz")}>
              <Brain size={16} className="shrink-0" />
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

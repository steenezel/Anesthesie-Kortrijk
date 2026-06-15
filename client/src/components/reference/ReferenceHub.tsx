import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, GraduationCap, Lock } from "lucide-react";
import { REFERENCE_MODULES } from "@/data/reference/modules";
import { cn } from "@/lib/utils";

export function ReferenceHub() {
  return (
    <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Referentie</h2>

      <div className="grid gap-3">
        {REFERENCE_MODULES.map((module) => {
          const isAvailable = module.status === "available";

          const card = (
            <Card
              className={cn(
                "border-none shadow-sm overflow-hidden rounded-2xl transition-all",
                isAvailable
                  ? "hover:shadow-md cursor-pointer group active:scale-[0.98]"
                  : "opacity-70"
              )}
            >
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl mr-4 transition-colors",
                      isAvailable
                        ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {isAvailable ? <GraduationCap size={18} /> : <Lock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm block">
                      {module.title}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug block mt-0.5">
                      {module.description}
                    </span>
                    {!isAvailable && (
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">
                        Binnenkort
                      </span>
                    )}
                  </div>
                  {isAvailable && (
                    <ChevronRight className="text-slate-200 group-hover:text-indigo-600 shrink-0" size={20} />
                  )}
                </div>
              </CardContent>
            </Card>
          );

          return isAvailable ? (
            <Link key={module.id} href={module.href}>
              {card}
            </Link>
          ) : (
            <div key={module.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}

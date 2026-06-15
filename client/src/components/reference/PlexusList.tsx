import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Network } from "lucide-react";
import { PLEXUS_REFERENCES } from "@/data/reference/plexus";
import { cn } from "@/lib/utils";

export function PlexusList() {
  return (
    <div className="grid gap-3">
      {PLEXUS_REFERENCES.map((plexus) => {
        const hasImage = !!plexus.imageSrc;

        return (
          <Link key={plexus.id} href={`/blocks/referentie/plexus/${plexus.id}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98] overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors overflow-hidden">
                    {hasImage ? (
                      <img
                        src={plexus.imageSrc}
                        alt=""
                        className="h-full w-full object-cover object-center opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <Network size={22} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm block">
                      {plexus.title}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-teal-600 mt-0.5 block">
                      {plexus.levels}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug block mt-1">
                      {plexus.description}
                    </span>
                    {!hasImage && (
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 block",
                          "text-amber-600"
                        )}
                      >
                        Afbeelding volgt
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className="text-slate-200 group-hover:text-indigo-600 shrink-0"
                    size={20}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

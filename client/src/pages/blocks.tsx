import { Card, CardContent } from "@/components/ui/card";
import { Box, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Blocks() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Blocks
        </h1>
        <p className="text-slate-500">
          Locoregionale technieken, sono-anatomie en echobeelden.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Zoek een block..." className="pl-10 h-12 bg-white border-2 border-slate-100 focus:border-purple-500 transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["Interscalene", "Axillary", "ISB", "PENG", "FICB", "Sciatic"].map((block) => (
          <Card key={block} className="cursor-pointer group overflow-hidden border border-slate-200">
            <div className="aspect-video bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors relative">
              <Box className="h-8 w-8 text-slate-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">{block} Block</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">Relevante sono-anatomie en instellingen voor de echograaf.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

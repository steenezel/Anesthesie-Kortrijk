import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";

const blocks = [
  { id: "interscalene", name: "Interscalene Block" },
  { id: "axillary", name: "Axillary Block" },
  { id: "isb", name: "Infraclavicular Block" },
  { id: "peng", name: "PENG Block" },
  { id: "ficb", name: "Fascia Iliaca Block" },
  { id: "sciatic", name: "Sciatic Block" },
  { id: "tap", name: "TAP Block" },
  { id: "rectus-sheath", name: "Rectus Sheath Block" },
];

export default function Blocks() {
  const [search, setSearch] = useState("");
  const filteredBlocks = blocks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Blocks
        </h1>
        <p className="text-slate-500">
          Selecteer een techniek voor details en sono-anatomie.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Zoek een block..." 
          className="pl-10 h-12 bg-white border-2 border-slate-100 focus:border-purple-500 transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filteredBlocks.map((block) => (
          <Link key={block.id} href={`/blocks/${block.id}`}>
            <Card className="cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 active:scale-[0.98]">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-tight">{block.name}</span>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

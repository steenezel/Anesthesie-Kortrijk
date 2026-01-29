import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";

const depts = [
  { id: "abdominale", name: "Abdominale Heelkunde", count: 1 },
  { id: "orthopedie", name: "Orthopedie", count: 12 },
  { id: "gynaecologie", name: "Gynaecologie", count: 8 },
  { id: "urologie", name: "Urologie", count: 5 },
  { id: "nko", name: "NKO", count: 10 },
];

export default function Protocols() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const abdominaleProtocols = [
    { id: "gastric-bypass", name: "Gastric Bypass" },
    { id: "lever-chirurgie", name: "Leverchirurgie" },
  ];

  const filteredDepts = depts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedDept === "abdominale") {
    return (
      <div className="space-y-6">
        <div onClick={() => setSelectedDept(null)} className="flex items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Terug naar specialismen
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
            Abdominale
          </h1>
        </div>
        <div className="grid gap-3">
          {abdominaleProtocols.map((p) => (
            <Link key={p.id} href={`/protocols/${p.id}`}>
              <Card className="cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 active:scale-[0.98]">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-tight">{p.name}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Protocollen
        </h1>
        <p className="text-slate-500">
          Raadpleeg de actuele anesthesieprotocollen van AZ Groeninge.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Zoek op specialisme..." 
          className="pl-10 h-12 bg-white border-2 border-slate-100 focus:border-blue-500 transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        {filteredDepts.map((dept) => (
          <div key={dept.id} onClick={() => setSelectedDept(dept.id)}>
            <Card className="cursor-pointer hover:bg-slate-50 transition-all border border-slate-200 active:scale-[0.98]">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="font-bold text-slate-700 uppercase tracking-tight">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-400 font-bold">{dept.count}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

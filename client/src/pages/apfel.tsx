import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const factors = [
  { id: "gender", label: "Vrouw" },
  { id: "smoking", label: "Niet-roker" },
  { id: "history", label: "Voorgeschiedenis PONV / reisziekte" },
  { id: "opioids", label: "Postoperatieve opioïden gepland" }
];

const riskTable = [10, 21, 39, 61, 79];

export default function ApfelCalculator() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const score = selected.length;
  const risk = riskTable[score];

  return (
    <div className="space-y-6 pb-20">
      <Link href="/calculator">
        <a className="flex items-center text-blue-600 font-bold uppercase text-xs tracking-widest">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </a>
      </Link>

      <Card className="border-slate-200 shadow-xl">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-xl font-black uppercase tracking-tighter">Apfel-Score</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-3">
            {factors.map(f => (
              <div 
                key={f.id} 
                onClick={() => toggle(f.id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selected.includes(f.id) ? "border-blue-600 bg-blue-50" : "border-slate-100"
                }`}
              >
                <span className="font-bold text-slate-700 text-sm uppercase">{f.label}</span>
                <Checkbox checked={selected.includes(f.id)} />
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-center text-white shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Risico op PONV</p>
            <div className="text-6xl font-black text-blue-400">{risk}%</div>
            <div className="mt-2 text-xs font-bold text-slate-400">SCORE: {score} / 4</div>
          </div>

          {score >= 3 && (
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p><strong>Hoog risico:</strong> Overweeg TIVA en/of triple profylaxe (bv. Dexamethason + Litican + Ondansetron).</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
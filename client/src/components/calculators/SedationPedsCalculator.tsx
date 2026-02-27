import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Baby, Syringe, AlertTriangle } from "lucide-react";

export default function SedationPedsCalculator() {
  const [age, setAge] = useState<number>(5);
  const [weight, setWeight] = useState<number>(20);

  // IBW Berekening (Ideal Body Weight) op basis van leeftijd
  // Formule: (age + 5) * 2
  const ibw = useMemo(() => {
    if (age < 1) return weight;
    return (age + 5) * 2;
  }, [age, weight]);

  const isObese = weight > ibw * 1.2;

  // Calculaties
  const calc = useMemo(() => {
    const atropineMcg = weight * 10;
    const atropineMl = atropineMcg / 20; // 20 mcg/ml

    const dexdorIndMcgABW = weight * 2;
    const dexdorIndMlABW = dexdorIndMcgABW / 10; // 10 mcg/ml
    const dexdorIndMcgIBW = ibw * 2;
    const dexdorIndMlIBW = dexdorIndMcgIBW / 10;

    const dexdorMaintMcgABW = weight * 0.5;
    const dexdorMaintMlABW = dexdorMaintMcgABW / 10;
    const dexdorMaintMcgIBW = ibw * 0.5;
    const dexdorMaintMlIBW = dexdorMaintMcgIBW / 10;

    return {
      atropineMcg, atropineMl,
      dexdorIndMcgABW, dexdorIndMlABW, dexdorIndMcgIBW, dexdorIndMlIBW,
      dexdorMaintMcgABW, dexdorMaintMlABW, dexdorMaintMcgIBW, dexdorMaintMlIBW
    };
  }, [weight, ibw]);

  return (
    <div className="space-y-4 my-6 not-prose"> {/* not-prose voorkomt dat Tailwind Typography de styling overschrijft */}
      <Card className="border-teal-100 bg-teal-50/30 overflow-hidden shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="h-4 w-4 text-teal-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patiënt Parameters</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Leeftijd (jaar)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={age === 0 ? "" : age} 
                onChange={(e) => setAge(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="h-10 font-bold bg-white" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-bold text-slate-400">Gewicht (kg)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={weight === 0 ? "" : weight} 
                onChange={(e) => setWeight(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="h-10 font-bold bg-white" 
              />
            </div>
          </div>
          {isObese && weight > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-100/50 rounded-lg border border-amber-200 text-[10px] font-bold text-amber-700 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              LET OP: Obesitas gedetecteerd (IBW: {ibw}kg). Gebruik de IBW kolom voor Dexdor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESULTATEN */}
      <div className="space-y-3">
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-3 flex items-center gap-2">
            <Syringe className="h-3 w-3" /> Atropine (10 mcg/kg)
          </h4>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-slate-900">{calc.atropineMcg} <span className="text-xs uppercase text-slate-400 font-bold">mcg</span></p>
              <p className="text-[9px] font-bold text-slate-400">Conc: 20 mcg/ml (1mg/5ml of 0.5mg/2.5ml)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-teal-600">{calc.atropineMl.toFixed(2)} <span className="text-xs uppercase font-bold">ml</span></p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
               Dexdor Inductie (2 mcg/kg)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <ResultBox label="Echt Gewicht (ABW)" dose={`${calc.dexdorIndMcgABW} mcg`} vol={`${calc.dexdorIndMlABW.toFixed(1)} ml`} />
              <ResultBox label="Ideaal Gewicht (IBW)" dose={`${calc.dexdorIndMcgIBW} mcg`} vol={`${calc.dexdorIndMlIBW.toFixed(1)} ml`} highlight={isObese} />
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-50">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">Dexdor Onderhoud (0.5 mcg/kg)</h4>
            <div className="grid grid-cols-2 gap-4">
              <ResultBox label="Echt Gewicht (ABW)" dose={`${calc.dexdorMaintMcgABW} mcg`} vol={`${calc.dexdorMaintMlABW.toFixed(2)} ml`} />
              <ResultBox label="Ideaal Gewicht (IBW)" dose={`${calc.dexdorMaintMcgIBW} mcg`} vol={`${calc.dexdorMaintMlIBW.toFixed(2)} ml`} highlight={isObese} />
            </div>
          </div>
          <p className="text-[8px] text-slate-400 italic text-center font-bold uppercase tracking-tight">Dexdor verdunning: 10 mcg/ml (200µg in 20ml)</p>
        </div>
      </div>
    </div>
  );
}

function ResultBox({ label, dose, vol, highlight }: { label: string, dose: string, vol: string, highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-xl border transition-colors ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-xs font-black text-slate-900">{dose}</p>
      <p className={`text-sm font-black ${highlight ? 'text-amber-600' : 'text-teal-600'}`}>{vol}</p>
    </div>
  );
}
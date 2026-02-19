import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

export default function DantroleenCalc() {
  const [weight, setWeight] = useState<number | "">("");

  const weightNum = Number(weight);
  
  // Berekeningen op basis van intern protocol
  const startMg = weightNum * 2.5;
  const vervolgMg = weightNum * 1;
  const maxMg = weightNum * 10;

  const startVials = Math.ceil(startMg / 20);
  const vervolgVials = Math.ceil(vervolgMg / 20);
  const maxVials = Math.ceil(maxMg / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 bg-slate-50/50">
        <span className="font-bold text-slate-700 text-sm uppercase">Patiëntgewicht (kg)</span>
        <Input 
          type="number" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-24 bg-white border-2 font-black text-center"
          placeholder="0"
        />
      </div>

      {weightNum > 0 && (
        <div className="mt-6 p-6 bg-slate-900 rounded-2xl text-white shadow-inner space-y-6">
          {/* 1. STARTDOSIS */}
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Startdosis (2.5 mg/kg IV)</p>
            <div className="text-4xl font-black text-white">{startMg} MG</div>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase">{startVials} Flacons + {startVials * 60}ml Aqua</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
            {/* 2. VERVOLGDOSIS */}
            <div className="text-center border-r border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Vervolg (1 mg/kg)</p>
              <div className="text-xl font-black text-white">{vervolgMg} MG</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{vervolgVials} Flacons / 5-10 min</p>
            </div>

            {/* 3. MAXIMUMDOSIS */}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Maximum (10 mg/kg)</p>
              <div className="text-xl font-black text-white">{maxMg} MG</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Totaal {maxVials} Flacons</p>
            </div>
          </div>

          {/* Waarschuwing Stock */}
          {startVials > 20 && (
            <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-[10px] font-bold uppercase text-center">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              Direct reserve Vanas verdieping 9 inschakelen (Koffer PAZA = 20 flacons)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, Calendar, FlaskConical } from "lucide-react";

export default function PainPumpCalculator() {
  // We initialiseren met de waarden uit je Excel, maar staan 'undefined' of '0' toe voor de UI
  const [pumpVolume, setPumpVolume] = useState<number>(40);
  const [refTotal, setRefTotal] = useState<number>(460);
  const [refDaily, setRefDaily] = useState<number>(7.595);
  const [extraDaily, setExtraDaily] = useState<number>(50);

  const results = useMemo(() => {
    // Validatie: voorkom delen door nul of lege velden
    if (!refDaily || refDaily <= 0 || !refTotal || !pumpVolume) return null;

    const durationDays = refTotal / refDaily;
    const extraTotal = extraDaily * durationDays;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Math.floor(durationDays));

    const dailyVolume = pumpVolume / durationDays;

    return {
      durationDays: durationDays.toFixed(1),
      extraTotal: extraTotal.toFixed(1),
      endDate: endDate.toLocaleDateString('nl-BE', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      dailyVolume: dailyVolume.toFixed(3)
    };
  }, [pumpVolume, refTotal, refDaily, extraDaily]);

  // Helper om de invoer netjes te verwerken
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm rounded-[24px] overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pomp Volume (ml)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={pumpVolume === 0 ? "" : pumpVolume} 
                onFocus={handleFocus}
                onChange={(e) => setPumpVolume(e.target.value === "" ? 0 : Number(e.target.value))}
                className="rounded-xl border-slate-200 focus:ring-teal-500 h-12 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ref. Totaal (mg)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={refTotal === 0 ? "" : refTotal} 
                onFocus={handleFocus}
                onChange={(e) => setRefTotal(e.target.value === "" ? 0 : Number(e.target.value))}
                className="rounded-xl border-slate-200 focus:ring-teal-500 h-12 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ref. Dosis (mg/dag)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={refDaily === 0 ? "" : refDaily} 
                onFocus={handleFocus}
                onChange={(e) => setRefDaily(e.target.value === "" ? 0 : Number(e.target.value))}
                className="rounded-xl border-slate-200 focus:ring-teal-500 h-12 font-bold text-teal-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Extra Stof (mg/dag)</Label>
              <Input 
                type="number" 
                inputMode="decimal"
                value={extraDaily === 0 ? "" : extraDaily} 
                onFocus={handleFocus}
                onChange={(e) => setExtraDaily(e.target.value === "" ? 0 : Number(e.target.value))}
                className="rounded-xl border-slate-200 focus:ring-teal-500 h-12 font-bold text-purple-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results ? (
        <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 gap-3">
            <ResultBox 
              icon={<Clock className="h-4 w-4 text-blue-500" />}
              label="Looptijd"
              value={`${results.durationDays} dagen`}
              subtext="Totale duur"
            />
            <ResultBox 
              icon={<FlaskConical className="h-4 w-4 text-purple-500" />}
              label="Bij te vullen"
              value={`${results.extraTotal} mg`}
              subtext="Totaal extra stof"
            />
          </div>

          <Card className="bg-emerald-50 border-emerald-100 rounded-[24px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-700 opacity-70 italic">Verwachte einddatum</p>
                <p className="text-lg font-black text-emerald-900 leading-none mt-1">{results.endDate}</p>
              </div>
            </CardContent>
          </Card>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tight italic">
            Flow rate: {results.dailyVolume} ml / dag
          </p>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-100 rounded-[24px] border border-dashed border-slate-300">
           <p className="text-[10px] font-black uppercase text-slate-400 italic">Vul alle velden in voor resultaat</p>
        </div>
      )}
    </div>
  );
}

function ResultBox({ icon, label, value, subtext }: any) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-[24px]">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
        </div>
        <p className="text-xl font-black text-slate-900">{value}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase">{subtext}</p>
      </CardContent>
    </Card>
  );
}
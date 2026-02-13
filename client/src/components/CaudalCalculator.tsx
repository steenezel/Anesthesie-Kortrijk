import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CaudalCalculator() {
  const [weight, setWeight] = useState<number>(10);

  return (
    <Card className="border-2 border-orange-200 bg-orange-50/30 rounded-3xl overflow-hidden my-8">
      <div className="bg-orange-500 p-4 text-white">
        <h3 className="text-xs font-black uppercase tracking-widest text-center">Caudaal Volume Calculator</h3>
        <p className="text-[10px] text-orange-100 text-center uppercase font-bold mt-1 italic">Ropivacaïne 0.2%</p>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-orange-600 tracking-widest ml-1">Patiënt Gewicht (kg)</Label>
          <Input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="text-3xl h-16 font-black text-center border-orange-100 bg-white focus-visible:ring-orange-500 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Sacraal/Lumbaal</p>
            <p className="text-[8px] font-bold text-orange-400 uppercase mb-2">0.5 ml/kg</p>
            <p className="text-3xl font-mono font-black text-orange-600">{(weight * 0.5).toFixed(1)} <span className="text-xs">ml</span></p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Thoracolumbaal</p>
            <p className="text-[8px] font-bold text-orange-400 uppercase mb-2">1.0 ml/kg</p>
            <p className="text-3xl font-mono font-black text-orange-800">{(weight * 1.0).toFixed(1)} <span className="text-xs">ml</span></p>
          </div>
        </div>

        <div className="p-3 bg-white/50 border border-dashed border-orange-200 rounded-xl">
           <p className="text-[10px] font-bold text-orange-800 italic text-center">
             Max dosis ropivacaïne: 2 mg/kg (= 1 ml/kg van 0.2%)
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
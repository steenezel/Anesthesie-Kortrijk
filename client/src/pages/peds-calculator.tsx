import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Activity, Syringe, Wind, Ruler, AlertCircle, ShieldAlert } from "lucide-react";

export default function PedsCalculator() {
  const [ageValue, setAgeValue] = useState<number>(2);
  const [ageUnit, setAgeUnit] = useState<"weeks" | "months" | "years">("years");
  const [manualWeight, setManualWeight] = useState<number | null>(null);

  // 1. Bereken decimaal jaar
  const decimalYear = useMemo(() => {
    if (ageUnit === "weeks") return ageValue / 52.14;
    if (ageUnit === "months") return ageValue / 12;
    return ageValue;
  }, [ageValue, ageUnit]);

  // 2. Veiligheidscheck: gewicht verplicht onder 1 jaar
  const isWeightRequired = decimalYear < 1 && manualWeight === null;

  // 3. Gewichtsberekening
  const estimatedWeight = useMemo(() => {
    return decimalYear >= 1 ? (decimalYear + 5) * 2 : 0;
  }, [decimalYear]);

  const weight = manualWeight !== null ? manualWeight : estimatedWeight;

  // 4. Airway berekeningen (alleen als gewicht beschikbaar is)
  const airway = useMemo(() => {
    if (isWeightRequired || weight <= 0) return null;
    
    const ettUncuffed = decimalYear / 4 + 4;
    const ettCuffed = decimalYear / 4 + 3.5;
    
    let lma = "1";
    if (weight >= 5) lma = "1.5";
    if (weight >= 10) lma = "2";
    if (weight >= 20) lma = "2.5";
    if (weight >= 30) lma = "3";
    if (weight >= 50) lma = "4";

    return {
      uncuffed: ettUncuffed.toFixed(1),
      cuffed: ettCuffed.toFixed(1),
      lma,
      depth: (weight / 2 + 12).toFixed(1)
    };
  }, [decimalYear, weight, isWeightRequired]);

  // 5. Medicatie (Kortrijk Protocol)
  const drugs = useMemo(() => {
    if (isWeightRequired || weight <= 0) return null;

    return {
      sufentanil: { mcg: (weight * 0.15).toFixed(2), ml: (weight * 0.15 / 5).toFixed(2) }, // 5mcg/ml
      alfentanil: { mcg: (weight * 15).toFixed(0), ml: (weight * 15 / 500).toFixed(2) }, // 500mcg/ml
      propofol: { mg: (weight * 3).toFixed(0), ml: (weight * 3 / 10).toFixed(1) }, // 10mg/ml
      rocuronium: { mg: (weight * 0.9).toFixed(1), ml: (weight * 0.9 / 10).toFixed(2) },
      adrenaline: { mcg: (weight * 10).toFixed(0), ml: (weight * 10 / 100).toFixed(1) }, // 1:10.000
      cefazoline: { mg: (weight * 30).toFixed(0) }, // 30mg/kg
      amoxiclav: { mg: (weight * 30).toFixed(0) }  // 30mg/kg
    };
  }, [weight, isWeightRequired]);

  return (
    <div className="space-y-6 pb-20">
      {/* INPUT SECTIE */}
      <Card className={`border-2 transition-colors ${isWeightRequired ? 'border-amber-400 bg-amber-50/20' : 'border-teal-100'}`}>
        <CardHeader className="p-4 border-b flex flex-row items-center gap-2">
          <Baby className={`h-5 w-5 ${isWeightRequired ? 'text-amber-500' : 'text-teal-600'}`} />
          <CardTitle className="text-sm font-black uppercase tracking-tighter">Patiënt Gegevens</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Leeftijd</Label>
              <Input 
                type="number" 
                value={ageValue} 
                onChange={(e) => setAgeValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="text-xl font-mono font-bold h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Eenheid</Label>
              <Select value={ageUnit} onValueChange={(v: any) => setAgeUnit(v)}>
                <SelectTrigger className="h-12 font-bold uppercase text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weeks">Weken</SelectItem>
                  <SelectItem value="months">Maanden</SelectItem>
                  <SelectItem value="years">Jaren</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-400">Gewicht (kg)</Label>
            <Input 
              type="number" 
              placeholder={decimalYear >= 1 ? `Schatting: ${estimatedWeight} kg` : "Invoer verplicht..."}
              value={manualWeight ?? ""}
              onChange={(e) => setManualWeight(e.target.value ? parseFloat(e.target.value) : null)}
              className={`text-2xl font-mono font-bold h-12 ${isWeightRequired ? 'border-amber-500 ring-2 ring-amber-200' : 'border-teal-200'}`}
            />
            {decimalYear >= 1 && <p className="text-[9px] text-slate-400 italic font-medium">Formule: (leeftijd + 5) * 2</p>}
          </div>
        </CardContent>
      </Card>

      {/* RESULTATEN OF WAARSCHUWING */}
      {isWeightRequired ? (
        <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
          <CardContent className="p-8 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-black uppercase text-amber-800 tracking-tight">Gewicht Verplicht</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Voor kinderen jonger dan 1 jaar is een schatting op basis van leeftijd niet toegestaan. Voer een exact gewicht in om de dosissen te zien.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="airway">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl h-12">
            <TabsTrigger value="airway" className="rounded-lg text-[10px] font-black uppercase tracking-tighter italic">Airway</TabsTrigger>
            <TabsTrigger value="drugs" className="rounded-lg text-[10px] font-black uppercase tracking-tighter italic">Drugs</TabsTrigger>
            <TabsTrigger value="regional" className="rounded-lg text-[10px] font-black uppercase tracking-tighter italic">Regio</TabsTrigger>
          </TabsList>

          <TabsContent value="airway" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="ETT Uncuffed" value={airway?.uncuffed} unit="mm" color="bg-blue-50 text-blue-700 border-blue-100" />
              <ResultCard label="ETT Cuffed" value={airway?.cuffed} unit="mm" color="bg-indigo-50 text-indigo-700 border-indigo-100" />
              <ResultCard label="LMA Maat" value={airway?.lma} unit="#" color="bg-violet-50 text-violet-700 border-violet-100" />
              <ResultCard label="Diepte (oraal)" value={airway?.depth} unit="cm" color="bg-slate-50 text-slate-700 border-slate-200" />
            </div>
          </TabsContent>

          <TabsContent value="drugs" className="space-y-4">
            <div className="bg-red-600 p-4 rounded-2xl shadow-lg flex items-center justify-between border-b-4 border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-white animate-pulse" />
                <div>
                  <p className="text-[10px] font-black text-red-100 uppercase tracking-widest">Adrenaline (10µg/kg)</p>
                  <p className="text-2xl font-mono font-black text-white">{drugs?.adrenaline.ml} <span className="text-xs">ml (1:10k)</span></p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <DrugRow label="Propofol 1%" dose={`${drugs?.propofol.mg} mg`} volume={`${drugs?.propofol.ml} ml`} />
              <DrugRow label="Sufentanil (5µg/ml)" dose={`${drugs?.sufentanil.mcg} µg`} volume={`${drugs?.sufentanil.ml} ml`} />
              <DrugRow label="Alfentanil (500µg/ml)" dose={`${drugs?.alfentanil.mcg} µg`} volume={`${drugs?.alfentanil.ml} ml`} />
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Cefazoline</p>
                  <p className="text-sm font-bold">{drugs?.cefazoline.mg} mg</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Amoxiclav</p>
                  <p className="text-sm font-bold">{drugs?.amoxiclav.mg} mg</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regional">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="bg-orange-50/50 p-4 border-b">
                <CardTitle className="text-xs font-black uppercase text-orange-800 italic">Caudaal: Ropivacaïne 0.2%</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border-2 border-orange-50 rounded-2xl shadow-inner">
                    <p className="text-[9px] font-black text-orange-400 uppercase">Sacraal (0.5ml/kg)</p>
                    <p className="text-2xl font-mono font-black text-orange-700">{(weight * 0.5).toFixed(1)} <span className="text-xs font-bold text-orange-400 uppercase tracking-tighter whitespace-nowrap">ml</span></p>
                  </div>
                  <div className="p-4 bg-white border-2 border-orange-50 rounded-2xl shadow-inner">
                    <p className="text-[9px] font-black text-orange-400 uppercase">Thoraco-Lum (1ml/kg)</p>
                    <p className="text-2xl font-mono font-black text-orange-900">{(weight * 1.0).toFixed(1)} <span className="text-xs font-bold text-orange-400 uppercase tracking-tighter whitespace-nowrap">ml</span></p>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-[10px] text-orange-800 italic font-bold">Max: 2mg/kg. Reken steeds na op basis van patiënt conditie.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ResultCard({ label, value, unit, color }: any) {
  return (
    <div className={`p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-mono font-black">{value}<span className="text-sm ml-1">{unit}</span></p>
    </div>
  );
}

function DrugRow({ label, dose, volume }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-teal-100 transition-colors">
      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter leading-none">{label}</p>
        <p className="text-sm font-black text-slate-800 italic">{dose}</p>
      </div>
      <div className="text-right px-4 py-2 bg-teal-50 rounded-xl border border-teal-100 min-w-[80px]">
        <p className="text-lg font-mono font-black text-teal-700">{volume}</p>
      </div>
    </div>
  );
}
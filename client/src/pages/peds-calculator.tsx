import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Activity, Syringe, Wind, Ruler, AlertCircle } from "lucide-react";

export default function PedsCalculator() {
  const [ageValue, setAgeValue] = useState<number>(2);
  const [ageUnit, setAgeUnit] = useState<"weeks" | "months" | "years">("years");
  const [manualWeight, setManualWeight] = useState<number | null>(null);

  // 1. Bereken decimaal jaar voor de formules
  const decimalYear = useMemo(() => {
    if (ageUnit === "weeks") return ageValue / 52;
    if (ageUnit === "months") return ageValue / 12;
    return ageValue;
  }, [ageValue, ageUnit]);

  // 2. Gewichtsschatting op basis van leeftijd (jouw formule)
  const estimatedWeight = useMemo(() => {
    // Formule: (leeftijd + 5) * 2
    return (decimalYear + 5) * 2;
  }, [decimalYear]);

  const weight = manualWeight !== null ? manualWeight : estimatedWeight;

  // 3. Berekeningen voor Airway
  const airway = useMemo(() => {
    const ettUncuffed = decimalYear / 4 + 4;
    const ettCuffed = decimalYear / 4 + 3.5;
    
    // Larynxmasker op basis van gewicht
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
  }, [decimalYear, weight]);

  // 4. Medicatie Logica (Kortrijk Protocol)
  const drugs = useMemo(() => {
    return {
      sufentanil: { mcg: (weight * 0.15).toFixed(2), ml: (weight * 0.15 / 5).toFixed(2) }, // 5mcg/ml
      alfentanil: { mcg: (weight * 15).toFixed(0), ml: (weight * 15 / 500).toFixed(2) }, // 500mcg/ml
      propofol: { mg: (weight * 3).toFixed(0), ml: (weight * 3 / 10).toFixed(1) }, // 1% = 10mg/ml
      rocuronium: { mg: (weight * 0.9).toFixed(1), ml: (weight * 0.9 / 10).toFixed(2) },
      adrenaline: { mcg: (weight * 10).toFixed(0), ml: (weight * 10 / 100).toFixed(1) } // 1:10.000
    };
  }, [weight]);

  return (
    <div className="space-y-6 pb-20">
      {/* INPUT SECTIE */}
      <Card className="border-teal-100 shadow-md">
        <CardHeader className="bg-teal-50/50 p-4 border-b border-teal-100">
          <div className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-sm font-black uppercase tracking-tighter text-teal-900">Patient Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Leeftijd</Label>
              <div className="flex gap-1">
                <Input 
                  type="number" 
                  value={ageValue} 
                  onChange={(e) => setAgeValue(parseFloat(e.target.value) || 0)}
                  className="text-xl font-mono font-bold h-12"
                />
              </div>
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
              placeholder={`Schatting: ${estimatedWeight} kg`}
              value={manualWeight ?? ""}
              onChange={(e) => setManualWeight(e.target.value ? parseFloat(e.target.value) : null)}
              className="text-2xl font-mono font-bold h-12 border-teal-200 focus:ring-teal-500"
            />
            <p className="text-[9px] text-slate-400 italic">Formule: (leeftijd + 5) * 2</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="airway">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl h-12">
          <TabsTrigger value="airway" className="rounded-lg text-[10px] font-black uppercase"><Wind className="h-3 w-3 mr-1" /> Airway</TabsTrigger>
          <TabsTrigger value="drugs" className="rounded-lg text-[10px] font-black uppercase"><Syringe className="h-3 w-3 mr-1" /> Drugs</TabsTrigger>
          <TabsTrigger value="regional" className="rounded-lg text-[10px] font-black uppercase"><Ruler className="h-3 w-3 mr-1" /> Caudaal</TabsTrigger>
        </TabsList>

        {/* AIRWAY TAB */}
        <TabsContent value="airway" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="ETT Uncuffed" value={airway.uncuffed} unit="mm" color="bg-blue-50 text-blue-700" />
            <ResultCard label="ETT Cuffed" value={airway.cuffed} unit="mm" color="bg-indigo-50 text-indigo-700" />
            <ResultCard label="LMA Maat" value={airway.lma} unit="#" color="bg-violet-50 text-violet-700" />
            <ResultCard label="Diepte (oraal)" value={airway.depth} unit="cm" color="bg-slate-50 text-slate-700" />
          </div>
        </TabsContent>

        {/* DRUGS TAB */}
        <TabsContent value="drugs" className="space-y-4">
          <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-[10px] font-black text-red-700 uppercase">Emergency: Adrenaline (10µg/kg)</p>
              <p className="text-lg font-mono font-black text-red-900">{drugs.adrenaline.ml} <span className="text-xs">ml (1:10.000)</span></p>
            </div>
          </div>
          
          <div className="space-y-2">
            <DrugRow label="Propofol 1%" dose={`${drugs.propofol.mg} mg`} volume={`${drugs.propofol.ml} ml`} />
            <DrugRow label="Sufentanil (5µg/ml)" dose={`${drugs.sufentanil.mcg} µg`} volume={`${drugs.sufentanil.ml} ml`} />
            <DrugRow label="Alfentanil (500µg/ml)" dose={`${drugs.alfentanil.mcg} µg`} volume={`${drugs.alfentanil.ml} ml`} />
            <DrugRow label="Rocuronium" dose={`${drugs.rocuronium.mg} mg`} volume={`${drugs.rocuronium.ml} ml`} />
          </div>
        </TabsContent>

        {/* REGIONAL TAB */}
        <TabsContent value="regional">
          <Card className="border-orange-100 shadow-sm overflow-hidden">
            <div className="bg-orange-50 p-4 border-b border-orange-100">
              <h3 className="text-xs font-black uppercase text-orange-800">Ropivacaïne 0.2% (Caudaal)</h3>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-orange-100 rounded-xl">
                  <p className="text-[9px] font-bold text-orange-400 uppercase">Sacraal (0.5ml/kg)</p>
                  <p className="text-2xl font-mono font-black">{(weight * 0.5).toFixed(1)} <span className="text-xs">ml</span></p>
                </div>
                <div className="p-3 bg-white border border-orange-100 rounded-xl">
                  <p className="text-[9px] font-bold text-orange-400 uppercase">Thoraco-Lum (1ml/kg)</p>
                  <p className="text-2xl font-mono font-black">{(weight * 1.0).toFixed(1)} <span className="text-xs">ml</span></p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic font-medium">Max dosis: 2mg/kg (= 1ml/kg van 0.2%)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-componenten voor een schone code
function ResultCard({ label, value, unit, color }: any) {
  return (
    <div className={`p-4 rounded-2xl border border-transparent shadow-sm ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-mono font-black">{value} <span className="text-sm">{unit}</span></p>
    </div>
  );
}

function DrugRow({ label, dose, volume }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900">{dose}</p>
      </div>
      <div className="text-right px-4 py-2 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-lg font-mono font-black text-teal-700">{volume} <span className="text-[10px]">ml</span></p>
      </div>
    </div>
  );
}
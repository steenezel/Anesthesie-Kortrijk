import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, Wind, Droplets, Zap, ShieldAlert, AlertCircle, Ruler } from "lucide-react";
import { pediatricMeds, PediatricMed } from "@/lib/pediatric-config";

export default function PedsCalculator() {
  const [ageValue, setAgeValue] = useState<number>(2);
  const [ageUnit, setAgeUnit] = useState<"weeks" | "months" | "years">("years");
  const [manualWeight, setManualWeight] = useState<number | null>(null);
  const [manualHeight, setManualHeight] = useState<number | null>(null);

  // LOGICA VOOR LENGTE & GEWICHT (BEHOUDEN)
  const decimalYear = useMemo(() => {
    if (ageUnit === "weeks") return ageValue / 52.14;
    if (ageUnit === "months") return ageValue / 12;
    return ageValue;
  }, [ageValue, ageUnit]);

  const estimatedHeight = useMemo(() => {
    if (decimalYear < 1) return 50 + (decimalYear * 25);
    return (decimalYear * 6) + 70;
  }, [decimalYear]);

  const currentHeight = manualHeight !== null ? manualHeight : estimatedHeight;
  const isWeightRequired = decimalYear < 1 && manualWeight === null;

  const estimatedWeight = useMemo(() => {
    if (decimalYear < 1) return 0;
    const rawWeight = (decimalYear + 5) * 2;
    return Math.round(rawWeight * 2) / 2;
  }, [decimalYear]);

  const weight = manualWeight !== null ? manualWeight : estimatedWeight;

  // AIRWAY LOGICA (BEHOUDEN)
  const airway = useMemo(() => {
    if (isWeightRequired || weight <= 0) return null;
    const eckRaw = 2.44 + (decimalYear * 0.1) + (currentHeight * 0.02) + (weight * 0.016);
    const eck = Math.min(7.0, Math.round(eckRaw * 2) / 2);
    const coleUncuffed = Math.min(7.0, Math.round(((decimalYear / 4) + 4) * 2) / 2);
    const coleCuffed = Math.min(7.0, Math.round(((decimalYear / 4) + 3) * 2) / 2);
    const oralDepth = Math.min(21.0, (decimalYear / 2) + 12);
    const nasalDepth = Math.min(24.0, (decimalYear / 2) + 15);
    
    let lma = "1";
    if (weight >= 5) lma = "1.5";
    if (weight >= 10) lma = "2";
    if (weight >= 20) lma = "2.5";
    if (weight >= 30) lma = "3";
    if (weight >= 50) lma = "4";

    return {
      eck: eck.toFixed(1),
      coleUncuffed: coleUncuffed.toFixed(1),
      coleCuffed: coleCuffed.toFixed(1),
      lma,
      oralDepth: oralDepth.toFixed(1),
      nasalDepth: nasalDepth.toFixed(1)
    };
  }, [decimalYear, weight, currentHeight, isWeightRequired]);

  // DYNAMISCHE DOSERING OP BASIS VAN CONFIG PRECISIE
  const getMedData = (med: PediatricMed) => {
    let rawDose = med.dosePerKg * weight;
    if (med.maxDose && rawDose > med.maxDose) rawDose = med.maxDose;
    
    const doseStr = rawDose.toFixed(med.precisionDose ?? 1);
    
    let volumeStr = null;
    if (med.concentration && med.concentration > 0) {
      const vol = rawDose / med.concentration;
      volumeStr = vol.toFixed(med.precisionVolume ?? 1);
    }
    
    return { dose: doseStr, volume: volumeStr };
  };

  return (
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] px-4 max-w-2xl mx-auto">
      {/* PATIENT GEGEVENS KAART */}
      <Card className={`border-2 transition-colors ${isWeightRequired ? 'border-amber-400 bg-amber-50/20' : 'border-teal-100 shadow-sm'}`}>
        <CardHeader className="p-4 border-b flex flex-row items-center gap-2">
          <Baby className={`h-5 w-5 ${isWeightRequired ? 'text-amber-500' : 'text-teal-600'}`} />
          <CardTitle className="text-sm font-black uppercase tracking-tighter text-slate-700">Patiënt Gegevens</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Leeftijd</Label>
              <Input type="number" value={ageValue} onChange={(e) => setAgeValue(parseFloat(e.target.value) || 0)} className="text-xl font-mono font-bold h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Eenheid</Label>
              <Select value={ageUnit} onValueChange={(v: any) => setAgeUnit(v)}>
                <SelectTrigger className="h-12 font-bold uppercase text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weeks">Weken</SelectItem>
                  <SelectItem value="months">Maanden</SelectItem>
                  <SelectItem value="years">Jaren</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Lengte (cm)</Label>
              <Input type="number" placeholder={`Est: ${Math.round(estimatedHeight)}`} value={manualHeight ?? ""} onChange={(e) => setManualHeight(e.target.value ? parseFloat(e.target.value) : null)} className="text-base font-mono font-bold h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Gewicht (kg)</Label>
              <Input type="number" placeholder={decimalYear >= 1 ? `Est: ${estimatedWeight}` : "Verplicht"} value={manualWeight ?? ""} onChange={(e) => setManualWeight(e.target.value ? parseFloat(e.target.value) : null)} className={`text-base font-mono font-bold h-12 ${isWeightRequired ? 'border-amber-500 ring-2 ring-amber-100' : ''}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isWeightRequired ? (
        <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 text-center space-y-3">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-black uppercase text-amber-800 tracking-tight">Gewicht Verplicht</h3>
          <p className="text-xs text-slate-600 font-medium italic">Voor kinderen &lt; 1 jaar is een exact gewicht vereist.</p>
        </Card>
      ) : (
        <Tabs defaultValue="airway">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl h-12 shadow-inner">
            <TabsTrigger value="airway" className="text-[10px] font-black uppercase tracking-widest"><Wind className="h-3 w-3 mr-1"/> Airway</TabsTrigger>
            <TabsTrigger value="drugs" className="text-[10px] font-black uppercase tracking-widest"><Droplets className="h-3 w-3 mr-1"/> Drugs</TabsTrigger>
            <TabsTrigger value="resus" className="text-[10px] font-black uppercase tracking-widest text-red-600 font-bold"><Zap className="h-3 w-3 mr-1"/> Resus</TabsTrigger>
          </TabsList>

          <TabsContent value="airway" className="space-y-4">
            <div className="space-y-2">
               <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Ruler className="h-3 w-3" /> Formule van Eck</Label>
               <ResultCard label="ETT Maat (ID) - Cuffed" value={airway?.eck} unit="mm" color="bg-blue-600 text-white shadow-blue-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cole Uncuffed</Label>
                <ResultCard label="ID" value={airway?.coleUncuffed} unit="mm" color="bg-slate-50 text-slate-700 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cole Cuffed</Label>
                <ResultCard label="ID" value={airway?.coleCuffed} unit="mm" color="bg-slate-50 text-slate-700 border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <ResultCard label="Diepte (Oral)" value={airway?.oralDepth} unit="cm" color="bg-indigo-50 text-indigo-700 border-indigo-100" />
              <ResultCard label="Diepte (Nas)" value={airway?.nasalDepth} unit="cm" color="bg-sky-50 text-sky-700 border-sky-100" />
              <ResultCard label="LMA Maat" value={airway?.lma} unit="#" color="bg-violet-50 text-violet-700 border-violet-100" />
            </div>
          </TabsContent>

          <TabsContent value="drugs" className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-2">
                <div className="h-3 w-1 bg-blue-500 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Inductie & Emergency</h3>
              </div>
              <Card className="border-blue-100 bg-blue-50/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-blue-100">
                  {pediatricMeds
                    .filter(m => m.category === "inductie" || m.name === "Adrenaline" || m.name === "Atropine")
                    .map(med => (
                      <DrugListItem key={med.name} med={med} data={getMedData(med)} />
                    ))}
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-2">
                <div className="h-3 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Supportive</h3>
              </div>
              <Card className="border-emerald-100 bg-emerald-50/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-emerald-100">
                  {pediatricMeds
                    .filter(m => m.category === "supportive")
                    .map(med => (
                      <DrugListItem key={med.name} med={med} data={getMedData(med)} />
                    ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resus" className="space-y-4">
             <div className="bg-red-600 p-4 rounded-2xl shadow-lg border-b-4 border-red-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-white animate-pulse" />
                  <div>
                    <p className="text-[10px] font-black text-red-100 uppercase tracking-widest">Adrenaline (10µg/kg)</p>
                    <p className="text-3xl font-mono font-black text-white">{getMedData(pediatricMeds.find(m => m.name === "Adrenaline")!).volume} <span className="text-sm">ml</span></p>
                    <p className="text-[9px] text-red-100 font-bold italic">Verdun 1mg naar 10ml NaCl</p>
                  </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                {pediatricMeds.filter(m => m.category === "resus" && m.name !== "Adrenaline").map(med => (
                  <ResultCard key={med.name} label={med.name} value={getMedData(med).dose} unit={med.unit} color="bg-white border-red-100 text-red-700 shadow-sm" />
                ))}
             </div>
             <div className="p-4 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 italic">Quick Check</p>
                <div className="flex justify-center gap-4 text-xs font-bold text-slate-600">
                  <span>Vocht: {weight * 20}ml bolus</span>
                  <span>|</span>
                  <span>Buis ID: {airway?.coleCuffed}</span>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-8">
        <a href="https://reafiche.uzgent.be/reafiche.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
          <ShieldAlert className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-black uppercase tracking-tighter">Externe bron: Reafiche UZ Gent</span>
        </a>
      </div>
    </div>
  );
}

function ResultCard({ label, value, unit, color }: any) {
  return (
    <div className={`p-3 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center transition-all ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1 leading-none">{label}</p>
      <p className="text-xl font-mono font-black leading-none">{value}<span className="text-xs ml-0.5 font-bold">{unit}</span></p>
    </div>
  );
}

function DrugListItem({ med, data }: { med: PediatricMed, data: any }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors">
      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase text-slate-400 leading-none tracking-tighter">
          {med.name} {med.concentration && med.concentration > 1 ? `(${med.concentration}${med.unit}/ml)` : ""}
        </p>
        <p className="text-sm font-black text-slate-800">
          {data.dose} <span className="text-[10px] text-slate-500 font-bold">{med.unit}</span>
        </p>
      </div>
      {data.volume && (
        <div className="text-right px-3 py-1.5 bg-white/50 rounded-xl border border-white shadow-inner">
          <p className="text-lg font-mono font-black text-teal-700 leading-none">
            {data.volume} <span className="text-[10px] ml-0.5">ml</span>
          </p>
        </div>
      )}
    </div>
  );
}
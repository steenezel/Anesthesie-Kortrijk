import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { DRUG_DATA, calculateMaxDose, calculateIntralipid } from "@/lib/drugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Calculator as CalcIcon, 
  ShieldCheck, 
  Activity,
  Share2,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorPage() {
  const { toast } = useToast();
  const [weight, setWeight] = useState<number>(70);
  const [isHypervascular, setIsHypervascular] = useState(false);
  const [patientRisk, setPatientRisk] = useState<string>("1.0");
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>([]);
  const [showProtocol, setShowProtocol] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Safe Dose Calculator State
  const [safeDrugId, setSafeDrugId] = useState(DRUG_DATA[0].id);
  const [safeConc, setSafeConc] = useState<number>(5);

  const riskValue = parseFloat(patientRisk);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addDrug = () => {
    setSelectedDrugs([
      ...selectedDrugs,
      {
        instanceId: Math.random().toString(36).substr(2, 9),
        drugId: DRUG_DATA[0].id,
        doseMg: 0,
        volumeMl: 0,
        concentration: 10,
      }
    ]);
  };

  const removeDrug = (id: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.instanceId !== id));
  };

  const updateDrug = (id: string, updates: Partial<any>) => {
    setSelectedDrugs(selectedDrugs.map(d => {
      if (d.instanceId !== id) return d;
      const next = { ...d, ...updates };
      if ('volumeMl' in updates || 'concentration' in updates) {
        next.doseMg = next.volumeMl * next.concentration;
      } else if ('doseMg' in updates) {
        next.volumeMl = next.concentration > 0 ? next.doseMg / next.concentration : 0;
      }
      return next;
    }));
  };

  const toxicityScore = useMemo(() => {
    if (weight <= 0) return 0;
    return selectedDrugs.reduce((acc, d) => {
      const max = calculateMaxDose(weight, d.drugId, isHypervascular, riskValue);
      return acc + (max > 0 ? d.doseMg / max : 0);
    }, 0);
  }, [selectedDrugs, weight, isHypervascular, riskValue]);

  const safeDoseResult = useMemo(() => {
    const maxMg = calculateMaxDose(weight, safeDrugId, isHypervascular, riskValue);
    const maxMl = safeConc > 0 ? maxMg / safeConc : 0;
    return { maxMg, maxMl };
  }, [weight, safeDrugId, isHypervascular, safeConc, riskValue]);

  const intralipid = calculateIntralipid(weight);

  const getGaugeColor = (score: number) => {
    if (score < 0.5) return "bg-emerald-500";
    if (score < 0.8) return "bg-amber-500";
    return "bg-destructive";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* EMERGENCY HEADER */}
      <Card className="border-primary/20 shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-bold text-primary uppercase tracking-tighter">LAST Control</h2>
          </div>
          <div className="flex gap-2">
            {/* HERKENNING SYMPTOMEN */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-amber-500 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-amber-50 transition-colors">
                  <Activity className="h-3.5 w-3.5" /> Symptomen
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-t-8 border-t-amber-500">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-amber-700 flex items-center gap-2 uppercase tracking-tighter">
                    <Activity className="h-6 w-6" /> Herkenning LAST
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  {[
                    { cat: "Prodromaal", items: "Metaalsmaak, Tinnitus, Periorale tintelingen" },
                    { cat: "Excitatie (CZS)", items: "Agitatie, Spiertrekkingen, Insulten" },
                    { cat: "Depressie (CZS)", items: "Coma, Ademstilstand" },
                    { cat: "Cardiaal (CVS)", items: "Bradycardie, Aritmie, Asystolie" }
                  ].map((group, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-black text-amber-700 uppercase mb-0.5">{group.cat}</span>
                      <span className="text-xs font-bold text-slate-700 leading-tight">{group.items}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* LIPID PROTOCOL */}
            <Dialog open={showProtocol} onOpenChange={setShowProtocol}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-md hover:bg-destructive/90 transition-colors">
                  <ShieldAlert className="h-3.5 w-3.5" /> Lipid Protocol
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-t-8 border-t-destructive">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-destructive flex items-center gap-2 uppercase tracking-tighter">
                    <ShieldAlert className="h-8 w-8" /> INTRALIPID 20%
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-destructive/10 p-4 rounded-2xl border-2 border-destructive/20 text-center">
                      <div className="text-[10px] uppercase font-bold text-destructive mb-1">Bolus (1.5 mL/kg)</div>
                      <div className="text-3xl font-mono font-black text-destructive">{intralipid.bolus.toFixed(1)} <span className="text-sm">mL</span></div>
                    </div>
                    <div className="bg-destructive/5 p-4 rounded-2xl border-2 border-destructive/10 text-center">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Infusion (0.25 mL/kg/min)</div>
                      <div className="text-3xl font-mono font-black text-foreground">{intralipid.infusion.toFixed(1)} <span className="text-sm">mL/min</span></div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-6 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> ACLS Modificaties
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] leading-snug">
                        <p className="font-bold text-blue-900 uppercase tracking-tighter mb-1">Adrenaline</p>
                        <p className="text-blue-800 font-medium italic">
                          Reduceer doses tot {"< "} {(weight * 1).toFixed(0)} µg ({"< "} 1 µg/kg). 
                          Vermijd standaard 1 mg bolussen.
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-[11px] leading-snug">
                        <p className="font-bold text-amber-900 uppercase tracking-tighter mb-1">Aritmie Management</p>
                        <p className="text-amber-800 font-medium italic">
                          Vermijd vasopressine en calciumblokkers. Lidocaïne is gecontra-indiceerd.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Gewicht (kg)</Label>
              <Input 
                type="number" 
                value={weight === 0 ? "" : weight}
                onChange={(e) => setWeight(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="text-2xl font-mono font-bold h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Type Blok</Label>
              <Select value={isHypervascular ? "hyper" : "std"} onValueChange={(v: string) => setIsHypervascular(v === "hyper")}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Standaard</SelectItem>
                  <SelectItem value="hyper">Hypervasculair (α=0.8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Patiënt Risico Profiel</Label>
            <Select value={patientRisk} onValueChange={(v: string) => setPatientRisk(v)}>
              <SelectTrigger className="h-12 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">Laag Risico (Standaard, α=1.0)</SelectItem>
                <SelectItem value="0.8">Matig Risico (Ouderdom, hart/leverfalen, α=0.8)</SelectItem>
                <SelectItem value="0.7">Hoog Risico (Zwangerschap, orgaanfalen, α=0.7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="safe-dose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/80 p-1.5 rounded-2xl h-14 shadow-inner">
          <TabsTrigger value="safe-dose" className="rounded-xl font-black uppercase tracking-tight text-xs gap-2">
            <ShieldCheck className="h-4 w-4" /> Max Safe Dose
          </TabsTrigger>
          <TabsTrigger value="toxicity" className="rounded-xl font-black uppercase tracking-tight text-xs gap-2">
            <CalcIcon className="h-4 w-4" /> Toxicity Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="safe-dose" className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <Card className="border-2 border-primary/20 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center">
                  <div className="text-[10px] uppercase font-bold text-primary mb-1">Max Dose (mg)</div>
                  <div className="text-3xl font-mono font-black text-primary">{safeDoseResult.maxMg.toFixed(1)}</div>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Max Volume (mL)</div>
                  <div className="text-3xl font-mono font-black text-emerald-600">{safeDoseResult.maxMl.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Molecule</Label>
                <Select value={safeDrugId} onValueChange={(v: string) => setSafeDrugId(v)}>
                  <SelectTrigger className="h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRUG_DATA.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Concentratie (mg/ml)</Label>
                <Input type="number" value={safeConc === 0 ? "" : safeConc} onChange={(e) => setSafeConc(e.target.value === "" ? 0 : parseFloat(e.target.value))} className="h-12 font-mono text-xl" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toxicity" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <Card className="relative overflow-hidden border-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
              <motion.div 
                className={`h-full ${getGaugeColor(toxicityScore)}`}
                animate={{ width: `${Math.min(toxicityScore * 100, 100)}%` }}
              />
            </div>
            <CardContent className="p-6 text-center">
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Cumulative Toxicity Score</div>
              <div className={`text-5xl font-mono font-black ${(toxicityScore >= 1) ? 'text-destructive animate-pulse' : ''}`}>
                {(toxicityScore * 100).toFixed(1)}%
              </div>
              {toxicityScore >= 1 && (
                <div className="mt-2 text-destructive font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-tighter">
                  <AlertTriangle className="h-4 w-4" /> Toxic Limit Exceeded
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Geadministreerd</h3>
              <Button onClick={addDrug} size="sm" variant="outline" className="gap-2 rounded-lg border-primary/20 text-primary uppercase text-[10px] font-black h-8">
                <Plus className="h-3 w-3" /> Add Drug
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {selectedDrugs.map((drug) => (
                <motion.div key={drug.instanceId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Select value={drug.drugId} onValueChange={(v: string) => updateDrug(drug.instanceId, { drugId: v })}>
                          <SelectTrigger className="flex-1 font-bold h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DRUG_DATA.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeDrug(drug.instanceId)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">Conc (mg/ml)</Label>
                          <Input type="number" value={drug.concentration === 0 ? "" : drug.concentration} onChange={(e) => updateDrug(drug.instanceId, { concentration: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className="font-mono h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">Volume (mL)</Label>
                          <Input type="number" value={drug.volumeMl === 0 ? "" : drug.volumeMl} onChange={(e) => updateDrug(drug.instanceId, { volumeMl: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className="font-mono h-9" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
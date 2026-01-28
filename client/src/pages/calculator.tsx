import { useState, useMemo, useEffect } from "react";
import { DRUG_DATA, SelectedDrug, calculateMaxDose, calculateIntralipid } from "@/lib/drugs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(70);
  const [isHypervascular, setIsHypervascular] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [showProtocol, setShowProtocol] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        usePercentage: true
      }
    ]);
  };

  const removeDrug = (id: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.instanceId !== id));
  };

  const updateDrug = (id: string, updates: Partial<SelectedDrug>) => {
    setSelectedDrugs(selectedDrugs.map(d => {
      if (d.instanceId !== id) return d;
      const next = { ...d, ...updates };
      
      if ('volumeMl' in updates || 'concentration' in updates || 'usePercentage' in updates) {
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
      const max = calculateMaxDose(weight, d.drugId, isHypervascular);
      return acc + (max > 0 ? d.doseMg / max : 0);
    }, 0);
  }, [selectedDrugs, weight, isHypervascular]);

  const intralipid = calculateIntralipid(weight);

  const getGaugeColor = (score: number) => {
    if (score < 0.5) return "bg-emerald-500";
    if (score < 0.8) return "bg-amber-500";
    return "bg-destructive";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Gewicht (kg)</Label>
              <Input 
                type="number" 
                value={weight === 0 ? "" : weight}
                placeholder="0"
                onChange={(e) => setWeight(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="text-2xl font-mono font-bold h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Type Blok</Label>
              <Select value={isHypervascular ? "hyper" : "std"} onValueChange={(v) => setIsHypervascular(v === "hyper")}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="std">Standaard</SelectItem>
                  <SelectItem value="hyper">Hypervasculair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-2 border-border">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <motion.div 
            className={`h-full ${getGaugeColor(toxicityScore)}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(toxicityScore * 100, 100)}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-1">Cumulative Toxicity Score</div>
          <div className={`text-5xl font-mono font-black ${(toxicityScore >= 1) ? 'text-destructive animate-pulse' : ''}`}>
            {(toxicityScore * 100).toFixed(1)}%
          </div>
          {toxicityScore >= 1 && (
            <div className="mt-2 text-destructive font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" /> TOXIC LIMIT EXCEEDED
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showProtocol} onOpenChange={setShowProtocol}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full h-16 text-lg font-black uppercase tracking-tighter shadow-xl shadow-destructive/20 hover:scale-[1.02] transition-transform">
            <ShieldAlert className="mr-2 h-6 w-6" /> OPEN INTRALIPID PROTOCOL
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-destructive flex items-center gap-2">
              <ShieldAlert className="h-8 w-8" /> INTRALIPID 20%
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-destructive/10 p-4 rounded-2xl border-2 border-destructive/20 text-center">
                <div className="text-xs uppercase font-bold text-destructive mb-1">Bolus (1.5 mL/kg)</div>
                <div className="text-3xl font-mono font-black text-destructive">{intralipid.bolus.toFixed(1)} <span className="text-sm">mL</span></div>
              </div>
              <div className="bg-destructive/5 p-4 rounded-2xl border-2 border-destructive/10 text-center">
                <div className="text-xs uppercase font-bold text-muted-foreground mb-1">Infusion (0.25 mL/kg/min)</div>
                <div className="text-3xl font-mono font-black text-foreground">{intralipid.infusion.toFixed(1)} <span className="text-sm">mL/min</span></div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Repeat bolus</strong> every 3-5 mins if stability not restored (max 3 doses total).</p>
              <p>• <strong>Double infusion rate</strong> to 0.5 mL/kg/min if stability not restored.</p>
              <p>• <strong>Continue infusion</strong> for 10 mins after stability.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading">Local Anesthetics</h3>
          <Button onClick={addDrug} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Drug
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {selectedDrugs.map((drug) => (
            <motion.div
              key={drug.instanceId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <Card className="border-l-4 border-l-primary overflow-visible">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Select 
                      value={drug.drugId} 
                      onValueChange={(v) => updateDrug(drug.instanceId, { drugId: v })}
                    >
                      <SelectTrigger className="flex-1 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRUG_DATA.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDrug(drug.instanceId)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Concentratie (mg/ml)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          step="0.5"
                          inputMode="decimal"
                          value={drug.concentration === 0 ? "" : drug.concentration}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            updateDrug(drug.instanceId, { concentration: val });
                          }}
                          className="font-mono h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Volume (mL)</Label>
                      <Input 
                        type="number" 
                        value={drug.volumeMl === 0 ? "" : drug.volumeMl}
                        placeholder="0"
                        onChange={(e) => updateDrug(drug.instanceId, { volumeMl: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                        className="font-mono h-9"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                    <div className="text-xs font-bold text-muted-foreground">Totaal: {drug.doseMg.toFixed(1)} mg</div>
                    <div className="text-xs font-mono font-bold">
                      {((drug.doseMg / calculateMaxDose(weight, drug.drugId, isHypervascular)) * 100).toFixed(1)}% van max
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedDrugs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-3xl text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">Click 'Add Drug' to begin calculation</p>
          </div>
        )}
      </div>
    </div>
  );
}

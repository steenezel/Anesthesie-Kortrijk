import { useState } from "react";
import { DRUGS } from "@/lib/drugs";
import { DrugCard } from "@/components/drug-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(70);
  const [weightInput, setWeightInput] = useState<string>("70");

  const handleWeightChange = (val: string) => {
    setWeightInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setWeight(num);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      
      {/* Weight Input Section */}
      <section className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Patient Data</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="weight" className="text-base font-medium">Weight (kg)</Label>
              <div className="relative mt-2">
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="text-3xl font-mono h-14 pl-4 pr-12 font-bold bg-secondary/20 border-secondary focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">kg</span>
              </div>
            </div>
            <div className="w-24 bg-muted rounded-lg p-2 flex flex-col items-center justify-center h-14 border border-border/50">
               <span className="text-xs text-muted-foreground">Lbs</span>
               <span className="font-mono font-medium text-foreground">{(weight * 2.20462).toFixed(0)}</span>
            </div>
          </div>

          <Slider
            defaultValue={[70]}
            max={150}
            min={1}
            step={1}
            value={[weight]}
            onValueChange={(vals) => handleWeightChange(vals[0].toString())}
            className="py-2"
          />
        </div>
      </section>

      {/* Warning if weight is unusual */}
      {weight < 30 && (
         <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pediatric/Low Weight Warning</AlertTitle>
          <AlertDescription>
            Verify weight carefully. Pediatric dosing requires extreme caution.
          </AlertDescription>
        </Alert>
      )}

      {/* Drug List */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-semibold text-lg text-foreground">Anesthetics</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">Max Doses</span>
        </div>

        {DRUGS.map((drug) => (
          <motion.div key={drug.id} variants={item}>
            <DrugCard drug={drug} weight={weight} />
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center text-xs text-muted-foreground pt-8 pb-4">
        <p>Values based on common clinical guidelines.</p>
        <p>Always verify with institutional protocols.</p>
      </div>
    </div>
  );
}

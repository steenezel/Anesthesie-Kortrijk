import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Phone, AlertOctagon } from "lucide-react";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3">
        <AlertOctagon className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h2 className="font-heading font-bold text-destructive text-lg">LAST EMERGENCY</h2>
          <p className="text-sm text-destructive-foreground">Stop injection immediately if toxicity is suspected.</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Immediate Management</h3>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <span className="font-medium">Airway Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 bg-muted/20">
                  <ul className="list-disc list-inside space-y-1 text-sm pt-2">
                    <li>Ventilate with 100% Oxygen</li>
                    <li>Avoid hyperventilation (aim for normal CO2)</li>
                    <li>Secure airway if necessary</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                     <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <span className="font-medium">Seizure Suppression</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 bg-muted/20">
                  <ul className="list-disc list-inside space-y-1 text-sm pt-2">
                    <li>Benzodiazepines (Midazolam 1-2mg IV)</li>
                    <li>Propofol (small doses, avoid cardiovascular depression)</li>
                    <li>Avoid large doses if unstable</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="item-3">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                     <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <span className="font-medium">Cardiovascular Support</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 bg-muted/20">
                  <ul className="list-disc list-inside space-y-1 text-sm pt-2">
                    <li>ACLS protocols with modifications</li>
                    <li><strong>Reduced Epinephrine doses</strong> (&lt; 1mcg/kg)</li>
                    <li>Avoid Vasopressin</li>
                    <li>Avoid Calcium Channel Blockers & Beta Blockers</li>
                    <li>Amiodarone is preferred for arrhythmias</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
         <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Lipid Emulsion Therapy (20%)</h3>
         <Card className="border-l-4 border-l-emerald-500 overflow-hidden">
            <CardHeader className="bg-emerald-500/10 pb-3">
              <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Intralipid 20%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <div className="text-xs uppercase text-muted-foreground font-bold">Bolus</div>
                <div className="text-xl font-mono font-bold">1.5 mL/kg</div>
                <div className="text-sm text-muted-foreground">Over 1 minute</div>
              </div>
              <div className="w-full h-px bg-border"></div>
              <div className="space-y-1">
                <div className="text-xs uppercase text-muted-foreground font-bold">Infusion</div>
                <div className="text-xl font-mono font-bold">0.25 mL/kg/min</div>
                <div className="text-sm text-muted-foreground">Continue for at least 10 mins after stability</div>
              </div>
               <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm border border-amber-100 dark:border-amber-900/50 mt-2">
                <p><strong>Refractory?</strong> Repeat bolus (max 2 times) and increase infusion to 0.5 mL/kg/min.</p>
                <p className="mt-1 text-xs text-muted-foreground">Max total dose: ~10-12 mL/kg over first 30 mins.</p>
              </div>
            </CardContent>
         </Card>
      </div>

      <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-4 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-foreground">Lipid Rescue</div>
          <div className="text-sm text-muted-foreground">www.lipidrescue.org</div>
        </div>
      </div>
    </div>
  );
}

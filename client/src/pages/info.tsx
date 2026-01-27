import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info as InfoIcon } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">About This Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            This LAST (Local Anesthetic Systemic Toxicity) Calculator is designed to assist anesthesia providers in quickly estimating maximum safe doses of common local anesthetics.
          </p>
          <p>
            The interface is optimized for mobile use in clinical environments, focusing on clarity, speed, and high-contrast legibility.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-foreground">
            <InfoIcon className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive font-bold">Educational Use Only</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              <p className="mb-2">
                This application is a reference tool and does not replace clinical judgment.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Dosage limits vary by patient condition (age, liver/renal function, comorbidities).</li>
                <li>Absorption rates vary by injection site (Intravascular &gt; Intercostal &gt; Caudal &gt; Epidural &gt; Brachial Plexus &gt; Sciatic/Femoral &gt; SubQ).</li>
                <li>Always aspirate before injection.</li>
              </ul>
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground mt-4">
            Data sources roughly aligned with ASRA (American Society of Regional Anesthesia and Pain Medicine) and manufacturers' guidelines.
          </p>
        </CardContent>
      </Card>

      <div className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Designed for Safety
        </p>
      </div>
    </div>
  );
}

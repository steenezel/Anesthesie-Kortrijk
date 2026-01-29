import { useRoute } from "wouter";
import { ChevronLeft, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id;

  const getProtocolData = (id: string | undefined) => {
    switch(id) {
      case "gastric-bypass":
        return {
          title: "Gastric Bypass",
          lastUpdated: "Januari 2026",
          sections: [
            { title: "Pre-operatief", content: "Opname op dag zelf. Patiënt stapt naar de zaal." },
            { title: "Installatie", content: "• Eén perifere lijn. • Arteriële en/of centrale: zeer zelden, enkel op indicatie comorbiditeit. • Maagsonde: specifieke sonde voor bypass met mogelijkheid voor aspiratie, inspuiten, afklemmen en correcte afstandsbepaling. • SpotOn. • Zo beschikbaar: continue TOF" },
            { title: "Onderhoud", content: "• Inductie: Sufenta 10 mcg – Propofol 2mg/kg IBW – Rocuronium 0.6 mg/kg IBW • Onderhoud: Ultiva lage dosis (3-5 ml/u) – Sevo • Cefazoline 2g (>120kg: 3g). Enkel peroperatief. • Pantomed 40 mg (indien niet per os ingenomen) • Anti-emetica: DHBP 0.6 mg, Aacidexam 10 mg, Ondansetron 4 mg" },
            { title: "Pijnbeleid", content: "• Multimodale analgesie volgens schema: Paracetamol 1g met Catapressan 75 mcg, Ketamine 0.1 mg/kg OF Ketamine continu infuus 1.5 mg/kg tot 20 mL aan 2 ml/uur (zie EMV-schema Bariatrie), Lidocaine 1,5 mg/kg, Magnesium 2g in 100 mL, Ibuprofen 600 mg, Novalgine 1g. • Naar einde ingreep: Dipidolor of Morfine 5 mg iv. • Postoperatief geen NSAIDs. • Novalgine volgens persoonlijke voorkeur. Als je dit niet wil voorschrijven: toch voorschrijven maar dan “onderbreken” om duidelijk te maken dat dit bewuste keuze is." },
            { title: "Specifieke aandachtspunten", content: "• Preventie atelectase: zuurstoffractie zo laag mogelijk, PEEP 6-10 cm H20, elk halfuur recruteren. • Restrictief vochtbeleid. • Soms lektest met methyleenblauw via maagsonde. • Patiënt stimuleren om zelf over te kruipen in bed na extubatie." },
            { title: "Postoperatief", content: "• - Cfr medicatieschema KP, inclusief anti-emetica. • Fraxiparine: Avond operatie bij iedereen Fraxi 0.4 mL. Daarna volgens gewicht: <100kg 0.4 mL; 100-150kg 0.6 mL; >150kg 0.8 mL." }
          ]
        };
      case "lever-chirurgie":
        return {
          title: "Leverchirurgie",
          lastUpdated: "Januari 2026",
          sections: [
            { title: "Pre-operatief", content: "Evaluatie leverfunctie (Child-Pugh, MELD). Stollingsstatus controleren. Bloedgroepbepaling en kruisproef (2-4 units)." },
            { title: "Monitoring", content: "Invasieve bloeddrukmeting. Centraal veneuze katheter (CVP streefwaarde laag houden tijdens resectie: < 5 mmHg). Temperatuurmonitoring." },
            { title: "Inductie & Maintenance", content: "TIVA of inhalatieanesthesie. Voorzichtig met hepatotoxische medicatie. Handhaaf normovolemie buiten de resectiefase." },
            { title: "Bijzonderheden", content: "Pringle manoeuvre (ischemietijd bewaken). Correctie van stollingsstoornissen en electrolyten. Glucosemonitoring." }
          ]
        };
      default:
        return {
          title: id?.replace("-", " ").toUpperCase() + " Anesthesie",
          lastUpdated: "Gereviseerd op: 12/01/2026",
          sections: [
            { title: "Pre-operatief", content: "Nuchterbeleid volgens standaard. Screening op allergieën en eerdere anesthesieproblemen." },
            { title: "Inductie", content: "Standaard monitoring. Propofol 2-3 mg/kg, Sufentanil 0.1-0.2 µg/kg." },
            { title: "Maintenance", content: "Sevofluraan 1.0 MAC of TIVA (Propofol/Remifentanil)." },
            { title: "Post-operatief", content: "Pijnbestrijding: Paracetamol 1g iv, NSAID indien geen contra-indicaties." }
          ]
        };
    }
  };

  const protocolData = getProtocolData(id);

  return (
    <div className="space-y-6 pb-20">
      <Link href="/protocols">
        <div className="flex items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Terug naar overzicht
        </div>
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-tight">
          {protocolData.title}
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock className="h-3 w-3" /> {protocolData.lastUpdated}
        </div>
      </div>

      <div className="grid gap-4">
        {protocolData.sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-tighter text-sm">
              <div className="h-1 w-4 bg-blue-500 rounded-full"></div>
              {section.title}
            </h3>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 text-sm text-slate-600 leading-relaxed italic">
                {section.content.includes("•") ? (
                  <ul className="list-none space-y-1">
                    {section.content.split("•").filter(item => item.trim()).map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  section.content
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200 border-2">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="text-xs text-amber-700 font-medium">
            <strong>Let op:</strong> Dit is een standaardprotocol. Individualiseer altijd op basis van patiëntkarakteristieken.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

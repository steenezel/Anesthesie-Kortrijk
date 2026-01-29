import { useRoute } from "wouter";
import { ChevronLeft, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id;

  const protocolData = id === "gastric-bypass" ? {
    title: "Gastric Bypass",
    lastUpdated: "Januari 2026",
    sections: [
      { title: "Pre-operatief", content: "Screening op obstructieve slaapapneu (OSA). Check nuchterbeleid. Toediening premedicatie indien afgesproken." },
      { title: "Inductie", content: "RSI-inductie (bij vermoeden reflux). Propofol op basis van Lean Body Mass. Succinylcholine of Rocuronium voor relaxatie." },
      { title: "Maintenance", content: "Luchtwegbeheer: ETT. Beademing: Pressure Controlled / Volume Guaranteed met PEEP. Sevofluraan of Desfluraan." },
      { title: "Post-operatief", content: "Extubatie bij volledige recovery (TOF > 0.9). Pijnbestrijding: Multimodaal (Paracetamol iv, NSAID indien toegestaan). PONV profylaxe." }
    ]
  } : {
    title: id?.charAt(0).toUpperCase() + id?.slice(1) + " Anesthesie",
    lastUpdated: "Gereviseerd op: 12/01/2026",
    sections: [
      { title: "Pre-operatief", content: "Nuchterbeleid volgens standaard. Screening op allergieën en eerdere anesthesieproblemen." },
      { title: "Inductie", content: "Standaard monitoring. Propofol 2-3 mg/kg, Sufentanil 0.1-0.2 µg/kg." },
      { title: "Maintenance", content: "Sevofluraan 1.0 MAC of TIVA (Propofol/Remifentanil)." },
      { title: "Post-operatief", content: "Pijnbestrijding: Paracetamol 1g iv, NSAID indien geen contra-indicaties." }
    ]
  };

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
                {section.content}
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

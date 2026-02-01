import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Key, 
  MapPin, 
  Users, 
  AlertTriangle, 
  ChevronRight,
  Info
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function OnboardingPage() {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          On<span className="text-teal-600">boarding</span>
        </h1>
        <p className="text-slate-500 text-sm italic">Welkom in het team van AZ Groeninge.</p>
      </header>

      {/* 1. LOGISTIEK & TOEGANG */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-500" /> Logistiek & Toegang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-bold">Badge & Kledij</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm space-y-2">
                <p>• **Badge:** Af te halen bij de personeelsdienst (Route 12). Geeft toegang tot OK-complex en lockers.</p>
                <p>• **Kledij:** Beschikbaar via de kledingautomaat op niveau -1. Maat doorgeven bij start.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-bold">IT & Logins</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm space-y-2">
                <p>• **EPD (HiX):** Login via je algemene ziekenhuisaccount.</p>
                <p>• **PACSON:** Radiologie viewer op elk werkstation.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* 2. ZAAL-SPECIFIEKE TIPS (Jouw specialisaties) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Zaal-Specifieke Tips</h3>
        <div className="grid gap-3">
          <Card className="hover:bg-slate-50 transition-colors cursor-help">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600 font-bold text-xs">OK 5</div>
              <div>
                <h4 className="font-bold text-sm uppercase">Robot-chirurgie (Uro/Abdo)</h4>
                <p className="text-xs text-slate-500 mt-1">Focus op positionering en beperkte toegang tot de patiënt. Check altijd de arm-vrijheid.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:bg-slate-50 transition-colors cursor-help">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="bg-rose-100 p-2 rounded-lg text-rose-600 font-bold text-xs">OK 8</div>
              <div>
                <h4 className="font-bold text-sm uppercase">Borstchirurgie</h4>
                <p className="text-xs text-slate-500 mt-1">Standaard PECS I/II of Serratus Plane blocks. Overleg met de chirurg over lokale infiltratie.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. EXPERTISE & MENTOREN */}
      <Card className="border-l-4 border-l-teal-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-500" /> Wie is Wie?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-slate-100">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Locoregionale Expert</p>
                  <p className="text-xs text-slate-500">Aanspreekpunt voor complexe blocks.</p>
                </div>
                <Info className="h-4 w-4 text-slate-300" />
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Medisch Diensthoofd</p>
                  <p className="text-xs text-slate-500">Algemene organisatie en planning.</p>
                </div>
                <Info className="h-4 w-4 text-slate-300" />
              </div>
           </div>
        </CardContent>
      </Card>

      {/* 4. EMERGENCY LOCATIONS */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <h3 className="text-red-700 font-black uppercase text-xs flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Emergency Flashcard
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Moeilijke Luchtweg</p>
              <p className="text-xs font-black text-red-600">Tegenover OK 4</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Lipid Rescue</p>
              <p className="text-xs font-black text-red-600">In elke blok-kar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
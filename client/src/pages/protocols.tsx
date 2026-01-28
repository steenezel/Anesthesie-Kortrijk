import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Protocols() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Protocollen
        </h1>
        <p className="text-slate-500">
          Raadpleeg de actuele anesthesieprotocollen van AZ Groeninge.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Zoek op ingreep of specialisme..." className="pl-10 h-12 bg-white border-2 border-slate-100 focus:border-blue-500 transition-colors" />
      </div>

      <div className="grid gap-3">
        {["Heelkunde", "Orthopedie", "Gynaecologie", "Urologie", "NKO"].map((dept) => (
          <Card key={dept} className="cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-slate-700 uppercase tracking-tight">{dept}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">12 documenten</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

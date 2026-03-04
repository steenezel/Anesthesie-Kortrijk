import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Calendar as CalendarIcon, Plus, User, Info, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function Marketplace() {
  const [view, setView] = useState<"home" | "offer" | "list">("home");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const { toast } = useToast();

  // 1. Data ophalen
  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/marketplace"],
  });

  // 2. Data opslaan
  const mutation = useMutation({
    mutationFn: async (newOffer: { providerName: string; date: string }) => {
      await apiRequest("POST", "/api/marketplace", newOffer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({ title: "Succes!", description: "Je verlof staat op de marktplaats." });
      setView("list");
      setName("");
    },
  });

  const handleOfferSubmit = () => {
    if (!selectedDate || !name) return;
    mutation.mutate({
      providerName: name,
      date: format(selectedDate, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="p-4 flex items-center bg-white border-b border-slate-100 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => view === "home" ? window.history.back() : setView("home")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug
        </Button>
        <h1 className="flex-1 text-center font-black uppercase text-xs tracking-widest text-slate-900">Marktplaats</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {view === "home" && (
          <div className="grid gap-4 pt-4">
            <MenuCard 
              title="Verlof aanbieden" 
              icon={<Plus className="text-teal-600" />} 
              onClick={() => setView("offer")}
              color="bg-teal-50 border-teal-100"
            />
            <MenuCard 
              title="Beschikbaar verlof" 
              icon={<CalendarIcon className="text-blue-600" />} 
              onClick={() => setView("list")}
              color="bg-blue-50 border-blue-100"
            />
          </div>
        )}

        {view === "offer" && (
          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
            <CardHeader className="bg-teal-600 text-white">
              <CardTitle className="text-sm font-black uppercase tracking-tighter">Kies een datum</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jouw Naam</label>
                <Input placeholder="v.b. Dr. Janssens" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-slate-200" />
              </div>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 h-12 rounded-xl font-bold"
                disabled={!selectedDate || !name || mutation.isPending}
                onClick={handleOfferSubmit}
              >
                {mutation.isPending ? <Loader2 className="animate-spin" /> : "NU AANBIEDEN"}
              </Button>
            </CardContent>
          </Card>
        )}

  {view === "list" && (
  <div className="space-y-3">
    <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Aangeboden dagen</h2>
    {isLoading ? (
      <Loader2 className="mx-auto animate-spin text-slate-300 mt-10" />
    ) : (!offers || (Array.isArray(offers) && offers.length === 0)) ? (
      <p className="text-center text-slate-400 py-10 text-sm italic">Geen verlof beschikbaar momenteel.</p>
    ) : (
      // We forceren hier dat 'offers' als array wordt gezien om de TS-fout op te lossen
      (offers as any[]).map((offer: any) => (
        <Card key={offer.id} className="border-none shadow-sm rounded-2xl overflow-hidden active:scale-95 transition-transform">
          <div className="flex items-center p-4 gap-4">
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-600">
              <span className="text-[10px] font-black uppercase">{format(new Date(offer.date), "MMM", { locale: nl })}</span>
              <span className="text-lg font-black leading-none">{format(new Date(offer.date), "dd")}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase text-slate-900">{offer.providerName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(offer.date), "eeee d MMMM yyyy", { locale: nl })}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => {
              toast({
                title: "Contact",
                description: `Neem contact op met ${offer.providerName} om dit over te nemen.`,
              });
            }}>
              <Info className="h-5 w-5 text-slate-300" />
            </Button>
          </div>
        </Card>
      ))
    )}
  </div>
)}
     </div>
    </div>
  );
}

function MenuCard({ title, icon, onClick, color }: any) {
  return (
    <Card className={`${color} border-2 cursor-pointer active:scale-95 transition-all rounded-[24px] shadow-none`} onClick={onClick}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm">{icon}</div>
        <span className="font-black uppercase text-slate-800 tracking-tight">{title}</span>
      </CardContent>
    </Card>
  );
}
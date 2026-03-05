import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Calendar as CalendarIcon, Plus, Info, Loader2, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Marketplace() {
  const [view, setView] = useState<"home" | "offer" | "list">("home");
  // Belangrijk: we gebruiken nu een array voor meerdere datums
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [name, setName] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const isAdmin = clickCount >= 5;
  const { toast } = useToast();


 
  // 1. Data ophalen
  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/marketplace"],
  });

  // 2. Data opslaan (mutatie voor meerdere dagen)
  const mutation = useMutation({
    mutationFn: async (newOffers: { providerName: string; date: string }[]) => {
      // We sturen ze één voor één of via een Promise.all
      const promises = newOffers.map(offer => apiRequest("POST", "/api/marketplace", offer));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({ title: "Succes!", description: "De geselecteerde dagen staan op de marktplaats." });
      setView("list");
      setName("");
      setSelectedDates([]);
    },
  });

  // 3. Verwijder mutatie (Admin functionaliteit)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/marketplace/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({ title: "Verwijderd", description: "De aanbieding is verwijderd." });
    },
  });

  const handleOfferSubmit = () => {
    if (!selectedDates || selectedDates.length === 0 || !name) return;
    
    const offerPayload = selectedDates.map(date => ({
      providerName: name,
      date: format(date, "yyyy-MM-dd"),
    }));

    mutation.mutate(offerPayload);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="p-4 flex items-center bg-white border-b border-slate-100 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => view === "home" ? window.history.back() : setView("home")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Terug
        </Button>
        <h1 
            onClick={() => setClickCount(prev => prev + 1)}
            className="flex-1 text-center font-black uppercase text-xs tracking-widest text-slate-900 select-none"
            >
            Marktplaats {isAdmin && " (Beheer)"}
        </h1>
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
              <CardTitle className="text-sm font-black uppercase tracking-tighter">Kies data</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-inner-sm flex justify-center">
                <Calendar 
                    mode="multiple" 
                    selected={selectedDates} 
                    onSelect={setSelectedDates}
                    className="rounded-md"
                    locale={nl as any}
                    // Voeg deze props toe voor een schone look
                    showOutsideDays={false} 
                />
                </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jouw Naam</label>
                <Input placeholder="v.b. Dr. Janssens" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-slate-200" />
              </div>
   <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button 
      className="w-full bg-teal-600 hover:bg-teal-700 h-12 rounded-xl font-bold text-white shadow-lg shadow-teal-100 transition-all active:scale-95"
      disabled={!selectedDates || selectedDates.length === 0 || !name || mutation.isPending}
    >
      {mutation.isPending ? <Loader2 className="animate-spin" /> : "NU AANBIEDEN"}
    </Button>
  </AlertDialogTrigger>
  
  <AlertDialogContent className="rounded-[32px] border-none p-8">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-black uppercase tracking-tight text-slate-900">
        Belangrijke herinnering
      </AlertDialogTitle>
      <AlertDialogDescription className="text-slate-600 space-y-4 pt-4 leading-relaxed">
        <p className="font-bold flex gap-3">
          <span className="text-teal-600">1°</span>
          <span>Indien niemand je verlof overneemt blijft je verlof ook gewoon staan.</span>
        </p>
        <p className="font-bold flex gap-3">
          <span className="text-teal-600">2°</span>
          <span>
            Hou er rekening mee dat wanneer iemand verlof in pakweg november overneemt, 
            de beschikbaarheid van verlof beperkt kan zijn, waardoor je dus misschien 
            je open verlofdagen niet meer kan opnemen. 
          </span>
        </p>
        <p className="bg-amber-50 p-4 rounded-2xl text-[11px] text-amber-800 font-bold uppercase tracking-wider leading-normal border border-amber-100">
          Als het finaal niet lukt om je volledige verlof op te nemen dan is het je eigen verantwoordelijkheid.
        </p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="mt-8 gap-3">
      <AlertDialogCancel className="rounded-xl border-slate-200 font-bold text-slate-500">
        ANNULEREN
      </AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleOfferSubmit}
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold px-8 shadow-md shadow-teal-100"
      >
        IK GA AKKOORD
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
            </CardContent>
          </Card>
        )}

        {view === "list" && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 text-center">Aangeboden dagen</h2>
            {isLoading ? (
              <Loader2 className="mx-auto animate-spin text-slate-300 mt-10" />
            ) : (!offers || (Array.isArray(offers) && offers.length === 0)) ? (
              <p className="text-center text-slate-400 py-10 text-sm italic">Geen verlof beschikbaar momenteel.</p>
            ) : (
              (offers as any[]).map((offer: any) => (
                <Card key={offer.id} className="border-none shadow-sm rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
                  <div className="flex items-center p-4 gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-600">
                      <span className="text-[10px] font-black uppercase">{format(new Date(offer.date), "MMM", { locale: nl })}</span>
                      <span className="text-lg font-black leading-none">{format(new Date(offer.date), "dd")}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase text-slate-900">{offer.providerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(offer.date), "eeee d MMMM", { locale: nl })}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => {
                        toast({
                          title: "Contact",
                          description: `Neem contact op met ${offer.providerName} om dit over te nemen.`,
                        });
                      }}>
                        <Info className="h-5 w-5 text-slate-300" />
                      </Button>
                      
                      {/* Verwijder knop voor admin/beheer */}
                     {/* Alleen renderen als isAdmin écht true is */}
                    {clickCount >= 5 && (
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-slate-200 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                        // e.stopPropagation voorkomt dat je per ongeluk andere klik-events triggert
                        e.stopPropagation(); 
                        if (confirm("Zeker dat je deze aanbieding wilt verwijderen?")) {
                            deleteMutation.mutate(offer.id);
                        }
                        }}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                        )}
                    </div>
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
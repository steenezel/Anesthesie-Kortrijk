import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Phone, Search, Stethoscope, GraduationCap, ChevronLeft} from "lucide-react";

const contacts = [
{ name: "Alegret Carmen", role: "Staf", phone: "3040", category: "staf" },
{ name: "Becaus Nathalie", role: "Staf", phone: "3041", category: "staf" },
{ name: "Bogaert Simon", role: "Staf", phone: "3078", category: "staf" },
{ name: "Carlier Laurence", role: "Staf", phone: "3072", category: "staf" },
{ name: "Casier Isabelle", role: "Staf", phone: "3042", category: "staf" },
{ name: "Castelain Charlotte", role: "Staf", phone: "3045", category: "staf" },
{ name: "Chafai Ali", role: "Staf", phone: "3046", category: "staf" },
{ name: "De Corte Wouter", role: "Staf", phone: "3047", category: "staf" },
{ name: "De Greef Evy", role: "Staf", phone: "3083", category: "staf" },
{ name: "De Leeuw Marie", role: "Staf", phone: "3069", category: "staf" },
{ name: "Demeyer Caroline", role: "Staf", phone: "3048", category: "staf" },
{ name: "Desmet Francis", role: "Staf", phone: "3067", category: "staf" },
{ name: "Desmet Matthias", role: "Staf", phone: "3050", category: "staf" },
{ name: "Detienne Hans", role: "Staf", phone: "3074", category: "staf" },
{ name: "Garip Levin", role: "Staf", phone: "3088", category: "staf" },
{ name: "Germonpré Pieter-Jan", role: "Staf", phone: "3065", category: "staf" },
{ name: "Hooft Frederik", role: "Staf", phone: "3052", category: "staf" },
{ name: "Janssens Sander", role: "Staf", phone: "3082", category: "staf" },
{ name: "Lamote Stoffel", role: "Staf", phone: "3055", category: "staf" },
{ name: "Lapere Matthias", role: "Staf", phone: "3054", category: "staf" },
{ name: "Lesenne Anouk", role: "Staf", phone: "3051", category: "staf" },
{ name: "Missant Carlo", role: "Staf", phone: "3060", category: "staf" },
{ name: "Papinyan Vahè", role: "Staf", phone: "3081", category: "staf" },
{ name: "Steelant Pieter Jan", role: "Staf", phone: "3056", category: "staf" },
{ name: "Sterckx Valerie", role: "Staf", phone: "3043", category: "staf" },
{ name: "Sykora Theo", role: "Staf", phone: "3057", category: "staf" },
{ name: "Vandebroek Anneleen", role: "Staf", phone: "3073", category: "staf" },
{ name: "Vandenbossche Carl", role: "Staf", phone: "3059", category: "staf" },
{ name: "Vanden Bûssche Birgit", role: "Staf", phone: "3080", category: "staf" },
{ name: "Vandendriessche Tine", role: "Staf", phone: "3066", category: "staf" },
{ name: "Vandeputte Louis", role: "Staf", phone: "3085", category: "staf" },
{ name: "Vanderheeren Marie-Camille", role: "Staf", phone: "3086", category: "staf" },
{ name: "Vandersteen Liesbeth", role: "Staf", phone: "3079", category: "staf" },
{ name: "Vanfleteren Lieven", role: "Staf", phone: "3061", category: "staf" },
{ name: "Vanneste Bert", role: "Staf", phone: "3064", category: "staf" },
{ name: "Van Ooteghem Barbara", role: "Staf", phone: "3062", category: "staf" },
{ name: "Van Overloop Jorne", role: "Staf", phone: "3084", category: "staf" },
{ name: "Vanvuchelen Charlotte", role: "Staf", phone: "3053", category: "staf" },
{ name: "Verbeke Nikolaas", role: "Staf", phone: "3049", category: "staf" },
{ name: "Vertommen Denis", role: "Staf", phone: "3063", category: "staf" },
{ name: "Secretariaat ANE Kortrijk", role: "Support", phone: "3030", category: "staf" },
{ name: "Secretariaat ANE Izegem", role: "Support", phone: "4646", category: "staf" },

{ name: "Celis Caitlin", role: "ASO", phone: "4863", category: "extra" },
{ name: "Collin Emma", role: "ASO", phone: "4805", category: "extra" },
{ name: "Decorte Sanne", role: "ASO", phone: "4809", category: "extra" },
{ name: "Dupont Camille", role: "ASO", phone: "4826", category: "extra" },
{ name: "Peeters Margot", role: "ASO", phone: "4869", category: "extra" },
{ name: "Van Kerckhove Magnus", role: "ASO", phone: "4807", category: "extra" },
{ name: "Ionut Bojor", role: "ASO", phone: "3089", category: "extra" },

{ name: "Beyls Frauke", role: "Staf", phone: "4510", category: "staf" },
{ name: "Bostyn An", role: "Staf", phone: "4513", category: "staf" },
{ name: "Caestecker Céline", role: "Staf", phone: "4511", category: "staf" },
{ name: "Espeel Stefanie", role: "Staf", phone: "4482", category: "staf" },
{ name: "Galle Sabrina", role: "Staf", phone: "4509", category: "staf" },
{ name: "Persyn Jorik", role: "Staf", phone: "4518", category: "staf" },
{ name: "Van den Berge Wouter", role: "Staf", phone: "4759", category: "staf" },
{ name: "Vanden Daelen Sophie", role: "Staf", phone: "4514", category: "staf" },
{ name: "Vanhoenacker Stefanie", role: "Staf", phone: "4521", category: "staf" },
{ name: "Vanhoorebeeck Patrick", role: "Staf", phone: "4512", category: "staf" },
{ name: "Bloedbank", role: "Support", phone: "4263", category: "extra" },

];

export default function ContactsPage() {
  const [search, setSearch] = useState("");

  const hospitalPrefix = "+325663";

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <Link href="/">
  <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group mb-4">
    <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
    Terug naar Home
  </div>
</Link>
      <header className="pt-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Telefoon<span className="text-teal-600">lijst</span>
        </h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Zoek collega of functie..." 
            className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-2">
        {filtered.map((contact, i) => (
          <Card key={i} className="border-slate-100 shadow-sm active:scale-[0.95] transition-transform">
            <CardContent className="p-0">
              {/* Hier gebeurt de magie: de 'tel:' link krijgt automatisch de prefix mee */}
              <a href={`tel:${hospitalPrefix}${contact.phone}`} className="flex items-center justify-between p-1">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${contact.category === 'staf' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                    {contact.category === 'staf' ? <Stethoscope className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-tight text-slate-900 text-sm">{contact.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* We tonen nog steeds het vertrouwde 4-cijferige nummer op het scherm */}
                  <span className="font-mono font-black text-lg text-slate-600">{contact.phone}</span>
                  <div className="bg-emerald-500 p-2 rounded-full text-white shadow-sm">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
          {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-medium">
          Geen resultaten gevonden voor "{search}"
        </div>
      )}

    </div>
  );
}
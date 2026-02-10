import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, Search, Stethoscope, GraduationCap} from "lucide-react";

const contacts = [
{ name: "Carmen Alegret", role: "Staf", phone: "3040", category: "staf" },
{ name: "Nathalie Becaus", role: "Staf", phone: "3041", category: "staf" },
{ name: "Simon Bogaert", role: "Staf", phone: "3078", category: "staf" },
{ name: "Laurence Carlier", role: "Staf", phone: "3072", category: "staf" },
{ name: "Isabelle Casier", role: "Staf", phone: "3042", category: "staf" },
{ name: "Charlotte Castelain", role: "Staf", phone: "3045", category: "staf" },
{ name: "Ali Chafai", role: "Staf", phone: "3046", category: "staf" },
{ name: "Wouter De Corte", role: "Staf", phone: "3047", category: "staf" },
{ name: "Evy De Greef", role: "Staf", phone: "3083", category: "staf" },
{ name: "Marie De Leeuw", role: "Staf", phone: "3069", category: "staf" },
{ name: "Caroline Demeyer", role: "Staf", phone: "3048", category: "staf" },
{ name: "Eline Depuydt", role: "Staf", phone: "3071", category: "staf" },
{ name: "Francis Desmet", role: "Staf", phone: "3067", category: "staf" },
{ name: "Matthias Desmet", role: "Staf", phone: "3050", category: "staf" },
{ name: "Hans Detienne", role: "Staf", phone: "3074", category: "staf" },
{ name: "Pieter-Jan Germonpré", role: "Staf", phone: "3065", category: "staf" },
{ name: "Frederik Hooft", role: "Staf", phone: "3052", category: "staf" },
{ name: "Sander Janssens", role: "Staf", phone: "3082", category: "staf" },
{ name: "Stoffel Lamote", role: "Staf", phone: "3055", category: "staf" },
{ name: "Matthias Lapere", role: "Staf", phone: "3054", category: "staf" },
{ name: "Anouk Lesenne", role: "Staf", phone: "3051", category: "staf" },
{ name: "Carlo Missant", role: "Staf", phone: "3060", category: "staf" },
{ name: "Pieter Jan Steelant", role: "Staf", phone: "3056", category: "staf" },
{ name: "Valerie Sterckx", role: "Staf", phone: "3043", category: "staf" },
{ name: "Theo Sykora", role: "Staf", phone: "3057", category: "staf" },
{ name: "Anneleen Vandebroek", role: "Staf", phone: "3073", category: "staf" },
{ name: "Carl Vandenbossche", role: "Staf", phone: "3059", category: "staf" },
{ name: "Birgit Vanden Bûssche", role: "Staf", phone: "3080", category: "staf" },
{ name: "Tine Vandendriessche", role: "Staf", phone: "3066", category: "staf" },
{ name: "Louis Vandeputte", role: "Staf", phone: "3085", category: "staf" },
{ name: "Marie-Camille Vanderheeren", role: "Staf", phone: "3086", category: "staf" },
{ name: "Liesbeth Vandersteen", role: "Staf", phone: "3079", category: "staf" },
{ name: "Lieven Vanfleteren", role: "Staf", phone: "3061", category: "staf" },
{ name: "Bert Vanneste", role: "Staf", phone: "3064", category: "staf" },
{ name: "Barbara Van Ooteghem", role: "Staf", phone: "3062", category: "staf" },
{ name: "Jorne Van Overloop", role: "Staf", phone: "3084", category: "staf" },
{ name: "Charlotte Vanvuchelen", role: "Staf", phone: "3053", category: "staf" },
{ name: "Nikolaas Verbeke", role: "Staf", phone: "3049", category: "staf" },
{ name: "Denis Vertommen", role: "Staf", phone: "3063", category: "staf" },
{ name: "Secretariaat ANE Kortrijk", role: "Support", phone: "3030", category: "staf" },
{ name: "Secretariaat ANE Izegem", role: "Support", phone: "4646", category: "staf" },

{ name: "Emma Collin", role: "ASO", phone: "4805", category: "extra" },
{ name: "Margaux Vervenne", role: "ASO", phone: "4808", category: "extra" },
{ name: "Sanne Decorte", role: "ASO", phone: "4809", category: "extra" },

{ name: "Frauke Beyls", role: "Staf", phone: "4510", category: "staf" },
{ name: "An Bostyn", role: "Staf", phone: "4513", category: "staf" },
{ name: "Céline Caestecker", role: "Staf", phone: "4511", category: "staf" },
{ name: "Stefanie Espeel", role: "Staf", phone: "4482", category: "staf" },
{ name: "Sabrina Galle", role: "Staf", phone: "4509", category: "staf" },
{ name: "Jorik Persyn", role: "Staf", phone: "4518", category: "staf" },
{ name: "Wouter Van den Berge", role: "Staf", phone: "4759", category: "staf" },
{ name: "Sophie Vanden Daelen", role: "Staf", phone: "4514", category: "staf" },
{ name: "Stefanie Vanhoenacker", role: "Staf", phone: "4521", category: "staf" },
{ name: "Patrick Vanhoorebeeck", role: "Staf", phone: "4512", category: "staf" },
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
      <header className="pt-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Telefoon<span className="text-teal-600">lijst</span>
        </h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Zoek collega of functie..." 
            className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl"
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
              <a href={`tel:${hospitalPrefix}${contact.phone}`} className="flex items-center justify-between p-4">
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
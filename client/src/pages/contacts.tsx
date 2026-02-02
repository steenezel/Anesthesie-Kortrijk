import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, Search, User, GraduationCap } from "lucide-react";

const contacts = [
  { name: "Pieter Jan Steelant", role: "Staf", phone: "3056", category: "staf" },
  { name: "Theo Sykora", role: "Staf", phone: "3057", category: "staf" },
  { name: "Stefaan Carlier", role: "Staf", phone: "3044", category: "staf" },
  { name: "Matthias Desmet", role: "Staf", phone: "3050", category: "staf" },
  { name: "Carmen Alegret", role: "Staf", phone: "3040", category: "staf" },
  { name: "Nathalie Becaus", role: "Staf", phone: "3041", category: "staf" },
  { name: "Simon Bogaert", role: "Staf", phone: "3078", category: "staf" },
  { name: "Emma Collin", role: "ASO", phone: "4805", category: "extra" },
  { name: "Margaux Vervenne", role: "ASO", phone: "4808", category: "extra" },
  { name: "Sanne Decorte", role: "ASO", phone: "4809", category: "extra" },
  { name: "OK Secretariaat", role: "Support", phone: "3030", category: "extra" },
];

export default function ContactsPage() {
  const [search, setSearch] = useState("");

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
          <Card key={i} className="border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
            <CardContent className="p-0">
              <a href={`tel:${contact.phone}`} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${contact.category === 'staf' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                    {contact.category === 'staf' ? <User className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-tight text-slate-900 text-sm">{contact.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
    </div>
  );
}
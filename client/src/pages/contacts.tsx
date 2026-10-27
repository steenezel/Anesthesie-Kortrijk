import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Phone, Search, Stethoscope, GraduationCap, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  category: string;
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const hospitalPrefix = "+325663";

  const { data: contacts = [], isLoading, isError } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, role, phone, category")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  const filtered = contacts.filter(
    (c) =>
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-slate-400 font-medium">
          Kon de telefoonlijst niet laden.
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            {filtered.map((contact) => (
              <Card
                key={contact.id}
                className="border-slate-100 shadow-sm active:scale-[0.95] transition-transform"
              >
                <CardContent className="p-0">
                  <a
                    href={`tel:${hospitalPrefix}${contact.phone}`}
                    className="flex items-center justify-between p-1"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          contact.category === "staf"
                            ? "bg-teal-50 text-teal-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {contact.category === "staf" ? (
                          <Stethoscope className="h-5 w-5" />
                        ) : (
                          <GraduationCap className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-black uppercase tracking-tight text-slate-900 text-sm">
                          {contact.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {contact.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-lg text-slate-600">
                        {contact.phone}
                      </span>
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
              {search
                ? `Geen resultaten gevonden voor "${search}"`
                : "Geen contacten beschikbaar."}
            </div>
          )}
        </>
      )}
    </div>
  );
}

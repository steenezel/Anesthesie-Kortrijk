import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Pencil } from "lucide-react";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Config voor disciplines per type
const DISCIPLINE_OPTIONS = {
  journal_club: ["Anesthesie", "Intensieve", "Urgentie", "Pijn"],
  protocols: [
    "Abdominale", "Buitendiensten", "Neurochirurgie", "NKO", 
    "Obstetrie-epidurale", "Orthopedie", "Reanimatie", "Thorax-vaat", "Algemeen"
  ]
};

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'clean'], // Afbeeldingen nu overal aan
  ],
};

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { toast } = useToast();

  const queryType = searchParams.get('type') || 'journal_club';
  const queryId = searchParams.get('id');
  const mode = queryId ? 'edit' : 'new';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');
  const [type, setType] = useState(queryType);

  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [content, setContent] = useState(""); 
  const [tab1, setTab1] = useState(""); 
  const [tab2, setTab2] = useState(""); 
  const [tab3, setTab3] = useState("");

  useEffect(() => {
    if (mode === 'edit') fetchDatabaseData();
  }, [mode, queryId]);

  async function fetchDatabaseData() {
    setFetching(true);
    try {
      const { data, error } = await supabase.from(type).select('*').eq('id', queryId).single();
      if (data && !error) {
        setTitle(data.title);
        setDiscipline(data.discipline || data.folder || "");
        if (type === 'journal_club' || type === 'protocols') {
          setContent(data.content || "");
        } else if (type === 'blocks') {
          setTab1(data.content_general || "");
          setTab2(data.content_anatomy || "");
          setTab3(data.content_technique || "");
        } else if (type === 'pocus') {
          setTab1(data.content_indicaties || "");
          setTab2(data.content_techniek || "");
          setTab3(data.content_interpretatie || "");
        }
      }
    } catch (e) { console.error(e); } finally { setFetching(false); }
  }

  const handleSave = async () => {
    if (!title) return toast({ title: "Titel is verplicht", variant: "destructive" });
    setLoading(true);

    const payload: any = { title };
    if (type === 'journal_club') Object.assign(payload, { content, disciplines: [discipline] });
    else if (type === 'protocols') Object.assign(payload, { content, discipline });
    else if (type === 'blocks') Object.assign(payload, { content_general: tab1, content_anatomy: tab2, content_technique: tab3 });
    else if (type === 'pocus') Object.assign(payload, { content_indicaties: tab1, content_techniek: tab2, content_interpretatie: tab3 });

    const { error } = mode === 'edit' 
      ? await supabase.from(type).update(payload).eq('id', queryId)
      : await supabase.from(type).insert([payload]);

    if (!error) {
      toast({ title: "Succes!", description: "Opgeslagen in de cloud." });
      window.history.back();
    } else {
      toast({ title: "Fout bij opslaan", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (fetching) return <div className="flex h-screen items-center justify-center text-teal-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="font-black uppercase text-[10px] tracking-widest text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Annuleren
          </Button>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Editor — {type}</h2>
        </header>

        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12 space-y-8">
            
            {/* RIJ 1: TYPE EN DISCIPLINE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content Type</label>
                <Select value={type} onValueChange={setType} disabled={mode === 'edit'}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal_club">Journal Club</SelectItem>
                    <SelectItem value="protocols">Protocol</SelectItem>
                    <SelectItem value="blocks">LRA Block</SelectItem>
                    <SelectItem value="pocus">POCUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(type === 'journal_club' || type === 'protocols') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {type === 'journal_club' ? 'Discipline' : 'Map'}
                  </label>
                  <Select value={discipline} onValueChange={setDiscipline}>
                    <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold"><SelectValue placeholder="Kies..." /></SelectTrigger>
                    <SelectContent>
                      {DISCIPLINE_OPTIONS[type as keyof typeof DISCIPLINE_OPTIONS].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* TITEL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titel</label>
              <Input placeholder="Bijv: Interscalenaire blok..." value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-slate-200 h-14 text-xl font-black uppercase italic" />
            </div>

            {/* EDITORS */}
            {(type === "journal_club" || type === "protocols") ? (
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inhoud</label>
                 <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* @ts-ignore */}
                    <ReactQuill theme="snow" modules={QUILL_MODULES} value={content} onChange={setContent} style={{ height: '450px', marginBottom: '40px' }} />
                 </div>
              </div>
            ) : (
              <div className="space-y-10">
                {[
                  { label: type === 'blocks' ? "1. Algemeen" : "1. Indicaties", val: tab1, set: setTab1 },
                  { label: "2. Anatomie / Scan", val: tab2, set: setTab2 },
                  { label: type === 'blocks' ? "3. Techniek" : "3. Interpretatie", val: tab3, set: setTab3 }
                ].map((t, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-teal-600 ml-1">{t.label}</label>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                      {/* @ts-ignore */}
                      <ReactQuill theme="snow" modules={QUILL_MODULES} value={t.val} onChange={t.set} style={{ height: '300px', marginBottom: '40px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleSave} disabled={loading} className="w-full h-16 bg-slate-900 hover:bg-teal-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl transition-all shadow-xl active:scale-95">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              {mode === 'edit' ? 'Wijzigingen Opslaan' : 'Publiceren naar Cloud'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
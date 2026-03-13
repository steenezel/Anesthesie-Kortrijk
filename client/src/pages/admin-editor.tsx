import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, LayoutGrid, CloudDownload, Pencil } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Globale imports voor migratie (moet matchen met je detail pagina's)
const allJournals = import.meta.glob('../content/journal-club/*.md', { query: 'raw', eager: true });
const allProtocols = import.meta.glob('../content/protocols/**/*.md', { query: 'raw', eager: true });
const allBlocks = import.meta.glob('../content/blocks/*.md', { query: 'raw', eager: true });
const allPocus = import.meta.glob('../content/pocus/*.md', { query: 'raw', eager: true });

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { toast } = useToast();

  const mode = searchParams.get('id') ? 'edit' : searchParams.get('migrate') ? 'migrate' : 'new';
  const queryType = searchParams.get('type') || 'journal_club';
  const queryId = searchParams.get('id') || searchParams.get('migrate');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode !== 'new');
  const [type, setType] = useState(queryType);

  // Form states
  const [title, setTitle] = useState("");
  const [folder, setFolder] = useState(""); 
  const [discipline, setDiscipline] = useState("Anesthesie");
  const [content, setContent] = useState(""); 
  const [tab1, setTab1] = useState(""); 
  const [tab2, setTab2] = useState(""); 
  const [tab3, setTab3] = useState("");

  useEffect(() => {
    if (mode === 'edit' && queryId) {
      fetchDatabaseData();
    } else if (mode === 'migrate' && queryId) {
      parseLocalFile();
    }
  }, [mode, queryId]);

  // DATA UIT DATABASE LADEN (Edit-modus)
  async function fetchDatabaseData() {
    setFetching(true);
    const { data, error } = await supabase.from(type).select('*').eq('id', queryId).single();
    if (data && !error) {
      setTitle(data.title);
      if (type === 'journal_club') {
        setContent(data.content);
        setFolder(data.folder || "");
        setDiscipline(data.disciplines?.[0] || "Anesthesie");
      } else if (type === 'protocols') {
        setContent(data.content);
        setDiscipline(data.discipline || "Anesthesie");
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
    setFetching(false);
  }

  // DATA UIT LOKAAL BESTAND LADEN (Migratie-modus)
  function parseLocalFile() {
    const source = type === 'blocks' ? allBlocks : type === 'pocus' ? allPocus : type === 'protocols' ? allProtocols : allJournals;
    const fileKey = Object.keys(source).find(k => k.toLowerCase().endsWith(`/${queryId?.toLowerCase()}.md`));
    const raw = fileKey ? String((source[fileKey] as any)?.default || source[fileKey] || "") : "";

    if (raw) {
      const cleanTitle = raw.split('\n')[0].replace('# ', '').trim();
      setTitle(cleanTitle);

      if (type === 'blocks' || type === 'pocus') {
        // Slimme splitter op ## koppen
        const sections = raw.split(/\n## /);
        setTab1(sections[0].replace(/^# .*\n/, '')); // Algemeen/Indicaties
        setTab2(sections.find(s => /anatomie|scan/i.test(s)) || ""); 
        setTab3(sections.find(s => /techniek|interpretatie/i.test(s)) || "");
      } else {
        setContent(raw);
      }
    }
    setFetching(false);
  }

  const handleSave = async () => {
    if (!title) return toast({ title: "Geen titel", variant: "destructive" });
    setLoading(true);

    const payload: any = { title };
    if (type === 'journal_club') Object.assign(payload, { content, folder, disciplines: [discipline] });
    else if (type === 'protocols') Object.assign(payload, { content, discipline });
    else if (type === 'blocks') Object.assign(payload, { content_general: tab1, content_anatomy: tab2, content_technique: tab3 });
    else if (type === 'pocus') Object.assign(payload, { content_indicaties: tab1, content_techniek: tab2, content_interpretatie: tab3 });

    const { error } = mode === 'edit' 
      ? await supabase.from(type).update(payload).eq('id', queryId)
      : await supabase.from(type).insert([payload]);

    if (!error) {
      toast({ title: mode === 'edit' ? "Bijgewerkt!" : "Opgeslagen!", description: `${title} staat nu in de cloud.` });
      setLocation("/"); 
    } else {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (fetching) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="font-black uppercase text-[10px] tracking-widest text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Annuleren
          </Button>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            {mode === 'edit' ? <Pencil size={12} /> : <CloudDownload size={12} />} {mode} mode
          </div>
        </header>

        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Type</label>
                  <Select value={type} onValueChange={setType} disabled={mode !== 'new'}>
                    <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal_club">Journal Club</SelectItem>
                      <SelectItem value="protocols">Protocol</SelectItem>
                      <SelectItem value="blocks">Regional Block</SelectItem>
                      <SelectItem value="pocus">POCUS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discipline / Map</label>
                  {type === "journal_club" ? (
                    <Input placeholder="Bijv: Maart 2026" value={folder} onChange={(e) => setFolder(e.target.value)} className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold" />
                  ) : (
                    <Select value={discipline} onValueChange={setDiscipline}>
                      <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Anesthesie", "ICU", "Urgentie", "Pijn"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <Input placeholder="Titel..." value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-slate-200 h-14 text-xl font-black uppercase" />

              {(type === "journal_club" || type === "protocols") ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* @ts-ignore */}
                  <ReactQuill theme="snow" modules={QUILL_MODULES} value={content} onChange={setContent} className="min-h-[300px]" /></div>
              ) : (
                <div className="space-y-6">
                  {[
                    { label: type === 'blocks' ? "1. Algemeen" : "1. Indicaties", val: tab1, set: setTab1 },
                    { label: "2. Anatomie / Scan", val: tab2, set: setTab2 },
                    { label: type === 'blocks' ? "3. Techniek" : "3. Interpretatie", val: tab3, set: setTab3 }
                  ].map((t, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t.label}</label>
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        {/* @ts-ignore */}
                        <ReactQuill theme="snow" value={t.val} onChange={t.set} /></div>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSave} disabled={loading} className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl transition-all shadow-xl shadow-teal-100">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                {mode === 'edit' ? 'Wijzigingen Opslaan' : 'Naar Supabase Schrijven'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
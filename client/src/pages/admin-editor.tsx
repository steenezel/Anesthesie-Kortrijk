import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, FileText, Video, Quote, HelpCircle } from "lucide-react";

// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;

const DISCIPLINE_OPTIONS = {
  journal_club: ["Anesthesie", "Intensieve", "Urgentie", "Pijn"],
  protocols: ["Abdominale", "Buitendiensten", "Neurochirurgie", "NKO", "Obstetrie-epidurale", "Orthopedie", "Pijnkliniek", "Reanimatie", "Thorax-vaat", "Algemeen"]
};

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'clean'],
  ],
};

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();
  
  const queryType = searchParams.get('type') || 'journal_club';
  const queryId = searchParams.get('id');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!queryId);
  const [type, setType] = useState(queryType);

  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [pubmedId, setPubmedId] = useState("");
  const [content, setContent] = useState("");
  const [tab1, setTab1] = useState("");
  const [tab2, setTab2] = useState("");
  const [tab3, setTab3] = useState("");

  useEffect(() => {
    if (queryId) fetchDatabaseData();
  }, [queryId, type]);

  async function fetchDatabaseData() {
    try {
      const { data, error } = await supabase.from(type).select('*').eq('id', queryId).single();
      if (data && !error) {
        setTitle(data.title);
        setDiscipline(data.discipline || data.folder || (type === 'journal_club' ? data.disciplines?.[0] : ""));
        setPubmedId(data.pubmed_id || "");
        
        if (type === 'pocus') {
          setTab1(data.content_indicaties || "");
          setTab2(data.content_techniek || "");
          setTab3(data.content_interpretatie || "");
        } else if (type === 'blocks') {
          setTab1(data.content_general || "");
          setTab2(data.content_anatomy || "");
          setTab3(data.content_technique || "");
        } else {
          setContent(data.content || "");
        }
      }
    } finally {
      setFetching(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const filePath = `${fileType}s/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      
      const htmlToInsert = fileType === 'pdf' 
        ? `<p><a href="${publicUrl}" target="_blank" rel="noopener noreferrer">📄 DOCUMENT: ${file.name}</a></p>`
        : `<p><video controls src="${publicUrl}" class="w-full rounded-3xl my-4"></video></p>`;

      if (type === 'pocus' || type === 'blocks') {
        setTab1(prev => prev + htmlToInsert);
      } else {
        setContent(prev => prev + htmlToInsert);
      }
      toast({ title: "Upload geslaagd" });
    } catch (error: any) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return toast({ title: "Titel is verplicht", variant: "destructive" });
    setLoading(true);

    let payload: any = { title };
    if (type === 'protocols') payload = { ...payload, content, discipline };
    else if (type === 'journal_club') payload = { ...payload, content, disciplines: [discipline], pubmed_id: pubmedId };
    else if (type === 'pocus') payload = { ...payload, content_indicaties: tab1, content_techniek: tab2, content_interpretatie: tab3 };
    else if (type === 'blocks') payload = { ...payload, content_general: tab1, content_anatomy: tab2, content_technique: tab3 };

    const { error } = queryId 
      ? await supabase.from(type).update(payload).eq('id', queryId)
      : await supabase.from(type).insert([payload]);

    if (!error) {
      toast({ title: "Succesvol opgeslagen!" });
      window.history.back();
    } else {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (fetching) return <div className="flex h-screen items-center justify-center text-blue-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-2 md:p-6 lg:p-10">
      {/* VOLLEDIGE BREEDTE CONTAINER */}
      <div className="max-w-[1800px] mx-auto w-full">
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <Button variant="ghost" onClick={() => window.history.back()} className="font-black uppercase text-[10px] tracking-widest text-slate-400 p-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Terug
          </Button>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none relative h-10 px-4 rounded-xl border-slate-200 bg-white font-black uppercase text-[9px] tracking-widest shadow-sm">
              <FileText className="mr-2 h-4 w-4 text-blue-600" /> PDF Upload
              <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf')} />
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none relative h-10 px-4 rounded-xl border-slate-200 bg-white font-black uppercase text-[9px] tracking-widest shadow-sm">
              <Video className="mr-2 h-4 w-4 text-purple-600" /> Video Upload
              <input type="file" accept="video/mp4" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'video')} />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* EDITOR (Neemt 9 van de 12 kolommen op desktop = 75%) */}
          <div className="lg:col-span-9 space-y-6 w-full">
            <Card className="border-none shadow-xl rounded-[32px] md:rounded-[48px] overflow-hidden bg-white">
              <CardContent className="p-4 md:p-10 lg:p-14 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type Content</label>
                    <Select value={type} onValueChange={(v: string) => setType(v)} disabled={!!queryId}>
                      <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 md:h-14 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protocols">Protocol</SelectItem>
                        <SelectItem value="pocus">POCUS</SelectItem>
                        <SelectItem value="journal_club">Journal Club</SelectItem>
                        <SelectItem value="blocks">LRA Block</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(type === 'protocols' || type === 'journal_club') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discipline</label>
                      <Select value={discipline} onValueChange={(v: string) => setDiscipline(v)}>
                        <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 md:h-14 font-bold"><SelectValue placeholder="Kies discipline..." /></SelectTrigger>
                        <SelectContent>
                          {DISCIPLINE_OPTIONS[type === 'protocols' ? 'protocols' : 'journal_club'].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Titel van het artikel</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl md:rounded-3xl border-slate-200 h-14 md:h-20 text-lg md:text-3xl font-black uppercase italic px-4 md:px-8" />
                </div>

                {(type === "protocols" || type === "journal_club") ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Hoofdinhoud</label>
                    <div className="rounded-2xl md:rounded-[32px] border border-slate-200 overflow-hidden bg-white">
                      <QuillEditor theme="snow" modules={QUILL_MODULES} value={content} onChange={setContent} className="min-h-[500px] md:min-h-[700px]" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-12">
                    {[
                      { label: type === 'pocus' ? "1. Indicaties / Algemeen" : "1. Algemeen", val: tab1, set: setTab1 },
                      { label: type === 'pocus' ? "2. Acquisitie / Techniek" : "2. Anatomie", val: tab2, set: setTab2 },
                      { label: type === 'pocus' ? "3. Interpretatie / Beslisboom" : "3. Techniek", val: tab3, set: setTab3 }
                    ].map((t, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-blue-600 ml-1">{t.label}</label>
                        <div className="rounded-2xl md:rounded-[32px] border border-slate-200 overflow-hidden bg-white shadow-sm">
                          <QuillEditor theme="snow" modules={QUILL_MODULES} value={t.val} onChange={t.set} className="min-h-[300px] md:min-h-[400px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} className="w-full h-16 md:h-24 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm rounded-2xl md:rounded-[32px] transition-all shadow-2xl">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-3 h-5 w-5 md:h-6 md:w-6" />}
                  Publiceren naar App
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ZIJBALK (Neemt 3 van de 12 kolommen op desktop = 25%) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-10">
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-xl border border-slate-100 max-h-[85vh] overflow-y-auto">
              <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-widest italic mb-6">Styling Handleiding</h3>
              <div className="space-y-6 text-[11px] leading-relaxed text-slate-500">
                <section>
                  <p className="font-black text-slate-900 uppercase mb-1">Sub-kopjes</p>
                  <p>Typ een titel en kies <b>Koptekst 2 (H2)</b> voor de blauwe lijn.</p>
                </section>
                <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900">
                  <p className="font-black uppercase mb-1 underline">Groen Kader</p>
                  <p className="italic">Druk op Quote (") en begin direct met typen.</p>
                </section>
                <section className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-900">
                  <p className="font-black uppercase mb-1 underline">Rood Kader</p>
                  <p className="italic">Druk op Quote (") en start met "WAARSCHUWING:".</p>
                </section>
                <section className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900">
                  <p className="font-black uppercase mb-1 underline">Blauw Kader</p>
                  <p className="italic">Druk op Quote (") en start met "INFO:".</p>
                </section>
                <section className="bg-slate-900 p-6 rounded-2xl text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Video Tip</p>
                  <p className="opacity-80">Video's verschijnen onderaan. Knip en plak naar de juiste plek.</p>
                </section>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
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
        : `<p><video controls class="w-full rounded-3xl my-4"><source src="${publicUrl}" type="video/mp4"></video></p>`;

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
    <div className="min-h-screen bg-slate-50 pb-20 p-4 lg:p-10">
      {/* Brede container voor maximale schermbenutting */}
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="font-black uppercase text-[10px] tracking-widest text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Terug
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="relative overflow-hidden text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl border-slate-200 bg-white shadow-sm">
              <FileText className="mr-2 h-4 w-4 text-blue-600" /> PDF Upload
              <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf')} />
            </Button>
            <Button variant="outline" size="sm" className="relative overflow-hidden text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl border-slate-200 bg-white shadow-sm">
              <Video className="mr-2 h-4 w-4 text-purple-600" /> Video Upload
              <input type="file" accept="video/mp4" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'video')} />
            </Button>
          </div>
        </header>

        {/* Grid layout met 4 kolommen voor betere verdeling */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* EDITOR SECTION (3 kolommen breed op desktop) */}
          <div className="lg:col-span-3 space-y-8">
            <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
              <CardContent className="p-8 lg:p-14 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type Content</label>
                    <Select value={type} onValueChange={(v: string) => setType(v)} disabled={!!queryId}>
                      <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-14 font-bold text-slate-700 shadow-inner"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protocols">Protocol</SelectItem>
                        <SelectItem value="pocus">POCUS</SelectItem>
                        <SelectItem value="journal_club">Journal Club</SelectItem>
                        <SelectItem value="blocks">LRA Block</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(type === 'protocols' || type === 'journal_club') && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discipline</label>
                      <Select value={discipline} onValueChange={(v: string) => setDiscipline(v)}>
                        <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-14 font-bold text-slate-700 shadow-inner"><SelectValue placeholder="Kies discipline..." /></SelectTrigger>
                        <SelectContent>
                          {DISCIPLINE_OPTIONS[type === 'protocols' ? 'protocols' : 'journal_club'].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titel</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="rounded-2xl border-slate-200 h-16 text-2xl font-black uppercase italic shadow-sm px-6" 
                    placeholder="Voer titel in..."
                  />
                </div>

                {(type === "protocols" || type === "journal_club") ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Hoofdinhoud</label>
                    <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                      <QuillEditor theme="snow" modules={QUILL_MODULES} value={content} onChange={setContent} className="min-h-[600px]" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {[
                      { label: type === 'pocus' ? "1. Indicaties / Algemeen" : "1. Algemeen", val: tab1, set: setTab1 },
                      { label: type === 'pocus' ? "2. Acquisitie / Techniek" : "2. Anatomie", val: tab2, set: setTab2 },
                      { label: type === 'pocus' ? "3. Interpretatie / Beslisboom" : "3. Techniek", val: tab3, set: setTab3 }
                    ].map((t, i) => (
                      <div key={i} className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-blue-600 ml-1">{t.label}</label>
                        <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                          <QuillEditor theme="snow" modules={QUILL_MODULES} value={t.val} onChange={t.set} className="min-h-[350px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} disabled={loading} className="w-full h-20 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.25em] text-sm rounded-[30px] transition-all shadow-xl active:scale-95 mt-10">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-3 h-5 w-5" />}
                  {queryId ? 'Opslaan & Bijwerken' : 'Publiceren naar App'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR GUIDE (Vaste breedte en sticky) */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-10 space-y-6">
              <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-6 text-blue-600">
                  <HelpCircle size={22} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest italic">Styling Gids</h3>
                </div>
                
                <div className="space-y-8 text-[11px] leading-relaxed text-slate-600">
                  <section>
                    <p className="font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-600 rounded-full" /> Sub-kopjes
                    </p>
                    <p>Typ een titel en kies <b>Koptekst 2 (H2)</b> voor de blauwe lijn en POCUS-look.</p>
                  </section>

                  <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="font-black text-emerald-700 uppercase mb-2 italic">💡 Tip Kader</p>
                    <p>Gebruik de Quote-knop ("). Start optioneel met "TIP:".</p>
                  </section>

                  <section className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="font-black text-red-700 uppercase mb-2 italic">⚠️ Waarschuwing</p>
                    <p>Gebruik Quote-knop. Start met "WAARSCHUWING:".</p>
                  </section>

                  <section className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="font-black text-blue-700 uppercase mb-2 italic">ℹ️ Info Kader</p>
                    <p>Gebruik Quote-knop. Start met "INFO:".</p>
                  </section>

                  <section>
                    <p className="font-black text-slate-900 uppercase mb-2">Wiskunde</p>
                    <p>Dollartekens voor formules: <b>$E=mc^2$</b>.</p>
                  </section>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 underline decoration-slate-700 underline-offset-8">Cloud Info</p>
                <p className="text-[11px] font-medium leading-relaxed opacity-90 italic">
                  Afbeeldingen in de editor worden automatisch klikbaar voor zoom in de app.
                  Voeg pdf's en mp4-video's toe op de juiste locatie door je cursor eerst op de goede plaats te zetten en dan op PDF of Video te klikken.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
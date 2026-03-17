import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, FileText, Video, ImageIcon, HelpCircle, Link as LinkIcon } from "lucide-react";

// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;

const DISCIPLINE_OPTIONS = {
  journal_club: ["Anesthesie", "Intensieve", "Urgentie", "Pijn"],
  protocols: ["Abdominale", "Buitendiensten", "Neurochirurgie", "NKO", "Obstetrie-epidurale", "Orthopedie", "Pijnkliniek", "Reanimatie", "Thorax-vaat", "Algemeen"]
};

export default function AdminEditor() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const editId = queryParams.get('id');
  const initialType = queryParams.get('type') || 'pocus';

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState("");
  
  // Journal Club specifieke velden
  const [pubmed, setPubmed] = useState("");
  const [referentie, setReferentie] = useState("");
  const [discipline, setDiscipline] = useState("");
  
  // Content velden
  const [content, setContent] = useState(""); // Voor protocols/journal_club
  const [tab1, setTab1] = useState(""); // Indicaties / Functionele Anatomie
  const [tab2, setTab2] = useState(""); // Techniek / Diagram
  const [tab3, setTab3] = useState(""); // Interpretatie / Techniek details

  useEffect(() => {
    if (editId) {
      const fetchData = async () => {
        const { data, error } = await supabase.from(type).select('*').eq('id', editId).single();
        if (data && !error) {
          setTitle(data.title || "");
          if (type === 'pocus' || type === 'blocks') {
            setTab1(data.content_indicaties || "");
            setTab2(data.content_techniek || "");
            setTab3(data.content_interpretatie || "");
          } else if (type === 'journal_club') {
            setContent(data.content || "");
            setPubmed(data.pubmed_id || "");
            setReferentie(data.reference || "");
            setDiscipline(data.discipline || "");
          } else {
            setContent(data.content || "");
            setDiscipline(data.discipline || "");
          }
        }
      };
      fetchData();
    }
  }, [editId, type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'img' | 'video' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      
      let htmlToInsert = "";
      if (fileType === 'pdf') {
        htmlToInsert = `<p><a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: bold; text-decoration: underline;">📄 DOCUMENT: ${file.name}</a></p>`;
      } else if (fileType === 'video') {
        htmlToInsert = `<video controls playsinline src="${publicUrl}" class="w-full rounded-3xl my-6 bg-black aspect-video"></video>`;
      } else {
        htmlToInsert = `<p><img src="${publicUrl}" class="rounded-3xl shadow-lg my-4" alt="afbeelding" /></p>`;
      }

      // Invoegen in de actieve editor
      if (type === 'pocus' || type === 'blocks') setTab1(prev => prev + htmlToInsert);
      else setContent(prev => prev + htmlToInsert);
      
      toast({ title: "Upload geslaagd" });
    } catch (error: any) {
      toast({ title: "Upload fout", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return toast({ title: "Titel verplicht", variant: "destructive" });
    setLoading(true);
    try {
      const payload: any = { 
        title, 
        updated_at: new Date() 
      };

      if (type === 'pocus' || type === 'blocks') {
        payload.content_indicaties = tab1;
        payload.content_techniek = tab2;
        payload.content_interpretatie = tab3;
      } else if (type === 'journal_club') {
        payload.content = content;
        payload.pubmed_id = pubmed;
        payload.reference = referentie;
        payload.discipline = discipline;
      } else {
        payload.content = content;
        payload.discipline = discipline;
      }

      const { error } = editId 
        ? await supabase.from(type).update(payload).eq('id', editId)
        : await supabase.from(type).insert([payload]);

      if (error) throw error;
      toast({ title: "Succesvol opgeslagen!" });
      setLocation(`/${type}`);
    } catch (error: any) {
      toast({ title: "Opslaan mislukt", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-xl font-bold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Terug
        </Button>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
           <h1 className="font-black uppercase tracking-tighter text-slate-900">Editor: {type}</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8 font-black uppercase tracking-widest text-white shadow-lg shadow-teal-600/20">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} Opslaan
        </Button>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-sm bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Module</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-2xl border-slate-200 h-14 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pocus">POCUS</SelectItem>
                      <SelectItem value="blocks">Blocks (LRA)</SelectItem>
                      <SelectItem value="protocols">Protocollen</SelectItem>
                      <SelectItem value="journal_club">Journal Club</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Titel</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel van het artikel/protocol" className="rounded-2xl border-slate-200 h-14 font-bold text-lg" />
                </div>
              </div>

              {type === 'journal_club' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">PubMed ID</label>
                    <div className="relative">
                      <Input value={pubmed} onChange={(e) => setPubmed(e.target.value)} placeholder="bijv: 34567890" className="rounded-2xl border-slate-200 h-12 pl-10 font-mono" />
                      <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Volledige Referentie</label>
                    <Input value={referentie} onChange={(e) => setReferentie(e.target.value)} placeholder="Auteur et al. (Jaar)" className="rounded-2xl border-slate-200 h-12 font-medium" />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 p-3 bg-slate-900 rounded-3xl shadow-inner">
                 <label className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest">
                    <Video className="h-4 w-4 text-teal-400" /> Video
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                 </label>
                 <label className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest">
                    <ImageIcon className="h-4 w-4 text-purple-400" /> Afbeelding
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'img')} />
                 </label>
                 <label className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest">
                    <FileText className="h-4 w-4 text-blue-400" /> PDF Document
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'pdf')} />
                 </label>
              </div>

              {(type === 'pocus' || type === 'blocks') ? (
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList className="grid grid-cols-3 h-12 bg-slate-100 rounded-2xl p-1 mb-4">
                    <TabsTrigger value="tab1" className="rounded-xl font-bold text-[11px] uppercase tracking-tight">
                      {type === 'pocus' ? 'Indicaties' : 'Indicatie'}
                    </TabsTrigger>
                    <TabsTrigger value="tab2" className="rounded-xl font-bold text-[11px] uppercase tracking-tight">
                      {type === 'pocus' ? 'Acquisitie' : 'Anatomie'}
                    </TabsTrigger>
                    <TabsTrigger value="tab3" className="rounded-xl font-bold text-[11px] uppercase tracking-tight">
                      {type === 'pocus' ? 'Interpretatie' : 'Techniek'}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1"><QuillEditor value={tab1} onChange={setTab1} className="h-[400px] mb-12" /></TabsContent>
                  <TabsContent value="tab2"><QuillEditor value={tab2} onChange={setTab2} className="h-[400px] mb-12" /></TabsContent>
                  <TabsContent value="tab3"><QuillEditor value={tab3} onChange={setTab3} className="h-[400px] mb-12" /></TabsContent>
                </Tabs>
              ) : (
                <div className="min-h-[500px]">
                  <QuillEditor value={content} onChange={setContent} className="h-[450px]" theme="snow" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 text-slate-900 border-b pb-4 mb-4">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <h3 className="font-black uppercase tracking-tight text-sm">Gids & Sneltoetsen</h3>
            </div>
            <div className="space-y-4 text-[11px] font-medium leading-relaxed">
                <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-black uppercase mb-1 text-blue-600">Blauwe Lijn (H2)</p>
                  <p className="text-slate-500 italic">Gebruik 'Heading 2' in de toolbar voor de scheidingslijn.</p>
                </section>
                <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="font-black uppercase mb-1 text-emerald-600 tracking-widest">Tip (Quote)</p>
                  <p className="text-emerald-900 font-bold italic">Gebruik de Quote knop (") voor kaders.</p>
                </section>
                <section className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="font-black uppercase mb-1 text-red-600 tracking-widest">Gevaar (WAARSCHUWING:)</p>
                  <p className="text-red-900 font-bold italic font-mono uppercase">WAARSCHUWING: tekst</p>
                </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
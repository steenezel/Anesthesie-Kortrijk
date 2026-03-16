import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, FileText, Video, Quote } from "lucide-react";

// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Fix voor de TypeScript JSX errors: we casten het component naar 'any'
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
  const quillRef = useRef<any>(null);

  const queryType = searchParams.get('type') || 'journal_club';
  const queryId = searchParams.get('id');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!queryId);
  const [type, setType] = useState(queryType);

  // Form states
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
    } catch (e) {
      console.error(e);
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
    
    // Pak de editor instance
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    const position = range ? range.index : quill.getLength();

    if (fileType === 'pdf') {
      // PDF invoegen als link op de cursor positie
      quill.insertText(position, `📄 DOCUMENT: ${file.name}`, 'link', publicUrl);
      quill.insertText(position + `📄 DOCUMENT: ${file.name}`.length, '\n');
    } else {
      // Video invoegen als HTML op de cursor positie
      const videoHtml = `<video controls src="${publicUrl}" class="w-full rounded-3xl my-4"></video><p><br></p>`;
      quill.clipboard.dangerouslyPasteHTML(position, videoHtml);
    }
    
    toast({ title: "Media ingevoegd op cursor positie" });
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

    if (type === 'protocols') {
      payload = { ...payload, content, discipline };
    } else if (type === 'journal_club') {
      payload = { ...payload, content, disciplines: [discipline], pubmed_id: pubmedId };
    } else if (type === 'pocus') {
      payload = { ...payload, content_indicaties: tab1, content_techniek: tab2, content_interpretatie: tab3 };
    } else if (type === 'blocks') {
      payload = { ...payload, content_general: tab1, content_anatomy: tab2, content_technique: tab3 };
    }

    const { error } = queryId 
      ? await supabase.from(type).update(payload).eq('id', queryId)
      : await supabase.from(type).insert([payload]);

    if (!error) {
      toast({ title: "Opgeslagen in de cloud!" });
      setLocation(type === 'pocus' ? '/pocus' : type === 'protocols' ? '/protocols' : '/journal');
    } else {
      toast({ title: "Fout bij opslaan", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (fetching) return <div className="flex h-screen items-center justify-center text-blue-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="font-black uppercase text-[10px] tracking-widest text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" /> Annuleren
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="relative overflow-hidden text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl border-slate-200 bg-white">
              <FileText className="mr-2 h-4 w-4 text-blue-600" /> PDF
              <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf')} />
            </Button>
            <Button variant="outline" size="sm" className="relative overflow-hidden text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl border-slate-200 bg-white">
              <Video className="mr-2 h-4 w-4 text-purple-600" /> Video
              <input type="file" accept="video/mp4" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'video')} />
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                <Select value={type} onValueChange={(v: string) => setType(v)} disabled={!!queryId}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold focus:ring-blue-600 text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protocols">Protocol</SelectItem>
                    <SelectItem value="pocus">POCUS</SelectItem>
                    <SelectItem value="journal_club">Journal Club</SelectItem>
                    <SelectItem value="blocks">LRA Blocks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(type === 'protocols' || type === 'journal_club') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discipline</label>
                  <Select value={discipline} onValueChange={setDiscipline}>
                    <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-bold focus:ring-blue-600 text-slate-900"><SelectValue placeholder="Kies..." /></SelectTrigger>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titel</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-slate-200 h-14 text-xl font-black uppercase italic focus-visible:ring-blue-600" />
            </div>

            {type === 'journal_club' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PubMed ID (optioneel)</label>
                <Input value={pubmedId} onChange={(e) => setPubmedId(e.target.value)} className="rounded-2xl border-slate-200 h-12 font-bold text-blue-600" />
              </div>
            )}

            {(type === "protocols" || type === "journal_club") ? (
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic flex items-center gap-2">
                   <Quote size={12}/> Gebruik de quote knop voor Tips (Groen), Waarschuwing (Rood) of Info (Blauw)
                 </label>
                 <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                    <QuillEditor ref={quillRef} theme="snow" modules={QUILL_MODULES} value={content} onChange={setContent} className="min-h-[400px]" />
                 </div>
              </div>
            ) : (
              <div className="space-y-10">
                {[
                  { label: type === 'pocus' ? "1. Indicaties" : "1. Algemeen", val: tab1, set: setTab1 },
                  { label: type === 'pocus' ? "2. Acquisitie" : "2. Anatomie", val: tab2, set: setTab2 },
                  { label: type === 'pocus' ? "3. Interpretatie" : "3. Techniek", val: tab3, set: setTab3 }
                ].map((t, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">{t.label}</label>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                      <QuillEditor theme="snow" modules={QUILL_MODULES} value={t.val} onChange={t.set} className="min-h-[250px]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleSave} disabled={loading} className="w-full h-16 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl transition-all shadow-xl active:scale-95">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              {queryId ? 'Wijzigingen Opslaan' : 'Publiceren naar Cloud'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
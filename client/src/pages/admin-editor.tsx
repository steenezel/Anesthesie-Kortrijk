import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, FileText, Video, ImageIcon, HelpCircle } from "lucide-react";

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
    ['clean']
  ],
};

const stripBase64Images = (html: string): string =>
  html.replace(/<img[^>]+src="data:[^">]+"[^>]*>/gi, "");

export default function AdminEditor() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const editId = queryParams.get('id');
  const editType = queryParams.get('type') || 'pocus';

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(editType);
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [content, setContent] = useState(""); 
  const [tab1, setTab1] = useState("");
  const [tab2, setTab2] = useState("");
  const [tab3, setTab3] = useState("");
  const [activePocusTab, setActivePocusTab] = useState<"indicaties" | "techniek" | "interpretatie">("indicaties");
  const pocusIndicatiesRef = useRef<any>(null);
  const pocusTechniekRef = useRef<any>(null);
  const pocusInterpretatieRef = useRef<any>(null);
  const genericContentRef = useRef<any>(null);

  useEffect(() => {
    if (editId) {
      const fetchData = async () => {
        const { data, error } = await supabase.from(type).select('*').eq('id', editId).single();
        if (data && !error) {
          setTitle(data.title);
          if (type === 'pocus' || type === 'blocks') {
            setTab1(data.content_indicaties || "");
            setTab2(data.content_techniek || "");
            setTab3(data.content_interpretatie || "");
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
      const filePath = `${type}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      
      let htmlToInsert = "";
      if (fileType === 'pdf') {
        htmlToInsert = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: bold; text-decoration: underline;">📄 DOCUMENT: ${file.name}</a>`;
      } else if (fileType === 'video') {
        // Gebruik Shortcode om strippen door Quill te voorkomen
        htmlToInsert = `[VIDEO:${publicUrl}]`;
      } else {
        // Gebruik URL om Base64 te voorkomen
        htmlToInsert = `<img src="${publicUrl}" alt="afbeelding" />`;
      }

      const insertVideoAtCursor = (editorRef: React.RefObject<any>, shortcode: string) => {
        const instance = editorRef.current;
        if (!instance) return false;
        const quill = instance.getEditor ? instance.getEditor() : instance;
        if (!quill) return false;

        quill.focus?.();
        const range = quill.getSelection() || quill.getSelection(true) || null;
        const index = range ? range.index : quill.getLength();

        // Insert als pure tekst zodat Quill geen HTML-structuur bewaart.
        quill.insertText(index, shortcode, "user");
        quill.insertText(index + shortcode.length, "\n", "user");
        quill.setSelection(index + shortcode.length + 1, 0, "user");
        return true;
      };

      const insertAtCursor = (editorRef: React.RefObject<any>) => {
        const instance = editorRef.current;
        if (!instance) return false;
        const quill = instance.getEditor ? instance.getEditor() : instance;
        if (!quill) return false;
        // Bij klikken op de upload-knop kan de Quill selectie wegvallen.
        // Gebruik daarom de laatst bekende selection (getSelection()) als eerste keuze.
        quill.focus?.();
        const range =
          quill.getSelection() || quill.getSelection(true) || null;
        const index = range ? range.index : quill.getLength();
        quill.clipboard.dangerouslyPasteHTML(index, htmlToInsert);
        return true;
      };

      if (type === 'pocus' || type === 'blocks') {
        if (activePocusTab === "indicaties") {
          const ok = fileType === "video"
            ? insertVideoAtCursor(pocusIndicatiesRef, htmlToInsert)
            : insertAtCursor(pocusIndicatiesRef);
          if (!ok) setTab1((prev) => prev + htmlToInsert);
        } else if (activePocusTab === "techniek") {
          const ok = fileType === "video"
            ? insertVideoAtCursor(pocusTechniekRef, htmlToInsert)
            : insertAtCursor(pocusTechniekRef);
          if (!ok) setTab2((prev) => prev + htmlToInsert);
        } else {
          const ok = fileType === "video"
            ? insertVideoAtCursor(pocusInterpretatieRef, htmlToInsert)
            : insertAtCursor(pocusInterpretatieRef);
          if (!ok) setTab3((prev) => prev + htmlToInsert);
        }
      } else {
        const ok = fileType === "video"
          ? insertVideoAtCursor(genericContentRef, htmlToInsert)
          : insertAtCursor(genericContentRef);
        if (!ok) setContent((prev) => prev + htmlToInsert);
      }
      
      toast({ title: "Upload geslaagd" });
    } catch (error: any) {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return toast({ title: "Titel verplicht", variant: "destructive" });
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { title };
      if (type === 'pocus' || type === 'blocks') {
        payload.content_indicaties = tab1;
        payload.content_techniek = tab2;
        payload.content_interpretatie = tab3;
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
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <div className="bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Terug
        </Button>
        <h1 className="font-black uppercase tracking-tighter">Content Editor</h1>
        <Button onClick={handleSave} disabled={loading} className="bg-teal-600 hover:bg-teal-700 rounded-xl px-6 font-bold text-white">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} OPSLAAN
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Module</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-slate-900">
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
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titel</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl border-slate-200 h-12 font-bold text-slate-900" />
              </div>

              <div className="flex gap-2 p-2 bg-slate-100 rounded-2xl text-slate-900">
                 <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Video className="h-4 w-4 text-teal-600" /> Video
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                 </label>
                 <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <ImageIcon className="h-4 w-4 text-purple-600" /> Afbeelding
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'img')} />
                 </label>
              </div>

              <div className="min-h-[400px] text-slate-900">
                {type === 'pocus' || type === 'blocks' ? (
                  <Tabs
                    value={activePocusTab}
                    onValueChange={(val) =>
                      setActivePocusTab(val as "indicaties" | "techniek" | "interpretatie")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-12 mb-4">
                      <TabsTrigger value="indicaties" className="rounded-xl text-[10px] font-black uppercase">
                        Indicaties
                      </TabsTrigger>
                      <TabsTrigger value="techniek" className="rounded-xl text-[10px] font-black uppercase">
                        Techniek
                      </TabsTrigger>
                      <TabsTrigger value="interpretatie" className="rounded-xl text-[10px] font-black uppercase">
                        Interpretatie
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="indicaties" className="outline-none">
                      <QuillEditor
                        ref={pocusIndicatiesRef}
                        value={tab1}
                        onChange={(value: string) => setTab1(stripBase64Images(value))}
                        className="h-[350px]"
                        theme="snow"
                        modules={QUILL_MODULES}
                      />
                    </TabsContent>
                    <TabsContent value="techniek" className="outline-none">
                      <QuillEditor
                        ref={pocusTechniekRef}
                        value={tab2}
                        onChange={(value: string) => setTab2(stripBase64Images(value))}
                        className="h-[350px]"
                        theme="snow"
                        modules={QUILL_MODULES}
                      />
                    </TabsContent>
                    <TabsContent value="interpretatie" className="outline-none">
                      <QuillEditor
                        ref={pocusInterpretatieRef}
                        value={tab3}
                        onChange={(value: string) => setTab3(stripBase64Images(value))}
                        className="h-[350px]"
                        theme="snow"
                        modules={QUILL_MODULES}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <QuillEditor
                    ref={genericContentRef}
                    value={content}
                    onChange={(value: string) => setContent(stripBase64Images(value))}
                    className="h-[350px]"
                    theme="snow"
                    modules={QUILL_MODULES}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b pb-4">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <h3 className="font-black uppercase tracking-tight text-sm text-slate-900">Design Gids</h3>
            </div>
            <div className="space-y-4 text-[11px] font-medium leading-relaxed text-slate-600">
                <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900">
                  <p className="font-black uppercase mb-1 underline">Blauwe Lijn</p>
                  <p>Typ een titel en kies <b>Koptekst 2 (H2)</b>.</p>
                </section>
                <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900">
                  <p className="font-black uppercase mb-1 underline">Groen Kader</p>
                  <p className="italic">Druk op Quote (") en typ je tekst.</p>
                </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
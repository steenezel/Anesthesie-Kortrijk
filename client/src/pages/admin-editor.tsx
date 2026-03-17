import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, FileText, Video, HelpCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [type, setType] = useState<string>("pocus");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>(""); 
  const [tab1, setTab1] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);

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
        htmlToInsert = `<p><a href="${publicUrl}" target="_blank" class="pdf-link underline text-teal-600 font-bold">📄 DOCUMENT: ${file.name}</a></p>`;
      } else if (fileType === 'video') {
        htmlToInsert = `<div class="video-container my-6">
            <video controls playsinline class="w-full rounded-3xl aspect-video bg-black shadow-lg">
              <source src="${publicUrl}" type="video/mp4">
            </video>
          </div>`;
      } else {
        htmlToInsert = `<p><img src="${publicUrl}" class="rounded-3xl shadow-lg my-4" alt="${file.name}" /></p>`;
      }

      if (type === 'pocus' || type === 'blocks') {
        setTab1(prev => prev + htmlToInsert);
      } else {
        setContent(prev => prev + htmlToInsert);
      }
      toast({ title: "Upload geslaagd" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      toast({ title: "Fout", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return toast({ title: "Titel ontbreekt", variant: "destructive" });
    setLoading(true);
    try {
      const payload = {
        title,
        content: (type === 'pocus' || type === 'blocks') ? tab1 : content,
        published: true,
        updated_at: new Date()
      };

      const { error } = await supabase.from(type).insert([payload]);
      if (error) throw error;

      toast({ title: "Succesvol opgeslagen!" });
      setLocation(`/${type}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Onbekende fout bij opslaan";
      toast({ title: "Fout bij opslaan", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" /> Terug
          </Button>
          <h1 className="font-black uppercase tracking-tighter text-xl text-slate-900">CMS Admin</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-teal-600 hover:bg-teal-500 rounded-xl px-8 font-bold text-white">
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} OPSLAAN
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-0">
        <div className="xl:col-span-3 p-8 space-y-8 bg-white border-r border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Module</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-2xl h-14 border-slate-200 focus:ring-teal-500">
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
            
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titel</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv: Gastric Ultrasound" 
                className="rounded-2xl h-14 border-slate-200 text-lg font-bold"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 p-4 bg-slate-900 rounded-3xl shadow-inner">
             <label className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl cursor-pointer transition-all border border-white/5 text-xs font-black uppercase">
                <Video className="h-4 w-4 text-teal-400" /> Video Upload
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
             </label>
             <label className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl cursor-pointer transition-all border border-white/5 text-xs font-black uppercase">
                <FileText className="h-4 w-4 text-blue-400" /> PDF/Doc
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'pdf')} />
             </label>
          </div>

          <div className="min-h-[500px] border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            <QuillEditor 
              value={type === 'pocus' || type === 'blocks' ? tab1 : content}
              onChange={type === 'pocus' || type === 'blocks' ? setTab1 : setContent}
              className="h-[600px] text-lg"
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [2, 3, false] }],
                  ['bold', 'italic', 'underline', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>

        <div className="p-8 space-y-6 bg-slate-50 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex items-center gap-2 text-slate-900 mb-4">
            <HelpCircle className="h-5 w-5 text-teal-600" />
            <h3 className="font-black uppercase tracking-tight">Styling Gids & Preview</h3>
          </div>
          
          <div className="space-y-4">
            <section className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 border-b pb-2">Blauwe Lijn (H2)</p>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span> Voorbeeld Kop
              </h2>
            </section>

            <div className="pt-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center">Preview op Mobiel Formaat</h3>
              <div className="mx-auto w-[320px] min-h-[500px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden overflow-y-auto p-4 scale-90 origin-top">
                <MarkdownRenderer content={type === 'pocus' || type === 'blocks' ? tab1 : content} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
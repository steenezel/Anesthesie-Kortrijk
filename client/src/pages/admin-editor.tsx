import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Video, ImageIcon, HelpCircle, ExternalLink } from "lucide-react";

// @ts-ignore
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = ReactQuill as any;

// ─── Tab-configuratie per module ───────────────────────────────────────────────
const TAB_CONFIG: Record<string, { label: string; field: string }[]> = {
  pocus: [
    { label: "Indicaties", field: "content_indicaties" },
    { label: "Techniek",   field: "content_techniek" },
    { label: "Interpretatie", field: "content_interpretatie" },
  ],
  blocks: [
    { label: "Algemeen",  field: "content_general" },
    { label: "Anatomie",  field: "content_anatomy" },
    { label: "Techniek",  field: "content_technique" },
  ],
};

const isMultiTab = (t: string) => t === "pocus" || t === "blocks";

const PROTOCOL_DISCIPLINES = [
  "Abdominale", "Buitendiensten", "Neurochirurgie", "NKO",
  "Obstetrie-epidurale", "Orthopedie", "Pijnkliniek",
  "Reanimatie", "Thorax-vaat", "Algemeen",
];

const JOURNAL_DISCIPLINES = ["Anesthesie", "Intensieve", "Urgentie", "Pijn"];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const stripBase64Images = (html: string): string =>
  html.replace(/<img[^>]+src="data:[^">]+"[^>]*>/gi, "");

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const editId   = queryParams.get("id");
  const editType = queryParams.get("type") || "pocus";

  const { toast } = useToast();
  const [loading,    setLoading]    = useState(false);
  const [type,       setType]       = useState(editType);
  const [title,      setTitle]      = useState("");
  const [discipline, setDiscipline] = useState("");
  const [pubmedId,   setPubmedId]   = useState("");
  const [content,    setContent]    = useState("");
  const [tab1, setTab1] = useState("");
  const [tab2, setTab2] = useState("");
  const [tab3, setTab3] = useState("");
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  const tabRef1          = useRef<any>(null);
  const tabRef2          = useRef<any>(null);
  const tabRef3          = useRef<any>(null);
  const genericContentRef = useRef<any>(null);

  // ─── Load existing record ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    const fetchData = async () => {
      const { data, error } = await supabase.from(type).select("*").eq("id", editId).single();
      if (!data || error) return;
      setTitle(data.title || "");
      if (isMultiTab(type)) {
        const cfg = TAB_CONFIG[type];
        setTab1(data[cfg[0].field] || "");
        setTab2(data[cfg[1].field] || "");
        setTab3(data[cfg[2].field] || "");
      } else if (type === "journal_club") {
        setContent(data.content || "");
        const rawDisc = data.disciplines;
        setDiscipline(Array.isArray(rawDisc) ? (rawDisc[0] || "") : (rawDisc || ""));
        setPubmedId(data.pubmed_id || "");
      } else {
        setContent(data.content || "");
        setDiscipline(data.discipline || "");
      }
    };
    fetchData();
  }, [editId, type]);

  // ─── Ref helper ───────────────────────────────────────────────────────────
  const getActiveRef = () => {
    if (!isMultiTab(type)) return genericContentRef;
    if (activeTab === "tab1") return tabRef1;
    if (activeTab === "tab2") return tabRef2;
    return tabRef3;
  };

  const getActiveSetter = () => {
    if (!isMultiTab(type)) return setContent;
    if (activeTab === "tab1") return setTab1;
    if (activeTab === "tab2") return setTab2;
    return setTab3;
  };

  // ─── Insert video shortcode at cursor position ─────────────────────────────
  const insertVideoAtCursor = (editorRef: React.RefObject<any>, shortcode: string): boolean => {
    const instance = editorRef.current;
    if (!instance) return false;
    const quill = instance.getEditor ? instance.getEditor() : instance;
    if (!quill) return false;
    quill.focus?.();
    const range = quill.getSelection() || quill.getSelection(true) || null;
    const index = range ? range.index : quill.getLength();
    quill.insertText(index, shortcode, "user");
    quill.insertText(index + shortcode.length, "\n", "user");
    quill.setSelection(index + shortcode.length + 1, 0, "user");
    return true;
  };

  // ─── Insert HTML (img/pdf) at cursor position ──────────────────────────────
  const insertHtmlAtCursor = (editorRef: React.RefObject<any>, html: string): boolean => {
    const instance = editorRef.current;
    if (!instance) return false;
    const quill = instance.getEditor ? instance.getEditor() : instance;
    if (!quill) return false;
    quill.focus?.();
    const range = quill.getSelection() || quill.getSelection(true) || null;
    const index = range ? range.index : quill.getLength();
    quill.clipboard.dangerouslyPasteHTML(index, html);
    return true;
  };

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "img" | "video" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";
    setLoading(true);
    try {
      const filePath = `${type}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const ref     = getActiveRef();
      const setter  = getActiveSetter();

      if (fileType === "video") {
        const shortcode = `[VIDEO:${publicUrl}]`;
        if (!insertVideoAtCursor(ref, shortcode)) {
          setter((prev: string) => prev + shortcode + "\n");
        }
      } else if (fileType === "img") {
        const html = `<img src="${publicUrl}" alt="afbeelding" />`;
        if (!insertHtmlAtCursor(ref, html)) {
          setter((prev: string) => prev + html);
        }
      } else {
        const html = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="color:#0284c7;font-weight:bold;text-decoration:underline;">📄 ${file.name}</a>`;
        if (!insertHtmlAtCursor(ref, html)) {
          setter((prev: string) => prev + html);
        }
      }

      toast({ title: "Upload geslaagd" });
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title) return toast({ title: "Titel verplicht", variant: "destructive" });
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { title };

      if (isMultiTab(type)) {
        const cfg = TAB_CONFIG[type];
        payload[cfg[0].field] = tab1;
        payload[cfg[1].field] = tab2;
        payload[cfg[2].field] = tab3;
      } else if (type === "journal_club") {
        payload.content    = content;
        payload.disciplines = discipline ? [discipline] : [];
        if (pubmedId.trim()) payload.pubmed_id = pubmedId.trim();
      } else {
        // protocols
        payload.content    = content;
        payload.discipline = discipline;
      }

      const { error } = editId
        ? await supabase.from(type).update(payload).eq("id", editId)
        : await supabase.from(type).insert([payload]);

      if (error) throw error;
      toast({ title: "Succesvol opgeslagen!" });
      setLocation(`/${type === "journal_club" ? "journalclub" : type}`);
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload toolbar (shared) ───────────────────────────────────────────────
  const UploadBar = () => (
    <div className="flex gap-2 p-2 bg-slate-100 rounded-2xl">
      <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-widest">
        <Video className="h-4 w-4 text-teal-600" /> Video
        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "video")} />
      </label>
      <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-widest">
        <ImageIcon className="h-4 w-4 text-purple-600" /> Afbeelding
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "img")} />
      </label>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Sticky header */}
      <div className="bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Terug
        </Button>
        <h1 className="font-black uppercase tracking-tighter">Content Editor</h1>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 rounded-xl px-6 font-bold text-white"
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
          OPSLAAN
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-6">

              {/* Module selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Module</label>
                <Select value={type} onValueChange={(v) => { setType(v); setActiveTab("tab1"); }}>
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

              {/* ── JOURNAL CLUB ────────────────────────────────────────────── */}
              {type === "journal_club" && (
                <>
                  {/* Discipline */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Discipline</label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                      <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-slate-900">
                        <SelectValue placeholder="Kies discipline…" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOURNAL_DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Titel */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="rounded-2xl border-slate-200 h-12 font-bold text-slate-900"
                    />
                  </div>

                  {/* PubMed ID */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                      PubMed ID <span className="font-normal normal-case">(optioneel — enkel het getal)</span>
                    </label>
                    <div className="relative">
                      <Input
                        value={pubmedId}
                        onChange={(e) => setPubmedId(e.target.value.replace(/\D/g, ""))}
                        placeholder="bv. 39512345"
                        className="rounded-2xl border-slate-200 h-12 font-bold text-slate-900 pr-12"
                      />
                      {pubmedId && (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-800"
                          title="Open PubMed"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <UploadBar />

                  {/* Quill editor */}
                  <div className="min-h-[400px]">
                    <QuillEditor
                      ref={genericContentRef}
                      value={content}
                      onChange={(val: string) => setContent(stripBase64Images(val))}
                      className="h-[350px]"
                      theme="snow"
                      modules={QUILL_MODULES}
                    />
                  </div>
                </>
              )}

              {/* ── PROTOCOLS ───────────────────────────────────────────────── */}
              {type === "protocols" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Discipline</label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                      <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-slate-900">
                        <SelectValue placeholder="Kies discipline…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROTOCOL_DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="rounded-2xl border-slate-200 h-12 font-bold text-slate-900"
                    />
                  </div>

                  <UploadBar />

                  <div className="min-h-[400px]">
                    <QuillEditor
                      ref={genericContentRef}
                      value={content}
                      onChange={(val: string) => setContent(stripBase64Images(val))}
                      className="h-[350px]"
                      theme="snow"
                      modules={QUILL_MODULES}
                    />
                  </div>
                </>
              )}

              {/* ── POCUS + BLOCKS (multi-tab) ───────────────────────────────── */}
              {isMultiTab(type) && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="rounded-2xl border-slate-200 h-12 font-bold text-slate-900"
                    />
                  </div>

                  <UploadBar />

                  <div className="min-h-[440px]">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as "tab1" | "tab2" | "tab3")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 rounded-2xl h-12 mb-4">
                        {TAB_CONFIG[type].map((cfg, i) => (
                          <TabsTrigger
                            key={cfg.field}
                            value={`tab${i + 1}` as "tab1" | "tab2" | "tab3"}
                            className="rounded-xl text-[10px] font-black uppercase"
                          >
                            {cfg.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="tab1" className="outline-none">
                        <QuillEditor
                          ref={tabRef1}
                          value={tab1}
                          onChange={(val: string) => setTab1(stripBase64Images(val))}
                          className="h-[350px]"
                          theme="snow"
                          modules={QUILL_MODULES}
                        />
                      </TabsContent>
                      <TabsContent value="tab2" className="outline-none">
                        <QuillEditor
                          ref={tabRef2}
                          value={tab2}
                          onChange={(val: string) => setTab2(stripBase64Images(val))}
                          className="h-[350px]"
                          theme="snow"
                          modules={QUILL_MODULES}
                        />
                      </TabsContent>
                      <TabsContent value="tab3" className="outline-none">
                        <QuillEditor
                          ref={tabRef3}
                          value={tab3}
                          onChange={(val: string) => setTab3(stripBase64Images(val))}
                          className="h-[350px]"
                          theme="snow"
                          modules={QUILL_MODULES}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Design Gids */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b pb-4">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <h3 className="font-black uppercase tracking-tight text-sm">Design Gids</h3>
            </div>
            <div className="space-y-4 text-[11px] font-medium leading-relaxed text-slate-600">
              <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900">
                <p className="font-black uppercase mb-1 underline">Blauwe Lijn (H2)</p>
                <p>Selecteer tekst → <b>Koptekst 2</b>.</p>
              </section>
              <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900">
                <p className="font-black uppercase mb-1 underline">Groen Kader</p>
                <p className="italic">Druk op Quote (") en typ je tekst.</p>
              </section>
              <section className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
                <p className="font-black uppercase mb-1 underline">Video invoegen</p>
                <p>Klik <b>eerst</b> op de gewenste positie in de tekst, dan op de Video-knop.</p>
              </section>
              {type === "journal_club" && (
                <section className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900">
                  <p className="font-black uppercase mb-1 underline">PubMed</p>
                  <p>Vul enkel het getal in (bv. <b>39512345</b>). De link wordt automatisch aangemaakt.</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CloudDownload,
  ExternalLink,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  Save,
  Video,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const QuillEditor = ReactQuill as any;

const TAB_CONFIG: Record<string, { label: string; field: string }[]> = {
  pocus: [
    { label: "Indicaties", field: "content_indicaties" },
    { label: "Techniek", field: "content_techniek" },
    { label: "Interpretatie", field: "content_interpretatie" },
  ],
  blocks: [
    { label: "Samenvatting", field: "content_general" },
    { label: "Anatomie", field: "content_anatomy" },
    { label: "Techniek", field: "content_technique" },
  ],
};

const PROTOCOL_DISCIPLINES = [
  "Abdominale",
  "Buitendiensten",
  "Neurochirurgie",
  "NKO",
  "Obstetrie-epidurale",
  "Orthopedie",
  "Pijnkliniek",
  "Reanimatie",
  "Thorax-vaat",
  "Algemeen",
];

const JOURNAL_DISCIPLINES = ["Anesthesie", "Intensieve", "Urgentie", "Pijn"];
const PROTOCOL_DISCIPLINE_ALIASES: Record<string, string> = {
  obstetrie: "Obstetrie-epidurale",
  "obstetrie epidurale": "Obstetrie-epidurale",
  obstetrie_epidurale: "Obstetrie-epidurale",
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const stripBase64Images = (html: string): string => html.replace(/<img[^>]+src="data:[^">]+"[^>]*>/gi, "");

const localProtocolFiles = import.meta.glob("../content/protocols/**/*.md", { query: "raw", eager: true });

const parseFrontmatter = (rawMarkdown: string): { frontmatter: Record<string, string>; body: string } => {
  const frontmatterMatch = rawMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatterMatch) return { frontmatter: {}, body: rawMarkdown };

  const frontmatterRaw = frontmatterMatch[1];
  const body = rawMarkdown.slice(frontmatterMatch[0].length);
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterRaw.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    if (!key) continue;

    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    frontmatter[key] = value;
  }

  return { frontmatter, body };
};

const inferDisciplineFromProtocolPath = (path: string): string => {
  const pathParts = path.split("/");
  const rawDiscipline = pathParts[pathParts.length - 2] || "algemeen";
  if (rawDiscipline.toLowerCase() === "protocols") return "Algemeen";

  return rawDiscipline
    .split("-")
    .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part))
    .join("-");
};

const normalizeProtocolDiscipline = (discipline?: string): string => {
  const raw = (discipline || "").trim();
  if (!raw) return "Algemeen";

  const lowered = raw.replace(/_/g, " ").trim().toLowerCase();
  if (PROTOCOL_DISCIPLINE_ALIASES[lowered]) {
    return PROTOCOL_DISCIPLINE_ALIASES[lowered];
  }

  const known = PROTOCOL_DISCIPLINES.find((candidate) => candidate.toLowerCase() === lowered.replace(/\s+/g, "-"));
  if (known) return known;

  if (lowered.startsWith("obstetrie")) return "Obstetrie-epidurale";

  return raw;
};

type TextSetter = React.Dispatch<React.SetStateAction<string>>;

function MarkdownSplitPane({
  value,
  onChange,
  textareaRef,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Markdown (ruw)</label>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="h-[420px] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="space-y-2">
        <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Live preview</label>
        <div className="h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
          <MarkdownRenderer content={value} />
        </div>
      </div>
    </div>
  );
}

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  const editId = queryParams.get("id");
  const editType = queryParams.get("type") || "protocols";
  const migrateSlug = queryParams.get("migrate");

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(editType);
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [pubmedId, setPubmedId] = useState("");
  const [content, setContent] = useState("");
  const [tab1, setTab1] = useState("");
  const [tab2, setTab2] = useState("");
  const [tab3, setTab3] = useState("");
  const [isMigratingProtocol, setIsMigratingProtocol] = useState(false);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  const pocusRef1 = useRef<any>(null);
  const pocusRef2 = useRef<any>(null);
  const pocusRef3 = useRef<any>(null);
  const singleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const blockTextareaRef1 = useRef<HTMLTextAreaElement>(null);
  const blockTextareaRef2 = useRef<HTMLTextAreaElement>(null);
  const blockTextareaRef3 = useRef<HTMLTextAreaElement>(null);

  const protocolDraftToMigrate = useMemo(() => {
    if (type !== "protocols" || !migrateSlug) return null;

    const fileKey = Object.keys(localProtocolFiles).find((key) =>
      key.toLowerCase().endsWith(`/${migrateSlug.toLowerCase()}.md`)
    );
    if (!fileKey) return null;

    const fileData = localProtocolFiles[fileKey] as any;
    const rawMarkdown = String(fileData?.default || fileData || "");
    const { frontmatter, body } = parseFrontmatter(rawMarkdown);

    return {
      slug: migrateSlug,
      title: frontmatter.title || migrateSlug.replace(/-/g, " "),
      discipline: normalizeProtocolDiscipline(frontmatter.discipline || inferDisciplineFromProtocolPath(fileKey)),
      content: body,
    };
  }, [migrateSlug, type]);

  useEffect(() => {
    if (!editId) return;

    const fetchData = async () => {
      const { data, error } = await supabase.from(type).select("*").eq("id", editId).single();
      if (!data || error) return;

      setTitle(data.title || "");

      if (type === "pocus" || type === "blocks") {
        const cfg = TAB_CONFIG[type];
        setTab1(data[cfg[0].field] || "");
        setTab2(data[cfg[1].field] || "");
        setTab3(data[cfg[2].field] || "");
        return;
      }

      if (type === "journal_club") {
        setContent(data.content || "");
        const rawDisciplines = data.disciplines;
        setDiscipline(Array.isArray(rawDisciplines) ? (rawDisciplines[0] || "") : (rawDisciplines || ""));
        setPubmedId(data.pubmed_id || "");
        return;
      }

      setContent(data.content || "");
      setDiscipline(normalizeProtocolDiscipline(data.discipline || ""));
    };

    fetchData();
  }, [editId, type]);

  useEffect(() => {
    if (editId || type !== "protocols" || !protocolDraftToMigrate) return;
    setTitle(protocolDraftToMigrate.title);
    setDiscipline(protocolDraftToMigrate.discipline);
    setContent(protocolDraftToMigrate.content);
  }, [editId, protocolDraftToMigrate, type]);

  const getActiveSetter = (): TextSetter => {
    if (type === "protocols" || type === "journal_club") return setContent;
    if (activeTab === "tab1") return setTab1;
    if (activeTab === "tab2") return setTab2;
    return setTab3;
  };

  const getActiveTextareaRef = (): React.RefObject<HTMLTextAreaElement | null> | null => {
    if (type === "protocols" || type === "journal_club") return singleTextareaRef;
    if (type !== "blocks") return null;
    if (activeTab === "tab1") return blockTextareaRef1;
    if (activeTab === "tab2") return blockTextareaRef2;
    return blockTextareaRef3;
  };

  const getActivePocusRef = (): React.RefObject<any> | null => {
    if (type !== "pocus") return null;
    if (activeTab === "tab1") return pocusRef1;
    if (activeTab === "tab2") return pocusRef2;
    return pocusRef3;
  };

  const insertTextAtCursorInTextarea = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    valueToInsert: string,
    setter: TextSetter
  ): boolean => {
    const textarea = ref.current;
    if (!textarea) return false;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;

    setter((prev) => `${prev.slice(0, start)}${valueToInsert}${prev.slice(end)}`);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      const cursor = start + valueToInsert.length;
      ref.current.focus();
      ref.current.setSelectionRange(cursor, cursor);
    });
    return true;
  };

  const insertTextAtCursorInQuill = (ref: React.RefObject<any>, valueToInsert: string): boolean => {
    const instance = ref.current;
    if (!instance) return false;
    const quill = instance.getEditor ? instance.getEditor() : instance;
    if (!quill) return false;

    quill.focus?.();
    const range = quill.getSelection() || quill.getSelection(true) || null;
    const index = range ? range.index : quill.getLength();
    quill.insertText(index, valueToInsert, "user");
    quill.setSelection(index + valueToInsert.length, 0, "user");
    return true;
  };

  const buildUploadSnippet = (fileType: "img" | "video" | "pdf", publicUrl: string, fileName: string): string => {
    if (fileType === "video") return `\n[VIDEO:${publicUrl}]\n`;
    if (fileType === "img") return `\n![${fileName.replace(/\.[^.]+$/, "") || "afbeelding"}](${publicUrl})\n`;
    return `\n[📄 ${fileName}](${publicUrl})\n`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "img" | "video" | "pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setLoading(true);
    try {
      const filePath = `${type}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath);

      const setter = getActiveSetter();
      const textareaRef = getActiveTextareaRef();
      const quillRef = getActivePocusRef();
      const snippet = buildUploadSnippet(fileType, publicUrl, file.name);

      let inserted = false;
      if (textareaRef) inserted = insertTextAtCursorInTextarea(textareaRef, snippet, setter);
      if (!inserted && quillRef) inserted = insertTextAtCursorInQuill(quillRef, snippet);
      if (!inserted) setter((prev) => `${prev}${snippet}`);

      toast({ title: "Upload geslaagd" });
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Titel verplicht", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let error: any = null;

      if (type === "protocols") {
        const payload = {
          title: title.trim(),
          discipline: normalizeProtocolDiscipline(discipline || "Algemeen"),
          content,
        };
        const result = editId
          ? await supabase.from("protocols").update(payload).eq("id", editId)
          : await supabase.from("protocols").insert([payload]);
        error = result.error;
      } else if (type === "journal_club") {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          content,
          disciplines: discipline ? [discipline] : [],
        };
        if (pubmedId.trim()) payload.pubmed_id = pubmedId.trim();
        const result = editId
          ? await supabase.from("journal_club").update(payload).eq("id", editId)
          : await supabase.from("journal_club").insert([payload]);
        error = result.error;
      } else if (type === "blocks" || type === "pocus") {
        const cfg = TAB_CONFIG[type];
        const payload = {
          title: title.trim(),
          [cfg[0].field]: tab1,
          [cfg[1].field]: tab2,
          [cfg[2].field]: tab3,
        };
        const result = editId
          ? await supabase.from(type).update(payload).eq("id", editId)
          : await supabase.from(type).insert([payload]);
        error = result.error;
      }

      if (error) throw error;
      toast({ title: "Succesvol opgeslagen!" });
      setLocation(`/${type === "journal_club" ? "journalclub" : type}`);
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateProtocolFile = async () => {
    if (!protocolDraftToMigrate) {
      toast({ title: "Bestand niet gevonden", description: "Controleer de migrate slug.", variant: "destructive" });
      return;
    }

    setIsMigratingProtocol(true);
    try {
      const payload = {
        title: protocolDraftToMigrate.title,
        discipline: normalizeProtocolDiscipline(protocolDraftToMigrate.discipline),
        content: protocolDraftToMigrate.content,
      };

      const { data, error } = await supabase.from("protocols").insert([payload]).select("id").single();
      if (error) throw error;

      toast({ title: "Migratie geslaagd", description: `${protocolDraftToMigrate.slug}.md staat nu in Supabase.` });
      setLocation(`/protocols/${data.id}`);
    } catch (err: any) {
      toast({ title: "Migratie mislukt", description: err.message, variant: "destructive" });
    } finally {
      setIsMigratingProtocol(false);
    }
  };

  const UploadBar = ({ showPdf = false }: { showPdf?: boolean }) => (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
      <label className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
        <Video className="h-4 w-4 text-teal-600" /> Video
        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "video")} />
      </label>
      <label className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
        <ImageIcon className="h-4 w-4 text-purple-600" /> Afbeelding
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "img")} />
      </label>
      {showPdf && (
        <label className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
          <FileText className="h-4 w-4 text-slate-600" /> PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, "pdf")} />
        </label>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white p-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Terug
        </Button>
        <h1 className="font-black uppercase tracking-tighter">Content Editor</h1>
        <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-teal-600 px-6 font-bold text-white hover:bg-teal-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          OPSLAAN
        </Button>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Module</label>
                <Select value={type} onValueChange={(v: any) => { setType(v); setActiveTab("tab1"); }}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 text-slate-900">
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

              {type === "journal_club" && (
                <>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Discipline</label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 text-slate-900">
                        <SelectValue placeholder="Kies discipline…" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOURNAL_DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="h-12 rounded-2xl border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">
                      PubMed ID <span className="normal-case font-normal">(optioneel — enkel het getal)</span>
                    </label>
                    <div className="relative">
                      <Input
                        value={pubmedId}
                        onChange={(e) => setPubmedId(e.target.value.replace(/\D/g, ""))}
                        placeholder="bv. 39512345"
                        className="h-12 rounded-2xl border-slate-200 pr-12 font-bold text-slate-900"
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

                  <UploadBar showPdf />

                  <MarkdownSplitPane
                    value={content}
                    onChange={setContent}
                    textareaRef={singleTextareaRef}
                    placeholder={"# Journal club samenvatting\n\nSchrijf hier in pure Markdown..."}
                  />
                </>
              )}

              {type === "protocols" && (
                <>
                  {migrateSlug && (
                    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Lokale migratie</div>
                      {protocolDraftToMigrate ? (
                        <>
                          <p className="text-xs text-amber-900">
                            Bestand <span className="font-bold">{protocolDraftToMigrate.slug}.md</span> is geladen via{" "}
                            <code>import.meta.glob</code>. Klik hieronder om frontmatter + markdown body direct naar Supabase te inserten.
                          </p>
                          <Button
                            type="button"
                            onClick={handleMigrateProtocolFile}
                            disabled={isMigratingProtocol}
                            className="rounded-xl bg-amber-600 font-bold text-white hover:bg-amber-700"
                          >
                            {isMigratingProtocol ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CloudDownload className="mr-2 h-4 w-4" />
                            )}
                            MIGREER LOKAAL BESTAND
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-red-700">
                          Geen lokaal protocolbestand gevonden voor slug: <b>{migrateSlug}</b>.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Discipline</label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 text-slate-900">
                        <SelectValue placeholder="Kies discipline…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROTOCOL_DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="h-12 rounded-2xl border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <UploadBar />

                  <MarkdownSplitPane
                    value={content}
                    onChange={setContent}
                    textareaRef={singleTextareaRef}
                    placeholder={"# Titel\n\nSchrijf hier je protocol in pure Markdown..."}
                  />
                </>
              )}

              {type === "blocks" && (
                <>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="h-12 rounded-2xl border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <UploadBar />

                  <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "tab1" | "tab2" | "tab3")} className="w-full">
                    <TabsList className="mb-4 grid h-12 w-full grid-cols-3 rounded-2xl bg-slate-100 p-1.5">
                      {TAB_CONFIG.blocks.map((cfg, i) => (
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
                      <MarkdownSplitPane
                        value={tab1}
                        onChange={setTab1}
                        textareaRef={blockTextareaRef1}
                        placeholder={"# Samenvatting\n\nAlgemene uitleg..."}
                      />
                    </TabsContent>
                    <TabsContent value="tab2" className="outline-none">
                      <MarkdownSplitPane
                        value={tab2}
                        onChange={setTab2}
                        textareaRef={blockTextareaRef2}
                        placeholder={"# Anatomie\n\nDiagrammen en afbeeldingen..."}
                      />
                    </TabsContent>
                    <TabsContent value="tab3" className="outline-none">
                      <MarkdownSplitPane
                        value={tab3}
                        onChange={setTab3}
                        textareaRef={blockTextareaRef3}
                        placeholder={"# Techniek\n\nPraktische tips en video's..."}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}

              {type === "pocus" && (
                <>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Titel *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Verplicht"
                      className="h-12 rounded-2xl border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <UploadBar />

                  <div className="min-h-[440px]">
                    <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "tab1" | "tab2" | "tab3")} className="w-full">
                      <TabsList className="mb-4 grid h-12 w-full grid-cols-3 rounded-2xl bg-slate-100 p-1.5">
                        {TAB_CONFIG.pocus.map((cfg, i) => (
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
                          ref={pocusRef1}
                          value={tab1}
                          onChange={(val: string) => setTab1(stripBase64Images(val))}
                          className="h-[350px]"
                          theme="snow"
                          modules={QUILL_MODULES}
                        />
                      </TabsContent>
                      <TabsContent value="tab2" className="outline-none">
                        <QuillEditor
                          ref={pocusRef2}
                          value={tab2}
                          onChange={(val: string) => setTab2(stripBase64Images(val))}
                          className="h-[350px]"
                          theme="snow"
                          modules={QUILL_MODULES}
                        />
                      </TabsContent>
                      <TabsContent value="tab3" className="outline-none">
                        <QuillEditor
                          ref={pocusRef3}
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

        <div className="space-y-4">
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 text-slate-900">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <h3 className="text-sm font-black uppercase tracking-tight">Design Gids</h3>
            </div>
            <div className="space-y-4 text-[11px] font-medium leading-relaxed text-slate-600">
              <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-900">
                <p className="mb-2 font-black uppercase underline">Markdown basics</p>
                <ul className="space-y-1 text-[11px]">
                  <li><code>**vet**</code> = <b>vet</b></li>
                  <li><code>*cursief*</code> = <i>cursief</i></li>
                  <li><code>onderlijnd</code> = niet standaard in pure Markdown</li>
                  <li><code>## Kop 2</code> / <code>### Kop 3</code></li>
                </ul>
              </section>
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                <p className="mb-1 font-black uppercase underline">Callouts</p>
                <p>Gebruik <code>&gt; [!INFO]</code>, <code>&gt; [!TIP]</code> en <code>&gt; [!WARNING]</code>.</p>
              </section>
              <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-900">
                <p className="mb-1 font-black uppercase underline">Media invoegen</p>
                <p>Klik eerst op je cursorpositie en gebruik dan de Video/Afbeelding/PDF knop.</p>
              </section>
              {type === "blocks" && (
                <section className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-orange-900">
                  <p className="mb-1 font-black uppercase underline">Calculators</p>
                  <p>
                    Plaats <code>[CAUDAL_CALC]</code> op een nieuwe regel in Algemeen, Anatomie of Techniek om de
                    Caudaal Volume Calculator te tonen.
                  </p>
                </section>
              )}
              {type === "journal_club" && (
                <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
                  <p className="mb-1 font-black uppercase underline">PubMed</p>
                  <p>Vul enkel het nummer in (bv. <b>39512345</b>). De link wordt automatisch gemaakt.</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

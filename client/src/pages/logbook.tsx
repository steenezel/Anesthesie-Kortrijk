import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ClipboardList,
  Download,
  Loader2,
  LogOut,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { canReviewAsoLogbooks } from "@shared/permissions";
import {
  LOGBOOK_TREE,
  SUPERVISION_LEVELS,
  getLogbookCategory,
  getLogbookSubCategory,
  techniqueDisplayName,
  type LogbookCategory,
  type LogbookCategoryId,
  type LogbookSubCategory,
  type LogbookTechnique,
} from "@/data/logbook-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SessionUser } from "@/lib/auth-client";

type EntryStatus = "pass" | "fail";

type LogbookUser = {
  id: string;
  username: string;
  name: string;
  role: string;
  hidden?: boolean;
};

type LogbookEntry = {
  id: string;
  userId: string;
  asoName?: string | null;
  asoUsername?: string | null;
  category: string;
  subCategory: string;
  technique: string;
  status: EntryStatus;
  date: string;
  supervisionLevel?: string | null;
  supervisorName?: string | null;
  notes?: string | null;
  createdAt?: string | Date | null;
};

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatNlDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toLogbookUser(user: SessionUser): LogbookUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

export default function LogbookPage() {
  const { user, signOut, isKiosk, canWrite } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    void signOut();
    queryClient.removeQueries({
      predicate: (query) => String(query.queryKey[0] ?? "").startsWith("/api/logbook/"),
    });
    toast({ title: "Uitgelogd" });
  };

  if (!user) return null;

  if (isKiosk || !canWrite) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="font-black uppercase text-sm tracking-widest text-slate-700">
          Logboek niet beschikbaar in kiosk-modus
        </p>
        <Link href="/">
          <Button variant="outline">Terug naar home</Button>
        </Link>
      </div>
    );
  }

  const sessionUser = toLogbookUser(user);
  const isReviewer = canReviewAsoLogbooks(user.role);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 -mx-4">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="px-2 text-slate-500">
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600">
            Logboek technieken
          </p>
          <p className="text-xs font-black uppercase tracking-tight text-slate-900 truncate">
            {sessionUser.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-slate-400"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {isReviewer ? (
        <Tabs defaultValue="nakijken" className="px-4 pt-4 max-w-md mx-auto">
          <TabsList className="w-full h-12 rounded-2xl bg-slate-200/70 p-1">
            <TabsTrigger
              value="nakijken"
              className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700"
            >
              Nakijken
            </TabsTrigger>
            <TabsTrigger
              value="registreren"
              className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700"
            >
              Registreren
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nakijken" className="mt-4">
            <SupervisorOverview embedded />
          </TabsContent>
          <TabsContent value="registreren" className="mt-4">
            <AsoWorkspace user={sessionUser} embedded />
          </TabsContent>
        </Tabs>
      ) : (
        <AsoWorkspace user={sessionUser} />
      )}
    </div>
  );
}

function AsoWorkspace({
  user,
  embedded = false,
}: {
  user: LogbookUser;
  embedded?: boolean;
}) {
  return (
    <Tabs
      defaultValue="nieuw"
      className={cn(!embedded && "px-4 pt-4 max-w-md mx-auto")}
    >
      <TabsList className="w-full h-12 rounded-2xl bg-slate-200/70 p-1">
        <TabsTrigger
          value="nieuw"
          className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700"
        >
          Nieuw
        </TabsTrigger>
        <TabsTrigger
          value="historiek"
          className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-teal-700"
        >
          Mijn logboek
        </TabsTrigger>
      </TabsList>
      <TabsContent value="nieuw" className="mt-4">
        <LogWizard user={user} />
      </TabsContent>
      <TabsContent value="historiek" className="mt-4">
        <PersonalHistory userId={user.id} />
      </TabsContent>
    </Tabs>
  );
}

function LogWizard({ user }: { user: LogbookUser }) {
  const { toast } = useToast();
  const [category, setCategory] = useState<LogbookCategory | null>(null);
  const [subCategory, setSubCategory] = useState<LogbookSubCategory | null>(null);
  const [technique, setTechnique] = useState<LogbookTechnique | null>(null);
  const [customTechnique, setCustomTechnique] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [status, setStatus] = useState<EntryStatus>("pass");
  const [supervisionLevel, setSupervisionLevel] = useState<string>("Onder supervisie uitgevoerd");
  const [notes, setNotes] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const openConfirm = (nextTechnique: LogbookTechnique) => {
    setTechnique(nextTechnique);
    setCustomTechnique("");
    setDate(todayIsoDate());
    setStatus("pass");
    setSupervisionLevel("Onder supervisie uitgevoerd");
    setNotes("");
    setSheetOpen(true);
  };

  const resetWizard = () => {
    setCategory(null);
    setSubCategory(null);
    setTechnique(null);
    setCustomTechnique("");
    setNotes("");
    setSheetOpen(false);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const techniqueLabel = technique?.freeText
        ? customTechnique.trim()
        : technique?.label;
      if (!category || !subCategory || !techniqueLabel) {
        throw new Error("Onvolledige selectie");
      }
      const res = await apiRequest("POST", "/api/logbook/entries", {
        userId: user.id,
        category: category.id,
        subCategory: subCategory.id,
        technique: techniqueLabel,
        status,
        date,
        supervisionLevel,
        notes: notes.trim() || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => String(query.queryKey[0] ?? "").startsWith("/api/logbook/"),
      });
      toast({
        title: "Geregistreerd",
        description: `${technique?.freeText ? customTechnique.trim() : technique?.label} · ${status.toUpperCase()}`,
      });
      if (navigator.vibrate) navigator.vibrate(40);
      resetWizard();
    },
    onError: () => {
      toast({
        title: "Opslaan mislukt",
        description: "Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {!category ? "Stap 1 · Categorie" : !subCategory ? "Stap 2 · Subcategorie" : "Stap 3 · Techniek"}
        </p>
        {(category || subCategory) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-400"
            onClick={() => {
              if (subCategory) setSubCategory(null);
              else setCategory(null);
            }}
          >
            <ChevronLeft className="h-3 w-3 mr-1" /> Terug
          </Button>
        )}
      </div>

      {!category && (
        <div className="grid gap-3">
          {LOGBOOK_TREE.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-[24px] border-2 p-5 text-left active:scale-[0.98] transition-all",
                item.id === "LRA" && "bg-teal-50 border-teal-200",
                item.id === "Arterieel" && "bg-rose-50 border-rose-100",
                item.id === "Centraal" && "bg-sky-50 border-sky-100",
              )}
            >
              <p className="text-2xl font-black uppercase tracking-tighter text-slate-900">
                {item.label}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {category && !subCategory && (
        <div className="grid grid-cols-2 gap-2">
          {category.subCategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSubCategory(sub)}
              className="min-h-[72px] rounded-2xl border-2 border-slate-100 bg-white p-3 active:scale-95 transition-all"
            >
              <p className="font-black uppercase text-sm tracking-tight text-slate-900">
                {sub.label}
              </p>
              {sub.shortLabel && sub.shortLabel !== sub.label && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  {sub.shortLabel}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {category && subCategory && (
        <div className="grid grid-cols-1 gap-2">
          {subCategory.techniques.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openConfirm(item)}
              className="min-h-[56px] rounded-2xl border-2 border-teal-100 bg-white px-4 py-3 text-left active:scale-[0.98] transition-all"
            >
              <p className="font-black uppercase text-sm tracking-tight text-slate-900">
                {techniqueDisplayName(item)}
              </p>
              {item.shortLabel && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {item.label}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent className="rounded-t-[28px] pb-[env(safe-area-inset-bottom)] max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-black uppercase tracking-tight text-slate-900">
              {technique ? techniqueDisplayName(technique) : "Bevestig"}
            </DrawerTitle>
            <DrawerDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {category?.label} · {subCategory?.label}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 space-y-4 overflow-y-auto">
            {technique?.freeText && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Techniek
                </label>
                <Input
                  autoFocus
                  placeholder="bv. Geniculaire block"
                  value={customTechnique}
                  onChange={(e) => setCustomTechnique(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Datum
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Resultaat
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("pass")}
                  className={cn(
                    "h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all",
                    status === "pass"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-200 text-slate-400",
                  )}
                >
                  ✅ Pass
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("fail")}
                  className={cn(
                    "h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all",
                    status === "fail"
                      ? "bg-rose-600 border-rose-600 text-white"
                      : "bg-white border-slate-200 text-slate-400",
                  )}
                >
                  ❌ Fail
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Supervisie
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUPERVISION_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setSupervisionLevel(level.label)}
                    className={cn(
                      "min-h-[56px] rounded-2xl border-2 px-2 py-2 font-black uppercase tracking-tight text-[11px] leading-tight transition-all",
                      supervisionLevel === level.label
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-slate-200 text-slate-500",
                    )}
                  >
                    {level.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Uitleg <span className="text-slate-300">(optioneel)</span>
              </label>
              <Input
                placeholder="Korte toelichting…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <DrawerFooter>
            <Button
              className="h-14 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest"
              disabled={mutation.isPending || (technique?.freeText && !customTechnique.trim()) || !supervisionLevel}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Registreer Techniek"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function PersonalHistory({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<LogbookCategoryId | "all">("all");
  const { data: entries = [], isLoading } = useQuery<LogbookEntry[]>({
    queryKey: [`/api/logbook/my-entries?userId=${userId}`],
  });

  const counts = useMemo(() => {
    const byCategory = { LRA: 0, Arterieel: 0, Centraal: 0 };
    let pass = 0;
    for (const entry of entries) {
      if (entry.category in byCategory) {
        byCategory[entry.category as LogbookCategoryId] += 1;
      }
      if (entry.status === "pass") pass += 1;
    }
    return {
      total: entries.length,
      ...byCategory,
      passRate: entries.length ? Math.round((pass / entries.length) * 100) : 0,
    };
  }, [entries]);

  const visible = entries.filter((entry) => filter === "all" || entry.category === filter);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1.5">
        <SummaryBadge label="Totaal" value={counts.total} />
        <SummaryBadge label="LRA" value={counts.LRA} />
        <SummaryBadge label="Art." value={counts.Arterieel} />
        <SummaryBadge label="CVC" value={counts.Centraal} />
        <SummaryBadge label="Pass" value={`${counts.passRate}%`} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "LRA", "Arterieel", "Centraal"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
              filter === item
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-400 border-slate-200",
            )}
          >
            {item === "all" ? "Alles" : item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-10">
          Nog geen registraties
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function SupervisorOverview({ embedded = false }: { embedded?: boolean }) {
  const [asoId, setAsoId] = useState("all");
  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [technique, setTechnique] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: asoUsers = [] } = useQuery<LogbookUser[]>({
    queryKey: ["/api/logbook/users?role=aso"],
  });

  const selectedCategory = category === "all" ? undefined : getLogbookCategory(category);
  const selectedSub = subCategory === "all" || !selectedCategory
    ? undefined
    : getLogbookSubCategory(category, subCategory);

  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (asoId !== "all") params.set("asoId", asoId);
    if (category !== "all") params.set("category", category);
    if (subCategory !== "all") params.set("subCategory", subCategory);
    if (technique !== "all") params.set("technique", technique);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const qs = params.toString();
    return qs ? `/api/logbook/supervisor/all?${qs}` : "/api/logbook/supervisor/all";
  }, [asoId, category, subCategory, technique, startDate, endDate]);

  const { data: entries = [], isLoading } = useQuery<LogbookEntry[]>({
    queryKey: [queryUrl],
  });

  const stats = useMemo(() => buildSupervisorStats(entries), [entries]);

  const exportCsv = () => {
    const header = ["Datum", "ASO", "Categorie", "Subcategorie", "Techniek", "Resultaat", "Supervisie", "Uitleg"];
    const rows = entries.map((entry) => [
      entry.date,
      entry.asoName || entry.asoUsername || entry.userId,
      entry.category === "Centraal" ? "CVC" : entry.category,
      entry.subCategory,
      entry.technique,
      entry.status.toUpperCase(),
      entry.supervisionLevel || "",
      entry.notes || "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aso-logboek-${todayIsoDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "space-y-4",
        !embedded && "px-4 pt-4 max-w-md mx-auto",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Supervisor overzicht
        </p>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
          onClick={exportCsv}
          disabled={entries.length === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1" /> CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FilterSelect
          label="ASO"
          value={asoId}
          onChange={setAsoId}
          options={[
            { value: "all", label: "Alle ASO's" },
            ...asoUsers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
        <FilterSelect
          label="Categorie"
          value={category}
          onChange={(value) => {
            setCategory(value);
            setSubCategory("all");
            setTechnique("all");
          }}
          options={[
            { value: "all", label: "Alle" },
            ...LOGBOOK_TREE.map((item) => ({ value: item.id, label: item.label })),
          ]}
        />
        <FilterSelect
          label="Subcategorie"
          value={subCategory}
          onChange={(value) => {
            setSubCategory(value);
            setTechnique("all");
          }}
          options={[
            { value: "all", label: "Alle" },
            ...(selectedCategory?.subCategories.map((sub) => ({
              value: sub.id,
              label: sub.label,
            })) ?? []),
          ]}
        />
        <FilterSelect
          label="Techniek"
          value={technique}
          onChange={setTechnique}
          options={[
            { value: "all", label: "Alle" },
            ...(selectedSub?.techniques.map((item) => ({
              value: item.label,
              label: techniqueDisplayName(item),
            })) ?? []),
          ]}
        />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Van</p>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 rounded-xl" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tot</p>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        {stats.map((item) => (
          <div key={item.name} className="rounded-2xl border-2 border-teal-100 bg-teal-50 p-4">
            <p className="font-black uppercase tracking-tight text-slate-900">{item.name}</p>
            <p className="text-[11px] font-bold text-slate-600 mt-1">
              {item.topTechniques} · {item.passRate}% pass · {item.total}x totaal
            </p>
          </div>
        ))}
        {stats.length === 0 && !isLoading && (
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">
            Geen data voor deze filters
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} showAso />
          ))}
        </div>
      )}
    </div>
  );
}

function buildSupervisorStats(entries: LogbookEntry[]) {
  const byAso = new Map<
    string,
    { name: string; total: number; pass: number; techniques: Record<string, number> }
  >();

  for (const entry of entries) {
    const key = entry.userId;
    const current = byAso.get(key) ?? {
      name: entry.asoName || entry.asoUsername || "Onbekend",
      total: 0,
      pass: 0,
      techniques: {},
    };
    current.total += 1;
    if (entry.status === "pass") current.pass += 1;
    const statKey =
      entry.category === "Arterieel" || entry.category === "Centraal"
        ? `${formatEntryTitle(entry)} · ${entry.subCategory} · ${entry.technique}`
        : entry.technique;
    current.techniques[statKey] = (current.techniques[statKey] || 0) + 1;
    byAso.set(key, current);
  }

  return Array.from(byAso.values())
    .map((item) => {
      const top = Object.entries(item.techniques)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, count]) => `${count}x ${label}`)
        .join(", ");
      return {
        name: item.name,
        total: item.total,
        passRate: item.total ? Math.round((item.pass / item.total) * 100) : 0,
        topTechniques: top || "geen technieken",
      };
    })
    .sort((a, b) => b.total - a.total);
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 rounded-xl bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SummaryBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-2 text-center">
      <p className="text-lg font-black text-slate-900 leading-none">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
        {label}
      </p>
    </div>
  );
}

function formatEntryTitle(entry: LogbookEntry) {
  if (entry.category === "Arterieel") return "Arterieel";
  if (entry.category === "Centraal") return "CVC";
  return entry.technique;
}

function formatEntryDetails(entry: LogbookEntry) {
  if (entry.category === "Arterieel" || entry.category === "Centraal") {
    return [entry.subCategory, entry.technique].filter(Boolean).join(" · ");
  }
  return entry.subCategory;
}

function EntryRow({ entry, showAso = false }: { entry: LogbookEntry; showAso?: boolean }) {
  const pass = entry.status === "pass";
  const details = formatEntryDetails(entry);
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-black uppercase text-sm tracking-tight text-slate-900 truncate">
          {formatEntryTitle(entry)}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {formatNlDate(entry.date)}
          {details ? ` · ${details}` : ""}
          {showAso ? ` · ${entry.asoName || entry.asoUsername || ""}` : ""}
          {entry.supervisionLevel ? ` · ${entry.supervisionLevel}` : ""}
        </p>
        {entry.notes && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{entry.notes}</p>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest",
          pass ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
        )}
      >
        {pass ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

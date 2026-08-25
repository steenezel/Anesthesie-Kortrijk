import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Bone,
  ChevronLeft,
  ClipboardList,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SPINAL_AGENTS = ["Scandicaine", "Hyperbare Marcaine"] as const;
type SpinalAgent = (typeof SPINAL_AGENTS)[number];

const spinalLogFormSchema = z.object({
  aslOrAnesthetistName: z.string().trim().min(2, "Naam of initialen verplicht"),
  patientIdentifier: z.string().trim().min(1, "Initialen patiënt verplicht"),
  agentUsed: z.enum(SPINAL_AGENTS),
  doseAdministered: z.coerce
    .number({ invalid_type_error: "Vul de dosis in ml in" })
    .positive("Dosis moet groter dan 0 ml zijn"),
  surgicalSuccess: z.boolean(),
  durationOfAction: z.coerce
    .number({ invalid_type_error: "Vul de werkingsduur in minuten in" })
    .int()
    .min(0, "Werkingsduur kan niet negatief zijn"),
  pacuStayDuration: z.coerce
    .number({ invalid_type_error: "Vul de PACU-duur in minuten in" })
    .int()
    .min(0, "PACU-duur kan niet negatief zijn"),
  urinaryRetention: z.boolean(),
});

type SpinalLogFormValues = z.infer<typeof spinalLogFormSchema>;

type LogbookUser = {
  id: string;
  username: string;
  name: string;
  role: "aso" | "supervisor";
  hidden?: boolean;
};

type SpinalSession = {
  user: LogbookUser;
  pin: string;
};

type SpinalLog = {
  id: number;
  aslOrAnesthetistName: string;
  patientIdentifier: string;
  agentUsed: SpinalAgent;
  doseAdministered: number;
  surgicalSuccess: boolean;
  durationOfAction: number;
  pacuStayDuration: number;
  urinaryRetention: boolean;
  createdAt?: string | Date | null;
};

const SESSION_KEY = "ane_spinal_log_session";

function readSession(): SpinalSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpinalSession;
    if (!parsed?.user?.id || !parsed?.pin) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: SpinalSession | null) {
  if (!session) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function authHeaders(session: SpinalSession) {
  return {
    "X-Logbook-User-Id": session.user.id,
    "X-Logbook-Pin": session.pin,
  };
}

function formatNlDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("nl-BE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function SpinalLogbookPage() {
  const [session, setSession] = useState<SpinalSession | null>(() => readSession());

  const handleLogin = (next: SpinalSession) => {
    writeSession(next);
    setSession(next);
  };

  const handleLogout = () => {
    writeSession(null);
    setSession(null);
    queryClient.removeQueries({ queryKey: ["/api/spinal-logs"] });
  };

  if (!session) {
    return <SpinalLogLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 -mx-4">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="px-2 text-slate-500">
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-700">
            SMASH
          </p>
          <p className="text-xs font-black uppercase tracking-tight text-slate-900 truncate">
            {session.user.name}
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

      <Tabs defaultValue="nieuw" className="px-4 pt-4 max-w-3xl mx-auto">
        <TabsList className="w-full h-12 rounded-2xl bg-slate-200/70 p-1">
          <TabsTrigger
            value="nieuw"
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-800"
          >
            Nieuw
          </TabsTrigger>
          <TabsTrigger
            value="overzicht"
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-800"
          >
            Overzicht
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nieuw" className="mt-4">
          <SpinalLogForm session={session} onUnauthorized={handleLogout} />
        </TabsContent>
        <TabsContent value="overzicht" className="mt-4">
          <SpinalLogOverview session={session} onUnauthorized={handleLogout} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SpinalLogLogin({ onLogin }: { onLogin: (session: SpinalSession) => void }) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<LogbookUser | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<LogbookUser[]>({
    queryKey: ["/api/logbook/users"],
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: { userId: string; pin: string }) => {
      const res = await apiRequest("POST", "/api/logbook/auth/login", payload);
      return (await res.json()) as LogbookUser;
    },
    onSuccess: (user, variables) => onLogin({ user, pin: variables.pin }),
    onError: () => {
      setError(true);
      setPin("");
      if (navigator.vibrate) navigator.vibrate(200);
      toast({
        title: "Toegang geweigerd",
        description: "Controleer de PIN en probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  const submitPin = (value: string) => {
    if (!selectedUser || value.length < 4) return;
    loginMutation.mutate({ userId: selectedUser.id, pin: value });
  };

  const appendDigit = (digit: string) => {
    setError(false);
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    if (next.length === 4) submitPin(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 -mx-4">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="px-2 text-slate-500">
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>
        <h1 className="flex-1 text-center font-black uppercase text-xs tracking-widest text-slate-900 flex items-center justify-center gap-1">
          <Bone className="h-3.5 w-3.5 text-cyan-700" /> SMASH
        </h1>
        <div className="w-16" />
      </header>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {!selectedUser && (
          <div className="space-y-3 pt-2">
            <p className="text-center text-sm text-slate-600 leading-snug px-2">
              Scandicaine versus Marcaine: Anesthesia Spinal Hip
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
              Selecteer ASO of staflid
            </p>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-700" />
              </div>
            ) : isError ? (
              <div className="rounded-2xl border-2 border-rose-100 bg-rose-50 p-4 space-y-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                  Gebruikerslijst niet bereikbaar
                </p>
                <p className="text-xs text-rose-600">
                  Start de app met <span className="font-mono">npm run dev</span> zodat de API meedraait.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => refetch()}
                >
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-4 flex items-center gap-3 active:scale-[0.98] transition-all",
                    user.hidden
                      ? "border-transparent bg-transparent opacity-40 hover:opacity-70"
                      : "border-slate-100 bg-white",
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      user.hidden ? "bg-slate-100" : "bg-cyan-50",
                    )}
                  >
                    <UserRound
                      className={cn("h-5 w-5", user.hidden ? "text-slate-300" : "text-cyan-700")}
                    />
                  </div>
                  <span
                    className={cn(
                      "uppercase tracking-tight",
                      user.hidden
                        ? "text-xs font-medium text-slate-400 normal-case"
                        : "text-sm font-black text-slate-900",
                    )}
                  >
                    {user.name}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedUser && (
          <div className="space-y-5">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 uppercase text-[10px] font-black tracking-widest"
              onClick={() => {
                setSelectedUser(null);
                setPin("");
                setError(false);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Profiel
            </Button>
            <div className="text-center space-y-1">
              <p className="text-lg font-black uppercase tracking-tight text-slate-900">
                {selectedUser.name}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Voer PIN in
              </p>
            </div>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    pin.length > index
                      ? "bg-cyan-700 border-cyan-700"
                      : error
                        ? "border-rose-500"
                        : "border-slate-300",
                  )}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key) =>
                key === "" ? (
                  <div key="empty" />
                ) : (
                  <button
                    key={key}
                    type="button"
                    disabled={loginMutation.isPending}
                    onClick={() => {
                      if (key === "⌫") {
                        setError(false);
                        setPin((prev) => prev.slice(0, -1));
                        return;
                      }
                      appendDigit(key);
                    }}
                    className="h-16 rounded-2xl bg-white border-2 border-slate-100 font-black text-xl text-slate-900 active:scale-95 active:bg-cyan-50 transition-all disabled:opacity-50"
                  >
                    {key}
                  </button>
                ),
              )}
            </div>
            {loginMutation.isPending && (
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-700" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpinalLogForm({
  session,
  onUnauthorized,
}: {
  session: SpinalSession;
  onUnauthorized: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<SpinalLogFormValues>({
    resolver: zodResolver(spinalLogFormSchema),
    defaultValues: {
      aslOrAnesthetistName: session.user.name,
      patientIdentifier: "",
      agentUsed: "Scandicaine",
      doseAdministered: undefined,
      surgicalSuccess: true,
      durationOfAction: undefined,
      pacuStayDuration: undefined,
      urinaryRetention: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SpinalLogFormValues) => {
      const res = await fetch("/api/spinal-logs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(session),
        },
        body: JSON.stringify(values),
      });
      if (res.status === 401) {
        onUnauthorized();
        throw new Error("Sessie verlopen");
      }
      if (!res.ok) {
        throw new Error("Opslaan mislukt");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spinal-logs"] });
      toast({
        title: "Geregistreerd",
        description: "SMASH-invoer is opgeslagen.",
      });
      if (navigator.vibrate) navigator.vibrate(40);
      form.reset({
        aslOrAnesthetistName: session.user.name,
        patientIdentifier: "",
        agentUsed: "Scandicaine",
        doseAdministered: undefined,
        surgicalSuccess: true,
        durationOfAction: undefined,
        pacuStayDuration: undefined,
        urinaryRetention: false,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Opslaan mislukt",
        description: error.message || "Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4 pb-8">
      <div className="rounded-2xl border-2 border-cyan-100 bg-cyan-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
          SMASH
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Scandicaine versus Marcaine: Anesthesia Spinal Hip — registreer na THP of
          scandicaine een valabel alternatief is voor hyperbare marcaine.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="aslOrAnesthetistName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Uitvoerende arts / ASO
                </FormLabel>
                <FormControl>
                  <Input {...field} className="h-12 rounded-xl bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patientIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Initialen patiënt
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="bv. JD"
                    className="h-12 rounded-xl bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agentUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Lokaal anestheticum
                </FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SPINAL_AGENTS.map((agent) => (
                    <button
                      key={agent}
                      type="button"
                      onClick={() => field.onChange(agent)}
                      className={cn(
                        "min-h-[64px] rounded-2xl border-2 px-3 py-2 font-black uppercase tracking-tight text-[11px] leading-tight transition-all",
                        field.value === agent
                          ? "bg-cyan-700 border-cyan-700 text-white"
                          : "bg-white border-slate-200 text-slate-500",
                      )}
                    >
                      {agent}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doseAdministered"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Dosis (ml)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    placeholder="bv. 3"
                    className="h-12 rounded-xl bg-white"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value === "" ? undefined : event.target.value)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surgicalSuccess"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Chirurgisch succes zonder conversie
                </FormLabel>
                <YesNoToggle value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="durationOfAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Werkingsduur (min)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="min"
                      className="h-12 rounded-xl bg-white"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value === "" ? undefined : event.target.value)
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pacuStayDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    PACU-verblijf (min)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="min"
                      className="h-12 rounded-xl bg-white"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value === "" ? undefined : event.target.value)
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="urinaryRetention"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Urineretentie
                </FormLabel>
                <YesNoToggle value={field.value} onChange={field.onChange} invertColors />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-14 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white font-black uppercase tracking-widest"
          >
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ClipboardList className="h-4 w-4 mr-2" />
                Registreer
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function SpinalLogOverview({
  session,
  onUnauthorized,
}: {
  session: SpinalSession;
  onUnauthorized: () => void;
}) {
  const [agentFilter, setAgentFilter] = useState<SpinalAgent | "all">("all");

  const { data: logs = [], isLoading, isError } = useQuery<SpinalLog[]>({
    queryKey: ["/api/spinal-logs"],
    queryFn: async () => {
      const res = await fetch("/api/spinal-logs", {
        credentials: "include",
        headers: authHeaders(session),
      });
      if (res.status === 401) {
        onUnauthorized();
        throw new Error("Authenticatie vereist");
      }
      if (!res.ok) {
        throw new Error("Kon logboek niet ophalen");
      }
      return res.json();
    },
  });

  const visible = logs.filter(
    (log) => agentFilter === "all" || log.agentUsed === agentFilter,
  );

  const stats = useMemo(() => {
    const byAgent = (agent: SpinalAgent) => logs.filter((log) => log.agentUsed === agent);
    const summarize = (rows: SpinalLog[]) => ({
      n: rows.length,
      success: percent(rows.filter((row) => row.surgicalSuccess).length, rows.length),
      duration: mean(rows.map((row) => row.durationOfAction)),
      pacu: mean(rows.map((row) => row.pacuStayDuration)),
      retention: percent(rows.filter((row) => row.urinaryRetention).length, rows.length),
    });
    return {
      all: summarize(logs),
      scandicaine: summarize(byAgent("Scandicaine")),
      marcaine: summarize(byAgent("Hyperbare Marcaine")),
    };
  }, [logs]);

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-2 gap-2">
        <AgentStatCard
          title="Scandicaine"
          n={stats.scandicaine.n}
          success={stats.scandicaine.success}
          pacu={stats.scandicaine.pacu}
          retention={stats.scandicaine.retention}
        />
        <AgentStatCard
          title="Marcaine"
          n={stats.marcaine.n}
          success={stats.marcaine.success}
          pacu={stats.marcaine.pacu}
          retention={stats.marcaine.retention}
        />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <SummaryBadge label="N" value={stats.all.n} />
        <SummaryBadge label="Succes" value={`${stats.all.success}%`} />
        <SummaryBadge label="PACU" value={`${stats.all.pacu}m`} />
        <SummaryBadge label="Retentie" value={`${stats.all.retention}%`} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", ...SPINAL_AGENTS] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAgentFilter(item)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
              agentFilter === item
                ? "bg-cyan-700 text-white border-cyan-700"
                : "bg-white text-slate-400 border-slate-200",
            )}
          >
            {item === "all" ? "Alles" : item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-700" />
        </div>
      ) : isError ? (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-rose-600 py-10">
          Overzicht niet bereikbaar
        </p>
      ) : visible.length === 0 ? (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-10">
          Nog geen registraties
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Datum</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Arts</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Initialen</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Agent</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">ml</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Succes</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Duur</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">PACU</TableHead>
                <TableHead className="text-[9px] font-black uppercase tracking-widest">Ret.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-slate-600">
                    {formatNlDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {log.aslOrAnesthetistName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                    {log.patientIdentifier}
                  </TableCell>
                  <TableCell className="text-[10px] font-black uppercase tracking-tight text-slate-700 whitespace-nowrap">
                    {log.agentUsed === "Hyperbare Marcaine" ? "Marcaine" : "Scandicaine"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{log.doseAdministered}</TableCell>
                  <TableCell>
                    <BooleanPill value={log.surgicalSuccess} />
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{log.durationOfAction}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{log.pacuStayDuration}</TableCell>
                  <TableCell>
                    <BooleanPill value={log.urinaryRetention} invert />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
  invertColors = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  /** When true: Ja = rood (slecht), Nee = groen (goed). */
  invertColors?: boolean;
}) {
  const jaActive = invertColors
    ? "bg-rose-600 border-rose-600 text-white"
    : "bg-emerald-600 border-emerald-600 text-white";
  const neeActive = invertColors
    ? "bg-emerald-600 border-emerald-600 text-white"
    : "bg-rose-600 border-rose-600 text-white";

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all",
          value ? jaActive : "bg-white border-slate-200 text-slate-400",
        )}
      >
        Ja
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all",
          !value ? neeActive : "bg-white border-slate-200 text-slate-400",
        )}
      >
        Nee
      </button>
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

function AgentStatCard({
  title,
  n,
  success,
  pacu,
  retention,
}: {
  title: string;
  n: number;
  success: number;
  pacu: number;
  retention: number;
}) {
  return (
    <div className="rounded-2xl border-2 border-cyan-100 bg-white p-3">
      <p className="font-black uppercase tracking-tight text-slate-900 text-sm">{title}</p>
      <p className="text-[11px] font-bold text-slate-600 mt-1">
        {n}x · {success}% succes · PACU {pacu} min · retentie {retention}%
      </p>
    </div>
  );
}

function BooleanPill({ value, invert = false }: { value: boolean; invert?: boolean }) {
  const positive = invert ? !value : value;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
      )}
    >
      {value ? "Ja" : "Nee"}
    </span>
  );
}

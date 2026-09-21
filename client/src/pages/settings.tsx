import { Link } from "wouter";
import { ChevronLeft, RotateCcw, Settings2, Check, LogOut } from "lucide-react";
import { useSite } from "@/hooks/use-site";
import { useAuth } from "@/hooks/use-auth";
import { THEME_PRESETS, type ThemeId } from "@/config/themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MODULE_LABELS: {
  key: keyof ReturnType<typeof useSite>["site"]["modules"];
  label: string;
}[] = [
  { key: "protocols", label: "Protocollen" },
  { key: "blocks", label: "KARA / Regional Anesthesia" },
  { key: "logbook", label: "ASO-logboek" },
  { key: "pocus", label: "POCUS" },
  { key: "journal", label: "Journal Club" },
  { key: "calculators", label: "Calculators" },
  { key: "contacts", label: "Telefoonlijst" },
  { key: "onboarding", label: "Onboarding" },
  { key: "marketplace", label: "Marktplaats" },
  { key: "spinalLogbook", label: "SMASH" },
  { key: "games", label: "Minigames (easter egg)" },
];

export default function SettingsPage() {
  const { site, updateUserPrefs, resetUserPrefs, prefsSynced } = useSite();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      <Link href="/">
        <div className="flex items-center text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-pointer py-2 group">
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Home
        </div>
      </Link>

      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Settings2 className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Persoonlijk</p>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
          Instell<span className="text-primary">ingen</span>
        </h1>
        <p className="text-sm text-slate-500">
          Kleurenthema en zichtbare modules
          {prefsSynced ? " — gesynchroniseerd met je account" : " — lokaal + sync wanneer online"}.
          {user?.email ? (
            <>
              {" "}
              Ingelogd als <span className="font-medium text-slate-700">{user.email}</span>.
            </>
          ) : null}
        </p>
      </header>

      <Card className="border-slate-100 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2"
            onClick={async () => {
              await signOut();
              toast({ title: "Uitgelogd", description: "Op dit toestel is opnieuw een code via mail nodig." });
            }}
          >
            <LogOut className="h-4 w-4" /> Uitloggen
          </Button>
          {user?.role === "admin" && (
            <p className="text-xs text-slate-500 leading-relaxed">
              Allowlist (wie mag inloggen): beheer in{" "}
              <span className="font-medium text-slate-700">Supabase → Table Editor → invited_users</span>
              . Zie docs/INVITES_SUPABASE.md.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
            Kleurenthema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_PRESETS.map((theme) => {
              const active = site.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateUserPrefs({ themeId: theme.id as ThemeId })}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all active:scale-95",
                    active ? "border-primary bg-accent" : "border-slate-100 bg-white hover:border-slate-200",
                  )}
                >
                  <span
                    className="h-10 w-10 rounded-full shadow-inner ring-2 ring-white"
                    style={{ backgroundColor: theme.hex }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                    {theme.label}
                  </span>
                  {active && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
            Modules op home
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MODULE_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-1">
              <Label htmlFor={`mod-${key}`} className="text-sm font-medium text-slate-700">
                {label}
              </Label>
              <Switch
                id={`mod-${key}`}
                checked={site.modules[key]}
                onCheckedChange={(checked) =>
                  updateUserPrefs({ modules: { [key]: checked } })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
            Over deze app
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2 leading-relaxed">
          <p>
            Naslag- en beslissingssteun voor anesthesie. Geen vervanging van klinisch oordeel. Geen
            patiëntgegevens opslaan in deze tool.
          </p>
          <p className="text-xs text-slate-400">
            {site.appName} · {site.hospitalName}
          </p>
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2"
        onClick={() => {
          resetUserPrefs();
          toast({ title: "Persoonlijke voorkeuren gereset" });
        }}
      >
        <RotateCcw className="h-4 w-4" /> Reset thema & modules
      </Button>
    </div>
  );
}

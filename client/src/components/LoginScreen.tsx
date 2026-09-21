import { useState } from "react";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { useSite } from "@/hooks/use-site";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Step = "email" | "otp";

export function LoginScreen() {
  const { site } = useSite();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setError("Vul een geldig e-mailadres in");
      return;
    }
    setPending(true);
    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: normalized,
        type: "sign-in",
      });
      if (sendError) {
        setError(sendError.message || "Kon code niet versturen");
        return;
      }
      setEmail(normalized);
      setStep("otp");
      setInfo("Check je mail voor de 6-cijferige code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netwerkfout");
    } finally {
      setPending(false);
    }
  };

  const verifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (otp.trim().length < 6) {
      setError("Vul de 6-cijferige code in");
      return;
    }
    setPending(true);
    try {
      const { data, error: verifyError } = await authClient.signIn.emailOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      if (verifyError) {
        setError(verifyError.message || "Ongeldige code");
        setOtp("");
        if (navigator.vibrate) navigator.vibrate(200);
        return;
      }
      // Cookie is net gezet — korte delay helpt tegen race met /api/me
      await new Promise((r) => setTimeout(r, 50));
      const me = await refresh();
      if (!me) {
        setError(
          "Code geaccepteerd, maar sessie niet gezet. Open de app via http://localhost:5000 (niet 127.0.0.1) en probeer opnieuw.",
        );
        console.warn("[auth] signIn OK but /api/me empty", data);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login mislukt");
      setOtp("");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-center items-center z-[9999] px-6 pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm space-y-8 mx-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-3xl flex items-center justify-center mb-4 border border-teal-500/20">
            <Lock className="h-8 w-8 text-teal-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            {site.shortName} <span className="text-teal-500">{site.highlightName}</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Persoonlijke toegang
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@azgroeninge.be"
                className="h-14 pl-11 rounded-2xl bg-slate-900 border-slate-800 text-white"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-14 bg-teal-600 hover:bg-teal-500 rounded-2xl font-black uppercase tracking-widest"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Stuur inlogcode"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-slate-400 text-sm text-center">
              Code voor <span className="text-white font-medium">{email}</span>
            </p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="h-20 text-center text-3xl font-mono tracking-[0.4em] rounded-2xl bg-slate-900 border-slate-800 text-white"
              autoFocus
            />
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-14 bg-teal-600 hover:bg-teal-500 rounded-2xl font-black uppercase tracking-widest gap-2"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" /> Inloggen
                </>
              )}
            </Button>
            <button
              type="button"
              className="w-full text-slate-500 text-xs uppercase tracking-widest"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setInfo(null);
              }}
            >
              Ander e-mailadres
            </button>
          </form>
        )}

        {(error || info) && (
          <p
            className={`text-center text-[11px] font-bold uppercase tracking-widest ${
              error ? "text-red-500" : "text-teal-400"
            }`}
          >
            {error || info}
          </p>
        )}

        <p className="text-center text-slate-600 text-[9px] uppercase font-medium tracking-widest">
          {site.hospitalName} • {site.department}
          <br />
          Eenmalige code per toestel — daarna 90 dagen ingelogd
        </p>
      </div>
    </div>
  );
}

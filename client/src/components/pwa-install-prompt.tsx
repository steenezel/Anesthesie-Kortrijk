import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  if (!installPrompt) return null;

  return (
    <div className="bg-teal-600 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-4">
      <div>
        <p className="font-black uppercase tracking-tighter text-sm">App installeren</p>
        <p className="text-[10px] opacity-90">Gebruik de app offline op het OK.</p>
      </div>
      <Button 
        onClick={handleInstall}
        className="bg-white text-teal-600 hover:bg-slate-100 font-bold gap-2"
        size="sm"
      >
        <Download className="h-4 w-4" /> Installeren
      </Button>
    </div>
  );
}
import { useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

export function PwaUpdateListener() {
  useEffect(() => {
    const onUpdateAvailable = () => {
      toast({
        title: "Nieuwe app-versie",
        description: "Er is een update beschikbaar.",
        duration: 60_000,
        action: (
          <ToastAction altText="App verversen" onClick={() => window.location.reload()}>
            Verversen
          </ToastAction>
        ),
      });
    };

    window.addEventListener("pwa-update-available", onUpdateAvailable);
    return () => window.removeEventListener("pwa-update-available", onUpdateAvailable);
  }, []);

  return null;
}

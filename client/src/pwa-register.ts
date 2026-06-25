import { registerSW } from "virtual:pwa-register";

const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // elke 5 minuten terwijl de app open staat

let refreshingForUpdate = false;

export function registerPwaUpdates() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });

  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent("pwa-update-available"));
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdates = () => {
        void registration.update();
      };

      checkForUpdates();
      window.setInterval(checkForUpdates, UPDATE_INTERVAL_MS);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkForUpdates();
        }
      });
    },
  });
}

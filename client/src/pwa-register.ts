import { registerSW } from "virtual:pwa-register";

const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // elk uur terwijl de app open staat

export function registerPwaUpdates() {
  if (!("serviceWorker" in navigator)) return;

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const checkForUpdates = () => {
        void registration.update();
      };

      window.setInterval(checkForUpdates, UPDATE_INTERVAL_MS);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkForUpdates();
        }
      });
    },
  });
}

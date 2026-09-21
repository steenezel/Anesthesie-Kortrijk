import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { siteDefaults, type SiteConfig, type UserPrefs } from "@/config/site";
import {
  applySiteChrome,
  clearUserPrefs,
  loadUserPrefs,
  resolveSite,
  saveUserPrefs,
} from "@/lib/site-overrides";

interface SiteContextValue {
  site: SiteConfig;
  userPrefs: UserPrefs;
  updateUserPrefs: (patch: UserPrefs) => void;
  resetUserPrefs: () => void;
  prefsSynced: boolean;
}

const SiteContext = createContext<SiteContextValue | null>(null);

async function fetchRemotePrefs(): Promise<UserPrefs | null> {
  try {
    const res = await fetch("/api/preferences", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { prefs?: UserPrefs };
    return data.prefs && typeof data.prefs === "object" ? data.prefs : {};
  } catch {
    return null;
  }
}

async function pushRemotePrefs(prefs: UserPrefs) {
  try {
    await fetch("/api/preferences", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefs }),
    });
  } catch {
    /* offline / unauthenticated — local still saved */
  }
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() =>
    typeof window === "undefined" ? {} : loadUserPrefs(),
  );
  const [prefsSynced, setPrefsSynced] = useState(false);

  const site = useMemo(() => resolveSite(userPrefs), [userPrefs]);

  useEffect(() => {
    applySiteChrome(site);
  }, [site]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const remote = await fetchRemotePrefs();
      if (cancelled || remote === null) return;
      const local = loadUserPrefs();
      const merged: UserPrefs = {
        ...local,
        ...remote,
        modules: { ...local.modules, ...remote.modules },
      };
      saveUserPrefs(merged);
      setUserPrefs(merged);
      setPrefsSynced(true);
    };

    void load();
    const onAuth = () => {
      void load();
    };
    window.addEventListener("ane-auth-changed", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("ane-auth-changed", onAuth);
    };
  }, []);

  const updateUserPrefs = useCallback((patch: UserPrefs) => {
    setUserPrefs((prev) => {
      const next: UserPrefs = {
        ...prev,
        ...patch,
        modules: { ...prev.modules, ...patch.modules },
      };
      saveUserPrefs(next);
      void pushRemotePrefs(next);
      return next;
    });
  }, []);

  const resetUserPrefs = useCallback(() => {
    clearUserPrefs();
    setUserPrefs({});
    void pushRemotePrefs({});
  }, []);

  const value = useMemo(
    () => ({ site, userPrefs, updateUserPrefs, resetUserPrefs, prefsSynced }),
    [site, userPrefs, updateUserPrefs, resetUserPrefs, prefsSynced],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    return {
      site: resolveSite({}),
      userPrefs: {},
      updateUserPrefs: () => undefined,
      resetUserPrefs: () => undefined,
      prefsSynced: false,
    } satisfies SiteContextValue;
  }
  return ctx;
}

export { siteDefaults };

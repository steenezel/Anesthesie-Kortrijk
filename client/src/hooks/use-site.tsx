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
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [userPrefs, setUserPrefs] = useState<UserPrefs>(() =>
    typeof window === "undefined" ? {} : loadUserPrefs(),
  );

  const site = useMemo(() => resolveSite(userPrefs), [userPrefs]);

  useEffect(() => {
    applySiteChrome(site);
  }, [site]);

  const updateUserPrefs = useCallback((patch: UserPrefs) => {
    setUserPrefs((prev) => {
      const next: UserPrefs = {
        ...prev,
        ...patch,
        modules: { ...prev.modules, ...patch.modules },
      };
      saveUserPrefs(next);
      return next;
    });
  }, []);

  const resetUserPrefs = useCallback(() => {
    clearUserPrefs();
    setUserPrefs({});
  }, []);

  const value = useMemo(
    () => ({ site, userPrefs, updateUserPrefs, resetUserPrefs }),
    [site, userPrefs, updateUserPrefs, resetUserPrefs],
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
    } satisfies SiteContextValue;
  }
  return ctx;
}

export { siteDefaults };

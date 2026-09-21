import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient, type SessionUser } from "@/lib/auth-client";

type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
  isKiosk: boolean;
  canWrite: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchMe(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as { user: SessionUser };
    return data.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    if (me) {
      window.dispatchEvent(new Event("ane-auth-changed"));
    }
    return me;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const me = await fetchMe();
      if (!cancelled) {
        setUser(me);
        setLoading(false);
        if (me) window.dispatchEvent(new Event("ane-auth-changed"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    localStorage.removeItem("ane_kortrijk_auth");
    localStorage.removeItem("ane_logbook_session");
    sessionStorage.removeItem("ane_spinal_log_session");
    window.dispatchEvent(new Event("ane-auth-changed"));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      refresh,
      signOut,
      isKiosk: user?.role === "kiosk",
      canWrite: Boolean(user && user.role !== "kiosk"),
    }),
    [user, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

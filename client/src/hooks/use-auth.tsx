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
import {
  clearSessionSnapshot,
  loadSessionSnapshot,
  saveSessionSnapshot,
  startOfflineQueueListener,
} from "@/lib/offline";

type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
  isKiosk: boolean;
  canWrite: boolean;
  offlineSession: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchMe(): Promise<{ user: SessionUser | null; networkError: boolean }> {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (res.status === 401) return { user: null, networkError: false };
    if (!res.ok) return { user: null, networkError: false };
    const data = (await res.json()) as { user: SessionUser };
    return { user: data.user, networkError: false };
  } catch {
    return { user: null, networkError: true };
  }
}

function toSessionUser(raw: SessionUser): SessionUser {
  return {
    ...raw,
    kortenaam: raw.kortenaam || raw.username,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineSession, setOfflineSession] = useState(false);

  const refresh = useCallback(async () => {
    const { user: me, networkError } = await fetchMe();
    if (me) {
      const normalized = toSessionUser(me);
      setUser(normalized);
      setOfflineSession(false);
      saveSessionSnapshot(normalized);
      window.dispatchEvent(new Event("ane-auth-changed"));
      return normalized;
    }
    if (networkError || !navigator.onLine) {
      const snap = loadSessionSnapshot();
      if (snap?.user) {
        const normalized = toSessionUser(snap.user as SessionUser);
        setUser(normalized);
        setOfflineSession(true);
        return normalized;
      }
      return null;
    }
    setUser(null);
    setOfflineSession(false);
    clearSessionSnapshot();
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { user: me, networkError } = await fetchMe();
      if (cancelled) return;
      if (me) {
        const normalized = toSessionUser(me);
        setUser(normalized);
        setOfflineSession(false);
        saveSessionSnapshot(normalized);
        window.dispatchEvent(new Event("ane-auth-changed"));
      } else if (networkError || !navigator.onLine) {
        const snap = loadSessionSnapshot();
        if (snap?.user) {
          setUser(toSessionUser(snap.user as SessionUser));
          setOfflineSession(true);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        setOfflineSession(false);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return startOfflineQueueListener();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setOfflineSession(false);
    clearSessionSnapshot();
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
      canWrite: Boolean(user) && user?.role !== "kiosk",
      offlineSession,
    }),
    [user, loading, refresh, signOut, offlineSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

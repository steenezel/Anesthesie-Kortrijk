import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { NoteTargetType } from "@/lib/user-content";
import {
  enqueueOfflineMutation,
  notesStorageKey,
  startOfflineQueueListener,
} from "@/lib/offline";

type NoteRow = {
  id?: string;
  content: string;
  targetType?: NoteTargetType;
  targetId?: string;
  updatedAt?: string | Date | null;
};

function readLocal(userId: string, targetType: NoteTargetType, targetId: string): string {
  try {
    return localStorage.getItem(notesStorageKey(userId, targetType, targetId)) ?? "";
  } catch {
    return "";
  }
}

function writeLocal(userId: string, targetType: NoteTargetType, targetId: string, content: string) {
  localStorage.setItem(notesStorageKey(userId, targetType, targetId), content);
}

/**
 * Autosave that never clobbers in-progress typing.
 * Draft is local state; server responses only update lastSaved / cache, not the textarea.
 */
export function useUserNotes(targetType: NoteTargetType, targetId: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const normalizedId = targetType === "general" ? "" : targetId;
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline" | "error">(
    "idle",
  );

  const draftRef = useRef("");
  const lastSavedRef = useRef("");
  const hydratedKeyRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveAgainRef = useRef(false);

  const noteKey = `${userId ?? ""}:${targetType}:${normalizedId}`;

  // Reset hydration when switching protocol/block.
  useEffect(() => {
    if (hydratedKeyRef.current && hydratedKeyRef.current !== noteKey) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      draftRef.current = "";
      lastSavedRef.current = "";
      setDraft("");
      setSaveState("idle");
      hydratedKeyRef.current = null;
    }
  }, [noteKey]);

  const query = useQuery<NoteRow>({
    queryKey: ["/api/notes", userId, targetType, normalizedId],
    enabled: Boolean(userId) && (targetType === "general" || Boolean(normalizedId)),
    queryFn: async () => {
      if (!userId) return { content: "" };
      if (!navigator.onLine) {
        return { content: readLocal(userId, targetType, normalizedId) };
      }
      try {
        const qs = new URLSearchParams({
          targetType,
          targetId: normalizedId,
        });
        const res = await fetch(`/api/notes?${qs}`, { credentials: "include" });
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as NoteRow;
      } catch {
        return { content: readLocal(userId, targetType, normalizedId) };
      }
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  // Hydrate textarea once per note target — never again after typing starts.
  useEffect(() => {
    if (!userId) return;
    if (hydratedKeyRef.current === noteKey) return;
    if (query.isLoading) return;
    if (!query.isFetched && query.fetchStatus === "fetching") return;

    const serverContent = query.data?.content ?? "";
    const localContent = readLocal(userId, targetType, normalizedId);

    // Prefer local only when it looks like an unsynced draft (offline queue / prior session).
    const initial =
      localContent && localContent !== serverContent && !navigator.onLine
        ? localContent
        : serverContent || localContent;

    draftRef.current = initial;
    lastSavedRef.current = serverContent || (navigator.onLine ? initial : "");
    setDraft(initial);
    hydratedKeyRef.current = noteKey;
    setSaveState(initial && initial !== lastSavedRef.current ? "idle" : "idle");
  }, [
    userId,
    noteKey,
    normalizedId,
    targetType,
    query.data?.content,
    query.isLoading,
    query.isFetched,
    query.fetchStatus,
  ]);

  useEffect(() => {
    if (!userId) return;
    return startOfflineQueueListener(() => {
      // After flush, refresh cache but do not reset draft if dirty.
      void queryClient.invalidateQueries({
        queryKey: ["/api/notes", userId, targetType, normalizedId],
      });
    });
  }, [userId, targetType, normalizedId]);

  const persist = useCallback(
    async (content: string) => {
      if (!userId) throw new Error("Niet ingelogd");
      if (!navigator.onLine) {
        enqueueOfflineMutation({
          kind: "note_upsert",
          targetType,
          targetId: normalizedId,
          content,
        });
        writeLocal(userId, targetType, normalizedId, content);
        return { offline: true as const, content };
      }
      const res = await apiRequest("PUT", "/api/notes", {
        targetType,
        targetId: normalizedId,
        content,
      });
      const row = (await res.json()) as NoteRow;
      const saved = row.content ?? content;
      writeLocal(userId, targetType, normalizedId, saved);
      return { offline: false as const, content: saved, row };
    },
    [normalizedId, targetType, userId],
  );

  const saveMutation = useMutation({
    mutationFn: persist,
    onMutate: () => {
      setSaveState("saving");
      saveAgainRef.current = false;
    },
    onSuccess: (result, savedContent) => {
      lastSavedRef.current = savedContent;
      if (userId) {
        queryClient.setQueryData<NoteRow>(
          ["/api/notes", userId, targetType, normalizedId],
          (prev) => ({
            ...(prev ?? { content: savedContent }),
            content: result.content,
            updatedAt: result.offline ? prev?.updatedAt : new Date().toISOString(),
          }),
        );
      }

      // User typed more while this request was in flight — save the latest draft next.
      if (draftRef.current !== savedContent) {
        saveAgainRef.current = true;
        setSaveState("idle");
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (draftRef.current !== lastSavedRef.current) {
            saveMutation.mutate(draftRef.current);
          }
        }, 400);
        return;
      }

      setSaveState(result.offline ? "offline" : "saved");
    },
    onError: () => setSaveState("error"),
  });

  const scheduleSave = useCallback(
    (content: string) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (content !== draftRef.current) return; // superseded by newer keystrokes
        if (content === lastSavedRef.current) {
          setSaveState((s) => (s === "saving" ? s : "saved"));
          return;
        }
        if (saveMutation.isPending) {
          saveAgainRef.current = true;
          return;
        }
        saveMutation.mutate(content);
      }, 900);
    },
    [saveMutation, userId],
  );

  const setContent = useCallback(
    (value: string) => {
      draftRef.current = value;
      setDraft(value);
      setSaveState("idle");
      if (userId) writeLocal(userId, targetType, normalizedId, value);
      scheduleSave(value);
    },
    [normalizedId, scheduleSave, targetType, userId],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Flush pending draft on unmount / navigation away.
  useEffect(() => {
    return () => {
      const pending = draftRef.current;
      if (!userId || pending === lastSavedRef.current) return;
      if (!navigator.onLine) {
        enqueueOfflineMutation({
          kind: "note_upsert",
          targetType,
          targetId: normalizedId,
          content: pending,
        });
        writeLocal(userId, targetType, normalizedId, pending);
        return;
      }
      // Fire-and-forget; best effort when leaving the page.
      void persist(pending).catch(() => undefined);
    };
  }, [normalizedId, persist, targetType, userId]);

  return {
    content: draft,
    setContent,
    saveState,
    isLoading: query.isLoading && hydratedKeyRef.current !== noteKey,
  };
}

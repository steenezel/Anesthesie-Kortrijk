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

export function useUserNotes(targetType: NoteTargetType, targetId: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const normalizedId = targetType === "general" ? "" : targetId;
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef("");

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
        const row = (await res.json()) as NoteRow;
        writeLocal(userId, targetType, normalizedId, row.content || "");
        return row;
      } catch {
        return { content: readLocal(userId, targetType, normalizedId) };
      }
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data?.content != null) {
      setDraft(query.data.content);
      lastSavedRef.current = query.data.content;
    }
  }, [query.data?.content]);

  useEffect(() => {
    if (!userId) return;
    return startOfflineQueueListener(() => {
      void queryClient.invalidateQueries({
        queryKey: ["/api/notes", userId, targetType, normalizedId],
      });
    });
  }, [userId, targetType, normalizedId]);

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Niet ingelogd");
      if (!navigator.onLine) {
        enqueueOfflineMutation({
          kind: "note_upsert",
          targetType,
          targetId: normalizedId,
          content,
        });
        writeLocal(userId, targetType, normalizedId, content);
        return { offline: true as const };
      }
      const res = await apiRequest("PUT", "/api/notes", {
        targetType,
        targetId: normalizedId,
        content,
      });
      const row = (await res.json()) as NoteRow;
      writeLocal(userId, targetType, normalizedId, row.content || content);
      return { offline: false as const, row };
    },
    onMutate: () => setSaveState("saving"),
    onSuccess: (result) => {
      lastSavedRef.current = draft;
      setSaveState(result.offline ? "offline" : "saved");
      if (!result.offline && userId) {
        void queryClient.invalidateQueries({
          queryKey: ["/api/notes", userId, targetType, normalizedId],
        });
      }
    },
    onError: () => setSaveState("idle"),
  });

  const saveNow = useCallback(
    (content = draft) => {
      if (!userId) return;
      if (content === lastSavedRef.current && saveState !== "offline") return;
      saveMutation.mutate(content);
    },
    [draft, saveMutation, saveState, userId],
  );

  const setContent = useCallback(
    (value: string) => {
      setDraft(value);
      setSaveState("idle");
      if (userId) writeLocal(userId, targetType, normalizedId, value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!userId) return;
        if (value === lastSavedRef.current) return;
        saveMutation.mutate(value);
      }, 600);
    },
    [normalizedId, saveMutation, targetType, userId],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    content: draft,
    setContent,
    saveNow,
    saveState,
    isLoading: query.isLoading,
  };
}

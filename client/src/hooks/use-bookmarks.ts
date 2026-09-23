import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { BookmarkItemType } from "@/lib/user-content";
import {
  bookmarksStorageKey,
  enqueueOfflineMutation,
  flushOfflineQueue,
  startOfflineQueueListener,
} from "@/lib/offline";

export type BookmarkRow = {
  id?: string;
  userId?: string;
  itemType: BookmarkItemType;
  itemId: string;
  createdAt?: string | Date | null;
};

function readLocal(userId: string): BookmarkRow[] {
  try {
    const raw = localStorage.getItem(bookmarksStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookmarkRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(userId: string, rows: BookmarkRow[]) {
  localStorage.setItem(bookmarksStorageKey(userId), JSON.stringify(rows));
}

function bookmarkKey(itemType: BookmarkItemType, itemId: string) {
  return `${itemType}:${itemId}`;
}

export function useBookmarks() {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery<BookmarkRow[]>({
    queryKey: ["/api/bookmarks", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      if (!navigator.onLine) return readLocal(userId);
      try {
        const res = await fetch("/api/bookmarks", { credentials: "include" });
        if (!res.ok) throw new Error(String(res.status));
        const rows = (await res.json()) as BookmarkRow[];
        writeLocal(userId, rows);
        return rows;
      } catch {
        return readLocal(userId);
      }
    },
    initialData: userId ? () => readLocal(userId) : undefined,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!userId) return;
    return startOfflineQueueListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["/api/bookmarks", userId] });
      void flushOfflineQueue();
    });
  }, [userId]);

  const set = useMemo(() => {
    const map = new Set<string>();
    for (const row of query.data ?? []) {
      map.add(bookmarkKey(row.itemType, row.itemId));
    }
    return map;
  }, [query.data]);

  const isBookmarked = useCallback(
    (itemType: BookmarkItemType, itemId: string) => set.has(bookmarkKey(itemType, itemId)),
    [set],
  );

  const toggleMutation = useMutation({
    mutationFn: async ({
      itemType,
      itemId,
      next,
    }: {
      itemType: BookmarkItemType;
      itemId: string;
      next: boolean;
    }) => {
      if (!userId) throw new Error("Niet ingelogd");

      if (!navigator.onLine) {
        enqueueOfflineMutation({
          kind: next ? "bookmark_add" : "bookmark_remove",
          itemType,
          itemId,
        });
        return { offline: true as const };
      }

      if (next) {
        await apiRequest("POST", "/api/bookmarks", { itemType, itemId });
      } else {
        const qs = new URLSearchParams({ itemType, itemId });
        await apiRequest("DELETE", `/api/bookmarks?${qs}`);
      }
      return { offline: false as const };
    },
    onMutate: async ({ itemType, itemId, next }) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: ["/api/bookmarks", userId] });
      const prev = queryClient.getQueryData<BookmarkRow[]>(["/api/bookmarks", userId]) ?? [];
      const nextRows = next
        ? [...prev.filter((r) => !(r.itemType === itemType && r.itemId === itemId)), { itemType, itemId }]
        : prev.filter((r) => !(r.itemType === itemType && r.itemId === itemId));
      queryClient.setQueryData(["/api/bookmarks", userId], nextRows);
      writeLocal(userId, nextRows);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (!userId || !ctx?.prev) return;
      queryClient.setQueryData(["/api/bookmarks", userId], ctx.prev);
      writeLocal(userId, ctx.prev);
    },
    onSettled: () => {
      if (!userId || !navigator.onLine) return;
      void queryClient.invalidateQueries({ queryKey: ["/api/bookmarks", userId] });
    },
  });

  const toggle = useCallback(
    (itemType: BookmarkItemType, itemId: string) => {
      if (!itemId) return;
      const next = !isBookmarked(itemType, itemId);
      toggleMutation.mutate({ itemType, itemId, next });
    },
    [isBookmarked, toggleMutation],
  );

  return {
    bookmarks: query.data ?? [],
    isLoading: query.isLoading,
    isBookmarked,
    toggle,
    isToggling: toggleMutation.isPending,
  };
}

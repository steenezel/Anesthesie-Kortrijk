import type { BookmarkItemType, NoteTargetType } from "@/lib/user-content";

const QUEUE_KEY = "ane_offline_mutation_queue";

export type OfflineMutation =
  | {
      id: string;
      kind: "bookmark_add" | "bookmark_remove";
      itemType: BookmarkItemType;
      itemId: string;
      createdAt: number;
    }
  | {
      id: string;
      kind: "note_upsert";
      targetType: NoteTargetType;
      targetId: string;
      content: string;
      createdAt: number;
    };

function readQueue(): OfflineMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineMutation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineMutation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineMutation(
  mutation:
    | Omit<Extract<OfflineMutation, { kind: "bookmark_add" | "bookmark_remove" }>, "id" | "createdAt">
    | Omit<Extract<OfflineMutation, { kind: "note_upsert" }>, "id" | "createdAt">
    | (OfflineMutation & { id?: string }),
) {
  const queue = readQueue();
  const entry = {
    ...mutation,
    id: "id" in mutation && mutation.id ? mutation.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  } as OfflineMutation;

  // Collapse duplicate bookmark toggles / note upserts for same target.
  const filtered = queue.filter((item) => {
    if (entry.kind.startsWith("bookmark_") && item.kind.startsWith("bookmark_")) {
      return !(
        "itemType" in item &&
        "itemType" in entry &&
        item.itemType === entry.itemType &&
        item.itemId === entry.itemId
      );
    }
    if (entry.kind === "note_upsert" && item.kind === "note_upsert") {
      return !(item.targetType === entry.targetType && item.targetId === entry.targetId);
    }
    return true;
  });

  filtered.push(entry);
  writeQueue(filtered);
  return entry;
}

export function peekOfflineQueue() {
  return readQueue();
}

async function applyMutation(mutation: OfflineMutation): Promise<void> {
  if (mutation.kind === "bookmark_add") {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: mutation.itemType, itemId: mutation.itemId }),
    });
    if (!res.ok) throw new Error(`bookmark_add ${res.status}`);
    return;
  }
  if (mutation.kind === "bookmark_remove") {
    const qs = new URLSearchParams({
      itemType: mutation.itemType,
      itemId: mutation.itemId,
    });
    const res = await fetch(`/api/bookmarks?${qs}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`bookmark_remove ${res.status}`);
    return;
  }
  if (mutation.kind === "note_upsert") {
    const res = await fetch("/api/notes", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: mutation.targetType,
        targetId: mutation.targetId,
        content: mutation.content,
      }),
    });
    if (!res.ok) throw new Error(`note_upsert ${res.status}`);
  }
}

let flushing = false;

export async function flushOfflineQueue(): Promise<number> {
  if (flushing || !navigator.onLine) return 0;
  flushing = true;
  let applied = 0;
  try {
    const queue = readQueue();
    const remaining: OfflineMutation[] = [];
    for (const mutation of queue) {
      try {
        await applyMutation(mutation);
        applied += 1;
      } catch {
        remaining.push(mutation);
        break; // stop on first failure; retry later
      }
    }
    writeQueue(remaining);
  } finally {
    flushing = false;
  }
  return applied;
}

export function startOfflineQueueListener(onFlushed?: (count: number) => void) {
  const run = () => {
    void flushOfflineQueue().then((n) => {
      if (n > 0) onFlushed?.(n);
    });
  };
  window.addEventListener("online", run);
  run();
  return () => window.removeEventListener("online", run);
}

export function bookmarksStorageKey(userId: string) {
  return `ane_bookmarks_${userId}`;
}

export function notesStorageKey(userId: string, targetType: string, targetId: string) {
  return `ane_note_${userId}_${targetType}_${targetId || "general"}`;
}

export const SESSION_SNAPSHOT_KEY = "ane_session_snapshot";
export const SESSION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export type SessionSnapshot = {
  user: {
    id: string;
    username: string;
    kortenaam?: string;
    name: string;
    email: string | null;
    role: string;
  };
  cachedAt: number;
};

export function saveSessionSnapshot(user: SessionSnapshot["user"]) {
  const payload: SessionSnapshot = { user, cachedAt: Date.now() };
  localStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(payload));
}

export function loadSessionSnapshot(): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (!parsed?.user?.id || !parsed.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > SESSION_MAX_AGE_MS) {
      localStorage.removeItem(SESSION_SNAPSHOT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionSnapshot() {
  localStorage.removeItem(SESSION_SNAPSHOT_KEY);
}

/** Lightweight content cache for offline reads (lists/details). */
export function cacheContent(key: string, data: unknown) {
  try {
    localStorage.setItem(
      `ane_content_${key}`,
      JSON.stringify({ data, cachedAt: Date.now() }),
    );
  } catch {
    /* quota */
  }
}

export function readCachedContent<T>(key: string, maxAgeMs = SESSION_MAX_AGE_MS): T | null {
  try {
    const raw = localStorage.getItem(`ane_content_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; cachedAt: number };
    if (Date.now() - parsed.cachedAt > maxAgeMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

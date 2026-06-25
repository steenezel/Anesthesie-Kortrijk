import type { QueryKey } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

/** Query keys die Supabase-cloudcontent laden (niet de ingebakken markdown). */
const CLOUD_QUERY_ROOTS = new Set([
  "blocks-cloud",
  "protocols-cloud",
  "journal-articles-cloud",
  "journal-article",
  "block",
  "protocol",
  "pocus-cloud-only",
  "pocus-detail",
  "reference-blocks",
]);

export function isCloudContentQuery(queryKey: QueryKey): boolean {
  const root = queryKey[0];
  return typeof root === "string" && CLOUD_QUERY_ROOTS.has(root);
}

export function invalidateCloudContentQueries() {
  return queryClient.invalidateQueries({
    predicate: (query) => isCloudContentQuery(query.queryKey),
  });
}

export function registerCloudContentRefresh() {
  const refresh = () => {
    if (document.visibilityState === "visible") {
      void invalidateCloudContentQueries();
    }
  };

  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("focus", refresh);

  return () => {
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("focus", refresh);
  };
}

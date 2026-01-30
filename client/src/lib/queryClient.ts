// We importeren de types en de klasse op de meest expliciete manier
import { QueryClient } from "@tanstack/react-query";
import type { QueryFunction, QueryKey } from "@tanstack/react-query";

// De rest van de code blijft hetzelfde...
// We importeren alles als 'TanStack' om pad-conflicten te vermijden
import * as TanStack from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// We gebruiken hier de types direct van de 'TanStack' import
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => TanStack.QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: TanStack.QueryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as any;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Hier maken we de client aan met de klasse van TanStack
export const queryClient = new TanStack.QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
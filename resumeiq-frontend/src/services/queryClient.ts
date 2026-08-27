import { QueryClient } from "@tanstack/react-query";

/** Shared React Query client with sane defaults for a data-heavy SaaS UI. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

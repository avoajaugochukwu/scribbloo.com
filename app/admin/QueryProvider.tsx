'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Optionally add React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per component instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configure default query options if needed
        // Example: staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Optional: disable refetch on window focus
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: Add DevTools for debugging */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 
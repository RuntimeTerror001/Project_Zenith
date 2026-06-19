'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { GlobalAudioFeedback } from '@/hooks/use-audio';
import { WebSocketProvider } from './websocket-provider';
import { Toaster } from 'sonner';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 3, retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 30_000), refetchOnWindowFocus: true, refetchOnReconnect: true } } }));
  return (
    <QueryClientProvider client={client}>
      <WebSocketProvider>
        <GlobalAudioFeedback />
        <Toaster closeButton richColors theme="dark" position="bottom-right" />
        {children}
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

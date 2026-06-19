"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useZenithStore } from '@/store/zenith-store';
import { QUERY_KEYS } from '@/constants/query';
import { toast } from 'sonner';

const WebSocketContext = createContext<WebSocket | null>(null);

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token, addNotification } = useZenithStore();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let wsUrl = '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      wsUrl = `${protocol}//localhost:5001/ws`;
    } else {
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    const fullUrl = token ? `${wsUrl}?token=${token}` : wsUrl;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        if (type === 'iss') {
          // Dynamically write incoming ISS coordinate frames to TanStack Query cache
          queryClient.setQueryData(QUERY_KEYS.iss, data);
        } else if (type === 'notification') {
          // Push notification payload into store and pop a toast alerts HUD element
          addNotification(data);
          toast(data.message, {
            description: 'New Space-Bridge Alert',
            action: {
              label: 'View',
              onClick: () => {
                // We could programmatically trigger the profile view modal here
              }
            }
          });
        } else if (type === 'error') {
          console.warn('WebSocket server reported error:', data || payload.message);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, queryClient, addNotification]);

  return (
    <WebSocketContext.Provider value={wsRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

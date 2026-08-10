import { useEffect, useRef } from 'react';
import { useOrderStore } from '../store/useOrderStore';

const WS_BASE_URL = 'ws://localhost:8080/ws/trades';

export function useOrderWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const selectedSymbol = useOrderStore((state) => state.selectedSymbol);
  const setIsConnected = useOrderStore((state) => state.setIsConnected);
  const setMarketDepth = useOrderStore((state) => state.setMarketDepth);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      // Safely close existing connection
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      }

      const socketUrl = `${WS_BASE_URL}?symbol=${encodeURIComponent(selectedSymbol)}`;
      const socket = new WebSocket(socketUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const depthData = JSON.parse(event.data);
          setMarketDepth(depthData);
        } catch (err) {
          // Pass silently if ping frame
        }
      };

      socket.onerror = () => {
        if (!isMounted) return;
        setIsConnected(false);
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setIsConnected(false);

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSymbol, setIsConnected, setMarketDepth]);

  return wsRef.current;
}
import { useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';

export function useOrderWebSocket(url) {
  const setMarketDepth = useOrderStore((state) => state.setMarketDepth);
  const setIsConnected = useOrderStore((state) => state.setIsConnected);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMarketDepth(data);
      } catch (e) {
        console.error('Failed to parse WS payload:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [url, setMarketDepth, setIsConnected]);
}
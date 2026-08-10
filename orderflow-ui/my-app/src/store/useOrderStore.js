import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  // Level 2 Market Depth state received from WebSockets
  marketDepth: {
    symbol: 'AAPL',
    bids: [],
    asks: [],
    timestamp: null,
  },
  
  // Real-time WebSocket connection state
  isConnected: false,

  // Recent order execution audit log
  orderHistory: [],

  // Action Mutators
  setMarketDepth: (depth) => set({ marketDepth: depth }),
  
  setIsConnected: (connected) => set({ isConnected: connected }),

  addOrderToHistory: (order) =>
    set((state) => ({
      orderHistory: [
        {
          id: order.id || Date.now(),
          symbol: order.symbol,
          price: order.price,
          quantity: order.quantity,
          side: order.isBuy ? 'BUY' : 'SELL',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...state.orderHistory.slice(0, 49), // Retain top 50 recent executions
      ],
    })),

  clearHistory: () => set({ orderHistory: [] }),
}));
import { create } from 'zustand';

// Immutable static fallbacks to prevent reference mismatch crashes
export const EMPTY_POSITION = { qty: 0, avgPrice: 0 };
export const EMPTY_DEPTH = { symbol: 'AAPL', bids: [], asks: [] };

const initialRates = {
  AAPL: { price: 185.50, change: 0.25 },
  TSLA: { price: 240.10, change: -1.10 },
  NVDA: { price: 120.80, change: 1.85 },
  BTC: { price: 64200.00, change: -250.00 },
  ETH: { price: 3450.00, change: 12.40 }
};

export const useOrderStore = create((set, get) => ({
  isConnected: false,
  stockRates: initialRates,
  selectedSymbol: 'AAPL',
  allocatedFund: 50000.00,
  positions: {},
  tradeHistory: [],
  portfolioHistory: [
    { timestamp: new Date().toLocaleTimeString(), value: 50000.00 }
  ],
  marketDepth: EMPTY_DEPTH,

  setIsConnected: (status) => set({ isConnected: status }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setMarketDepth: (depth) => set({ marketDepth: depth }),

  adjustFunds: (amount) => set((state) => ({
    allocatedFund: Math.max(0, state.allocatedFund + amount)
  })),

  // High-frequency price updater guarded against unnecessary state mutations
  updateRates: () => {
    const { stockRates, positions, allocatedFund, portfolioHistory } = get();
    
    let hasChanged = false;
    const updatedRates = {};

    Object.keys(stockRates).forEach((symbol) => {
      const current = stockRates[symbol];
      const delta = (Math.random() - 0.49) * (current.price * 0.002);
      const newPrice = Math.max(1.0, Math.round((current.price + delta) * 100) / 100);
      
      if (newPrice !== current.price) {
        hasChanged = true;
      }

      updatedRates[symbol] = {
        price: newPrice,
        change: Math.round(delta * 100) / 100
      };
    });

    if (!hasChanged) return;

    let positionsValue = 0;
    Object.entries(positions).forEach(([sym, pos]) => {
      if (pos && pos.qty > 0 && updatedRates[sym]) {
        positionsValue += pos.qty * updatedRates[sym].price;
      }
    });

    const totalValue = Math.round((allocatedFund + positionsValue) * 100) / 100;
    const time = new Date().toLocaleTimeString();

    const lastPoint = portfolioHistory[portfolioHistory.length - 1];
    const updatedHistory = (!lastPoint || lastPoint.value !== totalValue)
      ? [...portfolioHistory.slice(-29), { timestamp: time, value: totalValue }]
      : portfolioHistory;

    set({
      stockRates: updatedRates,
      portfolioHistory: updatedHistory
    });
  },

  // executeTrade: (symbol, side, price, quantity) => {
  //   const { allocatedFund, positions, tradeHistory } = get();
  //   const cost = price * quantity;

  //   if (side === 'BUY' && allocatedFund < cost) {
  //     return { success: false, message: 'Insufficient allocated funds' };
  //   }

  //   const newFund = side === 'BUY' ? allocatedFund - cost : allocatedFund + cost;
  //   const currentPos = positions[symbol] || EMPTY_POSITION;

  //   let newQty = currentPos.qty;
  //   let newAvgPrice = currentPos.avgPrice;

  //   if (side === 'BUY') {
  //     const totalQty = currentPos.qty + quantity;
  //     newAvgPrice = ((currentPos.qty * currentPos.avgPrice) + (quantity * price)) / totalQty;
  //     newQty = totalQty;
  //   } else {
  //     newQty = Math.max(0, currentPos.qty - quantity);
  //   }

  //   const trade = {
  //     id: Date.now(),
  //     time: new Date().toLocaleTimeString(),
  //     symbol,
  //     side,
  //     price,
  //     quantity,
  //     total: Math.round(cost * 100) / 100
  //   };

  //   set({
  //     allocatedFund: Math.round(newFund * 100) / 100,
  //     positions: {
  //       ...positions,
  //       [symbol]: { qty: newQty, avgPrice: Math.round(newAvgPrice * 100) / 100 }
  //     },
  //     tradeHistory: [trade, ...tradeHistory]
  //   });

  //   return { success: true };
  // }
  executeTrade: (symbol, side, price, quantity) => {
  const { allocatedFund, positions, tradeHistory } = get();
  const currentPos = positions[symbol] || EMPTY_POSITION;

  let newQty = currentPos.qty;
  let newAvgPrice = currentPos.avgPrice;

  if (side === 'BUY') {
    if (currentPos.qty < 0) {
      // Covering a Short Position
      newQty = currentPos.qty + quantity;
      if (newQty === 0) newAvgPrice = 0; // Position fully closed
    } else {
      // Opening or Adding to a Long Position
      const totalQty = currentPos.qty + quantity;
      newAvgPrice = ((currentPos.qty * currentPos.avgPrice) + (quantity * price)) / totalQty;
      newQty = totalQty;
    }
  } else if (side === 'SELL') {
    if (currentPos.qty > 0) {
      // Selling/Closing a Long Position
      newQty = currentPos.qty - quantity;
      if (newQty === 0) newAvgPrice = 0;
    } else {
      // Opening or Adding to a Short Position (Sell First)
      const totalShortQty = Math.abs(currentPos.qty) + quantity;
      newAvgPrice = ((Math.abs(currentPos.qty) * currentPos.avgPrice) + (quantity * price)) / totalShortQty;
      newQty = currentPos.qty - quantity; // Negative quantity represents a Short
    }
  }

  const trade = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    symbol,
    side,
    price,
    quantity,
    total: Math.round(price * quantity * 100) / 100
  };

  set({
    positions: {
      ...positions,
      [symbol]: { qty: newQty, avgPrice: Math.round(newAvgPrice * 100) / 100 }
    },
    tradeHistory: [trade, ...tradeHistory]
  });

  return { success: true };
}
}));
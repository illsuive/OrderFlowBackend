import React, { useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export function MarketHeader() {
  const stockRates = useOrderStore((state) => state.stockRates);
  const selectedSymbol = useOrderStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useOrderStore((state) => state.setSelectedSymbol);
  const allocatedFund = useOrderStore((state) => state.allocatedFund);
  const adjustFunds = useOrderStore((state) => state.adjustFunds);
  const updateRates = useOrderStore((state) => state.updateRates);

  // Sub-second high-frequency rate updates
    useEffect(() => {
    const interval = setInterval(() => {
        updateRates();
    }, 500);
    return () => clearInterval(interval);
    }, [updateRates]);

  return (
    <div className="bg-base-200 border border-base-300 rounded-xl p-4 space-y-4 shadow-lg">
      {/* Rate Ticker Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {Object.entries(stockRates).map(([symbol, rate]) => {
          const isSelected = symbol === selectedSymbol;
          const isUp = rate.change >= 0;

          return (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`flex flex-col p-3 rounded-lg border min-w-[130px] transition-all text-left ${
                isSelected ? 'border-primary bg-base-300' : 'border-base-300 hover:bg-base-300/50'
              }`}
            >
              <span className="text-xs font-mono font-bold">{symbol}</span>
              <span className="text-sm font-mono font-bold">${rate.price.toFixed(2)}</span>
              <span className={`text-[10px] font-mono flex items-center gap-0.5 ${isUp ? 'text-success' : 'text-error'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{rate.change.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Fund Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-base-300">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-xs font-mono uppercase text-base-content/60">Allocated Fund:</span>
          <span className="text-xl font-bold font-mono text-primary">
            ${allocatedFund.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustFunds(-5000)}
            className="btn btn-sm btn-outline btn-error gap-1 font-mono"
          >
            <MinusCircle className="w-4 h-4" /> -$5,000
          </button>
          <button
            onClick={() => adjustFunds(5000)}
            className="btn btn-sm btn-outline btn-success gap-1 font-mono"
          >
            <PlusCircle className="w-4 h-4" /> +$5,000
          </button>
        </div>
      </div>
    </div>
  );
}
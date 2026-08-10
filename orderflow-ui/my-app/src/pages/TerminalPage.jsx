import React, { useState } from 'react';
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';
import { OrderBookCanvas } from '../components/OrderBookCanvas';
import { OrderForm } from '../components/OrderForm';
import { TradeHistory } from '../components/TradeHistory';
import { Cpu, Zap } from 'lucide-react';

export function TerminalPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  // Dynamic WebSocket connection URL
  useOrderWebSocket(`ws://localhost:8080/ws/trades?symbol=${selectedSymbol}`);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner with Ticker Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-200 border border-base-300 p-4 rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{selectedSymbol} Order Book Terminal</h1>
            <span className="badge badge-primary badge-sm font-mono">L2 DEPTH</span>
          </div>
          <p className="text-xs text-base-content/60 font-mono mt-1 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-primary" /> Lock-Free RingBuffer Engine
            <span className="text-base-content/30">•</span>
            <Zap className="w-3.5 h-3.5 text-warning" /> Sub-100µs Execution Path
          </p>
        </div>

        {/* Ticker Switcher Buttons */}
        <div className="join">
          {['AAPL', 'TSLA', 'NVDA', 'MSFT'].map((ticker) => (
            <button
              key={ticker}
              onClick={() => setSelectedSymbol(ticker)}
              className={`btn btn-sm join-item font-mono ${selectedSymbol === ticker ? 'btn-primary' : 'btn-ghost'}`}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderBookCanvas />
        </div>
        <div className="lg:col-span-1">
          <OrderForm selectedSymbol={selectedSymbol} setSelectedSymbol={setSelectedSymbol} />
        </div>
      </div>

      <div className="w-full">
        <TradeHistory />
      </div>
    </div>
  );
}
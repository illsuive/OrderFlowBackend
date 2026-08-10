import React, { useState } from 'react';
import { useOrderStore, EMPTY_POSITION } from '../store/useOrderStore';
import { sendOrderToGateway } from '../api/axios';

export function OrderBetForm({ selectedPrice }) {
  const selectedSymbol = useOrderStore((state) => state.selectedSymbol);
  const stockRates = useOrderStore((state) => state.stockRates);
  const positions = useOrderStore((state) => state.positions);
  const executeTrade = useOrderStore((state) => state.executeTrade);

  const currentRate = stockRates[selectedSymbol]?.price || 0;
  const position = positions[selectedSymbol] || EMPTY_POSITION;

  const [quantity, setQuantity] = useState(10);
  const [customPrice, setCustomPrice] = useState('');
  const [orderType, setOrderType] = useState('MARKET');

  const activePrice = selectedPrice || customPrice || (currentRate ? currentRate.toFixed(2) : '0.00');

  // Short Selling Mechanics:
  // Long Position  (qty > 0): Profit when currentRate rises above avgPrice
  // Short Position (qty < 0): Profit when currentRate drops below avgPrice
  const isLong = position.qty > 0;
  const isShort = position.qty < 0;
  const absQty = Math.abs(position.qty);

  const unrealizedPnL = position.qty !== 0
    ? isShort
      ? (position.avgPrice - currentRate) * absQty
      : (currentRate - position.avgPrice) * position.qty
    : 0;

  const pnlPercentage = position.qty !== 0 && position.avgPrice > 0
    ? isShort
      ? ((position.avgPrice - currentRate) / position.avgPrice) * 100
      : ((currentRate - position.avgPrice) / position.avgPrice) * 100
    : 0;

  const handleOrder = async (side) => {
    const tradeQty = parseInt(quantity, 10);
    if (!tradeQty || tradeQty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    const tradePrice = orderType === 'MARKET' ? currentRate : parseFloat(activePrice);
    const isBuy = side === 'BUY';

    // 1. Submit order to Spring Boot / LMAX Disruptor Matching Gateway asynchronously
    try {
      await sendOrderToGateway({
        symbol: selectedSymbol,
        price: tradePrice,
        quantity: tradeQty,
        isBuy: isBuy,
        isLimitOrder: orderType === 'LIMIT'
      });
    } catch (err) {
      console.warn('[Matching Gateway] Backend offline or order failed risk check. Executing locally.');
    }

    // 2. Execute trade in local Zustand store (Position & PnL tracking)
    const result = executeTrade(selectedSymbol, side, tradePrice, tradeQty);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl p-5 space-y-4 font-mono">
      {/* Header with Ticker Symbol & Live Rate */}
      <h2 className="text-md font-bold border-b border-base-300 pb-2 flex justify-between items-center">
        <span>TRADE {selectedSymbol}</span>
        <span className="text-primary text-base">${currentRate.toFixed(2)}</span>
      </h2>

      {/* Floating PnL & Position Holding Overview */}
      <div className="bg-base-300 p-3 rounded-lg space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-base-content/60">Position Holding:</span>
          <div className="flex items-center gap-1.5">
            {isLong && <span className="badge badge-success badge-sm text-white font-bold">LONG</span>}
            {isShort && <span className="badge badge-error badge-sm text-white font-bold">SHORT</span>}
            <span className="font-bold">{absQty} Units</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base-content/60">Avg Entry Price:</span>
          <span className="font-bold">${position.avgPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-base-100">
          <span className="text-base-content/60">Real-Time PnL:</span>
          <span className={`font-bold ${unrealizedPnL >= 0 ? 'text-success' : 'text-error'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)} ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Order Type Toggle (Market vs Limit) */}
      <div className="join w-full">
        <button
          onClick={() => setOrderType('MARKET')}
          className={`join-item btn btn-sm flex-1 ${orderType === 'MARKET' ? 'btn-primary' : 'btn-outline'}`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('LIMIT')}
          className={`join-item btn btn-sm flex-1 ${orderType === 'LIMIT' ? 'btn-primary' : 'btn-outline'}`}
        >
          Limit
        </button>
      </div>

      {/* Inputs for Quantity & Limit Price */}
      <div className="space-y-3">
        <div>
          <label className="label-text text-xs text-base-content/60 block mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input input-sm input-bordered w-full"
            min="1"
          />
        </div>

        {orderType === 'LIMIT' && (
          <div>
            <label className="label-text text-xs text-base-content/60 block mb-1">Limit Price ($)</label>
            <input
              type="number"
              value={activePrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="input input-sm input-bordered w-full"
              step="0.01"
            />
          </div>
        )}
      </div>

      {/* Execution Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => handleOrder('BUY')}
          className="btn btn-success text-white uppercase btn-sm h-10 font-bold"
        >
          {isShort ? 'Buy / Cover' : 'Buy / Long'}
        </button>
        <button
          onClick={() => handleOrder('SELL')}
          className="btn btn-error text-white uppercase btn-sm h-10 font-bold"
        >
          {isLong ? 'Sell / Close' : 'Sell / Short'}
        </button>
      </div>
    </div>
  );
}
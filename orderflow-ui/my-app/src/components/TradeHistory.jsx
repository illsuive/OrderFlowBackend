import React from 'react';
import { useOrderStore } from '../store/useOrderStore';

export function TradeHistory() {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);

  return (
    <div className="card bg-base-200 border border-base-300 p-5 shadow-xl">
      <h3 className="text-md font-mono font-bold mb-3">Order History Log</h3>
      <div className="overflow-x-auto max-h-60">
        <table className="table table-sm w-full font-mono">
          <thead>
            <tr className="text-base-content/60">
              <th>Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            {tradeHistory.map((trade) => (
              <tr key={trade.id} className="hover:bg-base-300/50">
                <td className="text-xs">{trade.time}</td>
                <td className="font-bold">{trade.symbol}</td>
                <td>
                  <span className={`badge badge-sm font-bold ${
                    trade.side === 'BUY' ? 'badge-success text-white' : 'badge-error text-white'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                <td>${trade.price.toFixed(2)}</td>
                <td>{trade.quantity}</td>
                <td className="font-bold">${trade.total.toFixed(2)}</td>
              </tr>
            ))}
            {tradeHistory.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-xs text-base-content/50 py-4">
                  No orders executed yet. Place a trade to populate logs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
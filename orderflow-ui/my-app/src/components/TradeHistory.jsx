import React from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { History, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function TradeHistory() {
  const orderHistory = useOrderStore((state) => state.orderHistory);
  const clearHistory = useOrderStore((state) => state.clearHistory);

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-base-content/70">
            Recent Executions Log
          </h3>
        </div>
        
        {orderHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
            title="Clear History"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
        <table className="table table-xs w-full font-mono">
          <thead>
            <tr className="border-b border-base-300 text-base-content/50">
              <th>TIME</th>
              <th>SIDE</th>
              <th>SYMBOL</th>
              <th>PRICE</th>
              <th>QTY</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-base-content/40 italic">
                  No orders submitted yet. Submit an order to record execution logs.
                </td>
              </tr>
            ) : (
              orderHistory.map((trade) => (
                <tr key={trade.id} className="hover:bg-base-300/50 border-b border-base-300/40">
                  <td className="text-base-content/60 text-[11px]">{trade.timestamp}</td>
                  <td>
                    <span
                      className={`badge badge-xs font-semibold px-2 py-1 gap-0.5 ${
                        trade.side === 'BUY'
                          ? 'badge-success text-success-content'
                          : 'badge-error text-error-content'
                      }`}
                    >
                      {trade.side === 'BUY' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {trade.side}
                    </span>
                  </td>
                  <td className="font-bold">{trade.symbol}</td>
                  <td className={trade.side === 'BUY' ? 'text-success' : 'text-error'}>
                    ${trade.price.toFixed(2)}
                  </td>
                  <td>{trade.quantity.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
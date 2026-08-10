import React from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { PortfolioChart } from '../components/PortfolioChart';
import { TradeHistory } from '../components/TradeHistory';
import { Wallet, PieChart, ShieldAlert, Cpu } from 'lucide-react';

export function AnalyticsPage() {
  const allocatedFund = useOrderStore((state) => state.allocatedFund);
  const positions = useOrderStore((state) => state.positions);
  const stockRates = useOrderStore((state) => state.stockRates);

  // Calculate total positions value
  let totalPositionValue = 0;
  Object.entries(positions).forEach(([symbol, pos]) => {
    if (pos.qty > 0 && stockRates[symbol]) {
      totalPositionValue += pos.qty * stockRates[symbol].price;
    }
  });

  const totalPortfolioValue = allocatedFund + totalPositionValue;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-200 border border-base-300 p-4 font-mono shadow-md">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <Wallet className="w-4 h-4 text-primary" /> Total Net Worth
          </span>
          <h3 className="text-xl font-bold text-primary mt-1">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="card bg-base-200 border border-base-300 p-4 font-mono shadow-md">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <PieChart className="w-4 h-4 text-success" /> Liquid Funds
          </span>
          <h3 className="text-xl font-bold text-success mt-1">
            ${allocatedFund.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="card bg-base-200 border border-base-300 p-4 font-mono shadow-md">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <Cpu className="w-4 h-4 text-warning" /> Invested Capital
          </span>
          <h3 className="text-xl font-bold text-warning mt-1">
            ${totalPositionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="card bg-base-200 border border-base-300 p-4 font-mono shadow-md">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-info" /> Risk Engine Status
          </span>
          <h3 className="text-xl font-bold text-info mt-1">
            PASSED ($1M CAP)
          </h3>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="card bg-base-200 border border-base-300 p-5 shadow-xl">
        <h3 className="text-md font-mono font-bold mb-3">Active Holdings Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full font-mono">
            <thead>
              <tr className="text-base-content/60">
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg Entry</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>Unrealized PnL</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(positions).map(([symbol, pos]) => {
                if (pos.qty <= 0) return null;
                const currentPrice = stockRates[symbol]?.price || 0;
                const marketVal = pos.qty * currentPrice;
                const pnl = (currentPrice - pos.avgPrice) * pos.qty;

                return (
                  <tr key={symbol} className="hover:bg-base-300/50">
                    <td className="font-bold">{symbol}</td>
                    <td>{pos.qty}</td>
                    <td>${pos.avgPrice.toFixed(2)}</td>
                    <td>${currentPrice.toFixed(2)}</td>
                    <td>${marketVal.toFixed(2)}</td>
                    <td className={`font-bold ${pnl >= 0 ? 'text-success' : 'text-error'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {Object.values(positions).every((p) => p.qty === 0) && (
                <tr>
                  <td colSpan="6" className="text-center text-xs text-base-content/50 py-4">
                    No active position holdings. Execute a trade in the terminal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Chart & Execution Logs */}
      <PortfolioChart />
      <TradeHistory />
    </div>
  );
}
import React from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function PortfolioChart() {
  const portfolioHistory = useOrderStore((state) => state.portfolioHistory);

  return (
    <div className="card bg-base-200 border border-base-300 p-5 shadow-xl">
      <h3 className="text-md font-mono font-bold mb-4">Live Net Worth Curve</h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={portfolioHistory}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="timestamp" stroke="#9ca3af" fontSize={10} />
            <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#pnlGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
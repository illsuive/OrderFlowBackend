import React from 'react';
import { PortfolioChart } from './PortfolioChart';
import { TradeHistory } from './TradeHistory';

export function DashboardView() {
  return (
    <div className="space-y-6">
      <PortfolioChart />
      <TradeHistory />
    </div>
  );
}
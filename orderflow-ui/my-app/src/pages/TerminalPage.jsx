import React, { useState } from 'react';
import { MarketHeader } from '../components/MarketHeader';
import { OrderBookCanvas } from '../components/OrderBookCanvas';
import { OrderBetForm } from '../components/OrderBetForm';
import { DashboardView } from '../components/DashboardView';

export function TerminalPage() {
  const [selectedPrice, setSelectedPrice] = useState(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Live Market Header & Fund Controls */}
      <MarketHeader />

      {/* Main Trading Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderBookCanvas onSelectPrice={setSelectedPrice} />
        </div>
        <div className="lg:col-span-1">
          <OrderBetForm selectedPrice={selectedPrice} />
        </div>
      </div>

      {/* Portfolio Chart & Order Logs */}
      <DashboardView />
    </div>
  );
}
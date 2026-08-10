import React from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { Activity, Radio, BarChart2, Terminal } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const isConnected = useOrderStore((state) => state.isConnected);

  return (
    <div className="navbar bg-base-200 border-b border-base-300 px-6">
      <div className="flex-1 items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider">ORDERFLOW</h1>
          <p className="text-[10px] font-mono text-base-content/50 uppercase">Low-Latency Matching Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Navigation Tabs */}
        <div className="join bg-base-300 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`join-item btn btn-sm font-mono gap-2 ${
              activeTab === 'terminal' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <Terminal className="w-4 h-4" /> Terminal
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`join-item btn btn-sm font-mono gap-2 ${
              activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </div>

        {/* Live Engine Connection Badge */}
        <div className={`badge badge-sm font-mono gap-1.5 p-2.5 ${
          isConnected ? 'badge-success text-white' : 'badge-error text-white'
        }`}>
          <Radio className="w-3 h-3 animate-pulse" />
          {isConnected ? 'WS CONNECTED' : 'WS DISCONNECTED'}
        </div>
      </div>
    </div>
  );
}
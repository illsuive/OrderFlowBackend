import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { Activity, BarChart2, Radio } from 'lucide-react';

export function Navbar() {
  const isConnected = useOrderStore((state) => state.isConnected);
  const location = useLocation();

  return (
    <div className="navbar bg-base-200 border-b border-base-300 px-4">
      <div className="flex-1 gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <span className="text-xl font-bold tracking-wider text-base-content">
          OrderFlow <span className="text-primary text-xs font-mono uppercase">LMAX Terminal</span>
        </span>
      </div>

      <div className="flex-none gap-4">
        {/* Connection Status Badge */}
        <div className={`badge gap-2 py-3 px-3 font-mono text-xs ${isConnected ? 'badge-success text-success-content' : 'badge-error text-error-content'}`}>
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          {isConnected ? 'STREAMING ACTIVE' : 'DISCONNECTED'}
        </div>

        {/* Navigation Tabs */}
        <div className="join">
          <Link
            to="/"
            className={`btn btn-sm join-item ${location.pathname === '/' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Terminal
          </Link>
          <Link
            to="/analytics"
            className={`btn btn-sm join-item ${location.pathname === '/analytics' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <BarChart2 className="w-4 h-4 mr-1" />
            Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
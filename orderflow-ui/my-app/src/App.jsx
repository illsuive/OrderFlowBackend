import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { TerminalPage } from './pages/TerminalPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useOrderWebSocket } from './hooks/useOrderWebSocket';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  // Global persistent WebSocket connection across all pages
  useOrderWebSocket(`ws://localhost:8080/ws/trades?symbol=${selectedSymbol}`);

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <TerminalPage 
                selectedSymbol={selectedSymbol} 
                setSelectedSymbol={setSelectedSymbol} 
              />
            } 
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
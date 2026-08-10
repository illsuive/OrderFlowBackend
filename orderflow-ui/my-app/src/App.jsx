import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TerminalPage } from './pages/TerminalPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { useOrderWebSocket } from './hooks/useOrderWebSocket';

export function App() {
  const [activeTab, setActiveTab] = useState('terminal');

  // Initialize WebFlux WebSocket stream connection
  useOrderWebSocket();

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pb-12">
        {activeTab === 'terminal' ? <TerminalPage /> : <AnalyticsPage />}
      </main>
    </div>
  );
}

export default App;
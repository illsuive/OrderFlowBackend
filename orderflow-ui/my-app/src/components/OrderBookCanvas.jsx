import React, { useRef, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';

export function OrderBookCanvas({ onSelectPrice }) {
  const canvasRef = useRef(null);
  const selectedSymbol = useOrderStore((state) => state.selectedSymbol);
  const marketDepth = useOrderStore((state) => state.marketDepth);
  const currentRate = useOrderStore((state) => state.stockRates[selectedSymbol]?.price || 150.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Mock depth fallback if WebSocket stream is resting
    const bids = marketDepth.bids?.length ? marketDepth.bids : [
      { price: currentRate - 0.2, volume: 150 },
      { price: currentRate - 0.4, volume: 320 },
      { price: currentRate - 0.6, volume: 450 },
      { price: currentRate - 0.8, volume: 600 }
    ];

    const asks = marketDepth.asks?.length ? marketDepth.asks : [
      { price: currentRate + 0.2, volume: 120 },
      { price: currentRate + 0.4, volume: 280 },
      { price: currentRate + 0.6, volume: 410 },
      { price: currentRate + 0.8, volume: 590 }
    ];

    const rowHeight = 30;
    ctx.font = '12px monospace';

    // Render Asks (Sells - Top Half)
    asks.slice(0, 5).reverse().forEach((ask, index) => {
      const y = index * rowHeight + 10;
      const barWidth = Math.min(width * 0.5, (ask.volume / 1000) * width);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(width - barWidth, y, barWidth, rowHeight - 4);

      ctx.fillStyle = '#ef4444';
      ctx.fillText(`$${ask.price.toFixed(2)}`, 20, y + 18);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${ask.volume} QTY`, width - 90, y + 18);
    });

    // Spread Line
    const midY = 165;
    ctx.strokeStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(10, midY);
    ctx.lineTo(width - 10, midY);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`MID MARKET: $${currentRate.toFixed(2)}`, width / 2 - 60, midY + 4);

    // Render Bids (Buys - Bottom Half)
    bids.slice(0, 5).forEach((bid, index) => {
      const y = midY + 15 + (index * rowHeight);
      const barWidth = Math.min(width * 0.5, (bid.volume / 1000) * width);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(width - barWidth, y, barWidth, rowHeight - 4);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`$${bid.price.toFixed(2)}`, 20, y + 18);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${bid.volume} QTY`, width - 90, y + 18);
    });
  }, [marketDepth, currentRate]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Estimate clicked price tier
    const row = Math.floor(y / 30);
    const estimatedPrice = currentRate + ((5 - row) * 0.2);
    if (onSelectPrice) onSelectPrice(Math.round(estimatedPrice * 100) / 100);
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl p-4">
      <h3 className="text-sm font-mono font-bold mb-3 flex items-center justify-between">
        <span>L2 MARKET DEPTH ({selectedSymbol})</span>
        <span className="text-xs text-base-content/50 font-normal">Click level to pre-fill price</span>
      </h3>
      <canvas
        ref={canvasRef}
        width={480}
        height={340}
        onClick={handleCanvasClick}
        className="w-full bg-base-300 rounded-lg cursor-pointer border border-base-300"
      />
    </div>
  );
}
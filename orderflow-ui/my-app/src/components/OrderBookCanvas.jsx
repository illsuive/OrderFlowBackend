import React, { useRef, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';

export function OrderBookCanvas() {
  const canvasRef = useRef(null);
  const marketDepth = useOrderStore((state) => state.marketDepth);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high-DPI screens
    const width = canvas.width;
    const height = canvas.height;

    // Clear Background
    ctx.fillStyle = '#0F172A'; // Slate 900
    ctx.fillRect(0, 0, width, height);

    ctx.font = '12px monospace';
    const rowHeight = 22;
    const midX = width / 2;

    // Header Titles
    ctx.fillStyle = '#10B981'; // Green 500
    ctx.fillText('BIDS (BUY)', 15, 25);
    ctx.fillStyle = '#64748B';
    ctx.fillText('PRICE / QTY', 120, 25);

    ctx.fillStyle = '#EF4444'; // Red 500
    ctx.fillText('ASKS (SELL)', midX + 15, 25);
    ctx.fillStyle = '#64748B';
    ctx.fillText('PRICE / QTY', midX + 120, 25);

    // Separator Line
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, height - 10);
    ctx.stroke();

    // Render Bids (Buy Orders)
    marketDepth.bids?.forEach((bid, i) => {
      const y = 50 + i * rowHeight;
      const barWidth = Math.min((bid.volume / 1000) * (midX - 30), midX - 30);

      // Depth bar visualization
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(0, y - 14, barWidth, 18);

      // Text Data
      ctx.fillStyle = '#34D399';
      ctx.fillText(`$${bid.price.toFixed(2)}`, 15, y);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${bid.volume.toLocaleString()}`, 130, y);
    });

    // Render Asks (Sell Orders)
    marketDepth.asks?.forEach((ask, i) => {
      const y = 50 + i * rowHeight;
      const barWidth = Math.min((ask.volume / 1000) * (midX - 30), midX - 30);

      // Depth bar visualization
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(width - barWidth, y - 14, barWidth, 18);

      // Text Data
      ctx.fillStyle = '#F87171';
      ctx.fillText(`$${ask.price.toFixed(2)}`, midX + 15, y);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${ask.volume.toLocaleString()}`, midX + 130, y);
    });
  }, [marketDepth]);

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-base-content/70">
          Level 2 Market Depth (100ms Stream)
        </h3>
        <span className="badge badge-outline badge-sm font-mono">AAPL</span>
      </div>
      <canvas
        ref={canvasRef}
        width={550}
        height={320}
        className="w-full rounded-lg border border-slate-800"
      />
    </div>
  );
}
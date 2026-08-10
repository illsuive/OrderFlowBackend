import React, { useState } from 'react';
import api from '../api/axios';
import { useOrderStore } from '../store/useOrderStore';
import { toast } from 'sonner';
import { ArrowUpRight, ArrowDownRight, Send } from 'lucide-react';

export function OrderForm({ selectedSymbol, setSelectedSymbol }) {
  const [price, setPrice] = useState(150.50);
  const [quantity, setQuantity] = useState(100);
  const [isBuy, setIsBuy] = useState(true);
  const [loading, setLoading] = useState(false);

  const addOrderToHistory = useOrderStore((state) => state.addOrderToHistory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/orders', {
        symbol: selectedSymbol,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        isBuy,
        isLimitOrder: true,
      });

      addOrderToHistory({
        symbol: selectedSymbol,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        isBuy,
      });

      toast.success('Order Submitted', { description: response.data });
    } catch (error) {
      toast.error('Risk Check Rejected', {
        description: error.response?.data || 'Failed to submit order',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl p-5">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-base-content/70 mb-4">
        Order Execution Entry
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsBuy(true)}
            className={`btn btn-sm ${isBuy ? 'btn-success text-white' : 'btn-outline border-base-300'}`}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" /> BUY
          </button>
          <button
            type="button"
            onClick={() => setIsBuy(false)}
            className={`btn btn-sm ${!isBuy ? 'btn-error text-white' : 'btn-outline border-base-300'}`}
          >
            <ArrowDownRight className="w-4 h-4 mr-1" /> SELL
          </button>
        </div>

        {/* Dynamic Symbol Selector */}
        <div className="form-control">
          <label className="label label-text text-xs text-base-content/60 py-1">Symbol Ticker</label>
          <select
            className="select select-sm select-bordered font-mono font-bold"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
          >
            <option value="AAPL">AAPL</option>
            <option value="TSLA">TSLA</option>
            <option value="NVDA">NVDA</option>
            <option value="MSFT">MSFT</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label label-text text-xs text-base-content/60 py-1">Limit Price ($)</label>
          <input
            type="number"
            step="0.01"
            className="input input-sm input-bordered font-mono"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-control">
          <label className="label label-text text-xs text-base-content/60 py-1">Quantity</label>
          <input
            type="number"
            className="input input-sm input-bordered font-mono"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-sm mt-2 ${isBuy ? 'btn-success text-white' : 'btn-error text-white'}`}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 mr-1" /> Submit {isBuy ? 'Buy' : 'Sell'} Order
            </>
          )}
        </button>
      </form>
    </div>
  );
}
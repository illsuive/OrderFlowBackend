package com.orderflow.core.engine;

import com.lmax.disruptor.EventHandler;
import com.orderflow.core.event.OrderEvent;
import com.orderflow.core.model.Order;
import com.orderflow.core.model.Side;

public class MatchingEventHandler implements EventHandler<OrderEvent> {

    private final MultiSymbolMatchingEngine matchingEngine;

    public MatchingEventHandler(MultiSymbolMatchingEngine matchingEngine) {
        this.matchingEngine = matchingEngine;
    }

    @Override
    public void onEvent(OrderEvent event, long sequence, boolean endOfBatch) {
        Order order = new Order();
        
        // Pass symbol to populate: (orderId, symbol, side, price, quantity, timestamp)
        Side side = event.isBuy() ? Side.BUY : Side.SELL;
        String symbol = event.getSymbol() != null ? event.getSymbol() : "AAPL";

        order.populate(
            event.getOrderId(),
            symbol,
            side,
            event.getPrice(),
            event.getQuantity(),
            event.getTimestamp()
        );

        matchingEngine.processOrder(order);
    }
}
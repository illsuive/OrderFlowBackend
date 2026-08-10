package com.orderflow.core.disruptor;

import com.lmax.disruptor.EventHandler;
import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.core.event.OrderEvent;
import com.orderflow.core.model.Order;
import com.orderflow.core.model.Side;

public class MatchingEventHandler implements EventHandler<OrderEvent> {

    private final MultiSymbolMatchingEngine matchingEngine;

    public MatchingEventHandler(MultiSymbolMatchingEngine matchingEngine) {
        this.matchingEngine = matchingEngine;
    }

    @Override
    public void onEvent(OrderEvent event, long sequence, boolean endOfBatch) throws Exception {
        if (event.getSymbol() == null) {
            return;
        }

        // Translate RingBuffer event to Order model object
        Side side = event.isBuy() ? Side.BUY : Side.SELL;
        Order order = new Order();
        
        order.populate(
            event.getOrderId(),
            event.getSymbol(),
            side,
            event.getPrice(),
            event.getQuantity(),
            event.getTimestamp()
        );

        // Process order inside the symbol's order book
        matchingEngine.processOrder(order);

        // Reset event slot to avoid reference leaking
        event.clear();
    }
}
package com.orderflow.core.engine;

import java.util.ArrayList;

import com.orderflow.core.model.Order;
import com.orderflow.core.model.OrderBookDepth;

public class OrderBook {
    private final String symbol;

    public OrderBook(String symbol) {
        this.symbol = symbol;
    }

    // Process incoming orders from Disruptor / MatchingEngine
    public void addOrder(Order order) {
        // Place order matching and price level insertion logic here
    }

    // Convert current state into the OrderBookDepth DTO for WebSocket serialization
    public OrderBookDepth getDepthSnapshot() {
        return new OrderBookDepth(symbol, new ArrayList<>(), new ArrayList<>());
    }

    public String getSymbol() {
        return symbol;
    }
}
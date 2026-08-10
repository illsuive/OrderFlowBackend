package com.orderflow.core.engine;

import com.orderflow.core.model.Order;
import com.orderflow.core.model.OrderBookDepth;
import java.util.concurrent.ConcurrentHashMap;

public class MultiSymbolMatchingEngine {

    private final ConcurrentHashMap<String, OrderBook> orderBooks = new ConcurrentHashMap<>();

    public void processOrder(Order order) {
        if (order == null || order.getSymbol() == null) return;

        String symbol = order.getSymbol().toUpperCase();
        OrderBook book = orderBooks.computeIfAbsent(symbol, OrderBook::new);

        book.addOrder(order);
    }

    public OrderBook getOrderBook(String symbol) {
        if (symbol == null) return null;
        return orderBooks.get(symbol.toUpperCase());
    }

    public OrderBookDepth getDepthSnapshot(String symbol) {
        OrderBook book = getOrderBook(symbol);
        return (book != null) ? book.getDepthSnapshot() : new OrderBookDepth(symbol, java.util.Collections.emptyList(), java.util.Collections.emptyList());
    }
}
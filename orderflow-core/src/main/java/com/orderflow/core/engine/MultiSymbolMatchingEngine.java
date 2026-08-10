package com.orderflow.core.engine;

import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;

import com.orderflow.core.model.Order;
import com.orderflow.core.model.OrderBookDepth;
import com.orderflow.core.risk.CoreRiskFilter;

public class MultiSymbolMatchingEngine {

    private final ConcurrentHashMap<String, OrderBook> orderBooks = new ConcurrentHashMap<>();

    public void processOrder(Order order) {
        if (order == null || order.getSymbol() == null) return;

        // Microsecond pre-execution risk check
        if (!CoreRiskFilter.validate(order)) {
            return;
        }

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
        return (book != null) 
                ? book.getDepthSnapshot() 
                : new OrderBookDepth(symbol, Collections.emptyList(), Collections.emptyList());
    }
}
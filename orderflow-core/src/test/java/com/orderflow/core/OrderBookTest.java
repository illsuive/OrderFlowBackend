package com.orderflow.core;

import com.orderflow.core.engine.OrderBook;
import com.orderflow.core.model.Order;
import com.orderflow.core.model.OrderBookDepth;
import com.orderflow.core.model.Side;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderBookTest {

    private OrderBook orderBook;

    @BeforeEach
    void setUp() {
        orderBook = new OrderBook("AAPL");
    }

    @Test
    @DisplayName("Should add passive bids and asks without matching when price does not cross spread")
    void testPassiveOrders() {
        Order buyOrder = new Order(1L, "AAPL", Side.BUY, 150.00, 100, System.currentTimeMillis());
        Order sellOrder = new Order(2L, "AAPL", Side.SELL, 155.00, 50, System.currentTimeMillis());

        orderBook.addOrder(buyOrder);
        orderBook.addOrder(sellOrder);

        OrderBookDepth depth = orderBook.getDepthSnapshot();

        assertEquals(1, depth.getBids().size());
        assertEquals(1, depth.getAsks().size());
        assertEquals(150.00, depth.getBids().get(0).getPrice());
        assertEquals(100, depth.getBids().get(0).getVolume());
        assertEquals(155.00, depth.getAsks().get(0).getPrice());
        assertEquals(50, depth.getAsks().get(0).getVolume());
    }

    @Test
    @DisplayName("Should execute full trade match when aggressive buy crosses ask price")
    void testFullOrderMatch() {
        Order sellOrder = new Order(1L, "AAPL", Side.SELL, 150.00, 100, System.currentTimeMillis());
        orderBook.addOrder(sellOrder);

        Order buyOrder = new Order(2L, "AAPL", Side.BUY, 150.00, 100, System.currentTimeMillis());
        orderBook.addOrder(buyOrder);

        OrderBookDepth depth = orderBook.getDepthSnapshot();

        assertTrue(depth.getBids().isEmpty(), "Bids should be empty after full execution");
        assertTrue(depth.getAsks().isEmpty(), "Asks should be empty after full execution");
    }

    @Test
    @DisplayName("Should handle partial fills and leave remaining volume in book")
    void testPartialOrderMatch() {
        Order sellOrder = new Order(1L, "AAPL", Side.SELL, 150.00, 200, System.currentTimeMillis());
        orderBook.addOrder(sellOrder);

        Order buyOrder = new Order(2L, "AAPL", Side.BUY, 150.00, 50, System.currentTimeMillis());
        orderBook.addOrder(buyOrder);

        OrderBookDepth depth = orderBook.getDepthSnapshot();

        assertTrue(depth.getBids().isEmpty());
        assertEquals(1, depth.getAsks().size());
        assertEquals(150.00, depth.getAsks().get(0).getPrice());
        assertEquals(150, depth.getAsks().get(0).getVolume(), "Remaining ask volume should be 150");
    }
}
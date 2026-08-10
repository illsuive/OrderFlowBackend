package com.orderflow.core.model;

public class Order {
    private long orderId;
    private String symbol;
    private Side side;
    private double price;
    private int quantity;
    private long timestamp;

    public Order() {
        // Default constructor for pre-allocation in object pools / RingBuffer slots
    }

    public Order(long orderId, String symbol, Side side, double price, int quantity, long timestamp) {
        populate(orderId, symbol, side, price, quantity, timestamp);
    }

    /**
     * Mutates existing object fields to avoid GC allocation overhead.
     */
    public void populate(long orderId, String symbol, Side side, double price, int quantity, long timestamp) {
        this.orderId = orderId;
        this.symbol = symbol;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
        this.timestamp = timestamp;
    }

    public long getOrderId() {
        return orderId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Side getSide() {
        return side;
    }

    public double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "Order{" +
                "orderId=" + orderId +
                ", symbol='" + symbol + '\'' +
                ", side=" + side +
                ", price=" + price +
                ", quantity=" + quantity +
                ", timestamp=" + timestamp +
                '}';
    }
}
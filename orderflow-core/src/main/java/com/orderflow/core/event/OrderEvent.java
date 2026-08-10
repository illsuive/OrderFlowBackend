package com.orderflow.core.event;

public class OrderEvent {
    private long orderId;
    private String symbol;
    private double price;
    private int quantity;
    private boolean isBuy;
    private boolean isLimitOrder;
    private long timestamp;

    public void set(long orderId, String symbol, double price, int quantity, boolean isBuy, boolean isLimitOrder, long timestamp) {
        this.orderId = orderId;
        this.symbol = symbol;
        this.price = price;
        this.quantity = quantity;
        this.isBuy = isBuy;
        this.isLimitOrder = isLimitOrder;
        this.timestamp = timestamp;
    }

    public long getOrderId() { return orderId; }
    public String getSymbol() { return symbol; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public boolean isBuy() { return isBuy; }
    public boolean isLimitOrder() { return isLimitOrder; }
    public long getTimestamp() { return timestamp; }

    public void clear() {
        this.orderId = 0L;
        this.symbol = null;
        this.price = 0.0;
        this.quantity = 0;
        this.isBuy = false;
        this.isLimitOrder = false;
        this.timestamp = 0L;
    }
}
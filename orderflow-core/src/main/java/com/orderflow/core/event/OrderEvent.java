package com.orderflow.core.event;

public class OrderEvent {
    private long orderId;
    private String symbol;
    private double price;
    private int quantity;
    private boolean isBuy;
    private long timestamp;

    public long getOrderId() { return orderId; }
    public void setOrderId(long orderId) { this.orderId = orderId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isBuy() { return isBuy; }
    public void setBuy(boolean buy) { isBuy = buy; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
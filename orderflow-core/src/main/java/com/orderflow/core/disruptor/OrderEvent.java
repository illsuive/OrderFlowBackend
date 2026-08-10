package com.orderflow.core.disruptor;

public class OrderEvent {
    private long orderId;
    private String symbol;
    private double price;
    private int quantity;
    private boolean isBuy;

    public OrderEvent() {}

    /**
     * Mutator used to overwrite existing event data in the Ring Buffer
     * without instantiating new objects on the heap.
     */
    public void set(long orderId, String symbol, double price, int quantity, boolean isBuy) {
        this.orderId = orderId;
        this.symbol = symbol;
        this.price = price;
        this.quantity = quantity;
        this.isBuy = isBuy;
    }

    public long getOrderId() {
        return orderId;
    }

    public String getSymbol() {
        return symbol;
    }

    public double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public boolean isBuy() {
        return isBuy;
    }

    @Override
    public String toString() {
        return "OrderEvent{" +
                "orderId=" + orderId +
                ", symbol='" + symbol + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", isBuy=" + isBuy +
                '}';
    }
}
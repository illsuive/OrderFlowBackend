package com.orderflow.gateway.dto;

public class OrderRequest {
    private String symbol;
    private double price;
    private int quantity;
    private boolean isBuy;
    private boolean isLimitOrder;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isBuy() { return isBuy; }
    public void setBuy(boolean buy) { isBuy = buy; }

    public boolean isLimitOrder() { return isLimitOrder; }
    public void setLimitOrder(boolean limitOrder) { isLimitOrder = limitOrder; }
}
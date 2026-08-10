package com.orderflow.core.engine;

import java.util.ArrayDeque;
import java.util.Queue;

import com.orderflow.core.model.Order;

public class PriceLevel {
    private final double price;
    private int totalVolume;
    private final Queue<Order> orders = new ArrayDeque<>();

    public PriceLevel(double price) {
        this.price = price;
    }

    public void addOrder(Order order) {
        orders.add(order);
        this.totalVolume += order.getQuantity();
    }

    public Queue<Order> getOrders() {
        return orders;
    }

    public double getPrice() {
        return price;
    }

    public int getTotalVolume() {
        return totalVolume;
    }

    public void reduceVolume(int amount) {
        this.totalVolume -= amount;
    }
}
package com.orderflow.core.engine;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.Queue;
import java.util.TreeMap;

import com.orderflow.core.model.Order;
import com.orderflow.core.model.OrderBookDepth;
import com.orderflow.core.model.Side;

public class OrderBook {
    private final String symbol;
    
    // Bids sorted in descending order (highest price first)
    private final NavigableMap<Double, Queue<Order>> bids = new TreeMap<>(Collections.reverseOrder());
    // Asks sorted in ascending order (lowest price first)
    private final NavigableMap<Double, Queue<Order>> asks = new TreeMap<>();

    public OrderBook(String symbol) {
        this.symbol = symbol;
    }

    public synchronized void addOrder(Order order) {
        if (order.getSide() == Side.BUY) {
            matchBuyOrder(order);
        } else {
            matchSellOrder(order);
        }
    }

    private void matchBuyOrder(Order buyOrder) {
        while (buyOrder.getQuantity() > 0 && !asks.isEmpty()) {
            Map.Entry<Double, Queue<Order>> lowestAskEntry = asks.firstEntry();
            double lowestAskPrice = lowestAskEntry.getKey();

            if (buyOrder.getPrice() < lowestAskPrice) {
                break; // No match (price does not cross the spread)
            }

            Queue<Order> askQueue = lowestAskEntry.getValue();
            processQueueMatch(buyOrder, askQueue);

            if (askQueue.isEmpty()) {
                asks.remove(lowestAskPrice);
            }
        }

        // Rest of quantity goes to passive bids book
        if (buyOrder.getQuantity() > 0) {
            bids.computeIfAbsent(buyOrder.getPrice(), k -> new LinkedList<>()).add(buyOrder);
        }
    }

    private void matchSellOrder(Order sellOrder) {
        while (sellOrder.getQuantity() > 0 && !bids.isEmpty()) {
            Map.Entry<Double, Queue<Order>> highestBidEntry = bids.firstEntry();
            double highestBidPrice = highestBidEntry.getKey();

            if (sellOrder.getPrice() > highestBidPrice) {
                break; // No match
            }

            Queue<Order> bidQueue = highestBidEntry.getValue();
            processQueueMatch(sellOrder, bidQueue);

            if (bidQueue.isEmpty()) {
                bids.remove(highestBidPrice);
            }
        }

        // Rest of quantity goes to passive asks book
        if (sellOrder.getQuantity() > 0) {
            asks.computeIfAbsent(sellOrder.getPrice(), k -> new LinkedList<>()).add(sellOrder);
        }
    }

    private void processQueueMatch(Order incomingOrder, Queue<Order> restingQueue) {
        while (incomingOrder.getQuantity() > 0 && !restingQueue.isEmpty()) {
            Order restingOrder = restingQueue.peek();
            int matchedQty = Math.min(incomingOrder.getQuantity(), restingOrder.getQuantity());

            incomingOrder.setQuantity(incomingOrder.getQuantity() - matchedQty);
            restingOrder.setQuantity(restingOrder.getQuantity() - matchedQty);

            if (restingOrder.getQuantity() == 0) {
                restingQueue.poll();
            }
        }
    }

    public synchronized OrderBookDepth getDepthSnapshot() {
        List<OrderBookDepth.PriceLevelDto> bidLevels = new ArrayList<>();
        List<OrderBookDepth.PriceLevelDto> askLevels = new ArrayList<>();

        for (Map.Entry<Double, Queue<Order>> entry : bids.entrySet()) {
            int volume = entry.getValue().stream().mapToInt(Order::getQuantity).sum();
            bidLevels.add(new OrderBookDepth.PriceLevelDto(entry.getKey(), volume));
        }

        for (Map.Entry<Double, Queue<Order>> entry : asks.entrySet()) {
            int volume = entry.getValue().stream().mapToInt(Order::getQuantity).sum();
            askLevels.add(new OrderBookDepth.PriceLevelDto(entry.getKey(), volume));
        }

        return new OrderBookDepth(symbol, bidLevels, askLevels);
    }

    public String getSymbol() {
        return symbol;
    }
}
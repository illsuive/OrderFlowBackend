package com.orderflow.core.risk;

import com.orderflow.core.disruptor.OrderEvent;

public class RiskManager {

    // Pre-trade risk threshold limits
    private static final double MAX_ORDER_VALUE = 1_000_000.0; // $1,000,000 max value cap per order
    private static final int MAX_ORDER_QTY = 10_000;          // 10,000 max shares/contracts per order
    private static final double MIN_PRICE = 0.01;              // Minimum tick price
    private static final double MAX_PRICE = 50_000.00;         // Maximum price ceiling

    /**
     * Validates incoming OrderEvent data against risk rules.
     * Must execute synchronously without blocking or heap allocation[cite: 1].
     *
     * @param event The OrderEvent to validate
     * @return true if order passes all risk checks, false if rejected
     */
    public static boolean validate(OrderEvent event) {
        // 1. Quantity Check
        if (event.getQuantity() <= 0 || event.getQuantity() > MAX_ORDER_QTY) {
            System.err.printf("[RISK REJECT] Order ID %d failed quantity check: %d shares (Limit: %d)%n",
                    event.getOrderId(), event.getQuantity(), MAX_ORDER_QTY);
            return false;
        }

        // 2. Price Boundary Check
        if (event.getPrice() < MIN_PRICE || event.getPrice() > MAX_PRICE) {
            System.err.printf("[RISK REJECT] Order ID %d failed price check: $%.2f (Allowed range: $%.2f - $%.2f)%n",
                    event.getOrderId(), event.getPrice(), MIN_PRICE, MAX_PRICE);
            return false;
        }

        // 3. Total Order Notional Value Check
        double totalValue = event.getPrice() * event.getQuantity();
        if (totalValue > MAX_ORDER_VALUE) {
            System.err.printf("[RISK REJECT] Order ID %d exceeded max notional value cap: $%.2f (Limit: $%.2f)%n",
                    event.getOrderId(), totalValue, MAX_ORDER_VALUE);
            return false;
        }

        // 4. Symbol Integrity Check
        if (event.getSymbol() == null || event.getSymbol().trim().isEmpty()) {
            System.err.printf("[RISK REJECT] Order ID %d has invalid symbol%n", event.getOrderId());
            return false;
        }

        return true;
    }
}
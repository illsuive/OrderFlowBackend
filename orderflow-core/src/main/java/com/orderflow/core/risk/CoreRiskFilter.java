package com.orderflow.core.risk;

import com.orderflow.core.model.Order;

public class CoreRiskFilter {

    private static final double MAX_ORDER_VALUE = 1_000_000.0; // $1M Maximum Order Cap
    private static final int MAX_QUANTITY = 50_000;

    /**
     * Microsecond-level pre-execution risk & sanity verification.
     */
    public static boolean validate(Order order) {
        if (order == null) return false;
        if (order.getSymbol() == null || order.getSymbol().trim().isEmpty()) return false;
        if (order.getPrice() <= 0 || order.getQuantity() <= 0) return false;
        if (order.getQuantity() > MAX_QUANTITY) return false;

        double notionalValue = order.getPrice() * order.getQuantity();
        return notionalValue <= MAX_ORDER_VALUE;
    }
}
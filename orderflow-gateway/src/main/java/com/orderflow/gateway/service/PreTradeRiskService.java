package com.orderflow.gateway.service;

import org.springframework.stereotype.Service;

import com.orderflow.gateway.dto.OrderRequest;

@Service
public class PreTradeRiskService {

    private static final double MAX_ORDER_VALUE = 1_000_000.0;
    private static final int MAX_QUANTITY = 50_000;

    public boolean validate(OrderRequest request) {
        if (request == null || request.getSymbol() == null) return false;
        if (request.getPrice() <= 0 || request.getQuantity() <= 0) return false;
        if (request.getQuantity() > MAX_QUANTITY) return false;

        double notionalValue = request.getPrice() * request.getQuantity();
        return notionalValue <= MAX_ORDER_VALUE;
    }
}
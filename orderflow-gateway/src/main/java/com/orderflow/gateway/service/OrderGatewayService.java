package com.orderflow.gateway.service;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.orderflow.core.disruptor.DisruptorProvider;
import com.orderflow.core.engine.MultiSymbolMatchingEngine;
import com.orderflow.gateway.dto.OrderRequest;

@Service
public class OrderGatewayService {

    private final DisruptorProvider disruptorProvider;
    private final PreTradeRiskService riskService;
    private final AtomicLong orderIdGenerator = new AtomicLong(1);

    public OrderGatewayService(MultiSymbolMatchingEngine matchingEngine, PreTradeRiskService riskService) {
        this.disruptorProvider = new DisruptorProvider(matchingEngine);
        this.riskService = riskService;
    }

    public boolean submitOrder(OrderRequest request) {
        if (!riskService.validate(request)) {
            return false;
        }

        long orderId = orderIdGenerator.getAndIncrement();
        disruptorProvider.publishOrder(
                orderId,
                request.getSymbol(),
                request.getPrice(),
                request.getQuantity(),
                request.isBuy(),
                request.isLimitOrder()
        );

        return true;
    }
}